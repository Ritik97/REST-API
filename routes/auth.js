const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const User = require('../models/user');

const { body } = require('express-validator/check');

router.put('/signup', [
    body('email').isEmail().withMessage('Please enter a valid email!')
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then(result => {
                    if (result) {
                        return Promise.reject('Email already exists!!');
                    }
                });
        })
        .normalizeEmail(),
    body('password').trim().isLength({ min: 5 }),
    body('name').trim().not().isEmpty()
],
    authController.signUp);

router.post('/login', authController.logIn);    


module.exports = router;