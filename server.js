const express = require('express');
const path = require('path');
const { google } = require('googleapis');
const fs = require('fs');
const geoip = require('geoip-lite');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
// const MySQLStore = require('express-mysql-session')(session);
const RedisStore = require('connect-redis').default; // Updated import
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

app.use((req, res, next) => {
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }
  const geo = geoip.lookup(ip);
  console.log(`IP: ${ip}, Geo: ${geo ? JSON.stringify(geo) : 'Unknown'}`);
  if (ip === '::1' || ip === '127.0.0.1') {
    return next(); // Allow localhost
  }

  if (geo && geo.country === 'VN') {
    return res.status(403).send('Access denied');
  }

  next();
});




// const sessionStore = new MySQLStore({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   clearExpired: true, // Dọn dẹp session hết hạn
//   checkExpirationInterval: 900000, // Kiểm tra mỗi 15 phút (900000ms)
//   expiration: 3600000
// });

// Configure Redis Client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redisClient.connect().catch(console.error); // Handle connection errors

// Initialize RedisStore for session storage
const sessionStore = new RedisStore({
  client: redisClient,
  ttl: 3600 // session expiration in seconds (1 hour)
});


app.use(session({
  store: sessionStore,
  secret: `secret-key-${Date.now()}`,
  resave: false,
  rolling: true,
  saveUninitialized: false,
  cookie: { maxAge: 3600000, secure: false }
}));


// sequelize.sync({ alter: true }) // Sử dụng { force: true } để xóa và tạo lại bảng
//   .then(() => {
//     console.log('Database & tables created!');
//   })
//   .catch(err => {
//     console.error('Error syncing database:', err);
//   });


app.use(async (req, res, next) => {
  try {
    const producttype = await TypeProduct.findAll({ where: { delete: 1 } });
    res.locals.producttype = producttype;
    res.locals.cart = req.session.cart || [];
    res.locals.user = req.session.user || null;
    res.locals.req = req;
  } catch (error) {
    console.error('Error fetching product types:', error);
    res.locals.producttype = []; // Fallback if there's an error
  }
  next();
});



const KEY_PATH = path.join(__dirname, 'path-to-your-service-account-key.json');
let credentials;
try {
  credentials = JSON.parse(fs.readFileSync(KEY_PATH));
} catch (error) {
  console.error('Error reading or parsing the credentials file:', error);
  process.exit(1);
}

if (!credentials.web || !credentials.web.client_id || !credentials.web.client_secret || !credentials.web.redirect_uris) {
  console.error('Invalid credentials file. Ensure it contains client_id, client_secret, and redirect_uris.');
  process.exit(1);
}

const { client_id, client_secret, redirect_uris } = credentials.web;
const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const scopes = [
  'https://www.googleapis.com/auth/blogger',
  'https://www.googleapis.com/auth/calendar'
];

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use('/payment', paymentRouter);
// app.use('/admin' , checkRole('admin'), AdminRouter);
// app.use('/admin', AdminRouter);
app.use('/admin', adminMiddleware, AdminRouter);
app.use('', AuthRouter);
app.use('', HomeRouter);

app.get('/test', (req, res) => {
  res.render('pages/index', { title: 'Home Page' });
});


module.exports = { server, socketConnect }; 
