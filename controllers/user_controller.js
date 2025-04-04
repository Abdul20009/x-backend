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
        content,
        imageUrl: result.secure_url,
      });
     return res.status(201).json({ post, message: "Post created successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
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



  module.exports = {
    createPost,
    getAllPosts,
  };