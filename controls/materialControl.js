const Material = require('../models/materials/materials.model')
const User = require('../models/user.model')

const fs = require('fs')
const path = require('path')

exports.addMaterial = async(req, res, next)=>{
  console.log(req.body)
  console.log(req.file)
  
     const material = {
         course_title: req.body.course_title,
         course_description: req.body.course_decription,
         department: req.body.department,
         year: req.body.year,
         file: req.file.filename
         //  data: fs.readFileSync ( req.file.path),
           //contentType: 'image/jpg/png'
         
     }
   //  console.log(Event);
   await Material.create(material, (err, result)=>{
      if(err){
          res.json({
              status: 'failure',
              message: " File Couldnot be posted"
          });
          console.log(err);
          next();
        }
          else{
            res.json({
              status: " success",
              result
            })
            console.log(result);
            next();
          }
   })
}
exports.getAllMaterials = async( req, res, next)=>{
//  var date = new Date(Date.now() + 5*24*60*60*1000);
    const materials = await Material.find({});

    console.log(materials);
    if (materials){
      res.json({
        status: "success",
        materials
      })
    }
    else{
      res.json({
        status:"failure",
        message:" No Material Added Yet."
      })
    }
    next();
}
exports.getStudentMaterials = async( req, res, next)=>{
  var date = new Date(Date.now() + 5*24*60*60*1000);
  const user = await User.findById(req.params.userId);
 const department = user.department;
 console.log(user);
    const materials = await Material.find({department: department});
    if (materials){
      res.status(201).json({
        status: " success",
        materials
      })
    }
    else{
      res.json({
        status:'failure',
        message:" No Material Added Yet."
      })
    }
}

exports.deleteMaterial = async(req, res, next)=>{
   
  await Material.findOneAndRemove({_id: req.params.id}, (error, result)=>{
    if(error){
      res.json({
        status: 'failure',
        message: " File was not Removed!"
      })
    }
    else{
      res.json({
        status:"success",
        message: 'File Successfuly Removed.',
        result
      })
    }
    next();
  });

}
exports.editMaterial = async(req, res, next)=>{
   
  await Material.findOne({_id: req.params.id}, (error, result)=>{
    
    if(error){
      res.json({
        status: 'failure',
        message: " File was not Found!"
      })
    }
    else{
    
       result.course_title = req.body.title
       result.course_description = req.body.description
       result.file = req.file.filename

       result.save();
       res.json({
        status:"success",
        message: 'File Successfuly Updated.',
        result
      })
    }
    next();
  });

}