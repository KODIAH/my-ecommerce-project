const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category');
const multer = require('multer');
const path = require('path');

// Multer configuration for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
});

// Set file size limit (e.g., 50MB)
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB file size limit
}).single('image'); // 'image' is the field name for the file upload

// Fetch all subcategories
const getSubcategories = async (req, res) => {
    try {
        const subcategories = await Subcategory.find().populate('categoryId', 'name');
        res.json(subcategories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subcategories', error });
    }
};

// Add a new subcategory with image upload
const addSubcategory = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: 'Error uploading image', error: err });
        }

        const { name, categoryId } = req.body;
        const image = req.file ? req.file.path : '';

        try {
            const newSubcategory = new Subcategory({ name, categoryId, image });
            await newSubcategory.save();
            res.status(201).json(newSubcategory);
        } catch (error) {
            res.status(500).json({ message: 'Error adding subcategory', error });
        }
    });
};

// Update a subcategory
const updateSubcategory = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const updatedSubcategory = await Subcategory.findByIdAndUpdate(
            id,
            { name },
            { new: true } // Return the updated document
        );
        res.json(updatedSubcategory);
    } catch (error) {
        res.status(500).json({ message: 'Error updating subcategory', error });
    }
};

// Delete a subcategory
const deleteSubcategory = async (req, res) => {
    const { id } = req.params;

    try {
        await Subcategory.findByIdAndDelete(id);
        res.json({ message: 'Subcategory deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting subcategory', error });
    }
};

// Bulk delete subcategories
const bulkDeleteSubcategories = async (req, res) => {
    const { ids } = req.body;

    try {
        await Subcategory.deleteMany({ _id: { $in: ids } });
        res.json({ message: 'Subcategories deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error bulk deleting subcategories', error });
    }
};

// Search subcategories by name
const searchSubcategories = async (req, res) => {
    const { query } = req.query;

    try {
        const subcategories = await Subcategory.find({
            name: { $regex: query, $options: 'i' }, // Case-insensitive search
        }).populate('categoryId', 'name');

        res.json(subcategories);
    } catch (error) {
        res.status(500).json({ message: 'Error searching subcategories', error });
    }
};

// Sort subcategories by name (ascending or descending)
const sortSubcategories = async (req, res) => {
    const { order } = req.query; // 'asc' or 'desc'

    try {
        const sortOrder = order === 'desc' ? -1 : 1;
        const subcategories = await Subcategory.find()
            .sort({ name: sortOrder })
            .populate('categoryId', 'name');

        res.json(subcategories);
    } catch (error) {
        res.status(500).json({ message: 'Error sorting subcategories', error });
    }
};

module.exports = {
    getSubcategories,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    bulkDeleteSubcategories,
    searchSubcategories,
    sortSubcategories,
};