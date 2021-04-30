const { rules } = require('eslint-config-prettier');
const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema(
    {
        name: {
            type:String ,
            required: [true, 'A user must have a name'],
            trim: true
        } ,

        email: {
            type : String,
            required: [true, 'A user must have a email'],
            unique : true,
            lowercase: true,
            trim:true,
            validator :[validator.isEmail , 'enter valid Email']
        },

        photo: {type:String, default:'default.jpg'} ,

        role: {
            type : String ,
            enum:['user' , 'guide' , 'lead-guide' , 'admin'],
            default:'user'
        },

        password:{
            type:String,
            required: [true, 'A user must have a password'],
            minlength:8 ,
            select:false
        },
        
        confirmPassword :{
            type:String,
            required: [true, 'A user must have a password'],
            validate:{
                validator: function(el){
                    return el === this.password;
                },
                message:'password are not the same'
            },
            select:false
        },
        
        passwordChangeAt : Date ,
        passwordResetToken : String ,
        passwordResetExpire : Date,
        active:{
            type:Boolean,
            default:true,
            select:false
        }
    
    }
);
userSchema.pre('save' , async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password , 12);
    this.confirmPassword = undefined ;
    next();
});

userSchema.pre('save' , function(next){
    if(!this.isModified('password')||this.isNew) return next();
    this.passwordChangeAt = Date.now() -1000;
    next();

});
userSchema.pre(/^find/ , function(next){
    this.find({active:{$ne:false}});
    next();
})
userSchema.methods.correctPassword = async function(condidatePassword , userPassword){
    return await bcrypt.compare(condidatePassword , userPassword);
};

userSchema.methods.changePasswordAfter =  function(JWTTimestamp){
    if(this.passwordChangeAt){
        const changeTimetamp = parseInt(this.passwordChangeAt.getTime() /1000 , 10);
        return JWTTimestamp < changeTimetamp ;
    }
    return false ;
};

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpire = Date.now() + 10 *60 *1000 ;

    console.log({resetToken} , this.passwordResetToken);
    return resetToken;
}
const User = mongoose.model('User' , userSchema);
module.exports = User;