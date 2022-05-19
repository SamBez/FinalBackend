const mongoose = require('mongoose');
const crypto = require('crypto');

 const userSchema = new mongoose.Schema({
    firstname: {
        required: true,
        type: String
    },
    lastname: {
        required: true,
        type: String
    },
    department: {
        type: String,
        required: false,

    },
    email: {
        required: true,
        type: String
    },
    clubId: [],
    phone: {
        required: false,
        type: String
    },
    username:{
        required: true,
        type: String,
    },
    password: {
        required: true,
        type: String,
    
    },
    activated: {
        required: true,
        default: true,
        type: Boolean
    },
    createdAt:{
     type: Date,
     default: Date.now(),
     select: false
    },
    passwordModified: {
        type: Boolean,
        default: false
    },
    passwordResetToken: {
      type: String,
      select: false
    },
    passwordResetExpires:{
        type: Date,
        select: false
    },
    passwordChangedAt:{
        type: Date,
        select: false
    },
    createdClub:{type: Boolean,
                default: false},
    role: {
        type: String,
        enum: ['super-admin', 'student', 'forum-admin', 'material-admin', 'info-director', 'club-president'],
        default: 'student'
    }
});



userSchema.methods.createPasswordResetToken = function (){
    try {
        const resetToken = crypto.randomBytes(32).toString('hex');
        this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
        this.passwordResetExpires = Date.now() + 10*60*1000;
         console.log({resetToken}, this.passwordResetExpires);
         console.log(" this keyword " +this)
        return resetToken;
        
    } catch (error) {
     console.error("Some thing wrong in the Schema Methods " +error);   
    }

}
 module.exports = new mongoose.model('users', userSchema);