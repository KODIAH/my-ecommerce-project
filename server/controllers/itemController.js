const Item = require('../models/Item');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
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

// Fetch all items
const getItems = async (req, res) => {
    const { page = 1, category, subcategory, price, search } = req.query;
    const limit = 10;
    const skip = (page - 1) * limit;

    let query = {};

    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (price) query.price = { $lte: price };
    if (search) query.name = { $regex: search, $options: 'i' };

    try {
        const items = await Item.find(query)
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .skip(skip)
            .limit(limit);

        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching items', error });
    }
};

// Add a new item
const addItem = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: 'Error uploading image', error: err });
        }

        const { name, price, category, subcategory } = req.body;
        const image = req.file ? req.file.path : '';

        try {
            const newItem = new Item({ name, price, image, category, subcategory });
            await newItem.save();
            res.status(201).json(newItem);
        } catch (error) {
            res.status(500).json({ message: 'Error adding item', error });
        }
    });
};

// Update an item
const updateItem = async (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;
    const image = req.file ? req.file.path : req.body.image;

    try {
        const updatedItem = await Item.findByIdAndUpdate(
            id,
            { name, price, image },
            { new: true }
        );
        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: 'Error updating item', error });
    }
};

// Delete an item
const deleteItem = async (req, res) => {
    const { id } = req.params;

    try {
        await Item.findByIdAndDelete(id);
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting item', error });
    }
};

// Bulk delete items
const bulkDeleteItems = async (req, res) => {
    const { ids } = req.body;

    try {
        await Item.deleteMany({ _id: { $in: ids } });
        res.json({ message: 'Items deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error bulk deleting items', error });
    }
};

// Bulk restore items
const bulkRestoreItems = async (req, res) => {
    const { ids } = req.body;

    try {
        await Item.restore({ _id: { $in: ids } });
        res.json({ message: 'Items restored successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error bulk restoring items', error });
    }
};

module.exports = {
    getItems,
    addItem,
    updateItem,
    deleteItem,
    bulkDeleteItems,
    bulkRestoreItems,
};