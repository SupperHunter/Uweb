const express = require('express');
const router = express.Router();
const AccountUserControllers = require("../Controller/AdminControl/AcountInforController");
const ProductController = require('../Controller/AdminControl/ProductController');
const CategoryController = require('../Controller/AdminControl/CategoryController');
const ProductTypeController = require('../Controller/AdminControl/TypeProductController');
const OrderController = require('../Controller/AdminControl/OrderController');
const StotageController = require('../Controller/AdminControl/StorageController');
const UserManager = require('../Controller/AdminControl/UserManager');
const accountUserController = new AccountUserControllers();
const order = new OrderController();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });


router.get('/getallpayments', (req, res) => accountUserController.GetAllPayMent(req, res));
router.post('/SubmitVeryfy', (req, res) => accountUserController.SetupVerify(req, res))


const Product = new ProductController();
router.get('/products', (req, res) => Product.getAllProducts(req, res));
router.get('/products/create', Product.showCreateForm);
router.post('/products/create', upload.array('images'), Product.createProduct);
router.get('/products/:id/edit', Product.showEditForm);
router.post('/products/:id', upload.array('images'), Product.updateProduct);
router.post('/products/:id/delete', Product.deleteProduct);



// ProductType 
const ProductType = new ProductTypeController();
router.get('/ProductType', ProductType.getAllCategories);
router.post('/ProductType', ProductType.createCategory);
router.get('/ProductTypeNew', ProductType.showFormCreate);
router.post('/ProductType/edit/:id', ProductType.updateCategory);

router.get('/ProductTypeedit/:id', ProductType.Showformedit);
router.post('/ProductType/delete/:id', ProductType.deleteCategory);

const category = new CategoryController();


router.get('/categories', category.getAllCategories);
router.post('/categoriesnew', upload.array('images'), category.createCategory);
router.get('/createCategory', category.showFormCreate);
router.post('/categories/edit/:id', upload.array('images'), category.updateCategory);

router.get('/editcategory/:id', category.Showformedit);
router.post('/categories/:id/delete', category.deleteCategory);

//order

router.get('/orders', order.GenderOrder)

router.post('/orders/:id/updateStatus', order.UpdateStatusOrder);

router.post('/orders/:orderId/updateTrackingID', order.updateStacking);

router.get('/orders/search', order.searchOrders);

// /storage/ router 

const store = new StotageController();


router.get('/storages', store.ShowList);
router.post('/storages', store.create);
router.post('/storages/:id/delete', store.deleteStorage)
router.post('/storages/:id/update', store.update)

const UserController = new UserManager();

// Lấy danh sách người dùng
router.get('/users', UserController.getAllUsers);

// Đổi mật khẩu người dùng
router.post('/users/:id/change-password', UserController.changePassword);

// Chặn người dùng
router.post('/users/:id/block', UserController.blockUser);

// Mở khóa người dùng
router.post('/users/:id/unblock', UserController.unblockUser);

// search user 
router.get('/users/search', UserController.searchUsers);


router.get('/ListUser', UserController.ShowListUser);

router.get('/userinfor/:id/infor', UserController.GetUserInfor)

router.get("/rendeUserInfor/:userId", UserController.RenderUserInfor);


module.exports = router;
