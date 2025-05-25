
const jwt = require('jsonwebtoken');
const {
    JWT_EXP_TIME,
    JWT_EXP_TIME_ADMIN,
    USER_DB_SECRET,
    SITE_SECRET
} = require('../scripts/constants');

const createJWTToken = (res, id, isAdmin) => {
    const expiresTimeMS = isAdmin ? JWT_EXP_TIME_ADMIN : JWT_EXP_TIME;
    const secretKey = isAdmin ? SITE_SECRET : USER_DB_SECRET;
    const cookieTokenName = isAdmin ? 'jwt_global' : 'jwt';
    const token = jwt.sign({ id }, secretKey, { expiresIn: expiresTimeMS});

    res.cookie(cookieTokenName, token, {
        httpOnly: true,
        maxAge: expiresTimeMS
    });

    return token;
}

module.exports = {
    createJWTToken
}