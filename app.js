
const createError = require('http-errors');
const express = require('express');
const cors = require("cors");
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
const { Eta } = require("eta");
const fs = require('fs');
const morgan = require('morgan');
// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

const indexRouter = require('./routes/Index');
const usersRouter = require('./routes/Login');
const accountRouter = require('./routes/Account');
const app = express();

// setup the logger
app.use(morgan('common', { stream: accessLogStream }));

const dotenv = require('dotenv');
dotenv.config();

const eta = new Eta({ views: path.join(__dirname, "views") });
app.engine("eta", buildEtaEngine());
app.set("view engine", "eta");
app.set('views', path.join(__dirname, 'views'));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.text({type: '/'}));
app.use('/uploads', express.static('uploads'));

app.use('/', indexRouter);
app.use('/login', usersRouter);
app.use('/account', accountRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

const mongoose = require('mongoose');
const connect = async () => {
    mongoose.connect('mongodb://root:example@localhost:27017/sellay?authSource=admin')
        .then(() => console.log('Connected to database movieDB'))
        .catch((err) => console.log(err));
}

connect();


// error handler
app.use(function(err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

function buildEtaEngine() {
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
module.exports = app;
