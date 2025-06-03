const fs = require('fs');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');

const setupLogging = (app, dir) => {
    // Capture response body
    app.use((req, res, next) => {
        const oldSend = res.send;
        res.send = function (body) {
            res.locals.body = body;
            return oldSend.call(this, body);
        };
        next();
    });

    morgan.token('req-body', (req) => 'Request: ' + JSON.stringify(req.body));
    morgan.token('res-body', (req, res) => {
        let data = 'HTML';
        try {
            data = typeof JSON.parse(res.locals.body) === 'object' ? res.locals.body : data;
        } catch (error) {}
        return 'Response: ' + data;
    });

    // create a write stream (in append mode)
    const accessLogStream = fs.createWriteStream(path.join(dir, 'access.log'), { flags: 'a' });
    app.use(
        morgan('[:date[clf]] :status :method :url  :req-body :res-body :response-time ms', {
            stream: accessLogStream,
            interval: '1d'
        })
    );
}

const connectDB = async () => {
    await mongoose.connect('mongodb://root:example@localhost:27017/sellay?authSource=admin')
        .then(() => console.log('Connected to database Sellay'))
        .catch((err) => console.log(err));
}

const buildEtaEngine = (eta) => {
    return (path, opts, callback) => {
        try {
            const fileContent = eta.readFile(path);
            const renderedTemplate = eta.renderString(fileContent, opts);
            callback(null, renderedTemplate);
        } catch (error) {
            callback(error);
        }
    };
}

const setupViewEngine = (app, dirname) => {
    const { Eta } = require("eta");
    const preferences = require('./preferences');
    const data = JSON.stringify({ preferences });
    const eta = new Eta({
        views: path.join(dirname, "views"),
        functionHeader:`Object.entries(${data}||{}).forEach(([k,v])=>globalThis[k]=v)`
    });
    app.engine("eta", buildEtaEngine(eta));
    app.set("view engine", "eta");
    app.set('views', path.join(dirname, 'views'));
}

module.exports = {
    setupViewEngine,
    setupLogging,
    connectDB
}