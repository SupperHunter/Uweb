const { DataTypes } = require('sequelize');
const sequelize = require('../Connect/dbConnect');
const User = require('./User'); // Import the User model

const Role = sequelize.define("Role", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'roles',
  timestamps: true,
});

module.exports = Role;
