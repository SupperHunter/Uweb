const { DataTypes } = require('sequelize');
const sequelize = require('../Connect/dbConnect');
const Category = require('./Category'); // Import the Category model
const TypeProduct = require('./TypeProduct');
const ProductVariants = require('./ProductVariants');
const Storage = require('./Storage');
// Define the Product model
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, // Tạo UUID tự động
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  discountprice: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  brand: {
    type: DataTypes.STRING,
  },
  color: {
    type: DataTypes.STRING,
  },
  size: {
    type: DataTypes.STRING,
  },
  IsActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
});

// Associate Product with Category
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

// Associate Product with TypeProduct
Product.belongsTo(TypeProduct, { foreignKey: 'TypeProductId', as: 'TypeProduct' });
TypeProduct.hasMany(Product, { foreignKey: 'TypeProductId', as: 'products' });

// Associate Product with ProductVariants (One-to-Many)
Product.hasMany(ProductVariants, { foreignKey: 'productId', as: 'variants' });
ProductVariants.belongsTo(Product, { foreignKey: 'productId' });

// Associate Product with Storage (Many-to-Many)
Product.belongsToMany(Storage, { through: ProductVariants, as: 'storages', foreignKey: 'productId' });
Storage.belongsToMany(Product, { through: ProductVariants, as: 'products', foreignKey: 'storageId' });

module.exports = Product;
