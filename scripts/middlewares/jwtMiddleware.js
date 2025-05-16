
const authSource = (req, res, next) => {
    const jwt = require('jsonwebtoken');
    let jwtCookie = req.cookies.jwt;

    jwt.verify(jwtCookie, 'secret_jwt', function (err, decoded) {
        if (!decoded) {
            return res.redirect('/users');
        }
        next();
    });
}

module.exports = {
    authSource
}