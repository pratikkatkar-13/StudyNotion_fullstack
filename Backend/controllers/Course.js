const Course = require("../models/Course");
const Tag = require("../models/tags");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/ImageUploader")

//createCourse handler function
exports.createCourse = async (req,res)=>{
    try{

        //fetch data
        const {courseName, courseDescription, whatYouWillLearn, price, tag} = req.body;
        //get thumbnail
        const thumbnail = req.files.thumbnailImage;
        //validation
        if(!courseName || !thumbnail|| !whatYouWillLearn || ! courseDescription || !price || !tag)
        {
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            });
        }
        //check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId); 
        console.log("Instructor Details", instructorDetails);
        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"Instructor Details not found",
            });
        }
        //check if tag is valid
        const tagDetails = await Tag.findById(tag);
        if(!tagDetails){
            return res.status(404).json({
                success:false,
                message:"tag details not found",
            });
        }

        //Uplaod Image top Clodinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_Name);

        //create an entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag:tagDetails._id,
            thumbnail:thumbnailImage.secure_url,
        });

        //add the new course to the userSchema of instructor
        await User.findByIdAndUpdate(
            {_id:instructorDetails._id},
            {
                $push: {
                    course:newCourse._id,
                }
            },
            {new:true},
        )

        //update the tagschema

        //return response
        return res.status(200).json({
            success:true,
            message:"course created successfully",
            data:newCourse,
        });
    }

    catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:"failed to create course",
            error:error.message,
        });
    }

};


//getAllCourses handler function
exports.showAllCourse = async (req,res) => {
    try{
        //TODO: change the below statement incrementally
        const allCourses = await Course.find({});

        return res.status(200).json({
            success:true,
            message:'Data for all courses fetched successfully',
            data:allCourses,
        })

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"cannot fetch course data",
            error:error.message,
        }); 
    }
}

