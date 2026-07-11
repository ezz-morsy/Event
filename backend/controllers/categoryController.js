const Category = require("../models/Category");
const Event = require("../models/Event");

const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        next(error);
    }
};

const createCategory = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        const existing = await Category.findOne({ name: name.trim() });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Category name already exists"
            });
        }

        const category = await Category.create({ name: name.trim(), description });
        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
};

const updateCategory = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        const oldCategory = await Category.findById(req.params.id);
        if (!oldCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Check if name is taken by another category
        const duplicate = await Category.findOne({ name: name.trim(), _id: { $ne: req.params.id } });
        if (duplicate) {
            return res.status(400).json({
                success: false,
                message: "Category name already exists"
            });
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { name: name.trim(), description },
            { new: true }
        );

        // If the category name changed, cascade update all events using the old category name
        if (oldCategory.name !== updatedCategory.name) {
            await Event.updateMany({ category: oldCategory.name }, { category: updatedCategory.name });
        }

        res.status(200).json({
            success: true,
            data: updatedCategory
        });
    } catch (error) {
        next(error);
    }
};

const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Check if category is being used by events
        const eventCount = await Event.countDocuments({ category: category.name });
        if (eventCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category "${category.name}" because it is currently used by ${eventCount} event(s).`
            });
        }

        await Category.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
};
