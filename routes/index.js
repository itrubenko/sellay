const express = require('express');
const route = express.Router();
const multer  = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { PutObjectCommand, S3Client }  = require('@aws-sdk/client-s3');

/* GET home page. */
route.get('/', function(req, res, next) {
    res.render('index',{ title: 'Express 1' });
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
