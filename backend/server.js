const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Import routes
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');
const userAuthRoutes = require('./routes/userAuth');

// Import Admin model for seeding default admin
const Admin = require('./models/Admin');

const app = express();
const PORT = process.env.PORT || 3000;


// ==========================================
//  MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static frontend files (HTML, CSS, JS, Assets)
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// EJS view engine for admin dashboard
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// ==========================================
//  ROUTES
// ==========================================

// Public API routes
app.use('/api', apiRoutes);

// Admin dashboard routes
app.use('/admin', adminRoutes);

// User authentication routes
app.use('/auth', userAuthRoutes);

// Serve frontend pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'signup.html'));
});


// ==========================================
//  DATABASE CONNECTION & SERVER START
// ==========================================

async function startServer() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Create default admin if none exists
        const adminCount = await Admin.countDocuments();
        if (adminCount === 0) {
            await Admin.create({
                name: 'Admin',
                email: process.env.ADMIN_EMAIL || 'admin@persiandarbar.com',
                password: process.env.ADMIN_PASSWORD || 'admin123'
            });
            console.log('✅ Default admin created');
            console.log(`   Email: ${process.env.ADMIN_EMAIL || 'admin@persiandarbar.com'}`);
            console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
        }

        // Start server
        app.listen(PORT, () => {
            console.log('');
            console.log('🍽️  Persian Darbar Server is running!');
            console.log(`   🌐 Website:  http://localhost:${PORT}`);
            console.log(`   📊 Admin:    http://localhost:${PORT}/admin`);
            console.log(`   🔌 API:      http://localhost:${PORT}/api/menu`);
            console.log('');
        });

    } catch (err) {
        console.error('❌ Failed to start server:', err.message);
        process.exit(1);
    }
}

startServer();
