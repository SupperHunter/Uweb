const Category = require("../../models/Category");
const cloudinary = require("../../Connect/cloudinaryConfig");
const { where } = require("sequelize");
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
        const { name, Description } = req.body;
        console.log(req.file);
        let urlimage = '';
        if (req.files && req.files.length > 0) {
            const imageUploadPromises = req.files.map((file) => {
                return new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                        if (error) {
                            return reject(error);
                        }
                        resolve(result.secure_url);
                    }).end(file.buffer);
                });
            });
            const imageUrls = await Promise.all(imageUploadPromises);
            urlimage = imageUrls[0]
        }
        try {
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
                    console.log("lllllllllllllllllllll");
                    const imageUploadPromises = req.files.map((file) => {
                        return new Promise((resolve, reject) => {
                            cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                                if (error) {
                                    return reject(error);
                                }
                                resolve(result.secure_url);
                            }).end(file.buffer);
                        });
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