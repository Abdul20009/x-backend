const express = require("express");
const router = express.Router();

const {
    createPost,
    getAllPosts,
    toggleLike,
    getFeed,
    createComment,
    toggleFollow,
  }  = require("../controllers/user_controller");
const { authenticateUser } = require("../middleware/authentication");

router.post("/post", authenticateUser, createPost);
router.get("/getallpost", authenticateUser, getAllPosts);
router.post("/like", authenticateUser, toggleLike);
router.get("/feed", authenticateUser, getFeed);
router.post("/comment", authenticateUser, createComment);
router.post("/follow", authenticateUser, toggleFollow);

module.exports = router;

//posts = posts.filter(post => post.content.includes("Flutter"));
