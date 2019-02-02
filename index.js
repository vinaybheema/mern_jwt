const express = require("express");
const app = express();
const mongoose = require("mongoose");
const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const bodyParser = require("body-parser");
const passport = require('passport');

const db = require("./config/keys").mongoURI;

mongoose
  .connect(db)
  .then(() => {
    console.log("Connected");
  })
  .catch(() => {
    console.log("Failed Connection");
  });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(passport.initialize());
require('./config/passport')(passport);

app.use("/api/users", users);
app.use("/api/profile", profile);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
