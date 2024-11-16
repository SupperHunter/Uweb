const jwt = require('jsonwebtoken');


const verifyToken = (req , res , next) => {
    const token = req.session.token;
    if(!token) res.redirect('/login');

    try {
      const verifytoken = jwt.verify(token, 'secretkey');
      req.user = verifytoken;
      next();
    } catch (error) {
      res.redirect('/login')
    }
}

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied: Admins only' });
  next();
};

module.exports = {verifyToken , isAdmin};