const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const debug = require('debug')('sellay:server');
const User = require('../db/User');
const { authSource } = require('../scripts/middlewares/jwtMiddleware');
const { createToken } = require('../scripts/jwtHelpers');

const connect = async () => {
    mongoose.connect('mongodb://root:example@localhost:27017/sellay?authSource=admin')
        .then(() => console.log('Connected to database movieDB'))
        .catch((err) => console.log(err));
}

connect();

router.get('/', function (req, res) {
    res.render('profile');
});

router.get('/profile', authSource, function (req, res) {
    res.render('profileLoggedIn');
});

function handleErrors(err) {
    let errors = {
        formErrors: {},
        globalErrorMessage: ''
    };

    if (err.name === 'ValidationError') {
        Object.values(err.errors).forEach(function(field) {
            errors.formErrors[field.path] = field.message ;
        });
    }

    if (err.code === 11000) {
        // Duplicate key error (unique fields like email)
        // errors = [`Duplicate field: ${Object.keys(err.keyValue)[0]}`]
        // errors['email'] = 'Already exists';
        errors.globalErrorMessage = 'Already exists';
    }

    if (err.name === 'Error') {
        if (err.message.includes('incorrect password') || err.message.includes('incorrect email')) {
            errors.globalErrorMessage = 'Invalid login or password. Remember that password is case-sensitive. Please try again.';
        }
    }
    return errors;
}

router.post('/register',
    async function (req, res, next) {
        let registerResult = {
            success: true,
            formErrors: {},
            errorMessage: ''
        };
        let { password, confirmpassword, email, confirmemail } = req.body;

        if (password !== confirmpassword) {
            // TODO: Check
        }

        if (email !== confirmemail) {
            // TODO: Check
        }

        try {
            let user = new User(req.body);
            saveResult = await user.save();
            let token;
            if (saveResult._id) {
                token = createToken(saveResult._id);
            }
            res.cookie('jwt', token, {
                httpOnly: true,
                maxAge: 10 * 1000 //ms
            })
            res.status(200).json(registerResult);
        } catch (error) {
            let result = handleErrors(error);
            registerResult.success = false;
            res.status(200).json({...registerResult, ...result});
        }
    }
);

router.post('/login',
    async function (req, res) {
        let loginResult = {
            success: true,
            formErrors: {},
            globalErrorMessage: ''
        }
        let { email, password } = req.body;
        try {
            const user = await User.login(email, password);
            if (user._id) {
                token = createToken(user._id);
            }
            res.cookie('jwt', token, {
                httpOnly: true,
                maxAge: 10 * 1000 //ms
            })
            res.status(200).json(loginResult);
        } catch (error) {
            let result = handleErrors(error);
            loginResult.success = false;
            res.status(200).json({...loginResult, ...result});
        }
    });

router.get('/profileLoggedIn',

    function (req, res, next) {
        res.render('profileLoggedIn')

});
module.exports = router;
