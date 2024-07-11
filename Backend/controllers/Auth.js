const User = require("../models/User");
const OTP =  require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();


//sendotp
exports.sendOTP = async (req,res)=>{
    try{
        //fetch email from request body
        const {email} = req.body;
        //check if user already exist
        const checkUserPresent = await User.findOne({email});
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:'User already registered',
            })
        }
        //generate otp
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        console.log("OTP generator", otp);

        const result = await OTP.findOne({otp:otp});
        while(result){
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = await OTP.findOne({otp:otp}); 
        }

        //create an enter of otp in DB
        const otpPayload = {email,otp};
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        res.status(200).json({
            success:true,
            message:"OTP Sent Successfully",
            otp,
        });

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });

    }
};

//signup
exports.signUp = async (req,res)=>{
    try{
            //data fetch from request body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        //validating data
        if(!firstName || !lastName || !email || !password|| !confirmPassword || !otp)
        {
            return res.status(403).json({
                success:false,
                message:"all fields are require"
            });
        }

        //matching two password
        if(password != confirmPassword)
        {
            return res.status(404).json({
                success:false,
                message:"Password do not matches"
            });

        }

        //check user alredy exist or not
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User alredy exist"
            });
        }

        //find most recent otp stored for the user
        const recentOTP = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOTP);
        //validate otp
        if(recentOTP.length == 0){
            return res.status(400).json({
                success:false,
                message:"OTP not found"
            });
        }
        else if(otp !== recentOTP.otp){
            //invalid otp
            return res.status(400).json({
                success:false,
                message:"Invalid OTP"
            });
        }

        //hashing password
        const hashedPassword = await bcrypt.hash(password,10);

        //create entry in DB
        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        });
        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image:'http://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}',
        })

        //response 
        return res.status(200).json({
            success:true,
            message:"User is registered Successfully",
            user,
        });

    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registered",

        })

    }
}


//login
exports.login = async (req,res)=>{
    try{
        //get data from request body
        const{email, password} = req.body;
        //validation of data
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:'All feilds are required',
            });
        }
        //user check exist or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user)
        {
            return res.status(401).json({
                success:false,
                message:"User is not registered, please signup first",
            });

        }

        //generate JWT token and password matching
        if(await bcrypt.compare(password, user.password)){
            const payload = {
                email:user.email,
                id:user._id,
                accountType:user.accountType,
            }
            const token = jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:"2h",});
            user.token = token;
            user.password = undefined;
            //return response by creating cookie
            const options = {
                expires: new Date(Date.now()+ 3*24*60*60*1000),
            }
            res.cookie("token", token, options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged in successfuly"
            });
        }
        else{
            return res.status(401).json({
                success:false,
                message:"password is incorrect",
            });
        }

    }
    catch(error){
        return res.status(501).json({
            success:false,
            message:"login failed",
        });
    }
};


//changepassword
exports.changePassword = async (req,res) =>{
    //get data 
    //get oldPassword, newPassword, confirmNewPassword
    //validation

    //update pwd in DB
    //send mail
    //return response
}
