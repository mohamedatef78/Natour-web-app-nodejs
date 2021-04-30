const express = require('express');
const multer = require('multer');

const userController = require('./../controllers/userController');

const authController = require('../controllers/authController');


const router = express.Router();

router.post('/signup',authController.signup);
router.post('/login',authController.login);
router.get('/logout',authController.logOut);
router.post('/forgetpassword',authController.forgotPassword);
router.patch('/resetpassword/:token',authController.resetPassword);

// 
router.use(authController.protect);

router.patch('/updatepassword' ,authController.updatePassword);
router.patch('/updateuserdata',userController.uploadPhoto,userController.resizePhoto, userController.updateMe);
router.delete('/deleteuser' ,  userController.deleteMe);
router.get('/me', userController.getMe , userController.getUser);
// router.post('/review',authController.protect , )

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get( userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get( userController.getUser)
  .patch( userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
