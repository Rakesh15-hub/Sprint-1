const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /auth/signup — Register a new user
router.post('/signup', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            phone: phone || '',
            password
        });

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set cookie
        res.cookie('userToken', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            success: true,
            message: 'Account created successfully!',
            user: { name: user.name, email: user.email }
        });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});


const Admin = require('../models/Admin');

// POST /auth/login — Login user (or admin)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // 1. First check User collection
        let user = await User.findOne({ email });
        let isAdmin = false;

        if (user) {
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }
        } else {
            // 2. Check Admin collection
            const admin = await Admin.findOne({ email });
            if (admin) {
                const isMatch = await admin.comparePassword(password);
                if (isMatch) {
                    isAdmin = true;
                    user = {
                        _id: admin._id,
                        email: admin.email,
                        name: admin.name + ' (Admin)'
                    };
                } else {
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid email or password'
                    });
                }
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name, isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set cookie
        res.cookie('userToken', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        if (isAdmin) {
            // Also set admin token cookie so they can access /admin seamlessly
            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
        }

        res.json({
            success: true,
            message: isAdmin ? 'Admin login successful!' : 'Login successful!',
            isAdmin,
            user: { name: user.name, email: user.email }
        });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});


// POST /auth/logout — Logout user
router.post('/logout', (req, res) => {
    res.clearCookie('userToken');
    res.json({ success: true, message: 'Logged out successfully' });
});


// GET /auth/me — Get current user (check if logged in)
router.get('/me', (req, res) => {
    const token = req.cookies.userToken;

    if (!token) {
        return res.json({ success: false, loggedIn: false });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({
            success: true,
            loggedIn: true,
            user: { name: decoded.name, email: decoded.email }
        });
    } catch (err) {
        res.clearCookie('userToken');
        res.json({ success: false, loggedIn: false });
    }
});

module.exports = router;
