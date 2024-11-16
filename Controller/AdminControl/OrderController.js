const Image = require("../../models/image");
const Order = require("../../models/Order");
const OrderDetail = require("../../models/OrderDetail");
const Product = require("../../models/product");
const User = require("../../models/User");
const { Op } = require('sequelize');
const sendEmail = require("../../utils/sendEmail");

class OrderController {
    async GenderOrder(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 20;
            const offset = (page - 1) * limit;
            const orders = await Order.findAndCountAll({
                limit: limit,
                offset: offset,
            });

            // Calculate total pages
            const totalPages = Math.ceil(orders.count / limit);

            res.render('AdminViews/Orders/index', {
                title: 'Order',
                orders: orders.rows,
                currentPage: page,
                searchQuery: "",
                totalPages: totalPages,
                layout: 'layouts/admin'
            });
        } catch (error) {
            console.error("Error fetching orders:", error);
            res.status(500).json({ message: "An error occurred while fetching orders." });
        }
    }

    async updateStacking(req, res) {
        const orderId = req.params.orderId; // Get the order ID from the request parameters
        const newStackingID = req.body.stackingID; // Get the new StackingID from the request body
        const TrackLinkItemnew = req.body.TrackLinkItem;
        if (!newStackingID) {
            return res.status(400).json({ status: false, message: 'New StackingID is required' });
        }
        try {
            const [updatedRows] = await Order.update(
                { StackingID: newStackingID, TrackLinkItem: TrackLinkItemnew },
                { where: { id: orderId } }
            );
            if (updatedRows === 0) {
                return res.status(404).json({ status: false, message: 'Order not found' });
            }
            const order = await Order.findOne({ where: { id: orderId } });
            const user = await User.findOne({ where: { id: order.userId } });
            const orderDetails = await OrderDetail.findAll({
                where: { orderId: orderId },
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

            // Dynamically generate HTML email content
            const htmlemail = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Order Has Shipped</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 20px;
            background-color: #333333;
            color: #ffffff;
            border-top-left-radius: 5px;
            border-top-right-radius: 5px;
        }
        .header h1 {
            margin: 0;
            font-size: 20px;
        }
        .content {
            padding: 20px;
            color: #333333;
        }
        .content h2 {
            font-size: 18px;
            margin: 0;
            text-transform: uppercase;
        }
        .content p {
            font-size: 14px;
            margin: 5px 0 20px;
        }
        .tracking-button {
            display: inline-block;
            padding: 10px 20px;
            margin: 10px 0;
            background-color: #7e57c2;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-size: 14px;
        }
        .details, .items {
            margin: 20px 0;
        }
        .details-header, .items-header {
            background-color: #333333;
            color: #ffffff;
            padding: 10px;
            font-weight: bold;
            font-size: 14px;
            text-align: center;
        }
        .details-body, .items-body {
            padding: 15px;
            border: 1px solid #dddddd;
            background-color: #f9f9f9;
        }
        .tracking-info, .shipping-info {
            width: 48%;
            display: inline-block;
            vertical-align: top;
        }
        .tracking-info {
            text-align: center;
            padding-right: 10px;
            border-right: 1px solid #dddddd;
        }
        .items-body .item {
            display: flex;
            align-items: center;
            border-top: 1px solid #dddddd;
            padding: 10px 0;
        }
        .items-body .item:first-child {
            border-top: none;
        }
        .items-body .item img {
            width: 80px;
            height: auto;
            margin-right: 15px;
            border-radius: 5px;
        }
        .items-body .item-info {
            flex-grow: 1;
        }
        .items-body .item-info h3 {
            margin: 0;
            font-size: 14px;
            font-weight: bold;
            color: #333333;
        }
        .items-body .item-info p {
            margin: 2px 0;
            font-size: 12px;
            color: #666666;
        }
        .items-body .item-price {
            font-weight: bold;
            color: #333333;
        }
        .footer {
            text-align: center;
            padding: 15px;
            font-size: 12px;
            color: #777777;
        }
        .tracking-button {
            color: white; /* Set text color to white */
            text-decoration: none; /* Optional: remove underline */
        }

        .tracking-button:hover {
            text-decoration: underline; /* Optional: add underline on hover */
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>${user.username}, YOUR ORDER HAS SHIPPED</h1>
        </div>

        <!-- Content -->
        <div class="content">
            <p>Good news! Your product(s) should arrive shortly. Track it anytime using the link below.</p>

            <!-- Delivery Details -->
            <div class="details">
                <div class="details-header">Delivery Details</div>
                <div class="details-body">
                    <div class="tracking-info">
                        <a href="${TrackLinkItemnew}" class="tracking-button" 
   style="color: white; background-color: #007BFF; padding: 10px 15px; border-radius: 5px; text-decoration: none;">TRACK YOUR ORDER</a>

                        <p>Tracking Number:<br><strong>${newStackingID}</strong></p>
                    </div>
                    <div class="shipping-info">
                        <h2>Shipped to</h2>
                        <p>${order.AddressOrderShip}</p>
                    </div>
                </div>
            </div>

            <!-- Recently Shipped Items -->
            <div class="items">
                <div class="items-header">Recently Shipped Items</div>
                <div class="items-body">
                    ${orderDetails.map(detail => `
                        <div class="item">
                            <img src="${detail.product.images[0]?.url || 'https://via.placeholder.com/80'}" alt="Product Image">
                            <div class="item-info">
                                <h3>${detail.product.name}</h3>
                            </div>
                            <div class="item-price">$${detail.product.price}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>
</body>
</html>
`;
            sendEmail(user.email, 'Information Tracking', htmlemail);
            res.redirect('/admin/orders');
        } catch (error) {
            console.error('Error updating StackingID:', error);
            return res.status(500).json({ status: false, message: 'Internal server error', error });
        }
    }

    async UpdateStatusOrder(req, res) {
        const { status } = req.body; // Nhận trạng thái mới từ form
        const orderId = req.params.id;
        if (status == 'Delivered') {
            const orderDetails = await OrderDetail.findAll({
                where: { orderId: orderId },
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

            const orderfill = await Order.findOne({ where: { id: orderId } });
            const user = await User.findOne({ where: { id: orderfill.userId } })

            let formattedDate = ""
            const dateStr = orderfill.orderDate;
            const date = new Date(dateStr);

            if (!isNaN(date.getTime())) {
                // Add 4 days
                date.setDate(date.getDate() + 4);

                // Format the new date as "Nov. 12 2024"
                const options = { year: 'numeric', month: 'short', day: 'numeric' };
                formattedDate = date.toLocaleDateString('en-US', options).replace(',', '');

                console.log(formattedDate); // Output: "Nov. 12 2024"
            } else {
                console.error("Invalid date format");
            }

            const purchaseDate = formattedDate;
            const orderNumber = orderfill.id;
            const trackingNumber = orderfill.StackingID;
            const shippingAddress = orderfill.AddressOrderShip;
            const recipientName = user.username;
            const trackLink = orderfill.TrackLinkItem;
            // Build the items HTML dynamically
            const itemsHtml = orderDetails.map(orderDetail => {
                const productName = orderDetail.product.name;
                const productPrice = `$${orderDetail.product.price}`;
                const productImageUrl = orderDetail.product.images[0]?.url || "https://via.placeholder.com/50";
                return `
        <div class="item-info">
            <img src="${productImageUrl}" alt="${productName}" class="item-image">
            <div class="item-description">${productName}</div>
            <div class="item-price">${productPrice}</div>
        </div>
    `;
            }).join('');

            // Generate the final HTML with dynamic data
            const htmlEmail = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Delivered</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border: 1px solid #ddd; }
        .header { font-size: 24px; font-weight: bold; text-align: center; color: #333; padding: 20px 0; }
        .subheader { font-size: 16px; text-align: center; color: #666; padding: 10px 0; }
        .address { text-align: center; color: #0066c0; font-weight: bold; }
        .order-details { padding: 20px 0; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; }
        .order-details p { margin: 5px 0; color: #333; }
        .track-button { text-align: right; margin: 10px 0; }
        .track-button a { padding: 10px 20px; background-color: #333; color: #ffffff; text-decoration: none; font-weight: bold; }
        .item-info { display: flex; padding: 20px 0; align-items: center; }
        .item-image { width: 50px; height: 50px; margin-right: 10px; }
        .item-description { flex: 1; }
        .item-price { text-align: right; font-weight: bold; }
        .address-info { display: flex; justify-content: space-between; padding: 20px 0; border-top: 2px solid #0073c0; }
        .address-info div { width: 45%; }
        .address-info p { margin: 5px 0; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">${recipientName}, YOUR ORDER WAS DELIVERED</div>
        <div class="subheader">Thanks again for your purchase.</div>
        <div class="address">
            Your package has been delivered to ${shippingAddress}
        </div>
        <div class="order-details">
            <p>Order date: ${purchaseDate}</p>
            <p>Order # ${orderNumber}</p>
            <p>Tracking # ${trackingNumber}</p>
            <div class="track-button">
                <a href="${trackLink}">TRACK YOUR ORDER</a>
            </div>
        </div>
        ${itemsHtml}
        <div class="address-info">
            <div>
                <p><strong>Shipped to</strong></p>
                <p>${recipientName}</p>
                <p>${shippingAddress.split(', ')[0]}</p>
            </div>
        </div>
    </div>
</body>
</html>
`;

            sendEmail(user.email, 'Thanks', htmlEmail);
        } else if (status == 'On the way') {


            const orderfill = await Order.findOne({ where: { id: orderId } });
            const user = await User.findOne({ where: { id: orderfill.userId } })


            let formattedDate = ""
            const dateStr = orderfill.orderDate;
            const date = new Date(dateStr);

            if (!isNaN(date.getTime())) {
                date.setDate(date.getDate() + 4);
                const options = { year: 'numeric', month: 'short', day: 'numeric' };
                formattedDate = date.toLocaleDateString('en-US', options).replace(',', '');

                console.log(formattedDate);
            } else {
                console.error("Invalid date format");
            }
            const htmlEmail = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order On the Way</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    color: #333;
                    margin: 0;
                    padding: 0;
                }
                .email-container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .header {
                    background-color: #4CAF50;
                    color: #ffffff;
                    padding: 10px;
                    text-align: center;
                    border-radius: 8px 8px 0 0;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 20px;
                    text-align: left;
                }
                .content p {
                    margin: 10px 0;
                }
                .content .order-details {
                    margin: 20px 0;
                    padding: 10px;
                    background-color: #f9f9f9;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                }
                .content .order-details h2 {
                    margin-top: 0;
                }
                .content .order-details p {
                    margin: 5px 0;
                }
                .footer {
                    text-align: center;
                    padding: 10px;
                    font-size: 12px;
                    color: #777;
                }
                .track-button {
                    display: inline-block;
                    margin: 20px 0;
                    padding: 10px 20px;
                    background-color: #4CAF50;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 4px;
                }
            </style>
        </head>
        <body>

        <div class="email-container">
            <div class="header">
                <h1>Your Order is On the Way!</h1>
            </div>
            <div class="content">
                <p>Hi ${user.username}</p>
                <p>Your order <strong>#${orderfill.id}</strong> is now on its way to you! We’re excited to get your items to you as soon as possible.</p>
                
                <div class="order-details">
                    <h2>Order Details:</h2>
                    <p><strong>Order Number:</strong> #${orderfill.id}</p>
                    <p><strong>Estimated Delivery Date:</strong> ${formattedDate}</p>
                    <p><strong>Shipping Address:</strong> ${orderfill.AddressOrderShip}</p>
                </div>
                
                <a href="${orderfill.TrackLinkItem}" class="track-button">Track Your Order</a>
                
                <p>If you have any questions or need further assistance, feel free to reach out to our support team.</p>
                
                <p>Thank you for shopping with us!</p>
            </div>
        </div>

        </body>
        </html>
        `
            console.log(user.email);
            sendEmail(user.email, 'Get Ready! Your Order is On Its Way to You', htmlEmail);
        } else if (status == 'Cancel') {
            const orderfill = await Order.findOne({ where: { id: orderId } });
            const user = await User.findOne({ where: { id: orderfill.userId } })
            const htmlEmail = `

            <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Canceled</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f7f7f7; color: #333; margin: 0; padding: 0; }
        .container { width: 100%; max-width: 600px; margin: 40px auto; padding: 20px; border-radius: 8px; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); border-top: 4px solid #ff4757; }
        h1 { font-size: 28px; letter-spacing: 2px; color: #ff4757; margin: 10px 0; text-align: center; }
        .order-number { font-size: 20px; font-weight: bold; margin: 10px 0; color: #ff4757; text-align: center; }
        p { text-align: left; font-size: 16px; line-height: 1.5; margin: 10px 0; }
        .signature { text-align: left; margin-top: 20px; font-size: 14px; color: #555; }
        .signature a { color: #007bff; text-decoration: none; }
        .signature a:hover { text-decoration: underline; }
        @media (max-width: 600px) { h1 { font-size: 24px; } .order-number { font-size: 18px; } p { font-size: 15px; } }
    </style>
</head>
<body>
    <div class="container">
        <h1>REVOLVE</h1>
        <p class="order-number">YOUR ORDER #${orderfill.id} HAS BEEN CANCELED</p>

        <p>Dear ${orderfill.Name},</p>

        <p>We are sorry to inform you that your order was not approved for shipment and has been canceled by our Risk Management team. Any pending authorizations have been voided and will drop off within the next 2-3 days. If you have questions regarding this, please reply to this email, and our team will do their best to assist you.</p>

        <p>Thank you for shopping with us!</p>

        <div class="signature">
            <p>Best regards,<br>
            Team <strong>REVOLVE</strong><br>
            <a href="https://sensetronics.us/">https://sensetronics.us/</a><br>
        </div>
    </div>
</body>
</html>
            `

            sendEmail(user.email, 'Order Canceled', htmlEmail);

        }

        try {
            await Order.update({ status }, { where: { id: orderId } });
            res.redirect('/admin/orders');
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    }


    async searchOrders(req, res) {
        const { search, limit = 2 } = req.query; // Lấy page, limit từ query string
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        console.log(page + " | " + limit);
        try {
            // Tìm kiếm theo tất cả các trường với phân trang
            const { rows: orders, count } = await Order.findAndCountAll({
                where: {
                    [Op.or]: [
                        { id: { [Op.like]: `%${search}%` } },
                        { userId: { [Op.like]: `%${search}%` } },
                        { orderDate: { [Op.like]: `%${search}%` } },
                        { StackingID: { [Op.like]: `%${search}%` } },
                        { TrackLinkItem: { [Op.like]: `%${search}%` } },
                        { AddressOrderShip: { [Op.like]: `%${search}%` } },
                        { totalAmount: { [Op.like]: `%${search}%` } },
                        { cardNumberpurchase: { [Op.like]: `%${search}%` } },
                        { status: { [Op.like]: `%${search}%` } }
                    ]
                },
                limit: 10,
                offset: parseInt(offset)
            });

            // Tính tổng số trang
            // const totalPages = Math.ceil(count / limit);

            const totalPages = 0;
            // Trả về kết quả tìm kiếm với phân trang
            res.render('AdminViews/Orders/index',
                {
                    title: 'Order',
                    orders,
                    searchQuery: search,
                    currentPage: parseInt(page),
                    totalPages,
                    layout: 'layouts/admin'
                });
        } catch (error) {
            console.error('Error searching orders:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}
module.exports = OrderController;