const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema  =  new mongoose.Schema({
    review :{type: String  , require:[true , 'Review cannot be empty']},
    rating : {type:Number , min : 1 , max:5} ,
    createdAt: {type:Date , default:Date.now()},
    tourID:[{
        type:mongoose.Schema.ObjectId ,
        ref:'Tour',
        require:[true , 'Review must belong to tour']

    }],
    userID:[{
        type:mongoose.Schema.ObjectId ,
        ref:'User',
        require:[true , 'Review must belong to user']
    }]
},

{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

reviewSchema.index({ tourID: 1, userID: 1 }, { unique: true });
reviewSchema.pre(/^find/, function(next) {
    // this.populate({
    //   path: 'tour',
    //   select: 'name'
    // }).populate({
    //   path: 'user',
    //   select: 'name photo'
    // });
  
    this.populate({
      path: 'userID',
      select: 'name photo'
    });
    next();
  });

reviewSchema.statics.calcAverageRatings = async function(tourID){
    const  stats = await this.aggregate([
        {
            $match:{tourID : tourID }
        },
        {
            $group:{
                _id:'$tourID',
                nRating:{$sum:1},
                avgRating :{$avg:'$rating'} 
            }
        }
    ]);
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourID, {
          ratingsQuantity: stats[0].nRating,
          ratingsAverage: stats[0].avgRating
        });
      } else {
        await Tour.findByIdAndUpdate(tourID, {
          ratingsQuantity: 0,
          ratingsAverage: 4.5
        });
      }
};

reviewSchema.post('save' ,function(){
    this.constructor.calcAverageRatings(this.tourID);
});

reviewSchema.pre(/^findOneAnd/ , async function(next){
    this.r = await this.findOne();
    next();
});

reviewSchema.post(/^findOneAnd/,async function(){
    await this.r.constructor.calcAverageRatings(this.r.tourID);
});

reviewSchema.pre(/^find/ , function(next){
    this.populate({path:'userID' , select:'name'});
    next();
  });

const Review = mongoose.model('review',reviewSchema) ;
module.exports = Review ;