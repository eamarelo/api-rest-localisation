'use strict';

import crypto from 'crypto';
import randomize from 'randomatic';

var validatePresenceOf = function (value) {
    return value && value.length;
};

module.exports = function (sequelize, DataTypes) {
    let User = sequelize.define(

        'User',
        {
            _id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            title: {
                type: DataTypes.ENUM('mr', 'mrs'),
                defaultValue: 'mr'
            },
            firstname: {
                type: DataTypes.STRING,
                allowNull: true
            },
            lastname: {
                type: DataTypes.STRING,
                allowNull: false
            },
            address: {
                type: DataTypes.STRING
            },
            role: {
                type: DataTypes.ENUM('user','admin'),
                defaultValue: 'user'
            },
            push_id : {
                type: DataTypes.STRING,
                allowNull: true
            },
            dl_number: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            receive_mail_authorisation: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: {
                    msg: 'The specified email address is already in use.'
                },
                validate: {
                    isEmail: true
                }
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true
                },
                scopes: ['self']
            },
            salt: DataTypes.STRING,
            resetPassword: DataTypes.STRING,
            resetPasswordSalt: DataTypes.STRING
        },
        {
            /**
             * Pre-save hooks
             */
            hooks: {
                beforeBulkCreate: function (users, fields, fn) {
                    let totalUpdated = 0;
                    users.forEach(function (user) {
                        user.updatePassword(function (err) {
                            if (err) {
                                return fn(err);
                            }
                            totalUpdated += 1;
                            if (totalUpdated === users.length) {
                                return fn();
                            }
                        });
                    });
                },
                beforeCreate: function (user, fields, fn) {
                    user.updatePassword(fn);
                },
                beforeUpdate: function (user, fields, fn) {
                    if (user.changed('password')) {
                        return user.updatePassword(fn);
                    }
                    if (user.changed('resetPassword')) {
                        return user.updateResetPassword(fn);
                    }
                    fn();
                }
            },

            /**
             * Instance Methods
             */
            instanceMethods: {
                /**
                 * Authenticate - check if the passwords are the same
                 *
                 * @param {String} password
                 * @param {Function} callback
                 * @return {Boolean}
                 * @api public
                 */
                authenticate: function (password, callback) {
                    if (!callback) {
                        return this.password === this.encryptPassword(password);
                    }

                    let _this = this;
                    this.encryptPassword(password, function (err, pwdGen) {
                        if (err) {
                            callback(err);
                        }

                        if (_this.password === pwdGen) {
                            callback(null, true);
                        } else {
                            callback(null, false);
                        }
                    });
                },

                /**
                 * Make salt
                 *
                 * @param {Number} byteSize Optional salt byte size, default to 16
                 * @param {Function} callback
                 * @return {String}
                 * @api public
                 */
                makeSalt: function (byteSize, callback) {
                    let defaultByteSize = 16;

                    if (typeof arguments[0] === 'function') {
                        callback = arguments[0];
                        byteSize = defaultByteSize;
                    } else if (typeof arguments[1] === 'function') {
                        callback = arguments[1];
                    }

                    if (!byteSize) {
                        byteSize = defaultByteSize;
                    }

                    if (!callback) {
                        return crypto.randomBytes(byteSize).toString('base64');
                    }

                    return crypto.randomBytes(byteSize, function (err, salt) {
                        if (err) {
                            callback(err);
                        }
                        return callback(null, salt.toString('base64'));
                    });
                },

                /**
                 * Encrypt password
                 *
                 * @param {String} password
                 * @param {Function} callback
                 * @return {String}
                 * @api public
                 */
                encryptPassword: function (password, callback) {
                    if (!password || !this.salt) {
                        if (!callback) {
                            return null;
                        }
                        return callback(null);
                    }

                    let defaultIterations = 10000;
                    let defaultKeyLength = 64;
                    let salt = new Buffer(this.salt, 'base64');

                    if (!callback) {
                        return crypto.pbkdf2Sync(password, salt, defaultIterations, defaultKeyLength, 'sha1')
                                .toString('base64');
                    }

                    return crypto.pbkdf2(password, salt, defaultIterations, defaultKeyLength, 'sha1',
                        function (err, key) {
                            if (err) {
                                callback(err);
                            }
                            return callback(null, key.toString('base64'));
                        });
                },

                /**
                 * Update password field
                 *
                 * @param {Function} fn
                 * @return {String}
                 * @api public
                 */
                updatePassword: function (fn) {
                    // Handle new/update passwords
                    if (this.password) {
                        if (!validatePresenceOf(this.password)) {
                            fn(new Error('Invalid password'));
                        }

                        // Make salt with a callback
                        let _this = this;
                        this.makeSalt(function (saltErr, salt) {
                            if (saltErr) {
                                fn(saltErr);
                            }
                            _this.salt = salt;
                            _this.encryptPassword(_this.password, function (encryptErr, hashedPassword) {
                                if (encryptErr) {
                                    fn(encryptErr);
                                }
                                _this.password = hashedPassword;
                                fn(null);
                            });
                        });
                    } else {
                        fn(null);
                    }
                },
                updateResetPassword: function (fn) {
                    if (this.resetPassword) {
                        let _this = this;
                        this.makeSalt(function (saltErr, salt) {
                            if (saltErr) {
                                fn(saltErr);
                            }
                            _this.resetPasswordSalt = randomize('Aa0', 80);
                            fn(null);
                        });
                    } else {
                        fn(null);
                    }
                },
                toJSON: function () {
                    let values = Object.assign({}, this.get());
                    delete values.salt;
                    delete values.password;
                    delete values.resetPassword;
                    delete values.resetPasswordSalt;
                    return values;
                }
            }
        }
    );

    return User;
};
