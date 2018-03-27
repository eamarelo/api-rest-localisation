/* global Promise */

'use strict';
import sqldb from '../sqldb';

let User            = sqldb.User;
let Type            = sqldb.Type;
let Section         = sqldb.Section;
let Compose         = sqldb.Compose;
let PurchaseOrder   = sqldb.PurchaseOrder;
let Notification    = sqldb.Notification;
let Message         = sqldb.Message;

let resetAllData = false;
let d_Users,d_Types,
    d_Sections,d_Composes,d_Po,
    d_Notifications,d_Messages;

if(resetAllData) {
    d_Users     = User.destroy({where: {}});
    d_Types     = Type.destroy({where: {}});
    d_Sections  = Section.destroy({where: {}});
    d_Composes  = Compose.destroy({where: {}});
    d_Po        = PurchaseOrder.destroy({where: {}});
    d_Notifications = Notification.destroy({where: {}});
    d_Messages  = Message.destroy({where: {}});
} else {
    let promise = Promise.resolve();
    d_Users = d_Types = d_Sections = d_Composes = d_Po = d_Notifications = d_Messages = promise;
}

User.sync().then(() => d_Users).then(() => {
    User.create({
        firstname: 'Super',
        lastname: 'ADMIN',
        email: 'admin@admin.com',
        role: 'admin',
        address: '34 rue du sentier, 75001 Paris',
        password: 'admin'
    });
});

Type.sync().then(() => d_Types).then(() => {
    Type.create({
        name: 'Operations',
        show_in_left_nav: 'true',
    });
});

Section.sync().then(() => d_Sections).then(() => {
    Section.create({
        name: 'Literature',
    });
});

PurchaseOrder.sync().then(() => d_Po).then(() => {
    PurchaseOrder.create({
        logo: 'path_to_file',
        range : 'CDE',
        title: 'Title',
        subtitle_author: 'Here is a subtitle',
        description: 'Here is a description',
        pdf_path: 'path_to_file'
    });
});

Notification.sync().then(() => d_Notifications).then(() => {
    Notification.create({
        msg_content: 'Sample content',
        status:'true',
    });
});

Message.sync().then(() => d_Messages).then(() => {
    Message.create({
        type: 'Message',
        title: 'Title',
        msg_content: 'Msg content',
    });
});
