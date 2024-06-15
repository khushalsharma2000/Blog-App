const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const slackUser = require('../models/slackUser');
const verifyToken = require('../verifyToken');

// UPDATE
router.put("/:id", verifyToken, async (req, res) => {
  try {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hashSync(req.body.password, salt);
    }
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Post.deleteMany({ userId: req.params.id });
    await Comment.deleteMany({ userId: req.params.id });
    res.status(200).json("User has been deleted!");
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET USER
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...info } = user._doc;
    res.status(200).json(info);
  } catch (err) {
    res.status(500).json(err);
  }
});

// FOLLOW USER
router.post("/follow", verifyToken, async (req, res) => {
  const { userId, profileId } = req.body;

  try {
    const profileUser = await slackUser.findOne({ userId: profileId });

    if (profileUser.follower.includes(userId)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    profileUser.follower.push(userId);
    await profileUser.save();

    return res.status(200).json({ message: "Successfully followed user" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// UNFOLLOW USER
router.post("/unfollow", verifyToken, async (req, res) => {
  const { userId, profileId } = req.body;

  try {
    const profileUser = await slackUser.findOne({ userId: profileId });

    if (!profileUser.follower.includes(userId)) {
      return res.status(400).json({ message: "Not following this user" });
    }

    profileUser.follower = profileUser.follower.filter((id) => id.toString() !== userId);
    await profileUser.save();

    return res.status(200).json({ message: "Successfully unfollowed user" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// CHECK IF FOLLOWING
router.post("/isFollowing", verifyToken, async (req, res) => {
  const { userId, profileId } = req.body;

  try {
    const profileUser = await slackUser.findOne({ userId: profileId });

    if (profileUser.follower.includes(userId)) {
      return res.status(200).json({ isFollowing: true });
    } else {
      return res.status(200).json({ isFollowing: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/getfollowers", verifyToken, async (req, res) => {
    const { userId } = req.body;
    
  
    try {
      const profileUser = await slackUser.findOne({ userId: userId });
  
      res.status(200).json({num:profileUser.follower.length})
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });

module.exports = router;
