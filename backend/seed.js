const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
const Review = require('./models/Review');
const Admin = require('./models/Admin');

// Rich menu items divided across Starter, Main Course, Dessert, and Beverages with exact local images
const menuItems = [
    // ==========================================
    // STARTERS
    // ==========================================
    {
        name: 'Paneer Tikka Angaare',
        price: 349,
        description: 'Charcoal-grilled cottage cheese cubes marinated in spiced hung curd, bell peppers, and fragrant Kashmiri red chili.',
        image: '/images/paneer_tikka.jpg',
        category: 'starter',
        isAvailable: true
    },
    {
        name: 'Mutton Galouti Kebab',
        price: 499,
        description: 'Melt-in-your-mouth royal minced lamb kebabs infused with 16 royal spices, served with fresh mint dip and paratha.',
        image: '/images/mutton_galouti_kebab.jpg',
        category: 'starter',
        isAvailable: true
    },
    {
        name: 'Chicken Seekh Kebab',
        price: 399,
        description: 'Tender minced chicken seasoned with cilantro, ginger, green chilies, and roasted ground cumin, grilled on skewers.',
        image: '/images/chicken_seekh_kebab.jpg',
        category: 'starter',
        isAvailable: true
    },
    {
        name: 'Crispy Vegetable Spring Rolls',
        price: 279,
        description: 'Golden fried handcrafted crispy rolls stuffed with julienned vegetables and served with sweet chili dipping sauce.',
        image: '/images/spring_rolls.jpg',
        category: 'starter',
        isAvailable: true
    },
    {
        name: 'Garlic Butter Tandoori Prawns',
        price: 549,
        description: 'Jumbo tiger prawns marinated in saffron-garlic butter and charred to perfection in the clay tandoor.',
        image: '/images/tandoori_prawns.jpg',
        category: 'starter',
        isAvailable: true
    },
    {
        name: 'Dahi Ke Sholay Kebab',
        price: 329,
        description: 'Crispy golden bread roll pockets filled with seasoned hung yogurt, paneer, and crushed pomegranate seeds.',
        image: '/images/dahi_kebab.jpg',
        category: 'starter',
        isAvailable: true
    },

    // ==========================================
    // MAIN COURSE
    // ==========================================
    {
        name: 'Persian Special Mutton Biryani',
        price: 699,
        description: 'Slow-cooked fragrant aged basmati rice dum-cooked with tender spiced mutton shank, saffron, and caramelised onions.',
        image: '/images/mutton_biryani.jpg',
        category: 'main-course',
        isAvailable: true
    },
    {
        name: 'Royal Butter Chicken',
        price: 479,
        description: 'Succulent tandoor-roasted chicken in a rich, silky tomato gravy infused with fresh cream and aromatic kasuri methi.',
        image: '/images/butter_chicken.jpg',
        category: 'main-course',
        isAvailable: true
    },
    {
        name: 'Dal Makhani Darbar',
        price: 369,
        description: 'Signature whole black lentils simmered overnight with tomatoes, churned butter, and mild aromatic spices.',
        image: '/images/dal_makhani.jpg',
        category: 'main-course',
        isAvailable: true
    },
    {
        name: 'Paneer Lababdar',
        price: 399,
        description: 'Soft fresh cottage cheese cubes cooked in a thick, rich tomato-onion-cashew gravy with a royal touch.',
        image: '/images/paneer_lababdar.jpg',
        category: 'main-course',
        isAvailable: true
    },
    {
        name: 'Kashmiri Mutton Rogan Josh',
        price: 599,
        description: 'Classic Kashmiri tender mutton braised in an aromatic sauce seasoned with fennel seeds, ginger, and ratan jot.',
        image: '/images/rogan_josh.jpg',
        category: 'main-course',
        isAvailable: true
    },
    {
        name: 'Hyderabadi Chicken Dum Biryani',
        price: 459,
        description: 'Layered basmati rice with marinated spiced chicken, caramelised onions, fresh mint, and saffron milk.',
        image: '/images/chicken_biryani.jpg',
        category: 'main-course',
        isAvailable: true
    },
    {
        name: 'Subz Nizami Handi',
        price: 349,
        description: 'Garden fresh seasonal vegetables tossed with roasted spices in a mild cashew-coriander gravy.',
        image: '/images/veg_handi.jpg',
        category: 'main-course',
        isAvailable: true
    },
    {
        name: 'Assorted Tandoori Bread Basket',
        price: 219,
        description: 'Freshly baked Garlic Butter Naan, Laccha Paratha, and Butter Roti served piping hot.',
        image: '/images/naan_basket.jpg',
        category: 'main-course',
        isAvailable: true
    },

    // ==========================================
    // DESSERT
    // ==========================================
    {
        name: 'Shahi Tukda Royal',
        price: 249,
        description: 'Crispy ghee-fried bread triangles soaked in fragrant saffron syrup, coated with thick rabri and pistachios.',
        image: '/images/shahi_tukda.jpg',
        category: 'dessert',
        isAvailable: true
    },
    {
        name: 'Sizzling Chocolate Walnut Brownie',
        price: 289,
        description: 'Gooey chocolate walnut brownie served sizzling hot with Madagascar vanilla ice cream and warm fudge sauce.',
        image: '/images/brownie.jpg',
        category: 'dessert',
        isAvailable: true
    },
    {
        name: 'Gulab Jamun with Kesar Rabri',
        price: 219,
        description: 'Golden fried milk-solid dumplings soaked in rose-cardamom syrup, served paired with chilled kesar rabri.',
        image: '/images/gulab_jamun.jpg',
        category: 'dessert',
        isAvailable: true
    },
    {
        name: 'Authentic Pistachio Baklava',
        price: 299,
        description: 'Crisp, flaky filo pastry sheets layered with chopped Iranian pistachios and sweetened with fragrant citrus honey.',
        image: '/images/baklava.jpg',
        category: 'dessert',
        isAvailable: true
    },
    {
        name: 'Royal Saffron Malai Kulfi',
        price: 199,
        description: 'Traditional slow-reduced dense milk ice cream flavored with saffron, green cardamom, and slivered almonds.',
        image: '/images/kulfi.jpg',
        category: 'dessert',
        isAvailable: true
    },
    {
        name: 'Molten Chocolate Lava Cake',
        price: 269,
        description: 'Warm dark chocolate cake with an irresistible flowing chocolate center, served with berry coulis.',
        image: '/images/lava_cake.jpg',
        category: 'dessert',
        isAvailable: true
    },

    // ==========================================
    // BEVERAGES
    // ==========================================
    {
        name: 'Persian Saffron Kahwa Tea',
        price: 179,
        description: 'Traditional green tea brewed with saffron strands, whole cinnamon, cardamom, and crushed almonds.',
        image: '/images/kahwa.jpg',
        category: 'beverage',
        isAvailable: true
    },
    {
        name: 'Royal Alphonso Mango Lassi',
        price: 189,
        description: 'Thick and luscious churned yogurt blended with pure Alphonso mango pulp and cardamom.',
        image: '/images/mango_lassi.jpg',
        category: 'beverage',
        isAvailable: true
    },
    {
        name: 'Fresh Mint & Lime Sparkler',
        price: 159,
        description: 'Muddled fresh mint leaves, lime juice, brown sugar, and sparkling soda with crushed ice.',
        image: '/images/mint_sparkler.jpg',
        category: 'beverage',
        isAvailable: true
    }
];

// Reviews
const reviews = [
    {
        customerName: 'Rahul Sharma',
        rating: 5,
        comment: 'Amazing food and excellent service. The Persian Special Biryani and Mutton Galouti Kebabs were absolutely divine!',
        isApproved: true
    },
    {
        customerName: 'Priya Mehta',
        rating: 5,
        comment: 'Beautiful restaurant ambiance with authentic rich flavors. The Butter Chicken and Baklava were unforgettable.',
        isApproved: true
    },
    {
        customerName: 'Arjun Patel',
        rating: 5,
        comment: 'The Paneer Tikka and Dal Makhani were top-notch and the staff was extremely hospitable. Definitely 5 stars!',
        isApproved: true
    }
];

async function seed() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await MenuItem.deleteMany({});
        await Review.deleteMany({});
        console.log('🗑️  Cleared existing menu items and reviews');

        // Seed menu items
        await MenuItem.insertMany(menuItems);
        console.log(`🍽️  Seeded ${menuItems.length} menu items with verified local images`);

        // Seed reviews
        await Review.insertMany(reviews);
        console.log(`⭐ Seeded ${reviews.length} reviews`);

        // Create default admin if none exists
        const adminCount = await Admin.countDocuments();
        if (adminCount === 0) {
            await Admin.create({
                name: 'Admin',
                email: process.env.ADMIN_EMAIL || 'admin@persiandarbar.com',
                password: process.env.ADMIN_PASSWORD || 'admin123'
            });
            console.log('👤 Default admin created');
        } else {
            console.log('👤 Admin already exists, skipping');
        }

        console.log('');
        console.log('✅ Database seeded successfully with accurate dish images!');
        console.log('');

        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
        process.exit(1);
    }
}

seed();
