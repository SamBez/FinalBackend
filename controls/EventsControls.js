const Events = require('../models/information/info.model')
const fs = require('fs')
const path = require('path')

exports.addEvents = async(req, res, next)=>{
  console.log(req.body)
  console.log(req.file)
     const data = {
         title: req.body.title,
         body: req.body.body,
         userId: req.params.userId,
         file: req.file.filename
         //  data: fs.readFileSync ( req.file.path),
           //contentType: 'image/jpg/png'
         
     }
   //  console.log(Event);
   const event = await Events.create(data)

      if(event == null){
          res.json({
              status: 'failure',
              message: " File Couldnot be posted"
          });
          console.log(err);
          next();
        }
          else{
            res.json({
              status: "success",
              data: event
            })
            console.log(event);
            next();
          }
}

exports.addClubEvents = async(req, res, next)=>{
  console.log(req.body)
     const Event = {
         title: req.body.title,
         body: req.body.body,
         userId: req.params.userId,
         file: req.file.filename
         //  data: fs.readFileSync ( req.file.path),
           //contentType: 'image/jpg/png'
         
     }
   //  console.log(Event);
   await Events.create(Event, (err, result)=>{
      if(err){
          res.json({
              status: 'failure',
              message: " File Couldnot be posted"
          });
          console.log(err);
        }
          else{
            res.json({
              status: " success",
               result
            })
            console.log(result);
          }
          next();

   })
}


exports.getAllEvents = async( req, res, next)=>{
  var date = new Date(Date.now() + 5*24*60*60*1000);
    
  const Event = await Events.find({});
    console.log(Event)

    if (Event){
      res.json({
        status: "success",
        Event
      })
    }
    else{
      res.json({
        status:'failure',
        message:" No Event Added Yet."
      })
    }
}

exports.getEvents = async( req, res, next)=>{
  var date = new Date(Date.now() + 5*24*60*60*1000);
    const Event = await Events.find({userId: req.params.id});
    
    if (Event){
      res.status(201).json({
        status: " success",
        body:{
          Event
        }
      })
    }
    else{
      res.json({
        status:'failure',
        message:" No Event Added Yet."
      })
    }
}
exports.getClubEvents = async( req, res, next)=>{
//  var date = new Date(Date.now() + 5*24*60*60*1000);
    const Event = await Events.find({userId: req.params.userId});
    console.log(Event)
    if (Event){
      res.status(201).json({
        status: "success",
          Event
      })
    }
    else{
      res.json({
        status:'failure',
        message:" No Event Added Yet."
      })
    }
    next();
}
exports.deleteEvent = async(req, res, next)=>{
   
  await Events.findOneAndRemove({_id: req.params.id}, (error, result)=>{
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
exports.editEvent = async(req, res, next)=>{
   
  await Events.findOne({_id: req.params.id}, (error, result)=>{
    if(error){
      res.json({
        status: 'failure',
        message: " File was not Found!"
      })
    }
    else{
      const Event = {
        title: req.body.title,
        body: req.body.body,
        _id: req.params.id,
        file: req.file.filename
      }
       result.title = req.body.title
       result.body = req.body.body
       result.userId = req.params.userId
       result.file = req.file.filename

       result.save();
       res.json({
        status:"success",
        message: 'File Successfuly Removed.',
        result
      })
    }
    next();
  });

}