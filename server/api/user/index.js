'use strict';

import {Router} from 'express';
import * as controller from './user.controller';
import * as auth from '../../auth/auth.service';

let router = new Router();

// Get user list
router.get('/', auth.hasRole('admin'), controller.index);

// Create user
router.post('/', controller.create);

// Get user data
router.get('/mydata', auth.isAuthenticated(), controller.me);

// User update
router.put('/:id', auth.isAuthenticated(), controller.update);

// Remove user
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;
