const express = require("express");
const router = express.Router();

const {createPost, getAllPosts}  = require("../controllers/user_controller");
const { authenticateUser } = require("../middleware/authentication");

router.post("/post", authenticateUser, createPost);
router.get("/getallpost", authenticateUser, getAllPosts);

module.exports = router;

//posts = posts.filter(post => post.content.includes("Flutter"));
