require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Role = require('../models/Role');
const sendEmail = require('../utils/sendEmail');
const Address = require('../models/Address');
const PaymentInfor = require('../models/PaymentInfor');
const { v4: uuidv4 } = require('uuid');
const Sequelize = require('sequelize');
const moment = require('moment');
class authController {
  async Login(req, res) {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({
        where: {
          [Sequelize.Op.or]: [
            { username: username },
            { email: username }
          ]
        },
        include: [
          {
            model: Address,
            as: 'addresses',
          },
          {
            model: PaymentInfor,
            as: 'payments',
          },
        ],
      });

      if (!user) {
        return res.status(404).json({ status: false, message: 'User not found' });
      }

      if (!user.blocked) {
        return res.status(404).json({ status: false, message: 'Your account has been blocked' });
      }

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ status: false, message: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id, roleId: user.roleId }, process.env.TokenSecret, { expiresIn: '1h' });
      req.session.user = user;
      const thirtyMinutes = 30 * 60 * 1000; // 30 phút tính bằng milliseconds
      const expirationDate = new Date(Date.now() + thirtyMinutes);
      res.cookie('authToken', token, { httpOnly: true, secure: true, expires: expirationDate });
      return res.json({
        status: true,
        message: 'Login successful',
        token: token,
        user: { id: user.id, username: user.username, roleId: user.roleId }
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({ status: false, message: 'An error occurred' });
    }
  }

  async register(req, res) {
    const { username, password, email } = req.body;

    console.log(req.body);

    try {
      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        return res.status(400).json({
          status: false,
          message: 'Email đã tồn tại',
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const role = await Role.findAll();
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        roleId: role[1].dataValues.id, // Giả sử 1 là admin, 2 là user
      });
      // sent email right here
      return res.status(200).json({
        status: true,
        message: 'Đăng ký thành công',
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: false,
        message: 'Lỗi server, vui lòng thử lại sau',
      });
    }
  }


  async forgotpasswordget(req, res) {
    const { email } = req.body;
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ status: false, message: 'Email not found' });
      }
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
      }
      console.log(result);
      const resetCode = result; // Generate a unique reset code
      const resetCodeExpires = moment().add(1, 'hour').toDate();

      // Update the user's record with the new reset code and expiration
      await User.update({ resetCode, resetCodeExpires }, { where: { email } });

      // Update the HTML string to include the actual reset code
      const htmlstring = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      background-color: #f2f2f2;
                      color: #333;
                      padding: 20px;
                  }
                  .container {
                      background-color: #fff;
                      padding: 20px;
                      margin: 0 auto;
                      max-width: 600px;
                      border-radius: 8px;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                  }
                  .header {
                      background-color: #007bff;
                      padding: 10px;
                      text-align: center;
                      color: white;
                      border-radius: 6px;
                  }
                  .header h1 {
                      margin: 0;
                      font-size: 24px;
                  }
                  .content {
                      padding: 20px;
                  }
                  .reset-code {
                      font-size: 20px;
                      color: #007bff;
                      font-weight: bold;
                      text-align: center;
                      padding: 10px;
                      border: 1px dashed #007bff;
                      border-radius: 6px;
                  }
                  .btn {
                      display: inline-block;
                      margin: 20px 0;
                      padding: 10px 20px;
                      background-color: #007bff;
                      color: white;
                      text-decoration: none;
                      border-radius: 6px;
                      text-align: center;
                  }
                  .footer {
                      margin-top: 20px;
                      text-align: center;
                      font-size: 14px;
                      color: #777;
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <h1>Password Reset Request</h1>
                  </div>
                  <div class="content">
                      <p>Hi <strong>User</strong>,</p>
                      <p>You have requested to reset your password. Please use the following reset code to proceed:</p>
                      <div class="reset-code">
                          ${resetCode} <!-- Use the actual reset code -->
                      </div>
                      <p>Once you have the reset code, click the button below to enter the reset code and create a new password.</p>
                  </div>
                  <div class="footer">
                      <p>If you didn’t request a password reset, you can safely ignore this email.</p>
                  </div>
              </div>
          </body>
          </html>
        `;

      // Send the email with the reset code
      sendEmail(user.email, 'ResetPass', htmlstring);

      // Render a response indicating success
      res.status(200).json({ status: true, message: '' });
    } catch (error) {
      console.log(error);
      res.status(404).json({ status: false, message: 'Email not found' });
    }
  }


  async renderCheckcode(req, res) {
    res.render('checkResetCode', {
      title: 'Check Verify code',
      status: false, layout: 'layouts/layoutEmpty'
    });
  }


  async verifyResetCode(req, res) {
    const { email, resetCode } = req.body;

    console.log(req.body);
    try {
      // Find the user by email
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.redirect('/login');
      }
      if (resetCode === user.resetCode && moment().isBefore(user.resetCodeExpires)) {
        console.log("thanh conggggggggggg");
        res.status(200).json({ status: true, message: 'Success' });
      } else {
        console.log("That baiiiii");
        res.status(404).json({ status: false, message: 'Enter wrong confirmation code' });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ status: false, message: 'Error' });
    }
  }


  async resetPassword(req, res) {
    const { email, newPassword } = req.body;
    console.log(req.body);
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await User.update({ password: hashedPassword, resetCode: null, resetCodeExpires: null }, { where: { email } });
      return res.status(200).json({ status: true, message: 'Success' });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ status: false, message: 'Error' });
    }
  }


}

module.exports = authController