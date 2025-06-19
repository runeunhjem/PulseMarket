const { CartItem, Product, Order, OrderItem, Membership } = require("../models");
const { Sequelize } = require("sequelize");

function generateOrderNumber() {
  return [...Array(8)].map(() => Math.random().toString(36)[2]).join("");
}

// ========== CART ==========
async function findCartItem(userId, productId) {
  return await CartItem.findOne({ where: { userId, productId } });
}

async function findOrCreateCartItem(userId, productId, quantity) {
  return await CartItem.findOrCreate({
    where: { userId, productId },
    defaults: { quantity },
  });
}

async function getUserCart(userId) {
  return await CartItem.findAll({
    where: { userId },
    include: [
      {
        model: Product,
        attributes: ["id", "name", "unitprice", "imgurl", "quantity"],
      },
    ],
  });
}

async function countCartItems(userId) {
  return await CartItem.count({ where: { userId } });
}

async function clearCartItems(userId) {
  return await CartItem.destroy({ where: { userId } });
}

async function deleteCartItem(userId, productId) {
  return await CartItem.destroy({ where: { userId, productId } });
}

// ========== PRODUCT ==========
async function getProductById(productId) {
  return await Product.findByPk(productId);
}

// ========== ORDER ==========
async function createOrder(data) {
  return await Order.create(data);
}

async function createOrderItem(data) {
  return await OrderItem.create(data);
}

// ========== MEMBERSHIP ==========
async function getMatchingMembership(totalQty) {
  return await Membership.findOne({
    where: {
      minQty: { [Sequelize.Op.lte]: totalQty },
      [Sequelize.Op.or]: [{ maxQty: { [Sequelize.Op.gte]: totalQty } }, { maxQty: null }],
    },
  });
}

module.exports = {
  generateOrderNumber,
  findCartItem,
  findOrCreateCartItem,
  getUserCart,
  countCartItems,
  clearCartItems,
  deleteCartItem,
  getProductById,
  createOrder,
  createOrderItem,
  getMatchingMembership,
};
