path = require('path');
var jwt = require('jwt-simple');
var security_key = require('../Config/security_key');
var User = require('../models/users');


exports.authenticateApi = function(req, res, next) {
    var token = getToken(req.headers);
    console.log(token);
    if (token && token !== null) {
        console.log("1");
        try {
            console.log("3");
            var decoded = jwt.decode(token, security_key.secret);
            console.log(decoded);
            User.findOne({
                'email': decoded.Users.email
            }, function(err, user) {
                console.log("err", user);
                console.log("errerrerrerr");
                if (!user) {
                    return res.status(451).send({ error: { message: 'Invalid token' } });
                } else {
                    console.log("4");
                    req.decode = decoded;
                    next();
                }
            });
        } catch (e) {
            console.log("2");
            console.log(e);
            return res.status(451).send({
                error: { message: 'Invalid token' }
            });
        }
    } else {
        return res.status(451).send({ error: { message: 'No token provided.please pass valid token in header' } });
    }
}
exports.OnlyAccesByAdmin = function(req, res, next) {
    console.log("++++++++", req.decode);
    var role = req.decode.Users.role;
    if (role && role == 1) {
        next();
    } else {
        return res.status(451).send({ error: { message: 'No Authorization for this api' } });
    }
};

/**
 * @author Rupesh
 * @param {type} headers
 * @returns {nm$_AuthController.getToken.parted}
 */
getToken = function(headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        console.log(parted);
        if (parted.length === 2 && parted[0] == 'Jloyds') {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
}