const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Order = sequelize.define(
  "Order",
  {
    orderNumber: {
      type: DataTypes.STRING(8),
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM("In Progress", "Ordered", "Completed"),
      defaultValue: "In Progress",
      allowNull: false,
    },
    membershipName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    discountUsed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    userSnapshotName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userSnapshotEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Order;
