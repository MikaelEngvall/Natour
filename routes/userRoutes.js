const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();


router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgottPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// From now on all are protected by JWT middleware 
// (only authenticated users can access this route)
router.use(authController.protect);

router
    .patch(
        '/updateMyPassword/', 
        authController.updatePassword
    );
router
    .get(
        '/me', 
        userController.getMe, 
        userController.getUser
    );

// only admin can access this route
router.use(authController.restrictTo('admin')); 

router
    .route('/')
    .get(userController.getAllUsers);

router
    .route('/:id') 
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;