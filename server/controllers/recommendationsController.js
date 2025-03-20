const Product = require('../models/Item');
const Recommendation = require('../models/Recommendation');

// Fetch all products
const fetchProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Error fetching products" });
    }
};

// Fetch recommendations with pagination
const fetchRecommendations = async (req, res) => {
    const { page = 1, limit = 5 } = req.query;

    try {
        const recommendations = await Recommendation.find()
            .populate('product')
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Recommendation.countDocuments();

        res.json({
            recommendations: recommendations.map(rec => ({
                id: rec.product._id,
                name: rec.product.name,
            })),
            total,
        });
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        res.status(500).json({ message: "Error fetching recommendations" });
    }
};

// Add a recommendation
const addRecommendation = async (req, res) => {
    const { productId } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const existingRecommendation = await Recommendation.findOne({ product: productId });
        if (existingRecommendation) {
            return res.status(400).json({ message: "Product is already recommended" });
        }

        const recommendation = new Recommendation({ product: productId });
        await recommendation.save();

        res.json({ message: "Product added to recommendations" });
    } catch (error) {
        console.error("Error adding recommendation:", error);
        res.status(500).json({ message: "Error adding recommendation" });
    }
};

// Remove a recommendation
const removeRecommendation = async (req, res) => {
    const { productId } = req.params;

    try {
        const recommendation = await Recommendation.findOneAndDelete({ item: itemId });
        if (!recommendation) {
            return res.status(404).json({ message: "Recommendation not found" });
        }

        res.json({ message: "Product removed from recommendations" });
    } catch (error) {
        console.error("Error removing recommendation:", error);
        res.status(500).json({ message: "Error removing recommendation" });
    }
};

module.exports = {
    fetchProducts,
    fetchRecommendations,
    addRecommendation,
    removeRecommendation,
};