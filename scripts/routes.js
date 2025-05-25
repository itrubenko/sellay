const indexRouter = require('../routes/Index');
const usersRouter = require('../routes/Login');
const accountRouter = require('../routes/Account');

const setupRoutes = app => {
    app.use('/', indexRouter);
    app.use('/login', usersRouter);
    app.use('/account', accountRouter);
}

module.exports = {
    setupRoutes
}