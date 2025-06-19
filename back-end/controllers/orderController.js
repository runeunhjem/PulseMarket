const { validateOrderStatus } = require("../utils/validators");

const { getOrdersByUser, getAllOrdersFromDB, findOrderById, updateOrderStatusInDB } = require("../services/orderService");

const getUserOrders = async (req, res) => {
  try {
    const orders = await getOrdersByUser(req.user.id);
    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully.",
      data: orders,
    });
  } catch (err) {
    console.error("❌ Error retrieving orders:", err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve orders.",
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await getAllOrdersFromDB();
    res.status(200).json({
      success: true,
      message: "All orders retrieved successfully.",
      data: orders,
    });
  } catch (err) {
    console.error("❌ Error retrieving all orders:", err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve all orders.",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const error = validateOrderStatus(status);
  if (error) {
    return res.status(400).json({ success: false, message: error });
  }

  try {
    const order = await findOrderById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with ID ${id} not found.`,
      });
    }

    if (order.status === "Completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot change status of a completed order.",
      });
    }

    const error = validateOrderStatus(status);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    await updateOrderStatusInDB(order, status);

    return res.status(200).json({
      success: true,
      message: `Order '${order.orderNumber}' updated to '${status}'.`,
    });
  } catch (err) {
    console.error("❌ Error updating order status:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update order status.",
    });
  }
};

module.exports = {
  getUserOrders,
  updateOrderStatus,
  getAllOrders,
};
