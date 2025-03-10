const express = require('express');
const router = express.Router();
const homeController = require('../Controller/HomeController');
const AccountUserControllers = require("../Controller/AdminControl/AcountInforController");
const accountUserController = new AccountUserControllers();
const control = new homeController();

router.get('/', control.HomeRender);

router.get('/productdetail/:id', control.GetWithid);

router.post('/addtocard', control.addtocard);

router.get("/Notpermission", (req, res) => {
    res.render('Notpermission', { title: 'Not Permission', layout: 'layouts/layoutEmpty' });
})


router.get("/listProduct", control.RenderListProduct);
// infor for user

// checkout , Thanks
router.post('/addnewaccountinfor', (req, res) => accountUserController.AddNewAccountInfor(req, res));
router.get('/checkout', control.ShowCheckout);

router.get('/thanks', control.ShowThanks);

router.get("/logout", control.Logout);
router.get('/profile/wishlish', control.RenderWishlish);
router.get('/profile/Orders', control.RenderOrder);


router.get('/getdetailorder/:id', control.ShowdetailOrderProduct);

router.get('/getorderNologin', control.ShowdetailOrderNoLogin);

router.get('/userinfor', control.ShowUserinfor);

router.post('/cancelOrder', control.CancelOrder);

// userinfor 
router.post('/useraddaccount', control.AddNewAcount);
router.get('/userinfor', control.GetUserInfor);
router.post('/addnewaddress', control.AddNewAdress);

router.get('/test', (req, res) => {
    res.render('test', { title: "test" });
})
module.exports = router;