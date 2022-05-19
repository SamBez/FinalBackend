const question = require("../models/forum/question.model");
const Answer = require("../models/forum/answers.model");
const Reason = require("../models/forum/reports.model");
const User = require("../models/user.model");

      /// Question Controls

exports.postQuestion = async (req, res, next) => {
  const user = await User.findOne({ _id: req.params.userId });
  if (user.activated == false) {
    res.json({
      status: "failure",
      message: "you have been banned from posting any Questions",
    });
  } else {
    const questionData = {
      title: req.body.title,
      description: req.body.description,
      userId: req.params.userId,
      catagory: req.body.catagory,
    };
    const createdQ = await question.create(questionData);

    if (!createdQ) {
      console.log("Prob creating question");
      console.log(err);
      res.json({
        status: "failure",
        message: "Unable to Post your Question.",
      });
    } else {
      res.json({
        status: "success",
        createdQ
      });
    }
  }
  next();
};
exports.allQuestionsbyDate = async (req, res, next) => {
  const allQuestions = await question.find({
    createdAt: {
      $gt: new Date(
        new Date().getTime() - 20 * 24 * 60 * 60 * 60 * 1000
      ).toISOString(),
    },
  });
  console.log(allQuestions);
  if (allQuestions) {
    res.json({
      status: "success",
      allQuestions,
    });
  } else {
    res.json({
      status: "failure",
      message: "no recent Question.",
    });
  }
  next();
};
exports.myQuestions = async (req, res, next) => {
  console.log(req.params.userId);
  const questions = await question.find({ userId: req.params.userId });
  console.log(questions);
  if (!questions) {
    res.json({
      status: "failure",
      message: "You dont have any question posted yet!",
    });
  } else {
    res.json({
      status: "success",
      questions,
    });
  }
  next();
};
exports.myAnswers = async (req, res, next) => {

  const answers = await Answer.find({ qID: req.params.qID });
  console.log("answers "+ answers)
  if (answers) {
    res.json({
      status: "success",
      answers
    });
  } else {
    res.json({
      status: "failure",
      message: "No answers Yet",
    });
  }
  next();
};
exports.removeQuestion = async (req, res, next) => {
  const questionID = req.params.qID;
  await question.findOneAndDelete({ _id: questionID }, (err, result) => {
    if (err) throw err;
    else {
console.log(result)
      res.json({
        status: "success",
        result,
        message: " Question Deleted!",
      });
    }
  });
  next();
};
exports.editQuestion = async (req, res, next) => {
  const questionID = req.params.id;
  const questions = await question.findOne(
    { _id: questionID },
    (err, result) => {
      if (err) throw err;
      else {
        console.log(result);
      }
    }
  );
  if (questions) {
    questions.title = req.body.title;
    questions.description = req.body.description;
    const updated = await questions.save();
    res.json({
      status: "success",
      updated,
    });
  }
};
exports.rateQuestion = async (req, res, next) => {
  try {
    const questionn = await question
      .findOne({ _id: req.params.id });
      console.log(questionn)

    questionn.rate += 1;
    const rate = questionn.rate
    questionn.save();
    res.json({
      status: "success",
      message: " Succefully voted!",
      rate
    });
    next();
  } catch (err) {
    res.json({
      status: "failure",
      message: "Not voted!",
    });
  }
};

exports.makeReport = async (req, res, next) => {
  const data = {
    userId: req.params.userId,
    qID: req.body.qID,
    reason: req.body.reason,
  };
  const qn = await question.findOne({_id:req.body.qID});
  console.log(qn)
  const reason = await Reason.create(data)
  console.log(reason)
  qn.no_reports+=
  qn.reports.push(reason._id);
  qn.save();
  if (reason) {
    res.json({
      status: "success",
      message: " Question successfuly reported!",
      qn
    });
  }
  else{
    res.json({
      status: "failure",
      message: " Question has not been reported!",
    });
  }
};
exports.getAllReports = async (req, res, next) => {

  const reason = await Reason.find({ qID: req.params.qID }, (err, result) => {
    if (err) throw err;

    else {
      console.log(result);
      res.json({
        status: "success",
        result
      });
    }
  });
};
exports.getReports = async (req, res, next) => {

  const reason = await Reason.find({ }, (err, result) => {
 let usersArray = []
    if (err) throw err;
    
    else {
       result.forEach(async element => {
          usersArray.push(await User.findById(element.userId))
         console.log(element.userId)
       });
       console.log(usersArray);
       /*(async (id) => {
          await question.findById(id.qID)
      })
      console.log(qn)
      const myQuestions =  Promise.all(qn);
      //questions.push(result)

      console.log(myQuestions);*/
      res.json({
        status: "success",
        result
      });
    }
  });
};
exports.getQuestion = async (req, res, next) => {
  const myQuestions = await question.findById(req.params.qID);
  const user = await User.findById(myQuestions.userId);
  if (!myQuestions) {
    console.log(myQuestions);
    res.json({
      status: "failure",
      message: "No Answers Yet",
    });
  } else {
    console.log(myQuestions);
    res.json({
      status: "success",
      myQuestions,
      user,
    });
  }
  next();
};

// Answers Control
exports.giveAnswer = async (req, res, next) => {
  let data = {
    userId: req.params.userId,
    description: req.body.description,
    qID: req.body.qID,
  };
  console.log(data);
  const reason = await Answer.create(data);
  const qn = await question.findById(req.body.qID);
  qn.answers.push(reason._id);
  qn.save();
  if (reason) {
    res.json({
      status: "success",
      reason,
    });
  } else {
    res.json({
      status: "failure",
      message: "Your answer has not been registered.",
    });
  }
  /* (err, result)=>{
                                if(err) throw err
                        
                                else{
                                   /* res.json({
                                        status: 'success',
                                        result
                                    })
                                    console.log(result);
                                }*/
  console.log(reason);
  //});
  next();
};

exports.getallAnswers = async (req, res, next) => {
  const reason = await Answer.find({ qID: req.params.qID });

  if (!reason) {
    console.log("no result found " + reason);
    res.json({
      status: "failure",
      message: "No Answers Yet",
    });
  } else {
    //let user = [];
    // for(reas in reason){
    //   console.log(reason[reas])
    //user.push( await User.findById(reason[reas].userId))
    // }
    res.json({
      status: "success",
      reason,
     // user,
    });
  }
  console.log(reason);
  next();
};
exports.reportAnswer = async (req, res, next) => {
  let data = {
    userId: req.params.userId,
    description: req.body.reason,
    aID: req.body.aID,
  };
  console.log(data);
  const report = await Reason.create(data);
  const ans = await Answer.findById(req.body.aID);
  ans.reports.push(report._id);
  ans.save();
  if (reason) {
    res.json({
      status: "success",
      report,
      message: "You have successfully reported this answer. Thank you!",
    });
  } else {
    res.json({
      status: "failure",
      message: "Your input has not been registered.",
    });
  }
};
exports.rateAnswer = async (req, res, next) => {
  const answer = await Answer.findById(req.body.aID);
  answer.rates += 1;
  answer.save();
  if (reason) {
    res.json({
      status: "success",
      answer,
      message: "You have successfully reported this answer. Thank you!",
    });
  } else {
    res.json({
      status: "failure",
      message: "Your input has not been registered.",
    });
  }
  next();
};
exports.listOfReportedQ = async(req, res, next)=>{
let usersArray =[]
  const questions = await question.find({no_report: {$gt: 0}});
  console.log(questions);
 
  const users = questions.map(async element => await User.findById(element.userId))
  const arr = await Promise.all(users);
  /*questions.forEach(async element => {
    const one = await User.findById(element.userId)
    console.log(one)
    usersArray = one
   console.log(element.userId)

 });*/
 console.log(arr)
 console.log(usersArray);
  if (questions != null) {
    res.json({
      status: "success",
      questions, 
      arr
    });
  } else {
    res.json({
      status: "failure",
      message: "No reported question has not been registered.",
    });
  }
  next();

}
exports.listOfReportedS = async(req, res, next)=>{
   
    const questions = await question.find({reports: {$exists: true, $ne:[]}});

    //const user = await User.findById(questions.userId)
    console.log(" new line for the response \n"+ questions);
    
    const users = questions.map(async element => await User.findById(element.userId))
    const arr = await Promise.all(users);
    
   console.log(arr)
    if (questions != null) {
      res.json({
        status: "success",
        arr, 
        
      });
    } else {
      res.json({
        status: "failure",
        message: "No reported Student has  been registered.",
      });
    }
    next();
  
  }