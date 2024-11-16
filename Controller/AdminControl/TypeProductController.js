const { where } = require('sequelize');
const Category = require('../../models/TypeProduct');

class TypeProductController {
    async getAllCategories(req, res) {
        try {
            const categories = await Category.findAll({ where: { delete: 1 } });
            res.render('AdminViews/ProductType/index', { title: 'ProductType', categories, layout: 'layouts/admin' })
            // res.render('AdminViews/Categories/index', { categories });
        } catch (error) {
            console.error('Error fetching categories:', error);
            res.status(500).send('Error fetching categories');
        }
    }

    async showFormCreate(req, res) {
        res.render('AdminViews/ProductType/create', { title: 'Create Category', layout: 'layouts/admin' })
    }

    async createCategory(req, res) {
        const { name, Description } = req.body;
        try {
            await Category.create({ name, Description });
            res.redirect('/admin/ProductType');
        } catch (error) {
            console.error('Error creating category:', error);
            res.status(500).send('Error creating category');
        }
    }


    async Showformedit(req, res) {
        const category = await Category.findByPk(req.params.id);
        res.render('AdminViews/ProductType/edit', {
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
                await category.save();
                res.redirect('/admin/ProductType');
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

            console.log(category);
            if (category) {
                await category.update({ delete: 0 });
                res.redirect('/admin/ProductType');
            } else {
                res.status(404).send('Category not found');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            res.status(500).send('Error deleting category');
        }
    }
}

module.exports = TypeProductController;