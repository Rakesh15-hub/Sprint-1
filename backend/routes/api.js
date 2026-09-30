const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const Review = require('../models/Review');
const Contact = require('../models/Contact');
const Order = require('../models/Order');

// ==========================================
//  MENU ENDPOINTS
// ==========================================

// GET /api/menu — Get all available menu items
router.get('/menu', async (req, res) => {
    try {
        const { category } = req.query;
        const filter = { isAvailable: true };

        if (category && category !== 'all') {
            filter.category = category;
        }

        const menuItems = await MenuItem.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, data: menuItems });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/menu/:id — Get a single menu item
router.get('/menu/:id', async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        res.json({ success: true, data: item });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// ==========================================
//  ORDERS ENDPOINTS
// ==========================================

// POST /api/orders — Create a new customer order
router.post('/orders', async (req, res) => {
    try {
        const { customer, items, paymentMethod, specialInstructions } = req.body;

        if (!customer || !customer.name || !customer.phone || !customer.address) {
            return res.status(400).json({
                success: false,
                message: 'Please provide complete delivery details (Name, Phone, Address)'
            });
        }

        if (!items || !items.length) {
            return res.status(400).json({
                success: false,
                message: 'Your cart is empty'
            });
        }

        // Calculate subtotal
        const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
        const deliveryFee = subtotal >= 500 ? 0 : 40;
        const tax = Math.round(subtotal * 0.05); // 5% GST
        const totalAmount = subtotal + deliveryFee + tax;

        const order = await Order.create({
            customer,
            items,
            subtotal,
            deliveryFee,
            tax,
            totalAmount,
            paymentMethod: paymentMethod || 'cod',
            specialInstructions: specialInstructions || '',
            status: 'confirmed'
        });

        res.status(201).json({
            success: true,
            message: '🎉 Order placed successfully!',
            data: order
        });
    } catch (err) {
        console.error('Order creation error:', err);
        res.status(500).json({ success: false, message: 'Failed to place order. Please try again.' });
    }
});

// GET /api/orders/:id — Get order details by ID or Order Number
router.get('/orders/:id', async (req, res) => {
    try {
        let order;
        if (req.params.id.startsWith('PD-')) {
            order = await Order.findOne({ orderNumber: req.params.id });
        } else {
            order = await Order.findById(req.params.id);
        }

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// ==========================================
//  REVIEWS ENDPOINTS
// ==========================================

// GET /api/reviews — Get all approved reviews
router.get('/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({ isApproved: true }).sort({ createdAt: -1 });
        res.json({ success: true, data: reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/reviews — Submit a new review (pending approval)
router.post('/reviews', async (req, res) => {
    try {
        const { customerName, rating, comment } = req.body;

        if (!customerName || !rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, rating, and comment'
            });
        }

        const review = await Review.create({
            customerName,
            rating: Math.min(5, Math.max(1, Number(rating))),
            comment,
            isApproved: false
        });

        res.status(201).json({
            success: true,
            message: 'Review submitted! It will appear after admin approval.',
            data: review
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// ==========================================
//  CONTACT ENDPOINTS
// ==========================================

// POST /api/contact — Submit a contact form message
router.post('/contact', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and message'
            });
        }

        const contact = await Contact.create({
            name,
            email,
            phone: phone || '',
            message
        });

        res.status(201).json({
            success: true,
            message: 'Message sent successfully! We will get back to you soon.',
            data: contact
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
