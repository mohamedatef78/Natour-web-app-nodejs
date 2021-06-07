const {promisify} = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const sendEmail = require('../utils/email');
const { findOne } = require('../models/userModel');


const signToken = id =>{
    return jwt.sign({id : id} , process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user , statusCode , res)=>{
  const token = signToken(user._id);
  const cookieOption ={
    expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN *24 *60 *60 *1000),
    httponly:true
  }
  if(process.env.NODE_ENV ==='production') cookieOption.secure= true ;
  res.cookie('jwt',token,cookieOption);
  user.password = undefined;
  res.status(statusCode).json({
    status:'success',
    token,
    data:{

      user
    }
  });
}

exports.signup =catchAsync( async (req,res , next) => {
    const newUser =  await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        confirmPassword:req.body.confirmPassword,
        role:req.body.role  
          });
    createSendToken(newUser , 200,res);
    
});

exports.login =  catchAsync( async(req,res,next)=>{
    const {email , password} = req.body;

    if(!email || !password){
       return next(new appError('please enter email || password',400));
    }

    const user =await User.findOne({email}).select('+password');
    
    if(!user || !await user.correctPassword(password ,user.password)){
        return next(new appError('incorrect email or password') , 401);
    }
    createSendToken(user , 200,res);

}); 

exports.logOut = (req,res)=>{
  res.cookie('jwt','Loggedout',{
    expires: new Date(Date.now()+10*1000),
    httponly:true
  });
  res.status(200).json({status:'success'});
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new appError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new appError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

    
    
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
      // roles ['admin', 'lead-guide']. role='user'
      if (!roles.includes(req.user.role)) {
        return next(
          new appError('You do not have permission to perform this action', 403)
        );
      }
  
      next();
    };
  };

  exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new appError('There is no user with email address.', 404));
    }
  
    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
  
    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetpassword/${resetToken}`;
  
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
  
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message
      });
  
      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!'
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpire = undefined;
      await user.save({ validateBeforeSave: false });
  
      return next(
        new appError('There was an error sending the email. Try again later!'),
        500
      );
    }
  });
  
exports.resetPassword = catchAsync( async(req,res,next)=>{
    // 1 ) get user based on token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User. findOne({
        passwordResetToken : hashedToken ,
         passwordResetExpire:{$gt:Date.now()}});


    //2) check if token not expire set new password
    if(!user ){
        return next( new appError('no user  or token has expired' , 400) );
    }
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();
    //3)update password changeAT


    createSendToken(user , 200,res);


});

exports.updatePassword = catchAsync( async (req,res,next)=>{
  //1)get user data
  const user = await User.findById(req.user.id).select('+password');
  //2) check password is correct
  if(! await user.correctPassword(req.body.currentPassword , user.password)){
    return next(new appError('your password is wrong' , 401));
  }

  //3) update password
  user.password =  req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  //4)log user in send jwt
  createSendToken(user , 200,res);


});


exports.isLoggedIn = async (req, res, next) => {
  // 1) Getting token and check of it's there
  if (req.cookies.jwt) {
    try{
    

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(
     req.cookies.jwt,
     process.env.JWT_SECRET
     );

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next();
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next();
  }

  // There is  user Logged
  res.locals.user = currentUser;
  return next();
}catch(err){
  return next();

}
  }
  next();
};
