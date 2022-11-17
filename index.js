const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
//Import Routes
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const userRoute = require("./routes/user");

dotenv.config();

//Connect to DB

mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true }, () =>
  console.log("Connected to DB")
);

//Middleware
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("Getting response");
});

// Route Middlewares
app.use("/api/", userRoute);
app.use("/api/", authRoute);
app.use("/api/posts", postRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server listening to port " + PORT);
});

module.exports = app;
