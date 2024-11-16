const express = require('express');
const router = express.Router();
const authController = require('../Controller/authController');

const auth = new authController();

router.get('/login', (req, res) => {
    res.clearCookie('authToken', { httpOnly: true, secure: true });
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error destroying session');
        }
    });
    res.render('login', { title: 'Not Permission', layout: 'layouts/layoutEmpty' });
});
router.get('/register', (req, res) => {
    res.render('register', { title: 'Not Permission', layout: 'layouts/layoutEmpty' });
});

router.post('/login', (req, res) => auth.Login(req, res));
router.post('/register', (req, res) => auth.register(req, res));


router.post('/requestpasswordreset', auth.forgotpasswordget);

// Verify Reset Code
router.post('/verifyresetcode', auth.verifyResetCode);

// Reset Password
router.post('/resetpassword', auth.resetPassword);

router.get('/renderCheckcode', auth.renderCheckcode);

module.exports = router;
