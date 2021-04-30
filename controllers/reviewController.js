const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');


exports.getAllReviews = catchAsync( async (req,res,next)=>{
    let filter = {};
    if(req.params.tourId) filter = {tourID:req.params.tourId};
    console.log(filter);
    const reviews = await Review.find(filter);
    if(!reviews) return next( new AppError('There is no reviews') , 404);
    res.status(200).json({
        status:'success',
        result:reviews.length,
        data:{
            reviews
        }
    });
});

exports.setID = (req,res,next)=>{
    if(!req.body.tourID) req.body.tourID = req.params.tourId;
    if(!req.body.userID) req.body.userID =req.user.id;
    next();
}
exports.postReview = factory.createOne(Review);

exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);