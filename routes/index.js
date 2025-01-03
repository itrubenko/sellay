var express = require('express');
var router = express.Router();
const { MongoClient } = require("mongodb");
const uri = "mongodb://admin:password@localhost:27017";
const client = new MongoClient(uri);

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index',{ title: 'Express 1' });
});

/* GET home page. */
router.get('/profile', function(req, res) {
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

router.post('/update', function(req, res) {
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

module.exports = router;
