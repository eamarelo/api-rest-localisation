/* global __dirname */

'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
  if (!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server port
  port: process.env.PORT || 9000,

  // Server IP
  ip: process.env.IP || '0.0.0.0',

  // Should we populate the DB with sample data?
  seedDB: false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: 'QRDCx4eAAW69QuFXB8zPRjh7pYSobnDI7MWxjUv6fly8wWeYtpEbGZjzSG1KZ6Ldw'+
            'Ms3pMgbPqnEWZzYJr8fTanPrvsut8dYlPMBP5QZKp8n7mZapgiIOfmaEF2KJmC6fxr'+
            'UQaE6LDnbTD55oI9g38F21mSp1sYghxdNGuqWjL75Otr6BswhD58ej6TwB6u8oqGtl'+
            'yiTSiIPHGnuIqflAGM9GFvsAVDueRkFHUUDRBnITW8x4npMNQye3STUzc7O'
  },

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  }
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./shared'),
  require('./' + process.env.NODE_ENV + '.js') || {});
