const express = require('express');
const router = express.Router();
const Prayer = require('../models/Prayer');

// @desc    Get all prayers
// @route   GET /api/prayers
// @access  Public
router.get('/', async (req, res) => {
    try {
        const prayers = await Prayer.find().sort({ createdAt: -1 });
        res.json(prayers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Submit a prayer request
// @route   POST /api/prayers
// @access  Public
router.post('/', async (req, res) => {
    if (!req.body.message) {
        res.status(400);
        throw new Error('Please add a prayer message');
    }

    try {
        const prayer = await Prayer.create({
            name: req.body.name || 'Anonymous',
            message: req.body.message
        });

        res.status(201).json(prayer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Amen a prayer
// @route   PUT /api/prayers/amen/:id
// @access  Public
router.put('/amen/:id', async (req, res) => {
    try {
        const prayer = await Prayer.findById(req.params.id);

        if (!prayer) {
            res.status(404);
            throw new Error('Prayer not found');
        }

        prayer.amenCount += 1;
        await prayer.save();

        res.json(prayer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
