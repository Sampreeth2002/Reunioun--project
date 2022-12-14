const router = require("express").Router();
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { registerValidation, loginValidation } = require("../validation");

// Login using JWT and bycrypt
router.post("/authenticate", async (req, res) => {
  //Login Validation
  if (req.body.email === undefined) {
    return res.status(400).send({ message: "Please enter email" });
  }

  if (req.body.email === undefined) {
    return res.status(400).send({ message: "Please enter password" });
  }

  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Checking if the email exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Email is not found");

  //Checking the password is correct
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send("Invalid password");

  //Create and assign a token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  res.status(200).header("auth-token", token).send({
    message: "Login Successfull",
    token: token,
  });
});

router.post("/register", async (req, res) => {
  //Validation of data
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Checking if the user is already in the database
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("Email already exists");

  //Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  //Create new user
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  });
  try {
    const savedUser = await user.save();
    res.send(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
