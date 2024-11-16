// utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: 'server233.web-hosting.com',
    port: 465,
    secure: true,
    auth: {
      user: 'sensetronics@sensetronics.us',
      pass: 'tCq1#hA^+6{7',
    },
    logger: true, // Enables detailed logging of email transactions
    debug: true,  // Enables debugging mode
  });

  const mailOptions = {
    from: 'sensetronics@sensetronics.us',
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendEmail;