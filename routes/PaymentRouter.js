const express = require('express');
const router = express.Router();
const cardController = require('../Controller/PaymentController');

router.get('/', (req, res) => {
    res.render('Payment', { title: 'Home Page', layout: 'layouts/layoutEmpty' });
});

router.get("/process", (req, res) => {
    var cardNumber = req.query.cardnumber;

    // Nếu cardNumber có dữ liệu, che các ký tự đầu
    if (cardNumber && cardNumber.length >= 4) {
        cardNumber = cardNumber.slice(-4); // Lấy 4 số cuối
        cardNumber = "**** **** **** " + cardNumber; // Định dạng lại số thẻ
    }

    res.render('SlidePanel', { title: 'Home Page', cardNumber, layout: 'layouts/layoutEmpty' });
})

const SCOPES = [
    'https://www.googleapis.com/auth/wallet_object.issuer', // Wallet API Scope
    'https://www.googleapis.com/auth/userinfo.email', // Request email access (optional)
    'https://www.googleapis.com/auth/userinfo.profile' // Request profile access (optional)
];

const emulatorCommand = 'adb -s emulator-5554 shell am start -n com.google.android.apps.walletnfcrel/.common.activities.WalletActivity';
const realDeviceCommand = 'adb -s 1234567890ABCDEF shell am start -n com.google.android.apps.walletnfcrel/.common.activities.WalletActivity';


function generateAuthUrl(oauth2Client) {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline', // Để lấy refresh token
        scope: [
            'https://www.googleapis.com/auth/wallet_object.issuer',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    });
}



// Endpoint để thêm thẻ vào ví Google Wallet
router.post('/addnewCard', cardController.addCard);


router.post('/test', async (req, res) => {
})
module.exports = router;
