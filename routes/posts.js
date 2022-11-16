const router = require("express").Router();
const Post = require("../model/Post");
const verify = require("./verifyToken");
ObjectId = require("mongodb").ObjectID;

router.post("/", verify, async (req, res) => {
  // Enter post title and description as req.body
  req.body.userId = req.user._id;
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.send({
      post_id: savedPost._id,
      description: savedPost.description,
      title: savedPost.title,
      created_time: savedPost.uploadedDate,
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.put("/:id", verify, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post.userId.toString() === req.user._id) {
      await post.updateOne({ $set: req.body });
      res.send({ message: "Your Post have been updated" });
    } else {
      res.status(400).send({ message: "Not authorized to update the post" });
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

//Delete a post
router.delete("/:id", verify, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId.toString() === req.user._id) {
      await post.deleteOne({ _id: req.params.id });
      res.send({ message: "Your Post have been deleted" });
    } else {
      res.status(400).send({ message: "Not authorized to delete the post" });
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

//Get the post details by id
router.get("/:id", verify, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.send({
      userId: post.userId,
      title: post.title,
      description: post.description,
      no_of_likes: post.likes.length,
      no_of_unlikes: post.unlikes.length,
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
