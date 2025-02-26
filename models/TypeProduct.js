const { DataTypes } = require('sequelize');
const sequelize = require('../Connect/dbConnect');

// Create Category model
const TypeProduct = sequelize.define('TypeProduct', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Tạo UUID tự động
        primaryKey: true
      },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    StringIcon: {
        type: DataTypes.STRING,
        allowNull: true
    },
    delete: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true,
});

module.exports = TypeProduct;
