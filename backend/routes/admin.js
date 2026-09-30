const express = require('express');
const router = express.Router();
const { requireAuth, generateToken } = require('../middleware/auth');
const Admin = require('../models/Admin');
const MenuItem = require('../models/MenuItem');
const Review = require('../models/Review');
const Contact = require('../models/Contact');
const Order = require('../models/Order');

// ==========================================
//  AUTH ROUTES
// ==========================================

// GET /admin/login — Show login page
router.get('/login', (req, res) => {
    // If already logged in, redirect to dashboard
    if (req.cookies.token) {
        return res.redirect('/admin/dashboard');
    }
    res.render('admin/login', { error: null });
});

// POST /admin/login — Authenticate admin
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.render('admin/login', { error: 'Invalid email or password' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.render('admin/login', { error: 'Invalid email or password' });
        }

        const token = generateToken(admin);
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.redirect('/admin/dashboard');
    } catch (err) {
        res.render('admin/login', { error: 'Something went wrong. Please try again.' });
    }
});

// POST /admin/logout — Logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/admin/login');
});

// GET /admin — Redirect to dashboard
router.get('/', (req, res) => {
    res.redirect('/admin/dashboard');
});


// ==========================================
//  DASHBOARD
// ==========================================

router.get('/dashboard', requireAuth, async (req, res) => {
    try {
        const totalMenuItems = await MenuItem.countDocuments();
        const availableItems = await MenuItem.countDocuments({ isAvailable: true });
        const totalReviews = await Review.countDocuments();
        const pendingReviews = await Review.countDocuments({ isApproved: false });
        const totalContacts = await Contact.countDocuments();
        const unreadContacts = await Contact.countDocuments({ isRead: false });

        const recentContacts = await Contact.find().sort({ createdAt: -1 }).limit(5);
        const recentReviews = await Review.find().sort({ createdAt: -1 }).limit(5);

        res.render('admin/dashboard', {
            page: 'dashboard',
            stats: {
                totalMenuItems,
                availableItems,
                totalReviews,
                pendingReviews,
                totalContacts,
                unreadContacts
            },
            recentContacts,
            recentReviews
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
});


// ==========================================
//  MENU MANAGEMENT
// ==========================================

// GET /admin/menu — List all menu items
router.get('/menu', requireAuth, async (req, res) => {
    try {
        const menuItems = await MenuItem.find().sort({ createdAt: -1 });
        res.render('admin/menu', {
            page: 'menu',
            menuItems,
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// POST /admin/menu — Add a new menu item
router.post('/menu', requireAuth, async (req, res) => {
    try {
        const { name, price, description, image, category } = req.body;
        await MenuItem.create({
            name,
            price: Number(price),
            description,
            image: image || undefined,
            category
        });
        res.redirect('/admin/menu?success=Menu item added successfully');
    } catch (err) {
        res.redirect('/admin/menu?error=Failed to add menu item');
    }
});

// POST /admin/menu/:id/update — Update a menu item
router.post('/menu/:id/update', requireAuth, async (req, res) => {
    try {
        const { name, price, description, image, category, isAvailable } = req.body;
        await MenuItem.findByIdAndUpdate(req.params.id, {
            name,
            price: Number(price),
            description,
            image,
            category,
            isAvailable: isAvailable === 'on' || isAvailable === 'true'
        });
        res.redirect('/admin/menu?success=Menu item updated successfully');
    } catch (err) {
        res.redirect('/admin/menu?error=Failed to update menu item');
    }
});

// POST /admin/menu/:id/toggle — Toggle availability
router.post('/menu/:id/toggle', requireAuth, async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.id);
        item.isAvailable = !item.isAvailable;
        await item.save();
        res.redirect('/admin/menu?success=Availability toggled');
    } catch (err) {
        res.redirect('/admin/menu?error=Failed to toggle availability');
    }
});

// POST /admin/menu/:id/delete — Delete a menu item
router.post('/menu/:id/delete', requireAuth, async (req, res) => {
    try {
        await MenuItem.findByIdAndDelete(req.params.id);
        res.redirect('/admin/menu?success=Menu item deleted');
    } catch (err) {
        res.redirect('/admin/menu?error=Failed to delete menu item');
    }
});


// ==========================================
//  REVIEWS MANAGEMENT
// ==========================================

// GET /admin/reviews — List all reviews
router.get('/reviews', requireAuth, async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.render('admin/reviews', {
            page: 'reviews',
            reviews,
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// POST /admin/reviews/:id/approve — Approve a review
router.post('/reviews/:id/approve', requireAuth, async (req, res) => {
    try {
        await Review.findByIdAndUpdate(req.params.id, { isApproved: true });
        res.redirect('/admin/reviews?success=Review approved');
    } catch (err) {
        res.redirect('/admin/reviews?error=Failed to approve review');
    }
});

// POST /admin/reviews/:id/reject — Reject (unapprove) a review
router.post('/reviews/:id/reject', requireAuth, async (req, res) => {
    try {
        await Review.findByIdAndUpdate(req.params.id, { isApproved: false });
        res.redirect('/admin/reviews?success=Review rejected');
    } catch (err) {
        res.redirect('/admin/reviews?error=Failed to reject review');
    }
});

// POST /admin/reviews/:id/delete — Delete a review
router.post('/reviews/:id/delete', requireAuth, async (req, res) => {
    try {
        await Review.findByIdAndDelete(req.params.id);
        res.redirect('/admin/reviews?success=Review deleted');
    } catch (err) {
        res.redirect('/admin/reviews?error=Failed to delete review');
    }
});


// ==========================================
//  CONTACTS MANAGEMENT
// ==========================================

// GET /admin/contacts — List all contact messages
router.get('/contacts', requireAuth, async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.render('admin/contacts', {
            page: 'contacts',
            contacts,
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// POST /admin/contacts/:id/read — Mark as read
router.post('/contacts/:id/read', requireAuth, async (req, res) => {
    try {
        await Contact.findByIdAndUpdate(req.params.id, { isRead: true });
        res.redirect('/admin/contacts?success=Marked as read');
    } catch (err) {
        res.redirect('/admin/contacts?error=Failed to update');
    }
});

// POST /admin/contacts/:id/delete — Delete a contact message
router.post('/contacts/:id/delete', requireAuth, async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.redirect('/admin/contacts?success=Message deleted');
    } catch (err) {
        res.redirect('/admin/contacts?error=Failed to delete message');
    }
});


// ==========================================
//  ORDERS MANAGEMENT
// ==========================================

// GET /admin/orders — List all customer orders
router.get('/orders', requireAuth, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.render('admin/orders', {
            page: 'orders',
            orders,
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// POST /admin/orders/:id/status — Update order status
router.post('/orders/:id/status', requireAuth, async (req, res) => {
    try {
        const { status } = req.body;
        await Order.findByIdAndUpdate(req.params.id, { status });
        res.redirect('/admin/orders?success=Order status updated');
    } catch (err) {
        res.redirect('/admin/orders?error=Failed to update order status');
    }
});

// POST /admin/orders/:id/delete — Delete an order
router.post('/admin/orders/:id/delete', requireAuth, async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.redirect('/admin/orders?success=Order deleted');
    } catch (err) {
        res.redirect('/admin/orders?error=Failed to delete order');
    }
});

module.exports = router;
