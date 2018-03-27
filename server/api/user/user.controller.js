'use strict';

import {User} from '../../sqldb';
import * as config from '../../config/environment';
import jwt from 'jsonwebtoken';

function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function (entity) {
        if (entity) {
            return res.status(statusCode).json(entity);
        }
        return null;
    };
}

function saveUpdates(updates) {
    return function (entity) {
        if (entity) {
            return entity.updateAttributes(updates).then(updated => {
                return updated;
            });
        }
    };
}

function removeEntity(res) {
    return function (entity) {
        if (entity) {
            return entity.destroy().then(() => {
                res.status(204).end();
            });
        }
    };
}

function handleEntityNotFound(res) {
    return function (entity) {
        if (!entity) {
            res.status(404).end();
            return null;
        }
        return entity;
    };
}

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function (err) {
        console.log(err);
        res.status(statusCode).send(err);
    };
}

export function index(req, res) {
    let userFilter = req.query ? req.query : {role: 'user'};
    let exclude = [];
    let where = {};

    let isAdmin = req.user.role === 'admin';
    if (!isAdmin) {
        return res.sendStatus(403);
    }

    if(!req.query.uniqueId) {
        if (userFilter.role) {
            where.role = userFilter.role;

            if (userFilter.push_id) {
                where.push_id = {$ne : null}; // Todo : link it with notification list
            }

            if (userFilter.receive_mail_authorisation) {
                where.receive_mail_authorisation = userFilter.receive_mail_authorisation;
            }
        }

        if (userFilter.isCsv) {
            exclude = ['_id', 'title', 'firstname','role', 'password', 'salt', 'resetPassword', 'resetPasswordSalt', 'updatedAt'];
        }

        return User.findAndCountAll({
            limit: 10000,
            offset: 0,
            where: where,
            attributes: {
                exclude: exclude
            }

        })
            .then(respondWithResult(res))
            .catch(handleError(res));
    } else {
        return User.find({
            where: {
                _id: req.query.uniqueId
            }
        }).then(user => {
            if (!user) {
                return res.status(404).end();
            }
            res.json(user);
        }).catch(err => next(err));
    }
}

export function create(req, res, next) {

    return User.build(req.body).save().then((user) => {
        let token = jwt.sign({_id: user._id}, config.secrets.session, {
            expiresIn: config.authTokenLifetime
        });
        res.status(201).json({
            token: token,
            _id: user._id
        });
    }).catch( (err) => {
        if(err.name = 'SequelizeValidationError:'){
            return res.status(422).json({
                error: err.message
            });
        }
        res.sendStatus(500);
    });
}

export function destroy(req, res) {
    return User.destroy({
        where: {
            _id: req.params.id
        }
    }).then(() => {
        res.status(204).end();
    }).catch(handleError(res));
}

export function update(req, res) {
    let userId = req.params.id;

    return User.find({
        where: {
            _id: userId
        }
    }).then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function me(req, res, next) {
    let userId = req.user._id;
    return User.find({
        where: {
            _id: userId
        }
    }).then((user) => {
        if (!user) {
            return res.status(401).end();
        }

        let newUserData = user.toJSON();
        delete newUserData.resetPassword;
        delete newUserData.resetPasswordSalt;
        res.send(newUserData);
    }).catch(err => next(err));
}
