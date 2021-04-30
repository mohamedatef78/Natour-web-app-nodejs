const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize= require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const viewRouter = require('./routes/viewRoutes');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const AppError = require('./utils/appError');
const globalErrorController = require('./controllers/errorController');
const cookieParser = require('cookie-parser');

const app = express();


app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));




// 1) MIDDLEWARES
 //set security http headers 
 app.use(helmet());
 //development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
const limiter =rateLimit({
  max:100,
  windowMs:60 * 60 * 1000,
  message:'too many request from this IP , please try agin after one hour!!!'
});
app.use('/api' , limiter);

//body parser , reading data from body into req.body

app.use(express.json({limit:'10kb'}));
app.use(express.urlencoded({extended:true, limit:'10kkb'}));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(`${__dirname}/public`));

//Data Sanitization Nosql query injection
app.use(mongoSanitize());

// Data Sanitization  XXS
app.use(xssClean());


//test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/',viewRouter)
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews',reviewRouter);

// handel unknow routes
app.all('*',(req,res,next)=>{

  next(new AppError(`can't find ${req.originalUrl}`,404));
});

app.use(globalErrorController);

module.exports = app;
