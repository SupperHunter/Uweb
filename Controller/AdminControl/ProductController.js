const Image = require("../../models/image");
const Product = require("../../models/product");
const cloudinary = require("../../Connect/cloudinaryConfig");
const ejs = require('ejs');
const Category = require("../../models/Category");
const TypeProduct = require("../../models/TypeProduct");
const Storage = require("../../models/Storage");
const ProductVariants = require("../../models/ProductVariants");
const { model } = require("mongoose");
const imageToBase64 = require("../../utils/ImageBase64");
class ProductController {
    async createProduct(req, res) {
        try {
            const { name, description, price, category, stock, brand, color, size, TypeProductId } = req.body;
            const sizes = [...new Set(req.body.sizes)];
            const prices = req.body.prices;

            // Create the product without images first
            const product = await Product.create({
                name,
                description,
                price,
                categoryId: category,
                TypeProductId,
                stock,
                brand,
                color,
                size
            });

            if (sizes && sizes.length > 0) {
                const sizesPromise = sizes.map((size, index) => {
                    if (prices[index] != 0) {
                        return ProductVariants.create({
                            storageId: size,
                            price: prices[index], // Add price for this size variant
                            stock: 10, // Assuming stock is constant, adjust as necessary
                            productId: product.id
                        });
                    }
                });
                await Promise.all(sizesPromise);

            }
            if (req.files && req.files.length > 0) {
                const imageUploadPromises = req.files.map(async (file) => {
                    try {
                        const imagebase64 = await imageToBase64(file);
                        return {
                            url: imagebase64,
                            productId: product.id
                        }
                    } catch (error) {

                    }
                });
                const productImages = await Promise.all(imageUploadPromises);
                await Image.bulkCreate(productImages);
            }
            res.redirect('/admin/products');
        } catch (err) {
            console.error(err); // Log error for debugging
            res.status(500).send(err.message);
        }
    }
    // show ra form tạo sản phẩm
    async showCreateForm(req, res) {
        const categories = await Category.findAll({
            where: { IsActive: true }
        });
        const producttype = await TypeProduct.findAll({ where: { delete: 1 } });
        const Store = await Storage.findAll({
            where: { IsActive: true }
        });
        res.render('AdminViews/products/create', { title: 'Create Product', categories, producttype, Store, layout: 'layouts/admin' })
    }
    async getAllProducts(req, res) {
        const limit = 20;  // Number of products per page
        const page = parseInt(req.query.page) || 1;  // Current page number, default to 1

        try {
            // Fetch total product count and products for the current page
            const { count, rows: products } = await Product.findAndCountAll({
                include: { model: Image, as: 'images' },
                limit,
                distinct: true,
                offset: (page - 1) * limit, // Calculate the offset for pagination
                where: { IsActive: true }
            });

            const totalPages = Math.ceil(count / limit);  // Calculate total pages
            console.log(totalPages);
            res.render('AdminViews/products/index', {
                title: 'Product',
                products,
                currentPage: page,
                totalPages,
                layout: 'layouts/admin'
            });

        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    async showEditForm(req, res) {
        try {
            // Fetch the product along with its associated images
            const product = await Product.findByPk(req.params.id, {
                include: [
                    {
                        model: Image, as: 'images' // Assuming you have an Image model associated
                    },
                    {
                        model: Category, as: 'category' // Change here to match the alias defined in the association
                    },
                    {
                        model: TypeProduct, as: 'TypeProduct' // Use the correct alias
                    },
                    {
                        model: Storage,
                        as: 'storages', // Use the alias defined in the model association
                        through: {
                            model: ProductVariants, // Explicitly include ProductVariants model
                            attributes: ['price', 'stock'] // Include price and stock from ProductVariants
                        }
                    }
                ]
            });


            // Check if the product exists
            if (!product) return res.status(404).send('Product not found');
            const categories = await Category.findAll({ where: { IsActive: 1 } });
            const producttype = await TypeProduct.findAll({ where: { delete: 1 } });
            const Store = await Storage.findAll({
                where: { IsActive: true }
            });
            res.render('AdminViews/products/edit', {
                categories, producttype, Store,
                product,
                title: 'Edit Product',
                layout: 'layouts/admin'
            });
        } catch (err) {
            res.status(500).send(err.message);
        }
    }
    async updateProduct(req, res) {
        try {
            const {
                name,
                description,
                price,
                category,
                stock,
                brand,
                color,
                size,
                removeImages
            } = req.body;
            const sizes = [...new Set(req.body.sizes)];
            const prices = req.body.prices;

            const { id } = req.params;

            const product = await Product.findByPk(id);
            if (!product) return res.status(404).send('Product not found');

            if (sizes && sizes.length > 0) {
                await ProductVariants.destroy({ where: { productId: id } });
                const sizesPromise = sizes.map((size, index) => {
                    return ProductVariants.create({
                        storageId: size,
                        price: prices[index],
                        stock: 10,
                        productId: id
                    });
                });
                await Promise.all(sizesPromise);

            }

            await product.update({ name, description, price, category, stock, brand, color, size });
            if (req.files && req.files.length > 0) {
                const imageUploadPromises = req.files.map(async (file) => {
                    const imagebase64 = await imageToBase64(file);
                    try {
                        const imagebase64 = await imageToBase64(file);
                        return {
                            url: imagebase64,
                            productId: product.id
                        }
                    } catch (error) {

                    }
                });
                const productImages = await Promise.all(imageUploadPromises);
                await Image.bulkCreate(productImages);
            }
            if (removeImages && Array.isArray(removeImages)) {
                await Image.destroy({ where: { id: removeImages } });
            }
            res.redirect('/admin/products');
        } catch (err) {
            res.status(500).send(err.message);
        }
    }
    async deleteProduct(req, res) {
        try {
            const { id } = req.params;

            await Product.update({ IsActive: false }, { where: { id } });
            res.redirect('/admin/products');
        } catch (err) {
            res.status(500).send(err.message);
        }
    }
}

module.exports = ProductController;