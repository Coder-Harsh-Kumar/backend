const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password, country } = req.body;

    if (!name || !email || !password || !country) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Generate Verification Token
    const crypto = require('crypto');
    const verificationToken = crypto.randomBytes(20).toString('hex');

    const user = await User.create({
        name,
        email,
        password,
        country,
        verificationToken
    });

    if (user) {
        // Send Verification Email
        const sendEmail = require('../utils/sendEmail');
        const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verify/${verificationToken}`;

        // Note: In local dev, req.protocol might be http.
        // For linking to frontend, we usually want checking via frontend route, but for simplicity we can use backend link that redirects or just responds.
        // Better implementation: Link to Frontend Page which then calls API.
        // For this task, let's link to a backend route that simply confirms and maybe redirects to frontend login.

        const message = `
            <h1>Email Verification</h1>
            <p>Please verify your email by clicking the link below:</p>
            <a href="${verifyUrl}" clicktracking=off>${verifyUrl}</a>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'FaithConnect - Email Verification',
                message
            });

            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                country: user.country,
                message: 'Registration successful! Please check your email to verify account.'
            });
        } catch (error) {
            console.error(error);
            // Don't delete user, but maybe let them resend? For now just error.
            res.status(500);
            throw new Error('Email could not be sent');
        }
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Verify Email
// @route   GET /api/auth/verify/:token
// @access  Public
router.get('/verify/:token', async (req, res) => {
    const user = await User.findOne({ verificationToken: req.params.token });

    if (!user) {
        return res.status(400).send('Invalid or expired token.');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.send('<h1>Email Verified Successfully!</h1><p>You can now close this window and login.</p>');
});


// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        if (!user.isVerified) {
            res.status(401);
            throw new Error('Please verify your email first.');
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            country: user.country,
            phone: user.phone,
            privacySettings: user.privacySettings,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid credentials');
    }
});

// @desc    Get User Profile
// @route   GET /api/auth/profile
// @access  Private
const { protect } = require('../middleware/authMiddleware'); // Assuming you have this
router.get('/profile', protect, async (req, res) => {
    const user = await User.findById(req.user.id);
    if (user) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            country: user.country,
            phone: user.phone,
            privacySettings: user.privacySettings,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});


// @desc    Update User Profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.phone = req.body.phone || user.phone;
        user.country = req.body.country || user.country;
        // Email usually managed separately or needs re-verification

        if (req.body.privacySettings) {
            user.privacySettings = req.body.privacySettings;
        }

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            country: updatedUser.country,
            phone: updatedUser.phone,
            privacySettings: updatedUser.privacySettings,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = router;
