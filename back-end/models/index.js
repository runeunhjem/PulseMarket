const sequelize = require("../config/database");

const Role = require("./Role");
const Membership = require("./Membership")(sequelize, require("sequelize").DataTypes);
const User = require("./User");
const Category = require("./Category");
const Brand = require("./Brand");
const Product = require("./Product");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const CartItem = require("./CartItem");

// User relationships
Role.hasMany(User, { foreignKey: "roleId" });
User.belongsTo(Role, { foreignKey: "roleId" });

Membership.hasMany(User, { foreignKey: "membershipId" });
User.belongsTo(Membership, { foreignKey: "membershipId" });

// Product relationships
Category.hasMany(Product, { foreignKey: "CategoryId" });
Product.belongsTo(Category, { foreignKey: "CategoryId" });

Brand.hasMany(Product, { foreignKey: "BrandId" });
Product.belongsTo(Brand, { foreignKey: "BrandId" });

// Order relationships
User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

Membership.hasMany(Order, { foreignKey: "membershipId" });
Order.belongsTo(Membership, { foreignKey: "membershipId" });

Order.hasMany(OrderItem, { foreignKey: "orderId" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

// Cart relationships
User.hasMany(CartItem, { foreignKey: "userId" });
CartItem.belongsTo(User, { foreignKey: "userId" });

Product.hasMany(CartItem, { foreignKey: "productId" });
CartItem.belongsTo(Product, { foreignKey: "productId" });

// Role relationships
Role.belongsTo(Membership, { as: "defaultMembership", foreignKey: "defaultMembershipId" });
Membership.hasMany(Role, { foreignKey: "defaultMembershipId" });

module.exports = {
  sequelize,
  Role,
  Membership,
  User,
  Category,
  Brand,
  Product,
  Order,
  OrderItem,
  CartItem,
};
