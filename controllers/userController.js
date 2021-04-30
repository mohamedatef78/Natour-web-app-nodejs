const multer = require('multer');
const sharp =require('sharp');

const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const factory = require('./handlerFactory');


// const multerStorage = multer.diskStorage({
//   destination:(req,file,cb)=>{
//     cb(null,'public/img/users');
//   },
//   filename:(req, file ,cb)=>{
//     const ex =file.mimetype.split('/')[1];
//     cb(null,`user-${req.user.id}-${Date.now()}.${ex}`);
//   }
// });
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new appError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage:multerStorage,
  fileFilter: multerFilter
});

exports.uploadPhoto = upload.single('photo');
exports.resizePhoto = catchAsync(async(req,res,next)=>{
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj =(obj , ...allowedFields)=>{
  const newObj = {};
//Object.keys loop throw an object return array contaning all keys name
Object.keys(obj).forEach(el =>{
  if(allowedFields.includes(el)){
    newObj[el] = obj[el]
  }
});
  return newObj ;
}

exports.getAllUsers =catchAsync(async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status:'success',
    data:{
      users
    }
  })
});

exports.updateMe = catchAsync(async (req ,res ,next)=>{
  //1)error
  if(req.body.password||req.body.confirmPassword){
    return next( new appError('this route is not for update password ' , 400));
  }

  //2)update user document
  
  const filterBody = filterObj(req.body , 'name' , 'email');
  if (req.file) filterBody.photo = req.file.filename;

  const updateUser= await User.findByIdAndUpdate(req.user.id , filterBody ,{runValidators :true,new:true});

  res.status(200).json({
    status:'success',
    data:{
      user:updateUser
    }
  })
});

exports.deleteMe = catchAsync( async (req ,res,next)=>{
  await User.findByIdAndUpdate(req,user.id , {active:false});

  res.status(204).json({
    status:'success',
    data:null
  });
});

exports.getUser = factory.getOne(User);
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.getMe = (req,res,next)=>{
  req.params.id = req.user.id;
  next();
}
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
