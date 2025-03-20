const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const categoryRoutes = require('./routes/categoryRoutes');
const subcategoryRoutes = require('./routes/subcategoryRoutes');
const itemRoutes = require('./routes/itemRoutes');
const orderRoutes = require('./routes/orderRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const recommendationsRoutes = require('./routes/recommendationsRoutes');
const loyaltyRoutes = require('./routes/loyaltyRoutes');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());

// Increase payload size limit for JSON and URL-encoded data
app.use(express.json({ limit: '50mb' })); // Increase JSON payload limit to 50MB
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Increase URL-encoded payload limit to 50MB

// Serve static files (e.g., uploaded images)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log('Uploads folder created');
}
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api', authRoutes); // Authentication routes
app.use('/api', dashboardRoutes); // Dashboard routes
app.use('/api/categories', categoryRoutes); // Category routes
app.use('/api/subcategories', subcategoryRoutes); // Subcategory routes
app.use('/api/items', itemRoutes); // Item routes
app.use('/api/orders', orderRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/admin/recommendations', recommendationsRoutes);
app.use('/api/loyalty', loyaltyRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));