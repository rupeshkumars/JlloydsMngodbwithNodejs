module.exports = {
    development: {
        dbName: process.env.DB_NAME,
        dbUserName: process.env.DB_USERNAME,
        dnHost: process.env.DB_HOSTNAME,
        dbPwd: process.env.DB_PASSWORD,
        dialect: process.env.DIALECT,
        socketPath: process.env.SocketPath
    }
};