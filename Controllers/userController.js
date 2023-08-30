const bcrypt = require("bcryptjs");
const userService = require("../Services/userServices");
const nodemailer = require('nodemailer');
const userModel = require("../modals/userModel");
const auth = require("../Middlewares/auth");
const register = async  (req, res) => {
  console.log(req.body);
  const { name, surname, email, password } = req.body;
  if (!(name && surname && email && password))
    return res
      .status("400")
      .send({ errMessage: "Please fill all required areas!" });
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  req.body.password = hashedPassword;
  await userService.register(req.body, (err, result) => {
    if (err) return res.status(400).send(err);
    return res.status(201).send(result);
  });
};
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!(email && password))
    return res
      .status(400)
      .send({ errMessage: "Please fill all required areas!" });
  await userService.login(email, (err, result) => {
    if (err) return res.status(400).send(err);

    const hashedPassword = result.password;
    if (!bcrypt.compareSync(password, hashedPassword))
      return res
        .status(400)
        .send({ errMessage: "Your email/password is wrong!" });

     result.token = auth.generateToken(result._id.toString(), result.email);
     result.password = undefined;  
     result.__v = undefined;
    return res
      .status(200)
      .send({ message: "User login successful!", user: result });
  });
};
const getUser = async (req, res) => {
  const userId =   req.user.id;
  await userService.getUser(userId, (err, result) => {
    if (err) return res.status(404).send(err);
    result.password = undefined;
    result.__v = undefined;
    return res.status(200).send(result);
  });
};
const getUserWithMail = async(req,res) => {
  const {email} = req.body;
  await userService.getUserWithMail(email,(err,result)=>{
    if(err) return res.status(404).send(err);
    const dataTransferObject = {
      name: result.name,
      surname: result.surname,
      color: result.color,
      email : result.email
    };
    return res.status(200).send(dataTransferObject);
  })
}
// Update User
const updateUser = async (req, res) => {
  const  id  = req.params.id
  if (req.body.userId === id) {
    try {
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      }
      const updatedUser = await userService.updateUser(id, req.body);
      res.status(200).json(updatedUser);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(401).json("You can update only your account!");
  }
};
 const sendotp = async (req, res) => {
  console.log(req.body)
  const _otp = Math.floor(100000 + Math.random() * 900000)
  console.log(_otp)
  let user = await userModel.findOne({ email: req.body.email })
  // send to user mail
  if (!user) {
      res.send({ code: 500, message: 'user not found' })
  }

  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'hafiznizaqatali@gmail.com',
        pass: 'apzctdaptqzwpmmu' 
      }
  })
  let info = await transporter.sendMail({
      from: 'hafiznizaqatali@gmail.com',
      to: req.body.email, // list of receivers
      subject: "OTP", // Subject line
      text: String(_otp),
   
  })
  if (info.messageId) {

      console.log(info, 84)
      userModel.updateOne({ email: req.body.email }, { otp: _otp, otpUsed:false })
          .then(result => {
              res.send({ code: 200, message: 'otp send' })
          })
          .catch(err => {
              res.send({ code: 500, message: 'Server err' })

          })

  } else {
      res.send({ code: 500, message: 'Server err' })
  }
}
const submitotp = async (req, res) => {
  try {
    const result = await userModel.findOne({ otp: req.body.otp });
console.log(result);
    if (!result) {
      return res.status(404).json({ code: 404, message: 'OTP not found' });
    }

    if (result.otpUsed) {
      return res.status(400).json({ code: 400, message: 'OTP already used' });
    }
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);

    // Mark the OTP as used and update the password
    const updateResult = await userModel.updateOne(
      { email: result.email, otpUsed: false }, // Only update if otpUsed is false
      { otpUsed: true, password: req.body.password }
    );

      return res.status(200).json({ code: 200, message: 'Password updated' });
    
  } catch (err) {
    return res.status(500).json({ code: 500, message: 'Server error' });
  }
};
//  const submitotp = (req, res) => {
//   console.log(req.body)


//   userModel.findOne({ otp: req.body.otp }).then(result => {

//       //  update the password 

//       userModel.updateOne({ email: result.email }, { password: req.body.password })
//           .then(result => {
//               res.send({ code: 200, message: 'Password updated' })
//           })
//           .catch(err => {
//               res.send({ code: 500, message: 'Server err' })

//           })


//   }).catch(err => {
//       res.send({ code: 500, message: 'otp is wrong' })

//   })


// }
module.exports = {
  register,
  login,
  getUser,
  getUserWithMail,
  updateUser,
  sendotp,
  submitotp
};
