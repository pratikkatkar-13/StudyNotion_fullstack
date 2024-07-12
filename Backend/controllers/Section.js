const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req,res) => {
    try{
        //data fetch
        const {sectionName, courseId} = req.body;

        //data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                messahe:"Missing Properties",
            });
        }
        //create section
        const newSection = await Section.create({sectionName});
        //update course with section ObjectId
        const updatedCourseDetails = await Course.findByIdAndUpdate(
                                    courseId,
                                    {
                                        $push:{
                                            courseContent:newSection._id,
                                        }
                                    },
                                    {new:true},
        )
        //use populate to replace section and subsection in updatedCourseDetails
        //return response
        return res.status(200),json({
            success:true,
            message:"section created successsfully",
            updatedCourseDetails,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"unable to create an section please try again",
            error:error.message,
        });
    }
}

exports.updateSection = async(req,res) =>{
    try{

        //data fetch
        const {sectionName, sectionId} = req.body;
        //data validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                messahe:"Missing Properties",
            });
        }
        //update data
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new:true});
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
        const {sectionId} = req.params
        //use findByIDAndDelete
        await Section.findByIdAndDelete(sectionId);
        //TODO:   deleting entry from courseSchema
        //return response
        return res.status(200).json({
            success:true,
            message:"section deleted successfully",
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"unable to delete an section please try again",
            error:error.message,
        });
    }
};