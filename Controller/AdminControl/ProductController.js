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
            const {
                name,
                description,
                price,
                category,
                stock,
                brand,
                color,
                size,
                TypeProductId,
                imageLinks,
                imageOption,
            } = req.body;

            const sizes = [...new Set(req.body.sizes)];
            const prices = req.body.prices;

            // 1. Tạo sản phẩm
            const product = await Product.create({
                name,
                description,
                price,
                categoryId: category,
                TypeProductId,
                stock,
                brand,
                color,
                size,
            });

            // 2. Thêm biến thể (variant theo kích thước + giá)
            if (sizes && sizes.length > 0) {
                const sizesPromise = sizes.map((size, index) => {
                    if (prices[index] != 0) {
                        return ProductVariants.create({
                            storageId: size,
                            price: prices[index],
                            stock: 10, // điều chỉnh nếu cần
                            productId: product.id,
                        });
                    }
                });
                await Promise.all(sizesPromise);
            }

            // 3. Xử lý ảnh
            let productImages = [];

            if (imageOption === 'upload' && req.files?.length > 0) {
                const imageUploadPromises = req.files.map(async (file) => {
                    try {
                        const imagebase64 = await imageToBase64(file);
                        return {
                            url: imagebase64,
                            productId: product.id,
                        };
                    } catch (error) {
                        console.warn('Lỗi chuyển ảnh:', error);
                        return null;
                    }
                });

                productImages = await Promise.all(imageUploadPromises);
                productImages = productImages.filter((img) => img); // loại bỏ null

            } else if (imageOption === 'url' && imageLinks) {
                const urls = imageLinks.split(',').map((url) => url.trim()).filter(Boolean);

                productImages = urls.map((url) => ({
                    url,
                    productId: product.id,
                }));
            }

            if (productImages.length > 0) {
                await Image.bulkCreate(productImages);
            }

            res.redirect('/admin/products');
        } catch (err) {
            console.error('Lỗi khi tạo sản phẩm:', err);
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
        const limit = 20;
        const page = parseInt(req.query.page) || 1;

        try {
            const { count, rows: products } = await Product.findAndCountAll({
                include: { model: Image, as: 'images' },
                limit,
                distinct: true,
                offset: (page - 1) * limit,
                where: { IsActive: true }
            });

            const totalPages = Math.ceil(count / limit);
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
            const product = await Product.findByPk(req.params.id, {
                include: [
                    {
                        model: Image, as: 'images'
                    },
                    {
                        model: Category, as: 'category'
                    },
                    {
                        model: TypeProduct, as: 'TypeProduct'
                    },
                    {
                        model: Storage,
                        as: 'storages',
                        through: {
                            model: ProductVariants,
                            attributes: ['price', 'stock']
                        }
                    }
                ]
            });
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
                removeImages,
                imageOption,
                imageLinks
            } = req.body;

            const sizes = [...new Set(req.body.sizes || [])];
            const prices = req.body.prices || [];
            const { id } = req.params;

            const product = await Product.findByPk(id);
            if (!product) return res.status(404).send('Product not found');

            // ✅ Cập nhật biến thể size
            if (sizes.length > 0) {
                await ProductVariants.destroy({ where: { productId: id } });
                const variants = sizes.map((storageId, index) => ({
                    storageId,
                    price: prices[index],
                    stock: 10,
                    productId: id
                }));
                await ProductVariants.bulkCreate(variants);
            }

            // ✅ Cập nhật thông tin chính
            await product.update({
                name,
                description,
                price,
                categoryId: category,
                stock,
                brand,
                color,
                size
            });

            // ✅ Xóa ảnh đã chọn
            if (removeImages && Array.isArray(removeImages)) {
                await Image.destroy({
                    where: { id: removeImages.filter((id) => id) } // lọc id hợp lệ
                });
            }

            // ✅ Thêm ảnh mới (upload hoặc link)
            let newImages = [];

            if (imageOption === 'upload' && req.files?.length > 0) {
                const filePromises = req.files.map(async (file) => {
                    try {
                        const base64 = await imageToBase64(file);
                        return { url: base64, productId: product.id };
                    } catch (e) {
                        console.warn('Lỗi khi chuyển ảnh upload:', e.message);
                        return null;
                    }
                });
                newImages = await Promise.all(filePromises);
                newImages = newImages.filter(Boolean);
            } else if (imageOption === 'url' && imageLinks) {
                const links = Array.isArray(imageLinks) ? imageLinks : [imageLinks];
                const urls = links.map((url) => url.trim()).filter((url) => url);
                newImages = urls.map((url) => ({
                    url,
                    productId: product.id
                }));
            }

            if (newImages.length > 0) {
                await Image.bulkCreate(newImages);
            }

            res.redirect('/admin/products');
        } catch (err) {
            console.error('Update product error:', err);
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