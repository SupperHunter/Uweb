const { DataTypes } = require('sequelize');
const sequelize = require('../Connect/dbConnect');

// Create Category model
const Category = sequelize.define('Category', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING, // You can also use DataTypes.TEXT if URLs are long
    allowNull: true, // You can set it to false if imageUrl is mandatory
  },
  IsActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
});

module.exports = Category;
