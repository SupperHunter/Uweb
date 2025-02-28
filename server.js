const express = require('express');
const path = require('path');
const { google } = require('googleapis');
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MySQLStore = require('express-mysql-session')(session);
const { createClient } = require('redis'); // Redis client import
const paymentRouter = require('./routes/PaymentRouter');
const AdminRouter = require('./routes/AdminRouter');
const AuthRouter = require('./routes/AuthRouter');
const HomeRouter = require('./routes/HomeRouter');
const sequelize = require('./Connect/dbConnect');
const Productvran = require('./models/ProductVariants');
const Role = require('./models/Role');
const user = require('./models/User');
const Image = require('./models/image');
const TypeProduct = require('./models/TypeProduct');
const PaymentInfor = require('./models/PaymentInfor');
const Product = require('./models/product');
const Category = require('./models/Category');
const order = require('./models/Order');
const OrderDetail = require('./models/OrderDetail');
const http = require('http');
const app = express();
const server = http.createServer(app);
const SocketConnect = require('./Connect/SocketConnect');
const socketConnect = new SocketConnect(server); // Khởi tạo SocketConnect
const ConnectToMobile = require('./Connect/ConnectToMoblile');
const multer = require('multer');
const expressLayouts = require('express-ejs-layouts');
const adminMiddleware = require('./middleWare/checkRole');
const cors = require('cors');
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(expressLayouts);
app.use(cors());
app.set('layout', 'layouts/main');
require('dotenv').config();


const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  clearExpired: true, // Dọn dẹp session hết hạn
  checkExpirationInterval: 900000, // Kiểm tra mỗi 15 phút (900000ms)
  expiration: 3600000
});


app.use(session({
  store: sessionStore,
  secret: `secret-key-${Date.now()}`,
  resave: false,
  rolling: true,
  saveUninitialized: false,
  cookie: { maxAge: 3600000, secure: false }
}));


// sequelize.sync({ force: true }) // Sử dụng { force: true } để xóa và tạo lại bảng
//   .then(() => {
//     console.log('Database & tables created!');
//   })
//   .catch(err => {
//     console.error('Error syncing database:', err);
//   });

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use('/payment', paymentRouter);
// app.use('/admin' , checkRole('admin'), AdminRouter);
app.use('/admin', AdminRouter);
// app.use('/admin', adminMiddleware, AdminRouter);
app.use('', AuthRouter);
app.use('', HomeRouter);

app.get('/test', (req, res) => {
  res.render('test', { title: 'Home Page' });
});


module.exports = { server, socketConnect }; 
