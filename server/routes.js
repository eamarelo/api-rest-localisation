/* global __dirname */
'use strict';

import path from 'path';
import config from './config/environment';
import express from 'express';

export default function (app) {

    // Insert routes below
    app.use('/api/users', require('./api/user'));
    app.use('/api/types', require('./api/type'));
    app.use('/api/sections', require('./api/section'));
    app.use('/api/purchase', require('./api/purchaseOrder'));
    app.use('/api/messages', require('./api/message'));
    app.use('/api/notifications', require('./api/notification'));

    // Auth && email verification
    app.use('/auth', require('./auth').default);
    app.use('/verification', require('./tools/verification'));
    app.use('/password', require('./tools/password'));

    // All undefined asset or api routes should return a 404
    app.route('/:url(api|auth|components|app|bower_components|assets)/*').get((req, res) => {
        res.status(404).send('Not Found !');
    });

    if (config.picturesEndpoint && config.files_upload_dir) {
        app.use(config.picturesEndpoint, express.static(config.files_upload_dir));
    }

    // All other routes should redirect to the index.html
    app.route('/*').get((req, res) => {
        res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
}
