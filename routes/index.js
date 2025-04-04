const express = require('express');
const route = express.Router();
const { MongoClient } = require("mongodb");
const uri = "mongodb://admin:password@localhost:27017";
const client = new MongoClient(uri);
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const multer  = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { PutObjectCommand, S3Client }  = require('@aws-sdk/client-s3');

/* GET home page. */
route.get('/', function(req, res, next) {
    res.render('index',{ title: 'Express 1' });
});

/* GET home page. */
route.get('/profile', function(req, res) {
    const eventName = "serverOpening";
    client.on(eventName, event => {
        console.log(`received ${eventName}: ${JSON.stringify(event, null, 2)}`);
    });

    async function run() {
        try {
            await client.connect();

            let db = client.db("user-account");
            let collection = await db.collection("users").findOne();
            await client.close();
            res.send(collection);
        } finally {
            // Ensures that the client will close when you finish/error
            await client.close();
        }
    }
    run().catch(console.dir);
});

route.post('/update', function(req, res) {
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
