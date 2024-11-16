const { DataTypes } = require('sequelize');
const sequelize = require('../Connect/dbConnect');

// Create Category model
const TypeProduct = sequelize.define('TypeProduct', {
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
