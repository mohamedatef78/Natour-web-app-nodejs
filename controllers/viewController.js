const Tour  = require('../models/tourModel');
const cathAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getTour=cathAsync(async(req,res , next)=>{
  const tour  = await Tour.findOne({slug:req.params.slug}).populate({path:'reviews' ,fields:'review rating userID'});
  console.log(tour.reviews.userID);
  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }
  res.status(200).render('tour',{
      title:tour.name,
      tour
  });
});


exports.getOverview = catchAsync(async(req,res)=>{

    const tours = await Tour.find();

    res.status(200).render('overview',{
        title:'All tous',
        tours
    });
});

exports.getAll = (req,res)=>{
    res.status(200).render('base',{
      tour:'Egypt',
      user:'Atef'
    });
};

exports.getLoginForm= (req,res)=>{
  res.status(200).render('login',{
    title:'log into your account'
  });
};

exports.getAccount=(req,res,next)=>{
  res.status(200).render('account',{
    title:'your account'
  });

}

