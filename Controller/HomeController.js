const Image = require("../models/image");
const Product = require("../models/product");
const Sequelize = require('../Connect/dbConnect');
const Category = require("../models/Category");
const Order = require("../models/Order");
const OrderDetail = require("../models/OrderDetail");
const Storage = require("../models/Storage");
const ProductVariants = require("../models/ProductVariants");
const PaymentInfor = require("../models/PaymentInfor");
const Address = require("../models/Address");
const User = require("../models/User");
const { Op } = require('sequelize');
const sendEmail = require("../utils/sendEmail");
class HomeController {
    constructor() { }
    async HomeRender(req, res) {
        const categories = await Category.findAll({
            where: { IsActive: true },
            order: [['createdAt', 'DESC']]
        });
        const trendingProducts = await Product.findAll({
            where: { IsActive: true },
            order: [['createdAt', 'DESC']],
            limit: 12,
            include: { model: Image, as: 'images' }
        });
        res.render('User/Home', {
            title: 'Home',
            categories,
            trendingProducts,
        });

    }

    async GetWithid(req, res) {
        try {
            const productid = req.params.id;
            const productdebtail = await Product.findOne({
                where: { id: productid },
                include: ['images',
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
            const productsrandom = await Product.findAll({
                order: Sequelize.literal('RAND()'), // For MySQL
                limit: 10,
                include: { model: Image, as: 'images' },
                where: { IsActive: true }
            });


            const productSpecial = await Product.findAll({
                order: Sequelize.literal('RAND()'), // For MySQL
                limit: 10,
                include: { model: Image, as: 'images' },
                where: { IsActive: true }
            });

            if (!productdebtail) return res.redirect('/');
            res.render('User/DetailProduct', {
                title: 'Home',
                Product: productdebtail,
                productsrandom: productsrandom,
                productSpecial: productSpecial
            });
        } catch (error) {

        }
    }
    async addtocard(req, res) {
        try {
            const { productId, quantity, priceadd } = req.body;
            console.log(req.body);
            const product = await Product.findOne({
                where: { id: productId },
                include: ['images'],
                attributes: ['id', 'name', 'price'],
            });

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            const productToAdd = {
                id: product.id,
                name: product.name,
                price: priceadd != undefined ? priceadd : product.price,
                imageUrl: product.images.length > 0 ? product.images[0].url : '',  // Lấy URL của ảnh
                quantity: (quantity) ? quantity : 1
            };

            if (!req.session.cart) {
                req.session.cart = [];
            }

            // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
            const productIndex = req.session.cart.findIndex(item => item.id === productToAdd.id && item.price == productToAdd.price);
            if (productIndex !== -1) {

                req.session.cart[productIndex].quantity = Number(req.session.cart[productIndex].quantity) + Number(((quantity) ? quantity : 1));
            } else {
                // Nếu chưa có, thêm vào giỏ hàng
                req.session.cart.push(productToAdd);
            }
            res.redirect(req.headers.referer || '/');
        } catch (error) {
            console.error("Error adding to cart: ", error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    async RenderWishlish(req, res) {
        res.render('User/UserProfile/Wishlist', { title: 'Wishlist', layout: 'layouts/inforlayout' });
    }

    async RenderOrder(req, res) {
        res.render('User/UserProfile/Orders', { title: 'Wishlist', layout: 'layouts/inforlayout' });
    }

    async Logout(req, res) {
        res.clearCookie('authToken', { httpOnly: true, secure: true });
        req.session.destroy(err => {
            if (err) {
                return res.status(500).send('Error destroying session');
            }
            res.redirect('/login'); // or any other route you want to redirect the user to
        });
    }

    async RenderListProduct(req, res) {
        let typetage = req.query.typepage;  // Type of page ('TypeProduct' or 'Category')
        const categoryId = req.query.categoryId;  // For filtering by category
        const TypeProduct = req.query.TypeProduct;  // For filtering by product type
        const limit = 16;  // Number of products per page
        const page = parseInt(req.query.page) || 1;  // Current page number, default to 1
        const searchQuery = req.query.searchQuery;

        console.log(categoryId + " , " + TypeProduct + " , " + searchQuery + " ," + typetage);

        let listProduct = [];
        let whereClause = {};
        if (typetage == undefined) typetage = 'FindAll';
        switch (typetage) {
            case 'TypeProduct': {
                whereClause = TypeProduct ? { TypeProductId: TypeProduct, IsActive: true } : { IsActive: true };
                break;
            }
            case 'categpry': {
                whereClause = categoryId ? { categoryId, IsActive: true } : { IsActive: true };
                break;
            }
            case 'FindAll': {

                whereClause = searchQuery ? {
                    name: { [Op.like]: `%${searchQuery}%` },
                    IsActive: true
                } : { IsActive: true };

                break;
            }
            default:
                whereClause = { IsActive: true };
        }

        try {
            const { count, rows: products } = await Product.findAndCountAll({
                where: whereClause,
                order: [['createdAt', 'DESC']],
                limit,
                distinct: true,
                offset: (page - 1) * limit,
                include: { model: Image, as: 'images' }
            });
            const categories = await Category.findAll({
                where: { IsActive: true }
            });
            // Calculate total pages
            const totalPages = Math.ceil(count / limit);

            // Fetch first three products for additional display (e.g. featured products)
            const firstThreeProducts = await Product.findAll({
                limit: 3,
                where: { IsActive: true },
                include: { model: Image, as: 'images' }
            });

            res.render('User/ListProduct', {
                title: 'Product List',
                products: products,  // The current page's products
                totalPages,          // Total number of pages
                currentPage: page,    // Current page number
                categories,
                typetage,        // List of categories for the filter
                currentCategory: categoryId,  // The selected category (if any)
                firstThreeProducts,  // First three products for additional UI display
                currentTypeProduct: TypeProduct  // The selected product type (if any)
            });

        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }

    async ShowCheckout(req, res) {
        res.render('User/checkout', { title: 'checkout' });
    }

    async GetUserInfor(req, res) {
        const userId = req.session.user ? req.session.user.id : null;
        if (!userId || !req.session.user.email) {
            return res.redirect('/login');
        }
        const userfornew = await User.findOne({
            where: { id: userId },
            include: [
                {
                    model: Address,
                    as: 'addresses',
                },
                {
                    model: PaymentInfor,
                    as: 'payments'
                }
            ]
        })
        console.log(userfornew);
        req.session.user = userfornew;
        return;
    }

    async AddNewAcount(req, res) {
        const { cardholderName, cardNumber, expiry, cvv } = req.body;

        const userId = req.session.user ? req.session.user.id : null;
        if (!userId || !req.session.user.email) {
            return res.redirect('/login');
        }
        try {
            const payment = await PaymentInfor.create({
                cardholderName: cardholderName,
                cardNumber: cardNumber,
                expiry: expiry,
                cvv: cvv,
                userId: userId
            });

            const userfornew = await User.findOne({
                where: { id: userId },
                include: [
                    {
                        model: Address,
                        as: 'addresses',
                    },
                    {
                        model: PaymentInfor,
                        as: 'payments'
                    }
                ]
            })
            req.session.user = userfornew;
            return res.status(200).json({ status: true, message: 'Payment method added successfully' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, message: 'Internal server error' });
        }
    }

    async AddNewAdress(req, res) {
        const { street, city, state, postalCode, country } = req.body;
        const userId = req.session.user ? req.session.user.id : null;
        if (!userId || !req.session.user.email) {
            return res.redirect('/login');
        }
        try {
            const address = await Address.create({
                street: street,
                city: city,
                state: state,
                postalCode: postalCode,
                country: country,
                userId: userId
            })

            const userfornew = await User.findOne({
                where: { id: userId },
                include: [
                    {
                        model: Address,
                        as: 'addresses',
                    },
                    {
                        model: PaymentInfor,
                        as: 'payments'
                    }
                ]
            })
            req.session.user = userfornew;
            return res.status(200).json({ status: true, message: 'Address added successfully' });
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: false, message: 'Internal server error' });
            return
        }
    }

    async ShowThanks(req, res) {
        const thankYouData = req.session.thankYouData;
        if (!thankYouData) {
            return res.redirect('/'); // If no data, redirect to homepage or another page
        }
        const productsrandom = await Product.findAll({
            order: Sequelize.literal('RAND()'), // For MySQL
            limit: 2,
            include: { model: Image, as: 'images' },
            where: { IsActive: true }
        });
        res.render('User/ThanksOrder', { title: 'Thanks Order', data: thankYouData, productsrandom });
    }

    async ShowUserinfor(req, res) {
        const userId = req.session.user ? req.session.user.id : null;
        if (!userId) return res.redirect('/login');
        let orders = []
        try {
            // Retrieve orders for the specified user ID
            orders = await Order.findAll({
                where: { userId: userId },
                include: [
                    {
                        model: OrderDetail,
                        as: 'orderDetails', // Make sure this matches the alias in your associations
                        include: [
                            {
                                model: Product,
                                as: 'product', // Make sure this matches the alias in your associations
                                include: { model: Image, as: 'images' }
                            }
                        ]
                    }
                ]
            });
        } catch (error) {
            console.error('Error retrieving orders:', error);
        }
        res.render('User/UserProfile/Userinfor', { title: 'User infor', orders });
    }


    async getOrderWithDetails(orderid) {
        try {
            const order = await Order.findOne({
                where: { id: orderid },
                include: [
                    {
                        model: OrderDetail,
                        as: 'orderDetails', // Make sure this matches the alias in your associations
                        include: [
                            {
                                model: Product,
                                as: 'product', // Make sure this matches the alias in your associations
                            }
                        ]
                    }
                ]
            });

            if (order) {
                return order;
            } else {
                return null; // Order not found
            }
        } catch (error) {
            console.error('Error retrieving order with details:', error);
            throw error;
        }
    }


    async ShowdetailOrderProduct(req, res) {
        try {
            const Orderid = req.params.id;

            // Fetch order details along with products
            const OrserProduct = await Order.findOne({
                where: { id: Orderid }
            })
            const orderDetails = await OrderDetail.findAll({
                where: { orderId: Orderid },
                include: [
                    {
                        model: Product,
                        as: 'product',
                        include: [
                            {
                                model: Image,
                                as: 'images',
                            },
                        ],
                    },
                ],
            });

            // Assuming you have a way to get the order's totalAmount and status
            const totalAmount = orderDetails.reduce((total, detail) => total + (detail.priceAtPurchase * 1), 0);

            const order = {
                id: Orderid,
                orderDate: OrserProduct.orderDate, // Replace with actual order date if available
                totalAmount: totalAmount,
                status: OrserProduct.status,
                orderDetails: orderDetails,
            };
            res.render('User/UserProfile/ViewOrder', { title: 'List product detail', order });
        } catch (error) {
            console.error('Error retrieving order with details:', error);
            res.status(500).send('Internal Server Error');
        }
    }



    async ShowdetailOrderNoLogin(req, res) {
        try {
            const { Orderid, email } = req.query;

            console.log(Orderid);
            if (!Orderid) return res.render("User/detailOrderNologin", { title: 'Order Lookup', message: null, order: null });

            // Fetch order details along with products
            const OrserProduct = await Order.findOne({
                where: { id: Orderid }
            });

            if (!OrserProduct) {
                // Nếu không tìm thấy đơn hàng, render ra view với thông báo lỗi
                return res.render("User/detailOrderNologin", { title: 'Order Lookup', message: "Order not found", order: null });
            }

            const userinfor = await User.findOne({
                where: { id: OrserProduct.userId }
            })
            const orderDetails = await OrderDetail.findAll({
                where: { orderId: Orderid },
                include: [
                    {
                        model: Product,
                        as: 'product',
                        include: [
                            {
                                model: Image,
                                as: 'images',
                            },
                        ],
                    },
                ],
            });

            const dateStr = OrserProduct.orderDate;
            const date = new Date(dateStr);

            // Mảng các tên tháng
            const monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];

            // Định dạng ngày theo yêu cầu mà không cần phần giờ
            const formattedDate = `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            console.log(formattedDate);

            // Tính tổng số tiền của đơn hàng
            const totalAmount = OrserProduct.totalAmount;
            const order = {
                id: Orderid,
                orderDate: formattedDate,
                address: OrserProduct.AddressOrderShip,
                StrackNumber: OrserProduct.StackingID,
                totalAmount: totalAmount,
                status: OrserProduct.status,
                orderDetails: orderDetails,
                username: OrserProduct.Name,
                cardNumber: OrserProduct.cardNumberpurchase ? "**** **** **** " + OrserProduct.cardNumberpurchase.slice(-4) : "Card number not available"

            };

            res.render('User/detailOrderNologin', { title: 'Order detail', order, message: null });
        } catch (error) {
            console.error('Error retrieving order with details:', error);
            res.status(500).send('Internal Server Error');
        }
    }


    async CancelOrder(req, res) {
        const { orderId } = req.body;
        try {
            await Order.update({ status: 'Cancel' }, { where: { id: orderId } });
            return res.json({ success: true, message: 'Order has been cancelled successfully' });
        } catch (error) {
            console.error('Error cancelling order:', error);
            return res.json({ success: false, message: 'Error cancelling order' });
        }
    }
}
module.exports = HomeController