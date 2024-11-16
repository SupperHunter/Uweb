const { DataTypes } = require('sequelize');
const sequelize = require('../Connect/dbConnect');

// Create Category model
const BannerTille = sequelize.define('BannerTille', {
    Title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    timestamps: true,
});

module.exports = BannerTille;
