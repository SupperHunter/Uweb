const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dgzdehdlt', // Replace with your Cloud Name
  api_key: '576717561699693',       // Replace with your API Key
  api_secret: 'Eh2DJxRSl6Y8ifQImaAzUOFBxi8'  // Replace with your API Secret
});

module.exports = cloudinary;
