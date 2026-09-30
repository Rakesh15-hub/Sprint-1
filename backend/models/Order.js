const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem'
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    image: String
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true
    },
    customer: {
        name: {
            type: String,
            required: [true, 'Customer name is required']
        },
        email: {
            type: String,
            required: [true, 'Email is required']
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required']
        },
        address: {
            type: String,
            required: [true, 'Delivery address is required']
        }
    },
    items: [orderItemSchema],
    subtotal: {
        type: Number,
        required: true
    },
    deliveryFee: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'online', 'card', 'upi'],
        default: 'cod'
    },
    specialInstructions: String,
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Auto-generate order number before saving
orderSchema.pre('save', function (next) {
    if (!this.orderNumber) {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        this.orderNumber = `PD-${Date.now().toString().slice(-4)}${randomNum}`;
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);
