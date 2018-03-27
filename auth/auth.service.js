'use strict';

import config from '../config/environment';
import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';
import compose from 'composable-middleware';
import {User} from'../sqldb';

const validateJwt = expressJwt({
    secret: config.secrets.session
});

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
export function isAuthenticated() {
    return compose().use(function (req, res, next) {  // Validate jwt
        // allow access_token to be passed through query parameter as well
        if (req.query && req.query.hasOwnProperty('access_token')) {
            req.headers.authorization = 'Bearer ' + req.query.access_token;
        }
        // IE11 forgets to set Authorization header sometimes. Pull from cookie instead.
        if (req.query && typeof req.headers.authorization === 'undefined') {
            req.headers.authorization = 'Bearer ' + req.cookies.token;
        }
        validateJwt(req, res, next);
    }).use(function (req, res, next) { // Attach user to request
        User.find({
            where: {
                _id: req.user._id
            }
        }).then((item) => {
            if (!item) {
                return res.sendStatus(401);
            }
            req.user = item;
            next();
            return null;
        }).catch((err) => {
            next(err);
        });
        // avoid the "UnauthorizedError: jwt malformed" error
    }).use((err, req, res, next) => {
        if (err) {
            console.log('auth error : ');
            console.log(err);
            res.sendStatus(401);
        } else {
            next();
        }
    });
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
export function hasRole(roleRequired) {
    if (!roleRequired) {
        throw new Error('Required role needs to be set');
    }

    return compose().use(isAuthenticated()).use(function meetsRequirements(req, res, next) {
        if (config.userRoles.indexOf(req.user.role) >=
                config.userRoles.indexOf(roleRequired)) {
            next();
        } else {
            res.status(403).send('Forbidden');
        }
    });
}

/**
 * Returns a jwt token signed by the app secret
 */
export function signToken(id, role) {
    return jwt.sign({_id: id, role: role}, config.secrets.session, {
        expiresIn: config.authTokenLifetime // 60 * 60 * 5
    });
}

/**
 * Set token cookie directly for oAuth strategies
 */
export function setTokenCookie(req, res) {
    if (!req.user) {
        return res.status(404).send('It looks like you aren\'t logged in, please try again.');
    }
    let token = signToken(req.user._id, req.user.role);
    res.cookie('token', token);
    res.redirect('/');
}
