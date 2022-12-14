const router = require("express").Router();
const User = require("../model/User");
const Post = require("../model/Post");
const verify = require("./verifyToken");
const Comment = require("../model/Comment");

// Get the user details
router.get("/user", verify, async (req, res) => {
  const userDetails = await User.findById(req.user._id);
  res
    .send({
      user_id: userDetails._id,
      username: userDetails.name,
      no_of_followers: userDetails.followers.length,
      no_of_followings: userDetails.followings.length,
    })
    .status(200);
});

// Follow the user
router.post("/follow/:id", verify, async (req, res) => {
  if (req.user._id !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.user._id);
      if (!user.followers.includes(req.user._id)) {
        await user.updateOne({ $push: { followers: req.user._id } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.send("You have followed the user").status(200);
      } else {
        res.send("You have already followed the user").status(400);
      }
    } catch (err) {
      res.status(400).send(err);
    }
  } else {
    res.send("Can't follow yourself");
  }
});

//Unfollow the user
router.post("/unfollow/:id", verify, async (req, res) => {
  if (req.user._id !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.user._id);
      if (user.followers.includes(req.user._id)) {
        // console.log("Sam");
        await user.updateOne({ $pull: { followers: req.user._id } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.send("You have unfollowed the user");
      } else {
        res.send("You are not following the user");
      }
    } catch (err) {
      res.status(400).send(err);
    }
  } else {
    res.send("Can't un-follow yourself");
  }
});

//Post like API
router.post("/like/:id", verify, async (req, res) => {
  if (req.params.id === undefined) {
    return res.send("Please enter the post id");
  }
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.user._id)) {
      await post.updateOne({ $push: { likes: req.user._id } });
      await post.updateOne({ $pull: { unlikes: req.user._id } });
      res.send("You have liked the post");
    } else {
      await res.send("Already liked the post");
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

//Unlike the post
router.post("/unlike/:id", verify, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.unlikes.includes(req.user._id)) {
      await post.updateOne({ $push: { unlikes: req.user._id } });
      await post.updateOne({ $pull: { likes: req.user._id } });
      res.send("You have unliked the post");
    } else {
      await res.send("Already unliked the post");
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

//Comment to the post
router.post("/comment/:id", verify, async (req, res) => {
  const comment = new Comment({
    userId: req.user._id,
    comment: req.body.comment,
  });
  try {
    const savedComment = await comment.save();
    const post = await Post.findById(req.params.id);
    await post.updateOne({ $push: { comments: savedComment } });
    res.send({
      comment_id: savedComment._id,
      message: "You have commented the post",
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

//get All posts in sorted order of time (latest post on top)
router.get("/all_posts", verify, async (req, res) => {
  try {
    const userId = req.user._id;
    const posts = await Post.find({
      userId: userId,
    }).sort({
      uploadedDate: -1,
    });

    for (var i = 0; i < posts.length; i++) {
      const tempPost = posts[i];
      posts[i] = {
        id: tempPost._id,
        title: tempPost.title,
        description: tempPost.description,
        created_at: tempPost.uploadedDate,
        comments: tempPost.comments,
        likes: tempPost.likes.length,
      };
    }
    res.json(posts);
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
