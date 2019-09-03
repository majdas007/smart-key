const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose');
const bcrypt = require('bcrypt-nodejs');

let userModel = new mongoose.Schema
(
    {
        FirstName : { type : String , required : true},
        LastName  : { type : String , required: true},
        Address    : { type : String , required: true},
        Zip    : { type : Number , required : true},
        Email     : { type : String , required : true},
        City     : { type : String , required : true},
        isEmailVerified: { type: Boolean, default: false },
        password: { type: String, required: true, trim: true },
        emailHash : { type: String },


    }
)
userModel.methods.validPassword = function (password) {
        return bcrypt.compareSync(password, this.password);
};
userModel.methods.generateHash = function (password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};


module.exports = mongoose.model('User',userModel)