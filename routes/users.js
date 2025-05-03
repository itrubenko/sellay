const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const debug = require('debug')('sellay:server');
const User = require('../db/User');

const connect = async () => {
    mongoose.connect('mongodb://root:example@localhost:27017/sellay?authSource=admin')
        .then(() => console.log('Connected to database movieDB'))
        .catch((err) => console.log(err));
}

connect();

function authSource(req, res, next) {
    const jwt = require('jsonwebtoken');
    let jwtCookie = req.cookies.jwt;
    debug("jwtCookie:" + jwtCookie);
    jwt.verify(jwtCookie, 'secret_jwt', function(err, decoded) {
        if (!decoded) {
            return res.redirect('/users');
        }
        next();
    });
}
router.get('/', function(req, res) {

    res.render('profile');
});

// /* GET home page. */
router.get('/profile', authSource, function(req, res) {
    res.render('profileLoggedIn');
});


// /* GET home page. */
router.get('/profile2', function(req, res) {
    res.render('profileLoggedIn');
});


function createToken(id) {
    const jwt = require('jsonwebtoken');
    return jwt.sign({id}, 'secret_jwt', { expiresIn: 10 }); //sec
}


router.post('/register',
    function (req, res, next) {

        next();
    },
    async function (req, res, next) {
        let { email , password } = req.body;


        var user = new User({ email, password });

        let saveResult = await user.save();

        let token;
        if (saveResult._id) {
            token = createToken(saveResult._id);

        }
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 10 * 1000 //ms
        })
        res.status(200).json({token});
});


router.post('/login',
    async function (req, res) {
        let { email , password } = req.body;
        try {
            const user = await User.login(email, password);
            if (user._id) {
                token = createToken(user._id);
            }
            res.cookie('jwt', token, {
                httpOnly: true,
                maxAge: 10 * 1000 //ms
            })
            res.status(200).json({user: user._id})
        } catch (error) {
            res.status(400).json({});
        }

});

// router.get('/profileLoggedIn',
//     function (req, res, next) {
//         res.render('profileLoggedIn')

// });
module.exports = router;
