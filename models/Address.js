const { DataTypes } = require('sequelize');
const sequelize = require('../Connect/dbConnect');
const BannerTille = require('./BannerTille');
const Address = sequelize.define("Address", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Tạo UUID tự động
        primaryKey: true
    },
    street: {
        type: DataTypes.STRING,
        allowNull: false
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    state: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    postalCode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'addresses',
    timestamps: true, // Adds 'createdAt' and 'updatedAt' fields automatically
});
module.exports = Address;
