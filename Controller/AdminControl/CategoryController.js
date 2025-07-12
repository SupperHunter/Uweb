const Category = require("../../models/Category");
const cloudinary = require("../../Connect/cloudinaryConfig");
const { where } = require("sequelize");
const imageToBase64 = require("../../utils/ImageBase64");
const axios = require('axios');
class CategoryController {
    async getAllCategories(req, res) {
        try {
            const categories = await Category.findAll({
                where: { IsActive: true }
            });
            res.render('AdminViews/Categories/index', { title: 'Category', categories, layout: 'layouts/admin' })
            // res.render('AdminViews/Categories/index', { categories });
        } catch (error) {
            console.error('Error fetching categories:', error);
            res.status(500).send('Error fetching categories');
        }
    }

    async showFormCreate(req, res) {
        res.render('AdminViews/Categories/create', { title: 'Create Category', layout: 'layouts/admin' })
    }

    async createCategory(req, res) {
        const { name, Description, imageLinks } = req.body;
        let urlimage = '';

        try {
            // Nếu người dùng chọn upload từ máy
            if (req.files && req.files.length > 0) {
                const imageUploadPromises = req.files.map(async (file) => {
                    try {
                        const imagebase64 = await imageToBase64(file.path); // hoặc dùng path
                        return imagebase64;
                    } catch (error) {
                        console.error("Lỗi convert ảnh:", error);
                        return null;
                    }
                });

                const imageUrls = await Promise.all(imageUploadPromises);
                urlimage = imageUrls.find(url => url); // lấy ảnh đầu tiên hợp lệ

            } else if (imageLinks) {
                const links = imageLinks.split('\n').map(link => link.trim()).filter(Boolean);
                if (links.length > 0) {
                    urlimage = links[0]; // ✅ Chỉ lưu link trực tiếp, không chuyển base64
                }
            }

            await Category.create({ name, Description, imageUrl: urlimage });
            res.redirect('/admin/categories');
        } catch (error) {
            console.error('Error creating category:', error);
            res.status(500).send('Error creating category');
        }
    }
    async Showformedit(req, res) {
        const category = await Category.findByPk(req.params.id);
        res.render('AdminViews/Categories/edit', {
            category,
            title: 'Edit Category',
            layout: 'layouts/admin'
        });
    }
    async updateCategory(req, res) {
        const { id } = req.params;
        const { name, Description } = req.body;
        try {
            const category = await Category.findByPk(id);
            if (category) {
                category.name = name;
                category.Description = Description;
                if (req.files && req.files.length > 0) {
                    const imageUploadPromises = req.files.map(async (file) => {
                        try {
                            const imagebase64 = await imageToBase64(file);
                            return imagebase64;
                        } catch (error) {
                            return null;
                        }
                    });
                    const imageUrls = await Promise.all(imageUploadPromises);
                    category.imageUrl = imageUrls[0];
                }
                await category.save();
                res.redirect('/admin/categories');
            } else {
                res.status(404).send('Category not found');
            }
        } catch (error) {
            console.error('Error updating category:', error);
            res.status(500).send('Error updating category');
        }
    }

    async deleteCategory(req, res) {
        const { id } = req.params;
        try {
            const category = await Category.findByPk(id);
            if (category) {
                await category.update({ IsActive: false });
                res.redirect('/admin/categories');
            } else {
                res.status(404).send('Category not found');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            res.status(500).send('Error deleting category');
        }
    }

}

module.exports = CategoryController