// middleware/checkRole.js
const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
function adminMiddleware(req, res, next) {
  const token = req.body.authToken || req.cookies.authToken;
  if (!token) {
    return res.redirect('/Notpermission'); // Không có token
  }

  jwt.verify(token, process.env.TokenSecret, (err, user) => {
    if (err) {
      return res.redirect('/Notpermission'); // Token không hợp lệ
    }
    if (user.roleId === 1) {
      req.user = user;
      return next();
    } else {
      return res.redirect('/Notpermission');
    }
  });
}
module.exports = adminMiddleware;
