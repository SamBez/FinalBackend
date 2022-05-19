const User = require("../models/user.model.js");
const path = require("path");
const jwt = require("jsonwebtoken");
const ServError = require("../utils/ServerError");
const nodemailer = require("nodemailer");
const sendmail = require("../email");
const Club = require('../models/club/clubs.model')
const crypto = require("crypto");

exports.login = async (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  try {
    const user = await User.findOne({
      email: email,
    });
   console.log(user);
    
    if (user && user.role == "student" ) {
      if (user.password == password) {
        if (user.activated == false) {
          res.status(202).json({
            status: "deactivated",
            message:
              " This account has been suspended due to some inappropriate activities, contact The Administrator! ",
          });
        } else {
          const token = jwt.sign(
            {
              id: user._id,
              email: user.email,
            },
            "secret",
            {
              expiresIn: "10d",
            }
          );
          console.log( "student token => "+ token + " user => /n" + user)
          res.status(200).json({
            status: "success",
             user,
             token
          });
        }
      } else {
        console.log(new ServError("Wrong Password", 202));
        res.json({
          status: "failure",
          message: "Wrong Password !",
        });
        next();
      }
    } else if (
      user &&
      user.role != "student" &&
      user.passwordModified == false
    ) {
      if(user.password == password){
        const token = jwt.sign(
          {
            id: user._id,
            email: user.email,
          },
          "secret",
          {
            expiresIn: "10d",
          }
        );
        res.json({
          message: "You need to change password !",
          user,
          token
      });
      next();
    }
    else{
      
      res.json({
        message: "You need to change password !",
        user,
      })
      next();
    }
    } else if (
      user &&
      user.role != "student" &&
      user.passwordModified == true
    ) {
      if (user.password == password) {
        const token = jwt.sign(
          {
            id: user._id,
            email: user.email,
          },
          "secret",
          {
            expiresIn: "10d",
          }
        );
        res.status(200).json({
          status: "success",
          user,
          token,
        });
        next();
      } else {
        res.status(200).json({
          status: "failure",
          message: "Wrong Password. Try again!",
        });
        
      }
    } else {
      res.status(200).json({
        status: "failure",
        message: "No Such Account",
      });
    }
  } catch (error) {
    console.error(error);
  }
  next();
};

exports.findUser = async (req, res, next)=>{
    const user = await User.findOne({
      _id: req.params.userId
    });
   res.json({
     status: 'success',
     user
   })
}
exports.signup = async (req, res, cb) => {
  console.log(req.body);
  const foundUser = await User.findOne({
    email: req.body.email,
  }).select("email");
  console.log(foundUser);
  if (foundUser === null) {
    try {
      const newUser = await User.create(req.body);
      const token = jwt.sign(
        {
          id: newUser._id,
        },
        "secret",
        {
          expiresIn: "1h",
        }
      );
      res.status(201).json({
        status: "success",
          user: newUser,
          token
        
      });
    } catch (error) {
      console.error(error);
    }
  } else {
    res.json({
      status: 'failure',
      message: "User Already Exists with the specified Email"
    });
  }
  cb();
};
exports.customSignup = async (req, res, next) => {
  const newAdmin = await User.findOne({
    email: req.body.email,
  });
  const dummyPsw = crypto.randomBytes(8).toString("hex");
  if (newAdmin) {
    res.status(201).json({
      status: "failure",
      message: " This Email has Already been Used",
    });
  } else {
    req.body.password = dummyPsw;
    const createdAdmin = await User.create(req.body, (error, result) => {
      if (error) {
        res.json({
          status: "failure",
          message: "Unable to create account",
        });
      } else {
        //EmailShit
        try {
          sendmail.sendEmail(
            {
              to: `${req.body.email}`,
              subject: "Hello",
              text: `Dear ${req.body.firstname}, Here is your password.
                     Password: ${dummyPsw} 
                     please make sure to change it asap!`,
            },
            (err, result) => {
              if (err) throw err;
              else {
                res.json({
                  status: "success",
                  message: " Email sent successfully!",
                });
              }
            }
          );

          // console.log("Message sent:%s", info.messageId);
          //console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        } catch (error) {
          console.error(" Eroror");
        }
      }
      next();
    });
  }
};
exports.forgotPassword = async (req, res, next) => {
  console.log(req.body)
  let user = await User.findOne({ email: req.body.email });
  console.log(user);
  if (!user) {
    res.json({
      status: "failure",
      message: " No user found",
    });
  } else {
    let resetToken;
    try {
      resetToken = user.createPasswordResetToken();
      console.log("from forgotps func " + resetToken);
      console.log("the user obj " + user);
      await user.save();
      console.log(req.body.email);
      const resetUrl = `${req.protocol}://${req.get(
        "host"
      )}/users/resetPassword:token=${resetToken}`;
      sendmail.sendEmail({
        from: "Admins Office <jonas@gmail.com>",
        to: `${req.body.email}`,
        subject: `Adminstrative Offce`,
        message: `Seems Like you forgot your password. Reset YOur password with this link. 
        ${resetUrl} know that it will expire after 10mins 
        If this is not you then ignore this email `,
      });
      res.status(200).json({
        status: "success",
        message: "Message is sent to your email! ",
        user,
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      console.error(error);
    }
  }
};

exports.changeOfPassword = async (req, res, next) => {
  const hashedPsw = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  console.log(req.body.token + " " + hashedPsw);
  const user = await User.findOne({
    passwordResetToken: hashedPsw,
    passwordResetExpires: { $gt: Date.now() },
  });
  console.log(user);
  if (!user) {
    res.json({
      status: 'failure',
      message: "Your Token does not much. Try again!",
    });
  } else {
    user.password = req.body.password;
    await user.save();
    res.json({
      status: "success",
      message: " Password Changed successfully!",
      user: {
        user,
      },
    });
  }
};
exports.resetPassword = async (req, res, next) => {
  const freshUser = await User.findOne({ _id: req.params.userId });
  if (freshUser && freshUser.password == req.body.sentpassword) {
    
    freshUser.password = req.body.newpassword;
    freshUser.passwordModified = true;
    await freshUser.save();
    const token = jwt.sign(
      {
        id: freshUser._id,
        email: freshUser.email,
      },
      "secret",
      {
        expiresIn: "10d",
      }
    );
    res.json({
      status: "success",
      message: " Password Successfuly changed",
      user: freshUser,
      token,
    });
  }
  else{
    res.json({
      status: 'failure',
      message: 'You entered wrong password. Make sure to enter the right one.'
    })
  }
  next();
};
exports.getAllAdmins = async(req, res, next)=>{
  const material_admin = await User.find({role: 'material-admin'})
  const info_admin =  await User.find({role: 'info-admin'})
  const club_president = await User.find({role: 'club-president'})
  const forum_admin =  await User.find({role: 'forum-admin'})
  if(material_admin || info_admin || club_president || forum_admin){
    res.json({
       status: 'success',
       data: {
         material_admin,
         info_admin,
         club_president,
         forum_admin
       }
    })    
  }
  else{
  res.json({
    status: 'failure',
    message: " There is no Administrator found in the DB."
  })
  }
}
exports.ban = async (req, res, next)=>{
  const user = await User.findById(req.params.uId);
  user.activated = false
  user.save();
  console.log(user);
  res.json({
    status: 'success',
    message: "Account successfully banned."
  })
}

exports.bannedAccounts = async (req, res, next)=>{
  const users = await User.find({activated: false});
  console.log(users);
  if(users){
    res.json({
      status: 'success',
      users
    })
  }
  else{
  res.json({
    status: 'failure',
    message: "No Account has benn banned yet."
  })
}
}
exports.editProfile = async (req, res, next)=>{
  const users = await User.findOne({_id: req.params.userId});
  console.log(users);
  users.firstname = req.body.firstname
  users.lastname = req.body.lastname
  users.email = req.body.email
  if(users){
    users.firstname = req.body.firstname
    users.lastname = req.body.lastname
    users.email = req.body.email
    users.save();
    res.json({
      status: 'success',
      users
    })
  }
  else{
  res.json({
    status: 'failure',
    message: "No Account has benn banned yet."
  })
}
}
