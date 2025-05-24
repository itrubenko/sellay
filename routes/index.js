const express = require('express');
const route = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { createJWTToken } = require('../scripts/jwtHelpers');
const jwt = require('jsonwebtoken');
const url = require('url');
const User = require('../db/User');
const axios = require('axios');
let oauth2Client;

/* GET home page. */
route.get('/', function (req, res) {
    res.render('index', { title: 'Express 1' });
});

route.get('/google', function (req, res) {
    const { google } = require('googleapis');
    const crypto = require('crypto');
    const { GOOGLE_CLIENT_ID,  GOOGLE_SECRET_ID, GOOGLE_CALLBACK_URL} = process.env;
    /**
     * To use OAuth2 authentication, we need access to a CLIENT_ID, CLIENT_SECRET, AND REDIRECT_URI
     * from the client_secret.json file. To get these credentials for your application, visit
     * https://console.cloud.google.com/apis/credentials.
     */
    oauth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_SECRET_ID,
        GOOGLE_CALLBACK_URL
    );

    const scopes = [
        'openid email profile'
    ];

    // Generate a secure random state value.
    const state = crypto.randomBytes(32).toString('hex');

    // Store state in the session
    // req.session.state = state;

    // Generate a url that asks permissions for the Drive activity and Google Calendar scope
    const authorizationUrl = oauth2Client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: 'offline',
        /** Pass in the scopes array defined above.
            * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
        scope: scopes,
        // Enable incremental authorization. Recommended as a best practice.
        include_granted_scopes: true,
        // Include the state parameter to reduce the risk of CSRF attacks.
        state: state
    });
    res.redirect(authorizationUrl);
});

route.get('/github', (req, res) => {
    let redirectURL = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_CALLBACK_URL}&scope=user`;
    res.redirect(redirectURL);
});

route.get('/auth/facebook', async (req, res) => {
    res.json({
        success: true
    })
});

route.post('/auth/facebook/login', async (req, res) => {
    const result = {
        success: true,
        redirectURL: '/account'
    }
    let body = req.body;
    if (body.email) {
        let email = body.email;
        let foundUser = await User.findOne({ email });
        if (!foundUser) {
            let [lastName, firstName] = body.name.split(' ');
            let user = new User({ email, confirmemail: email, confirmpassword: 'password', password: 'password', lastName, firstName });
            let saveResult = await user.save();
            if (saveResult._id) {
                createJWTToken(res, saveResult._id);
                return res.json(result);
            }
        }
        createJWTToken(res, foundUser._id);
    }

    res.json(result)
});

route.get('/auth/facebook/delete', async (req, res) => {
    res.json({
        success: true
    })
});

route.get('/auth/github', async (req, res) => {
    const requestToken = req.query.code;

    if (!requestToken) {
        return res.status(400).send("Code not found.");
    }
    try {
        // Step 3: Exchange code for access token
        const tokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code: requestToken,
            redirect_uri: process.env.GITHUB_CALLBACK_URL
        },
            {
                headers: {
                    accept: 'application/json'
                }
            }
        );
        const accessToken = tokenResponse.data.access_token;
        if (!accessToken) {
            return res.status(400).send("Failed to get access token.");
        }
        // Step 4: Use access token to get user info
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `token ${accessToken}`
            }
        });

        const user = userResponse.data;

        if (user.email) {
            let email = user.email;
            let foundUser = await User.findOne({ email });
            if (!foundUser) {
                let [lastName = 'Test Lastname', firstName = 'Test firstName'] = user.name.split(' ');
                let createUser = new User({ email, confirmemail: email, confirmpassword: 'password', password: 'password', lastName, firstName });
                let saveResult = await createUser.save();
                if (saveResult._id) {
                    createJWTToken(res, saveResult._id);
                    return res.redirect('/account');
                }
            }
            createJWTToken(res, foundUser._id);
        }
        res.redirect('/account');

    } catch (error) {
        console.error('OAuth error:', error);
        res.status(500).send('Authentication failed.');
    }
});


route.get('/auth/google', async (req, res) => {
    let q = url.parse(req.url, true).query;

    if (q.error) { // An error response e.g. error=access_denied
        console.log('Error:' + q.error);
        // } else if (q.state !== req.session.state) { //check state value
        //     console.log('State mismatch. Possible CSRF attack');
        //     res.end('State mismatch. Possible CSRF attack');
    } else { // Get access and refresh tokens (if access_type is offline)

        let { tokens } = await oauth2Client.getToken(q.code);
        await oauth2Client.setCredentials(tokens);

        var data = jwt.decode(tokens.id_token);
        if (data.email) {
            let email = data.email;
            let foundUser = await User.findOne({ email });
            if (!foundUser) {
                let [lastName, firstName] = data.name.split(' ');
                let user = new User({ email, confirmemail: email, confirmpassword: 'password', password: 'password', lastName, firstName });
                let saveResult = await user.save();
                if (saveResult._id) {
                    createJWTToken(res, saveResult._id);
                    return res.redirect('/account');
                }
            }
            createJWTToken(res, foundUser._id);
        }
        res.redirect('/account');
    };
});

route.post('/update', function (req, res) {
    async function run() {
        try {
            await client.connect();
            let query = { UserID: 1 };
            let db = client.db("user-account");
            let newValues = { $set: req.body };
            let result = await db.collection("users").updateOne(query, newValues);
            await client.close();
            res.send(result);
        } finally {
            // Ensures that the client will close when you finish/error
            await client.close();
        }
    }
    run().catch(console.dir);
});

const bucketName = process.env.S3_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

route.post("/files", upload.array('files', 12), async (req, res) => {
    var files = req.files;
    const client = new S3Client({
        region,
        credentials: {
            accessKeyId: AWS_ACCESS_KEY,
            secretAccessKey: AWS_SECRET_ACCESS_KEY
        }
    });

    let result;
    for (let file of files) {
        const params = {
            Bucket: bucketName,
            Body: file.buffer,
            Key: file.originalname,
            ContentType: file.mimetype
        };
        console.log(params);
        const command = new PutObjectCommand(params);
        result = await client.send(command);
    }

    if (res.status(200)) {
        return res.json(result);
    }
    return res.json({});
});


module.exports = route;
