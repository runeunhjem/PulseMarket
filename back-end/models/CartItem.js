const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CartItem = sequelize.define(
  "CartItem",
  {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = CartItem;
