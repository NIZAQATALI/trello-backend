const router = require("express").Router();
const User = require("../modals/User");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
//REGISTER
router.post("/register", async (req, res) => {
    try {
      const { username, email, password } = req.body;
  
      if (!username || !email || !password) {
        return res.status(422).json({ error: "please fill properly" });
      }
  
      User.findOne({ email: email }).then((UserExist) => {
        if (UserExist) {
          return res.status(422).json({ error: "Email Already Exist" });
        }
  
        bcrypt.genSalt(10, async (err, salt) => {
          if (err) {
            return res.status(500).json({ error: "Internal server error" });
          }
          const hashedPass = await bcrypt.hash(password, salt);
  
          const newUser = new User({
            username: username,
            email: email,
            password: hashedPass,
          });
          newUser.save()
            .then(() => {
              res.status(201).json({ message: "Register Successfully" });
            })
            .catch((err) => {
              res.status(422).json({ error: "Registration not done" });
            });
        });
      });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  });
//LOGIN
router.post("/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log(req.body);
      console.log(username);
      if (!username || !password) {
        return res.status(422).json({ error: "please fill properly" })
      }
      const Loginuser = await User.findOne({ username:username  })
      console.log(Loginuser);
      if (Loginuser) {
        const isMatch = await bcrypt.compare(password, Loginuser.password);
        token = await Loginuser.generateAuthToken();
        console.log(token);
        res.cookie('jwttoken', token, {
            expires: new Date(Date.now() + 25892000000),
            httpOnly: true
          })
        if (!isMatch) {
          res.status(422).json({ error: " invalid  password" })
        } else {
      const { password, ...others } = Loginuser._doc;
     res.status(200).json({ others,MESSAGE:'USER LOGIN SUCCESSFULLY'});  
     console.log(others);
        } 
      } else
        res.status(422).json({ error: " invalid Credential as username" })
    } catch (err) {
      console.log(err);
    }
  });
module.exports = router;