const jwt = require('jsonwebtoken');

// Middleware to protect admin routes
function requireAuth(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/admin/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.adminId = decoded.id;
        req.adminEmail = decoded.email;
        next();
    } catch (err) {
        res.clearCookie('token');
        return res.redirect('/admin/login');
    }
}

// Generate JWT token
function generateToken(admin) {
    return jwt.sign(
        { id: admin._id, email: admin.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

module.exports = { requireAuth, generateToken };
