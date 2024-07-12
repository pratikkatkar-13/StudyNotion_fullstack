const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/ImageUploader");

exports.createSubsection = async (req,res) =>{
    try{

        //fetch data form request body
        const {sectionId, title, timeDuration, description} = req.body;

        //extract file/vedio
        const video = req.files.videoFile;

        //validation
        if(!sectionId || !title || !timeDuration || !description){
            return res.status(400).json({
                success:false,
                message:"All feilds are required",
            });
        }
        //upload vedio to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
        //create an subsection
        const SubSectionDetails = await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url,
        })
        //update section with subsection ObjectID
        const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},
                                                                {
                                                                    $push:{
                                                                        subSection:SubSectionDetails._id,
                                                                    }
                                                                },
                                                                {new:true},
        );
        //TODO: log updated section here after adding populate querry
        //return response
        return res.status(200).json({
            success:true,
            message:"Sub Section created successfully",
            updatedSection,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"unable to create an subsection please try again",
            error:error.message,
        });
    }
};

//update and deleted subsection
exports.updateSubsection = async(req,res) =>{
    try{

        //fetch data form request body
        const {SubsectionId, title, timeDuration, description} = req.body;

        //validation
        if(!SubsectionId || !title || !timeDuration || !description){
            return res.status(400).json({
                success:false,
                message:"All feilds are required",
            });
        }
        //update data
        const subsection = await SubSection.findByIdAndUpdate(SubsectionId, {title, timeDuration,description }, {new:true});
        //return response
        return res.status(200).json({
            success:true,
            message:"section updated successfully",
        });
    
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"unable to update an section please try again",
            error:error.message,
        });
    }
};

exports.deleteSection = async (req,res)=>{
    try{
        //get ID -asuming that we are sending ID in params
        const {SubsectionId} = req.params
        //use findByIDAndDelete
        await SubSection.findByIdAndDelete(SubsectionId);
        //TODO:   deleting entry from courseSchema
        //return response
        return res.status(200).json({
            success:true,
            message:"subsection deleted successfully",
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"unable to delete an subsection please try again",
            error:error.message,
        });
    }
};

