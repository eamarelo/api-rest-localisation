/**
 * Main application file
 */

'use strict';

import express from 'express';
import sqldb from './sqldb';
import config from './config/environment';
import http from 'http';

// Populate databases with sample data
if (config.seedDB) {
    require('./config/seed');
}

// Setup server
var app = express();
var server = http.createServer(app);
var socketio = require('socket.io')(server, {
    serveClient: app.get('env') !== 'production',
    path: '/socket.io-client'
});
require('./config/socketio').default(socketio);
require('./config/express').default(app);
require('./routes').default(app);

// Start server
function startServer() {
    app.angularFullstack = server.listen(config.port, config.ip, function () {
        console.log('Express server listening on', config.port, 'in', app.get('env'));
    });
}

sqldb.sequelize.sync().then(startServer).catch(function (err) {
    console.log('Server failed to start due to error: %s', err);
});

// Expose app
exports = module.exports = app;

(function(){
    if(console.log){
        var old = console.log;
        console.log = function(){
            Array.prototype.unshift.call(arguments, '[' + new Date().toISOString().replace('T', ' ').replace('Z', '') + ']');
            old.apply(this, arguments);
        };
    }  
})();