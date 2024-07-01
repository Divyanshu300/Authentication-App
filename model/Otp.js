const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate")


const OTPSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true,
    },
    Otp : {
        type : String,
        required : true,
    },
    createdAt : {
        type : Date,
        default : Date.now(),
        expires : 5*60,
    },
})

//Function to send email
async function sendVerificetionEmail(email , otp) {
    try {
        const mailResponse = await mailSender(email , "Verification Email by Divyanshu Pathak" , emailTemplate(otp));
        console.log("Email Sent Successfully: " , mailResponse.response);
    }
    catch(error) {
        console.error("Error while sending Email : " , error);
        throw error;
    }   
}

//SCHEMA ke baad EXPORT ke pehle Email verification waala function rehta hai kyunki 
//jb tk verify nhi hoga tb tk DB mein entry create hogi
OTPSchema.pre("save" , async function(next) {
    //Only send an email when a new document is created
    if(this.isNew) {
        await sendVerificetionEmail(this.email , this.Otp)
    }
    next();
})

module.exports = mongoose.model("OTP" , OTPSchema);