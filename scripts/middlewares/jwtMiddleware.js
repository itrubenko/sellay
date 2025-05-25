
const jwt = require('jsonwebtoken');
const { JWT_EXP_TIME, USER_DB_SECRET, SITE_SECRET } = require('../constants');

const authSource = (req, res, next) => {
    let jwtCookie = req.cookies.jwt;

    jwt.verify(jwtCookie, USER_DB_SECRET, function (err, decoded) {
        if (!decoded) {
            return res.redirect('/login');
        }
        next();
    });
}

const createCustomerToken = (res, id) => {
    let token = jwt.sign({ id }, USER_DB_SECRET, { expiresIn: 10 }); //sec
    res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: JWT_EXP_TIME
    });

    return token;
}

module.exports = {
    createJWTToken: createCustomerToken,
    authSource
}