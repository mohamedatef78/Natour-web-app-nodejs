const express = require('express');
const reviewController = require('./../controllers/reviewController');

const authController = require('../controllers/authController');
const router = express.Router({mergeParams:true});



router
  .route('/')
  .get(authController.protect , reviewController.getAllReviews)
  .post( authController.protect ,authController.restrictTo('user') ,reviewController.setID, reviewController.postReview);
router
    .route('/:id')
    .patch(authController.restrictTo('user', 'admin'),reviewController.updateReview)
    .delete(reviewController.deleteReview);


module.exports = router;
