const Comment = require("../models/comment_model");
const User = require("../models/user_models");
const Post = require("../models/post_model");
const cloudinary = require("cloudinary").v2;

const createPost = async (req, res) => {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }
    if (!req.files || !req.files.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }
    try {
        const file = req.files.file;
    console.log("Cloudinary API Key:", process.env.CLOUD_API_SECRET);

    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "image_posts",
    });
      const post = await Post.create({
        user: req.user.userId,
        content,
        imageUrl: result.secure_url,
      });
     return res.status(201).json({ post, message: "Post created successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  const toggleLike = async (req, res) => {
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
  }

  const getAllPosts = async (req, res) => {
    try {
        const userId = req.user.userId; // Get logged-in user ID

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
  const posts = await Post.find()
    .populate("user", "username profileImage")
    .sort({ createdAt: -1 });

  res.status(200).json(posts);
};

const createComment = async (req, res) => {
  const { postId, text } = req.body;
  const comment = await Comment.create({
    user: req.user.userId,
    post: postId,
    text,
  });

  res.status(201).json(comment);
}

const toggleFollow = async (req, res) => {
  const {userIdFollow} = req.body;
  const currentUser = await User.findById(req.user.id);
  const targetUser = await User.findById(userIdFollow);

  const isFollowing = currentUser.following.includes(userIdFollow);

  if(isFollowing) {
    currentUser.following.pull(userIdFollow);
    targetUser.followers.pull(req.user.id);
  }else{
    currentUser.following.push(userIdFollow);
    targetUser.followers.push(req.user.id);
  }

  await currentUser.save();
  await targetUser.save();

  res.json({
    msg: isFollowing ? "Unfollowed" : "Followed",
  });
}



  module.exports = {
    createPost,
    getAllPosts,
    toggleLike,
    getFeed,
    createComment,
    toggleFollow,
  };