const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async (req,res) =>{
    try{
        //get data
        const {dateOfBirth="", about="", contactNumber, gender}= req.body;

        //get userId
        const id = req.user.id;

        //validation
        if(!contactNumber || !gender)
        {
            return res.status(400).json({
                success:false,
                message:"all feilds are requited",
            });
        }
        //find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        //update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();
        //return response
        return status(200).json({
            success:true,
            message:"Profile updated successfully",
            profileDetails,
        });

    }
    catch(error)
    {
        return res.status(500)({
            success:false,
            error:error.message,
        });

    }
};

//delete the account
exports.deleteAccount = async (req,res) =>{
    try{
        //get user id
        const id = req.user.id;
        //validation
        const userDetails = await User.findById(id);
        if(!userDetails)
        {
            return res.status(404).json({
                success:false,
                message:"No user exist",
            });
        }
        //delete profile of that user
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        //delete user
        await User.findByIdAndDelete({_id:id});
        //TODO: unenroll user from all enrolled courses
        //return response
        return res.status(200).json({
            success:true,
            message:"User deteted successfully",
        })

    }
    catch(error)
    {
        return res.status(500)({
            success:false,
            message:"User cannot be deteted",
        });

    }
};

exports.getAllUserDetails = async (req,res)=>{
    try{
        //get id
        const id = req.user.id;
        //validation
        const userDetails = await User.findById(id).populate("additinalDetails").exec();
       return res.status(200).json({
        success:true,
        message:"user data fetched Successfully",
       });

    }
    catch(error)
    {
        return res.status(500)({
            success:false,
            message:"something went wrong",
        });
    }
};
