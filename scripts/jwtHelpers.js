
const createToken = id => {
    const jwt = require('jsonwebtoken');
    return jwt.sign({ id }, 'secret_jwt', { expiresIn: 10 }); //sec
}

module.exports = {
    createToken
}