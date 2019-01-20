const bcrypt = require("bcrypt");
var mongoose = require('mongoose');
require('mongoose-double')(mongoose);
var Schema = mongoose.Schema;

var SchemaTypes = Schema.Types;
ObjectId = Schema.ObjectId;
var UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: Number, unique: false, min: 10, required: true },
    company_license: { type: Number, default: 1 },
    role: { type: Number },
    licenseStartDate: Date,
    licenseEndDate: Date,
    companyName: { type: String, unique: true },
    is_activated: { type: Number },
    createdAt: Date,
    updatedAt: Date,
}, {
    usePushEach: true
});
UserSchema.pre('save', function(next) {
    var user = this;
    var currentDate = new Date();
    this.updatedAt = currentDate;

    if (!this.role) {
        this.role = 2
    }
    if (this.role && this.role == 2) {
        this.company_license = 2;
        this.is_activated = 2
    }
    if (this.role && this.role == 1) {
        this.is_activated = 1
    }
    if (!this.createdAt)
        this.createdAt = currentDate;


    module.exports.findOne({ "phone": parseInt(this.phone) }, function(err, resData) {
        if (resData) {
            next(new Error('phone must be unique'));
        } else {
            module.exports.findOne({ "email": user.email }, function(err, resData2) {
                if (resData2) {
                    next(new Error('email must be unique'));
                } else {
                    if (this.role === 1) {
                        if (user.password && (user.isModified('password') || user.isNew)) {
                            bcrypt.genSalt(10, function(err, salt) {
                                if (err) {
                                    return next(err);
                                }
                                bcrypt.hash(user.password, salt, function(err, hash) {
                                    if (err) {
                                        return next(err);
                                    }
                                    user.password = hash;
                                    next()

                                });
                            });
                        }
                    } else {
                        console.log("in Cvalidation");
                        module.exports.findOne({ "companyName": user.companyName }, function(err, resData3) {
                            if (resData3) {
                                next(new Error('companyName must be unique'));
                            } else {
                                if (user.password && (user.isModified('password') || user.isNew)) {
                                    bcrypt.genSalt(10, function(err, salt) {
                                        if (err) {
                                            return next(err);
                                        }
                                        bcrypt.hash(user.password, salt, function(err, hash) {
                                            if (err) {
                                                return next(err);
                                            }
                                            if (user.password && (user.isModified('password') || user.isNew)) {
                                                bcrypt.genSalt(10, function(err, salt) {
                                                    if (err) {
                                                        return next(err);
                                                    }
                                                    bcrypt.hash(user.password, salt, function(err, hash) {
                                                        if (err) {
                                                            return next(err);
                                                        }
                                                        user.password = hash;
                                                        next()

                                                    });
                                                });
                                            }
                                            user.password = hash;
                                            next()

                                        });
                                    });
                                }
                            }
                        });
                    }

                }
            });
        }
    });




});
// UserSchema.post('save', function (error, doc, next) {
//     var user=this;

//     module.exports.findOne({"phone": parseInt(doc.phone)}, function (err,resData) {
//         if (resData) {
//             next(new Error('phone must be unique'));
//         } else {
//             if (error.name === 'MongoError' && error.code === 11000) {
//                 module.exports.findOne({"email": doc.email}, function (err,resData) {
//                     //console.log("in user model class ", resData);
//                     if (resData) {
//                         next(new Error('email must be unique'));
//                     }
//                 });

//             } else {
//                 next(error);
//             }
//         }
//     });

// });
UserSchema.methods.disabledValidation = function() {
    UserSchema.set('validateBeforeSave', false);
};

UserSchema.methods.comparePassword = function(passw, cb) {
    bcrypt.compare(passw, this.password, function(err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};
module.exports = mongoose.model('User', UserSchema);