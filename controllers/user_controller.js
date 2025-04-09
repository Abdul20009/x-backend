const Comment = require("../models/comment_model");
const User = require("../models/user_models");
const Post = require("../models/post_model");
const cloudinary = require("cloudinary").v2;

const createPost = async (req, res) => {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }
    try {
      let imageUrl = null;
      if (req.files && req.files.file) {
        const file = req.files.file;

    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "image_posts",
    });
    imageUrl = result.secure_url;
  }
      const post = await Post.create({
        user: req.user.userId,
        username: req.user.username,
        email: req.user.email,
        profilePicture: req.user.profilePicture,
        content,
        imageUrl,
      });
     return res.status(201).json({ post, message: "Post created successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  const toggleLike = async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likes.includes(req.user.userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.user.userId);
    } else {
      post.likes.push(req.user.userId);
    }

    await post.save();
    res.status(200).json({
      message: alreadyLiked ? "Post unliked" : "Post liked",
      likes: post.likes.length,
    });
    } catch (error) {
      res.status(400).json({ message: error.message });
      
    }
  }

  const getAllPosts = async (req, res) => {
    try {
      //  const userId = req.user.userId; // Get logged-in user ID

        // Fetch all posts (Make sure to await)
        let posts = await Post.find();

        // Optional: Filter posts (e.g., exclude the user's own posts)
       // posts = posts.filter(post => post !== userId);

        // Shuffle the posts randomly
        posts.sort(() => Math.random() - 0.5);

        res.status(200).json(posts);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getFeed = async (req, res) => {
  try {
    const posts = await Post.find()
    .populate("user", "username profileImage")
    .sort({ createdAt: -1 });

  res.status(200).json(posts);
  } catch (error) {
    res.status(400).json({ message: error.message });
    
  }
};

const createComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const {content } = req.body;
  const comment = await Comment.create({
    user: req.user.userId,
    post: post._id,
    text,
  });

  res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
    
  }
}

const toggleFollow = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.userId);

    if (!targetUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (!currentUser) {
      return res.status(404).json({ msg: "Current user not found" });
    }

    const isFollowing = currentUser.following.includes(targetUser.id);

    if (isFollowing) {
      currentUser.following.pull(targetUser.id);
      targetUser.followers.pull(req.user.userId);
    } else {
      currentUser.following.push(targetUser.id);
      targetUser.followers.push(req.user.userId);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      msg: isFollowing ? "Unfollowed" : "Followed",
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

  module.exports = {
    createPost,
    getAllPosts,
    toggleLike,
    getFeed,
    createComment,
    toggleFollow,
  };