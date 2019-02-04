const express = require("express");
const router = express.Router();
const passport = require("passport");
const mongoose = require("mongoose");
const Users = require("../../modals/User");
const Profile = require("../../modals/Profile");
const validatePostDData = require("../../Validator/post");
const Post = require("../../modals/Post");

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { isValid, errors } = validatePostDData(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    const post = {
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    };
    new Post(post).save().then(post => {
      res.json(post);
    });
  }
);

router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ noPostsFound: "No Posts found" }));
});

router.get("/:post_id", (req, res) => {
  Post.findById(req.params.post_id)
    .then(posts => res.json(posts))
    .catch(err =>
      res.status(404).json({ noPostFound: "No Post found with the given id" })
    );
});

router.delete(
  "/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.post_id)
        .then(post => {
          if (post.user.toString() !== req.user.id) {
            res.status(401).json({ notAuthorized: "User not authorized" });
          }
          post.remove().then(post => res.json({ success: true }));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found" }));
    });
  }
);

router.post(
  "/like/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.post_id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            res
              .status(400)
              .json({ alreadyliked: "User already liked this post" });
          } else {
            post.likes.unshift({ user: req.user.id });
            post.save().then(post => {
              res.json(post);
            });
          }
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found" }));
    });
  }
);

router.post(
  "/unlike/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.post_id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            res
              .status(400)
              .json({ alreadyliked: "You have not yet liked this post" });
          } else {
            const removeIndex = post.likes
              .map(item => item.user.toString())
              .indexOf(req.user.id);
            post.likes.splice(removeIndex, 1);
            post.save().then(post => res.json(post));
          }
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found" }));
    });
  }
);

router.post(
  "/comments/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { isValid, errors } = validatePostDData(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Post.findById(req.params.post_id)
      .then(post => {
        const comment = {
          text: req.body.text,
          user: req.user.id,
          name: req.body.name,
          avatar: req.user.avatar
        };
        post.comments.unshift(comment);
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: "No post found" }));
  }
);

router.delete(
  "/comments/:post_id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.post_id)
      .then(post => {
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ noCommentFound: "No Comment found with the given id" });
        } else {
          const removeIndex = post.comments
            .map(item => item._id.toString())
            .indexOf(req.params.comment_id);
          post.comments.splice(removeIndex, 1);
          post.save().then(post => res.json(post));
        }
      })
      .catch(err => res.status(404).json({ noPost: "Post is not availabels" }));
  }
);

module.exports = router;
