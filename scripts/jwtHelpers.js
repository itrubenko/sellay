
const { JWT_EXP_TIME } = require('../scripts/constants');
const createJWTToken = (res, id) => {
    const jwt = require('jsonwebtoken');
    let token = jwt.sign({ id }, 'secret_jwt', { expiresIn: JWT_EXP_TIME});
    res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: JWT_EXP_TIME
    });

    return token;
}

module.exports = {
    createJWTToken
}