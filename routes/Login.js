const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
    const payload = {
        registerFormActionURL: '/register',
        loginFormActionURL: '/account/login'
    }
    res.render('profile', payload);
});

router.get('/logout', function (req, res) {
    res.redirect('/');
});
module.exports = router;
