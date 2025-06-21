module.exports = {
    JWT_EXP_TIME : 10 * 1000, // 10s Customer
    JWT_EXP_TIME_ADMIN : 1000 * 60 * 60 * 24 * 31, // 1month Admin user
    USER_DB_SECRET:'secret_jwt',
    SITE_SECRET:'secret_site',
    BRYPT_SALT: 10
}