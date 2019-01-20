var bcrypt = require('bcrypt');
var jwt = require('jwt-simple');
var security_key = require('../Config/security_key');
var mongoose = require('mongoose');

/***********************************Model Invoke*********************************/
const Users = require('../models/users');

/**********************************Email Configuration********************************/

/************************************Email Templates***********************************/

/***
 * @author Rupesh Kumar Sharma
 * @param {type} req
 * @param {type} res
 */
exports.userRegistrations = function(req, res) {
    try {
        var request = req.body;
        exports.validateUsersCreat(request, function(err) {
            console.log(err);
            if (err) {
                console.log('1');
                res.status(400).send({ error: err })
            } else {
                var saveData = {
                    firstName: request.firstName,
                    lastName: request.lastName,
                    email: request.email,
                    companyName: request.companyName,
                    licenseStartDate: request.licenseStartDate,
                    licenseEndDate: request.licenseEndDate,
                    password: request.password,
                    phone: request.phone,
                    role: request.role
                };
                var newUser = new Users(saveData);
                newUser.save().then(Users => {
                    console.log("in");
                    console.log(Users);
                    var encript_Data = {
                        "expiresIn": Date.now() + (3600),
                        "Users": Users
                    }
                    var token = jwt.encode(encript_Data, security_key.secret);
                    var data = {
                        token: 'Jloyds ' + token,
                        expiresIn: 3600, //expiration time of 1 hr
                        Users: Users
                    };
                    // Send created user to client
                    res.status(200).send({ data })
                }).catch(function(err) {
                    var message = "Data validation failed";
                    if (err.message === 'email must be unique' || err.message === "phone must be unique" || err.message === "companyName must be unique") {
                        message = err.message;
                    }
                    console.log("error while new user saving data ", err.message);
                    // return res.json({ status: false, message: message, data: null });
                    // console.log(err);
                    // print the error details
                    res.status(400).send({ error: message })
                });
            }
        })

        // res.status(200).send({ data: {} })
    } catch (err) {
        res.status(400).send({ error: err })
    }


};
exports.validateUsersCreat = function(data, cb) {
    var message = {};
    try {

        if (!data.firstName || data.firstName == "") {
            message.firstName = "firstName should not empty"
        }
        if (!data.lastName || data.lastName == "") {
            message.lastName = "lastName should not empty"
        }
        if (!data.companyName || data.companyName == "") {
            message.companyName = "companyName should not empty"
        }
        if (!data.password || data.password == "") {
            message.password = "password should not empty"
        }
        if (!data.email || data.email == "") {
            message.email = "email should not empty"
        }
        if (!data.role || data.role == "") {
            message.role = "role should not empty"
        }
        if (!data.phone || data.phone == "") {
            message.role = "phone should not empty"
        }
        console.log(Object.keys(message).length);
        if (message && Object.keys(message).length > 0) {
            cb(message);
        } else {
            cb(null);
        }


    } catch (err) {
        cb(err);
    }

}
exports.ValidateCompanyName = function(req, res) {
    try {
        if (req.body.companyName && req.body.companyName != "") {
            Users.findOne({
                companyName: req.body.companyName,
                company_license: 1
            }, function(err, Users) {
                if (Users) {
                    res.status(200).send({ status: "success" })
                } else {
                    return res.status(200).send({ status: false });
                }
            });
        } else {
            return res.status(400).send({ error: { 'companyName': "not empty" } })
        }

    } catch (err) {
        return res.status(400).send({ error: err })
    }
}
exports.listofcompanies = function(res, res) {
    try {
        console.log("1");
        Users.find({
            "role": 2
        }, {
            "_id": 1,
            "company_license": 1,
            "firstName": 1,
            "lastName": 1,
            "email": 1,
            "companyName": 1,
            "licenseStartDate": 1,
            "licenseEndDate": 1,
            "phone": 1,
            "role": 1,
            "updatedAt": 1,
            "is_activated": 1,
        }).sort({ 'createdAt': -1 }).then(function(Users) {

            res.status(200).send({ Users })
        }).catch(function(err) {
            res.status(400).send({ error: err });
        });

    } catch (err) {
        res.status(400).send({ error: err })
    }
}
exports.updateInformation = function(req, res) {
        try {
            if (req.body.id && req.body.id != "") {
                var reqData = req.body;
                var updateData = {};
                if (reqData.cname && reqData.cname != "") {
                    updateData.companyName = reqData.cname;
                }
                if (reqData.licenseStartDate && reqData.licenseStartDate != "") {
                    updateData.licenseStartDate = reqData.licenseStartDate;
                }
                if (reqData.licenseEndDate && reqData.licenseEndDate != "") {
                    updateData.licenseEndDate = reqData.licenseEndDate;
                }
                if (reqData.company_license && reqData.company_license != "") {
                    updateData.company_license = parseInt(reqData.company_license);
                }
                if (Object.keys(updateData).length > 0) {
                    var options = { upsert: true };
                    var update = { $set: updateData };
                    Users.update({ _id: mongoose.Types.ObjectId(reqData.id) }, update, options, function() {
                        if (err) {
                            res.status(400).send({ error: { message: err } })
                        } else {
                            res.status(200).send({ status: "success" })
                        }
                    });

                } else {
                    res.status(400).send({ error: { message: "no data for update" } })
                }
            } else {
                res.status(400).send({ error: { message: "id requred" } })
            }
        } catch (err) {
            res.status(400).send({ error: err })
        }
    }
    /***
     * @author Rupesh
     * @param {type} req
     * @param {type} res
     * @description it is responsible to Authenticate the user
     */
exports.postlogin = function(req, res) {
    if (req.body.email && req.body.email != "" && req.body.password && req.body.password != "") {
        req.body.email = req.body.email.toLowerCase();
        Users.findOne({ 'email': req.body.email }, function(err, user) {
            if (err) {
                res.status(400).send({ error: { message: 'Authentication failed. User not found.' } });
            } else {
                if (!user) {
                    res.status(400).send({ error: { message: 'Authentication failed. User not found.' } });
                } else {
                    console.log("+++++++++++++++");
                    console.log(user);

                    user.comparePassword(req.body.password, function(err, isMatch) {
                        if (isMatch && !err) {
                            var encript_Data = {
                                "expiresIn": Date.now() + (3600),
                                "Users": user
                            }; //expiration time of 1 hr
                            var token = jwt.encode(encript_Data, security_key.secret);
                            var data = {
                                token: 'Jloyds ' + token,
                                Users: user,
                                expiresIn: 3600,
                            };
                            if (user.role && user.role != 1) {
                                console.log('1', user.is_activated, user.company_license);
                                if (user.company_license != 1) {
                                    res.status(400).send({ error: { message: 'Please Verify your company_license first.Your account is De-activated from admin' } });

                                } else {
                                    if (user.is_activated != 1) {
                                        res.status(400).send({ error: { message: 'Please Verify your account first.Your account is De-activated from admin' } });
                                    } else {
                                        console.log('2');
                                        res.status(200).send({ data });
                                    }

                                }
                            } else {
                                console.log('3');
                                if (user.is_activated != 1) {
                                    res.status(400).send({ error: { message: 'Please Verify your account  first.Your account is De-activated from admin' } });

                                } else {
                                    console.log('4');
                                    res.status(200).send({ data });
                                }
                            }

                        } else {
                            res.status(400).send({ error: { message: 'Authentication failed. Wrong password.' } });
                        }
                    });

                }
            }
        });

    } else {
        res.status(400).send({ error: { message: 'please provide us a valid email id' } });
    }
}