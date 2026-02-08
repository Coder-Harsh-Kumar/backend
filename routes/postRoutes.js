const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'name country')
            .sort({ createdAt: -1 }); // Newest first
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private (Protected)
router.post('/', protect, async (req, res) => {
    if (!req.body.content) {
        res.status(400);
        throw new Error('Please add text content');
    }

    try {
        const post = await Post.create({
            content: req.body.content,
            user: req.user.id
        });

        // Populate user details for immediate display
        const populatedPost = await Post.findById(post._id).populate('user', 'name country');

        res.status(201).json(populatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Like a post
// @route   PUT /api/posts/like/:id
// @access  Public (Can be protected if tracking user likes)
router.put('/like/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            res.status(404);
            throw new Error('Post not found');
        }

        post.likes += 1;
        await post.save();

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
