const express = require('express');
const router = express.Router();
const User = require('../db/User');
const { authSource } = require('../scripts/middlewares/jwtMiddleware');
const { createJWTToken } = require('../scripts/jwtHelpers');

router.get('/', authSource, function (req, res) {
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

router.get('/', authSource, function (req, res) {
    res.render('profileLoggedIn');
});

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
            let saveResult = await user.save();
            let token;
            if (saveResult._id) {
                token = createJWTToken(res, saveResult._id);
            }
            res.status(200).json(registerResult);
        } catch (error) {
            let result = handleErrors(error);
            registerResult.success = false;
            res.status(200).json({...registerResult, ...result});
        }
    }
);

// router.post('/editprofile', async function(req, res));
// router.post('/saveprofile', async function(req, res));
// router.post('/editpassword', async function(req, res));
// router.post('/SavePassword', async function(req, res));
// router.post('/PasswordResetDialogForm', async function(req, res));
// router.post('/PasswordReset', async function(req, res));
// router.post('/SetNewPassword', async function(req, res));
// router.post('/DoSetNewPassword', async function(req, res));
// router.post('/SaveNewPassword', async function(req, res));

router.post('/login',
    async function (req, res) {
        let loginResult = {
            success: true,
            formErrors: {},
            globalErrorMessage: ''
        }
        let { email, password } = req.body;
        // TODO: Params validation flow for all endpoints
        if (!email || !password) {
            loginResult.success = false;
            loginResult.globalErrorMessage = "Insufficiant params";
            return res.status(200).json(loginResult);
        }
        let isAdmin = res.locals.admin;
        delete res.locals.admin;
        try {
            const user = await User.login(email, password);
            if (user._id) {
                token = createJWTToken(res, user._id, isAdmin);
            }
            res.status(200).json(loginResult);
        } catch (error) {
            let result = handleErrors(error);
            loginResult.success = false;
            res.status(200).json({...loginResult, ...result});
        }
    }
);

module.exports = router;
