const Category = require('../models/Category');
const multer = require('multer');
const path = require('path');

// Multer configuration for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage }).single('image');

// Fetch all categories
const getCategories = async (req, res) => {
    try {
        const { search, sort } = req.query;
        let query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        let sortQuery = {};
        if (sort === 'name_asc') {
            sortQuery.name = 1;
        } else if (sort === 'name_desc') {
            sortQuery.name = -1;
        }

        const categories = await Category.find(query).sort(sortQuery);
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error });
    }
};

// Add a new category
const addCategory = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: 'Error uploading image', error: err });
        }

        const { name } = req.body;
        const image = req.file ? req.file.path : '';

        try {
            const newCategory = new Category({ name, image });
            await newCategory.save();
            res.status(201).json(newCategory);
        } catch (error) {
            res.status(500).json({ message: 'Error adding category', error });
        }
    });
};

// Edit a category
const editCategory = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const updatedCategory = await Category.findByIdAndUpdate(id, { name }, { new: true });
        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: 'Error updating category', error });
    }
};

// Delete a category
const deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        await Category.findByIdAndDelete(id);
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category', error });
    }
};

// Bulk delete categories
const bulkDeleteCategories = async (req, res) => {
    const { ids } = req.body;

    try {
        await Category.deleteMany({ _id: { $in: ids } });
        res.json({ message: 'Categories deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error bulk deleting categories', error });
    }
};

module.exports = {
    getCategories,
    addCategory,
    editCategory,
    deleteCategory,
    bulkDeleteCategories,
};