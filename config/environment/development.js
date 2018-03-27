/* global __dirname */

'use strict';

import os from 'os';
import fs from 'fs';

const appName = 'cde';
let path = require("path");

let tempDir = os.tmpdir() + '/' + appName + '/';
let devHostName = 'Hornet';
let hostname = os.hostname();
let siteURL = (hostname === devHostName)? 'http://localhost:4000/' : 'https://cde.bfast.link/';
let files_upload_dir = (hostname === devHostName)? path.resolve(__dirname, '..', '..')+'/import' : path.resolve(__dirname, '..', '..','..', '..')+'/import';

let fileTab = [tempDir, files_upload_dir];

for (let i = 0; i <fileTab.length; i++) {
    if (!fs.existsSync(fileTab[i])) {
        fs.mkdirSync(fileTab[i]);
    }
}

module.exports = {
    env: 'dev',
    tempDir: tempDir,
    authTokenLifetime: 60 * 60 * 60 * 24 + 7200, // one month
    sequelize: {
        uri: (hostname === devHostName)? 'mysql://root:root@localhost/cde' : 'mysql://cde:U1SFR05bdNCGALQi@db002.hosting.bfast-system.net/cde',
        options: {
            logging: false,
            storage: 'mysql',
            define: {
                timestamps: true
            }
        }
    },
    email: {
        params: {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'cde.library.exchange@gmail.com',
                pass: "Axyh2obylrdVAxyh2obylrdV"
            }
        },
        adminSender: {
            from: '"Application CDE" <cde.library.exchange@gmail.com>',
            cc : 'Adrien.Servieres@cde.fr',
            subject: 'Réponse à votre mail',
            // contentPath: 'server/emails/supplier.request.html'
        },
        emails: {
            'emailConfirmation': {
                from: 'noreply@cde.library.exchange.com',
                verificationURL: siteURL + 'verification/',
                renewTokenURL: siteURL + 'verification/renew',
                subject: {
                    fr: 'Vous avez presque fini. Vérifiez votre compte maintenant!',
                    en: 'You\'re almost done. Verify your account now!'
                },
                content: {
                    html: {
                        fr: path.join(__dirname, '../../', 'emails/account_confirmation_fr.html'),
                        en: path.join(__dirname, '../../', 'emails/account_confirmation_en.html')
                    },
                    txt: {
                        fr: path.join(__dirname, '../../', 'emails/account_confirmation_fr.html'),
                        en: path.join(__dirname, '../../', 'emails/account_confirmation_en.html')
                    }
                },
                fields: ['firstname', 'email', 'link']
            },
            'resetPassword': {
                from: 'noreply@cde.library.exchange.com',
                activateNewPasswordURL: siteURL + 'password/reset/',
                newPasswordLifetime: 1, // hour
                subject: {
                    fr: 'Réinitialisez votre mot de passe',
                    // en: 'Please reset your password'
                },
                content: {
                    html: {
                        fr: path.join(__dirname, '../../', 'emails/reset_password_fr.html'),
                        // en: path.join(__dirname, '../../', 'emails/reset_password_en.html')
                    },
                    txt: {
                        fr: path.join(__dirname, '../../', 'emails/account_confirmation_fr.html'),
                        // en: path.join(__dirname, '../../', 'emails/account_confirmation_en.html')
                    }
                },
                messages: {
                    success: {
                        fr: 'Votre nouveau mot de passe a été activé avec succès.',
                        // en: 'Your new password has been successfully activated.'
                    },
                    fail: {
                        fr: 'Ce lien n\'est plus valide.<br>Veuillez demander un nouveau mot de passe.',
                        // en: 'This link is no longer valid.<br>Please request a new password.'
                    }
                },
                fields: ['firstname', 'email', 'newPassword', 'activateNewPasswordURL', 'newPasswordLifetime']
            }
        }
    },
    company: {
        name: 'CDE',
        address: '26 Rue de Condé, 75006 Paris',
        phone: '+33(0)1 44 41 19 19',
        logo: siteURL + 'assets/img/logo.png'
    },
    oneSignal : {
        apiKey : 'MTlkZDJiOGMtZDljYi00YzhmLTg5YjctNTFjNWVkMGZkZWEy',
        apiURL : 'https://onesignal.com/api/v1/notifications',
        appId : '6a33667d-b7b2-44aa-ad30-b1784161a5f3'
    },
    files_upload_dir : files_upload_dir ,
    picturesEndpoint: '/static/images/',
    seedDB: false
};


