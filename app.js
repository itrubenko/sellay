
var createError = require('http-errors');
var express = require('express');
var cors = require("cors");
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser')
const { Eta } = require("eta");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var app = express();

const dotenv = require('dotenv');
dotenv.config();

const eta = new Eta({ views: path.join(__dirname, "views") });
app.engine("eta", buildEtaEngine());
app.set("view engine", "eta");
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.text({type: '/'}));
app.use('/uploads', express.static('uploads'));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

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
