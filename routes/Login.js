const express = require('express');
const router = express.Router();
const debug = require('debug')('sellay:server');
const { authSource } = require('../scripts/middlewares/jwtMiddleware');

router.get('/', function (req, res) {
    res.render('profile');
});

router.get('/logout', function (req, res) {
    res.redirect('/');
});
module.exports = router;
