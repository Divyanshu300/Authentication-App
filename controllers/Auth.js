const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const otpGenerator = require("otp-generator");
const Otp = require("../model/Otp");


exports.sendOtp = async(req , res) => {
    try {
        //fetch email
        const {email} = req.body;

        const user = await User.findOne({email});

        if(user) {
            return res.status(500).json({
                success : false,
                message : "User Already Registered"
            })
        }

        //Generate Otp
        var otp = otpGenerator.generate(6 , {
            upperCaseAlphabets : false,
            lowerCaseAlphabets : false,
            specialChars : false,
        });

        const result = await Otp.findOne({otp : otp});
        console.log("OTP : " , otp);
        console.log("Result : ",result);

        while(result) {
            otp = otpGenerator.generate(6 , {
                upperCaseAlphabets : false,
                lowerCaseAlphabets : false,
                specialChars : false,
            });
    
            result = await Otp.findOne({otp : otp});
        }

        const otpPayload = {email , Otp : otp};
        console.log("Otp Payload: ",otpPayload)

        const otpBody = await Otp.create(otpPayload);

        res.status(200).json({
            success : true,
            message : "OTP sent successfully",
            otp,
        })
    }
    catch(error) {
        console.error(error);
        return res.status(500).json({
            success : false,
            message : "Could Not Send Otp"
        })
    }
}

exports.signup = async(req,res) => {
    try {
        const {name , email , username , password , dob , phone , otp} = req.body;

        const userExist = await User.findOne({email} || {username} || {phone});

        if(userExist) {
            return res.status(500).json({
                success : false,
                message : "User Already Exists",
            })
        }

        if(!otp) {
            return res.status(500).json({
                success : false,
                message : "Otp Not Found",
            })
        }
                                                //timestamp ke basis prr sort krr liyaa and recent waale ko fetch krr liyaa
        const recentOtp = await Otp.find({email}).sort({createdAt: -1}).limit(1);
        console.log("RECENTOTP: " , recentOtp)
        //validate Otp
        if(recentOtp.length === 0) {
            //otp not found
            return res.status(400).json({
                success : false,
                message : "Otp Not Found",
            });
        }
        else if(otp !== recentOtp[0].Otp) {
            //invalid otp
            return res.status(400).json({
                success : false,
                message : "Invalid Otp",
            })
        }

        const hashPassowrd = await bcrypt.hash(password , 10);

        const user = await User.create({
            name,
            email,
            phone,
            password : hashPassowrd,
            username,
            dob,
        })

        //create token
        const token = jwt.sign({email : email , id : user._id} , process.env.JWT_SECRET);

        res.cookie("token" , token).status(200).json({
            success : true,
            token,
            user,
            message : "User Loggedin Successfully"
        })

        return res.status(200).json({
            success : true,
            message : "User Created Successfully",
            data : user, 
        })
    }
    catch(error) {
        console.log(error);
        res.status(500).json({
            success : false,
            message : "Something Went Wrong",
        })
    }
}


exports.login = async(req , res) => {
    try {
        const {email , username , phone , password} = req.body;
        
        const user = await User.findOne({username}) || await User.findOne({email}) || await User.findOne({phone});
        console.log(user)

        if(!user) {
            return res.status(404).json({
                success : false,
                message : "User is not registered, please signup first",
            })
        }

        const same = await bcrypt.compare(password , user.password);

        if(!same) {
            return res.status(401).json({
                success : false,
                message : "Input Incorrect",
            })
        }

        //generate jwt , cookie

        const token = jwt.sign({email : email , id : user._id} , process.env.JWT_SECRET);

        //set cookie for token
        const options = {
            expires : new Date(Date.now() + 3*24*60*60*1000),
            httpOnly : true
        }

        res.cookie("token" , token , options).status(200).json({
            success : true,
            token,
            user,
            message : "Logged In Successfully",
        })

    }
    catch(error) {
        console.error(error);
        res.status(500).json({
            success : false ,
            message : "Incorrect Input Values"
        })
    }
}