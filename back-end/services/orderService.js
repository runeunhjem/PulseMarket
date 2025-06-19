const { Order, OrderItem, Membership, User } = require("../models");

async function getOrdersByUser(userId) {
  const orders = await Order.findAll({
    where: { userId },
    include: [
      { model: OrderItem, attributes: ["productName", "unitprice", "quantity", "total"] },
      { model: Membership, attributes: ["name", "discount"] },
    ],
    order: [["createdAt", "DESC"]],
  });

  return orders.map((order) => {
    const totalOriginal = order.OrderItems.reduce((sum, item) => sum + item.total, 0);
    const discount = order.Membership?.discount || 0;
    const totalPaid = totalOriginal * (1 - discount / 100);

    return {
      ...order.toJSON(),
      totalOriginal,
      totalPaid,
      membershipName: order.Membership?.name || "N/A",
    };
  });
}

async function getAllOrdersFromDB() {
  const orders = await Order.findAll({
    include: [
      { model: OrderItem, attributes: ["productName", "unitprice", "quantity", "total"] },
      { model: Membership, attributes: ["name", "discount"] },
      { model: User, attributes: ["username", "email"] },
    ],
    order: [["createdAt", "DESC"]],
  });

  return orders.map((order) => {
    const totalOriginal = order.OrderItems.reduce((sum, item) => sum + item.total, 0);
    const discount = order.Membership?.discount || 0;
    const totalPaid = totalOriginal * (1 - discount / 100);

    return {
      ...order.toJSON(),
      totalOriginal,
      totalPaid,
      membershipName: order.Membership?.name || "N/A",
      items: order.OrderItems,
      username: order.userSnapshotName || order.User?.username || "Deleted user",
      email: order.userSnapshotEmail || order.User?.email || "N/A",
    };
  });
}

async function findOrderById(id) {
  return await Order.findByPk(id);
}

async function updateOrderStatusInDB(order, newStatus) {
  return await order.update({ status: newStatus });
}

module.exports = {
  getOrdersByUser,
  getAllOrdersFromDB,
  findOrderById,
  updateOrderStatusInDB,
};
