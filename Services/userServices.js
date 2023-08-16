const userModel = require("../modals/userModel");
const { createRandomHexColor } = require("./helperMethods");

const register = async (user, callback) => {
  console.log('hi from the register url')
  const newUser = userModel({ ...user, color:createRandomHexColor()});
  await newUser
    .save()
    .then((result) => {
      return callback(false, { message: "User created successfuly!" });
    })
    .catch((err) => {
      return callback({ errMessage: "Email already in use!", details: err });
    });
};

const login = async (email, callback) => {
  try {
    let user = await userModel.findOne({ email });
    if (!user) return callback({ errMessage: "Your email/password is wrong!" });
    return callback(false, { ...user.toJSON() });
  } catch (err) {
    return callback({
      errMessage: "Something went wrong",
      details: err.message,
    });
  }
};
const getUser = async (id, callback) => {
  try {
    let user = await userModel.findById(id);
    if (!user) return callback({ errMessage: "User not found!" });
    return callback(false, { ...user.toJSON() });
  } catch (err) {
    return callback({
      errMessage: "Something went wrong",
      details: err.message,
    });
  }
};
const getUserWithMail = async (email, callback) => {
  try {
    let user = await userModel.findOne({ email });
    if (!user)
      return callback({
        errMessage: "There is no registered user with this e-mail.",
      });
    return callback(false, { ...user.toJSON() });
  } catch (error) {
    return callback({
      errMessage: "Something went wrong",
      details: error.message,
    });
  }
};

const updateUser = async (id, updateData) => {
  try {
    console.log(updateData);
    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
    console.log(updatedUser)
    return updatedUser;
  } catch (error) {
    throw error;
  }
};

const submitOtp = async (otp, newPassword) => {
  try {
    const result = await userModel.findOne({ otp: otp });

    if (!result) {
      throw { code: 404, message: 'OTP not found' };
    }

    if (result.otpUsed) {
      throw { code: 400, message: 'OTP already used' };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Mark the OTP as used and update the password
    await userModel.updateOne(
      { email: result.email, otpUsed: false }, // Only update if otpUsed is false
      { otpUsed: true, password: hashedPassword }
    );

    return { code: 200, message: 'Password updated' };
  } catch (err) {
    throw { code: 500, message: 'Server error' };
  }
};



module.exports = {
  register,
  login,
  getUser,
  getUserWithMail,
  updateUser ,
  submitOtp 
};
