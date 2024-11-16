
const { DataTypes } = require('sequelize');
const sequelize = require('../Connect/dbConnect');
const Storage = sequelize.define('Storage', {
    size: {
        type: DataTypes.STRING, // Example: '64GB', '128GB'
        allowNull: false,
    },
    IsActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true,
});
module.exports = Storage;