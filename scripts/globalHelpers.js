const fs = require('fs');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');

const setupLogging = (app, dir) => {
    // create a write stream (in append mode)
    const accessLogStream = fs.createWriteStream(path.join(dir, 'access.log'), { flags: 'a' });
    // setup the logger
    app.use(morgan('common', { stream: accessLogStream }));
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
    const eta = new Eta({ views: path.join(dirname, "views") });
    app.engine("eta", buildEtaEngine(eta));
    app.set("view engine", "eta");
    app.set('views', path.join(dirname, 'views'));
}

module.exports = {
    setupViewEngine,
    setupLogging,
    connectDB
}