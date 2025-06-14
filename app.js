
const createError = require('http-errors');
const express = require('express');
const cors = require("cors");
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')

const { setupViewEngine, setupMorganLogging, connectMongoDB } = require('./scripts/globalHelpers');
const { authenticateAdminToken } = require('./scripts/middlewares/jwtMiddleware');
const { setupRoutes } = require('./scripts/routes');
const app = express();

const dotenv = require('dotenv');
dotenv.config();

app.use(cookieParser());

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.text({type: '/'}));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));

app.disable('strict routing');

// TODO: Rewrire this apploach
// Remove trailing slashes (except root) /login/ -> /login
app.use((req, res, next) => {
    if (req.path.length > 1 && req.path.endsWith('/')) {
      res.redirect(301, req.path.slice(0, -1) + req.url.slice(req.path.length));
    } else {
      next();
    }
});

// Protect all routes below this line
app.use(authenticateAdminToken);
setupViewEngine(app, __dirname);

setupMorganLogging(app, __dirname + '/logs');

setupRoutes(app);
connectMongoDB(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404, 'Endpoint not found'));
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

module.exports = app;
