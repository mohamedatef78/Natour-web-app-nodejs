const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.deleteOne = Model=>
    catchAsync( async (req, res) => {
        const doc = await Model.findByIdAndDelete(req.params.id);
        if(!doc){
         return next(AppError('No doc found !!!'),404);
        }
        res.status(204).json({
            status: 'success',
            data: null
        });
 
});


exports.updateOne = Model => catchAsync(  async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if(!doc){
      return next(AppError('No doc found !!!'),404);
    }
    res.status(200).json({
      status: 'success',
      data: {
        data:doc
      }
    });

}); 

exports.createOne = Model => catchAsync( async (req, res) => {

  const doc = await Model.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      doc: doc
    }
  });

});

exports.getOne = (Model , popOptions)=> catchAsync( async (req, res , next) => {
  let query = Model.findById(req.params.id) ;
  if(popOptions) query = query.populate(popOptions);
  const doc = await query ;
  //const tour = await Tour.findById(req.params.id).populate({path:'reviews',select:'-__v  -id'});
  if (!doc){
    return next( new AppError('No doc    found !!!'),404);
  }
  res.status(200).json({
    status: 'success',
    data: {
      data:doc
    }
  });

});