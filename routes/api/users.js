const express = require("express");
const router = express.Router();
const User = require("../../modals/User");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");
const validateRegisterData = require("../../Validator/register");
const validateLoginData = require("../../Validator/login");

router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterData(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = "User already exists";
      res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", //Size
        rg: "pg", //Rating
        d: "mm" //Default
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) {
            throw err;
          } else {
            newUser.password = hash;
            newUser
              .save()
              .then(user => res.json(user))
              .catch(() => console.log(err));
          }
        });
      });
    }
  });
});

router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginData(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email }).then(user => {
    if (!user) {
      errors.email = "User is not found";
      res.status(404).json(errors);
    } else {
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          const payload = {
            id: user.id,
            email: user.email,
            avatar: user.avatar
          };
          jwt.sign(
            payload,
            keys.secretOrKey,
            { expiresIn: 3600 },
            (err, token) => {
              res.json({
                success: true,
                token: "Bearer " + token
              });
            }
          );
          //   res.json("User is found");
        } else {
          errors.password = "Password is incorrect";
          res.status(400).json(errors);
        }
      });
    }
  });
});

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
