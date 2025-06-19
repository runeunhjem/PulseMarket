const {
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
} = require("../services/cartService");
const { User, Order, OrderItem, Membership } = require("../models");

const validateProductIdAndQuantity = (productId, quantity) => {
  if (!productId || typeof productId !== "number") return "Invalid product ID.";
  if (!quantity || typeof quantity !== "number" || quantity <= 0) return "Invalid quantity.";
  return null;
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    const parsedProductId = parseInt(productId, 10);
    const parsedQuantity = parseInt(quantity, 10);

    const error = validateProductIdAndQuantity(parsedProductId, parsedQuantity);
    if (error) {
      return res.status(400).json({ success: false, message: `Failed to add to cart - ${error}` });
    }

    const product = await getProductById(parsedProductId);
    if (!product || product.isDeleted) {
      return res.status(404).json({ success: false, message: "Product not found or has been deleted." });
    }

    if (product.quantity < parsedQuantity) {
      return res.status(400).json({ success: false, message: "Not enough stock available." });
    }

    const [cartItem, created] = await findOrCreateCartItem(userId, parsedProductId, parsedQuantity);

    if (!created) {
      cartItem.quantity = Number(cartItem.quantity) + parsedQuantity;
      await cartItem.save();
    }

    return res.status(200).json({
      success: true,
      message: `Product '${product.name}' added to cart.`,
      data: cartItem,
    });
  } catch (err) {
    console.error("❌ Error adding to cart:", err);
    return res.status(500).json({ success: false, message: "Failed to add product to cart." });
  }
};

const getCart = async (req, res) => {
  try {
    const cartItems = await getUserCart(req.user.id);
    res.status(200).json({
      success: true,
      message: "Cart retrieved successfully.",
      data: cartItems,
    });
  } catch (err) {
    console.error("❌ Error fetching cart:", err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve cart.",
    });
  }
};

const deleteFromCart = async (req, res) => {
  try {
    const parsedProductId = parseInt(req.params.productId, 10);
    if (isNaN(parsedProductId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const userId = req.user.id;

    const cartItem = await findCartItem(userId, parsedProductId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${parsedProductId} not found in cart.`,
      });
    }

    await cartItem.destroy();
    return res.status(200).json({
      success: true,
      message: `Product with ID ${parsedProductId} removed from cart.`,
    });
  } catch (err) {
    console.error("❌ Error deleting cart item:", err);
    return res.status(500).json({ success: false, message: "Failed to delete cart item." });
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const itemsInCart = await countCartItems(userId);

    if (itemsInCart === 0) {
      return res.status(400).json({ success: false, message: "Cart is already empty." });
    }

    const deletedCount = await clearCartItems(userId);
    return res.status(200).json({
      success: true,
      message: `Cart cleared. ${deletedCount} item(s) removed.`,
    });
  } catch (err) {
    console.error("❌ Error clearing cart:", err);
    return res.status(500).json({ success: false, message: "Failed to clear cart." });
  }
};

const checkoutCart = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ success: false, message: "Unauthorized - user not logged in." });
  }

  const userId = user.id;

  try {
    const cartItems = await getUserCart(userId);
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty." });
    }

    let totalQuantity = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const product = item.Product;
      if (item.quantity > product.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for '${product.name}'. Available: ${product.quantity}`,
        });
      }

      totalQuantity += item.quantity;

      orderItems.push({
        productId: item.productId,
        productName: product.name,
        unitprice: product.unitprice,
        quantity: item.quantity,
        total: product.unitprice * item.quantity,
      });
    }

    const dbUser = await User.findByPk(userId, {
      include: [Membership],
    });

    if (!dbUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const membership = dbUser.Membership;
    if (!membership) {
      return res.status(400).json({ success: false, message: "Membership information not found for user." });
    }

    const order = await createOrder({
      userId,
      membershipId: membership.id,
      membershipName: membership.name,
      discountUsed: membership.discount,
      userSnapshotName: dbUser.username,
      userSnapshotEmail: dbUser.email,
      orderNumber: generateOrderNumber(),
      status: "In Progress",
    });

    for (const item of orderItems) {
      await createOrderItem({ ...item, orderId: order.id });

      const product = await getProductById(item.productId);
      product.quantity -= item.quantity;
      await product.save();
    }

    await clearCartItems(userId);

    const allOrders = await Order.findAll({
      where: { userId },
      include: [OrderItem],
    });

    const totalPurchased = allOrders.reduce((sum, order) => {
      return sum + order.OrderItems.reduce((sub, item) => sub + item.quantity, 0);
    }, 0);

    const upgradedMembership = await getMatchingMembership(totalPurchased);
    if (upgradedMembership && upgradedMembership.discount > membership.discount) {
      const dbUser = await User.findByPk(userId);
      dbUser.membershipId = upgradedMembership.id;
      await dbUser.save();
    }

    return res.status(201).json({
      success: true,
      message: `Order '${order.orderNumber}' created successfully with ${totalQuantity} items.`,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        membership: membership.name,
        discount: membership.discount,
        items: orderItems,
      },
    });
  } catch (err) {
    console.error("❌ Error during checkout:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to complete checkout.",
      error: err.message || "Unexpected error.",
    });
  }
};

const updateCartQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const parsedProductId = parseInt(req.params.productId, 10);
    const parsedQuantity = parseInt(req.body.quantity, 10);

    const error = validateProductIdAndQuantity(parsedProductId, parsedQuantity);
    if (error) {
      return res.status(400).json({ success: false, message: `Invalid update - ${error}` });
    }

    const product = await getProductById(parsedProductId);
    if (!product || product.isDeleted) {
      return res.status(404).json({ success: false, message: "Product not found or deleted." });
    }

    if (parsedQuantity > product.quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.quantity} unit(s) available in stock.`,
      });
    }

    const cartItem = await findCartItem(userId, parsedProductId);
    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Cart item not found." });
    }

    cartItem.quantity = parsedQuantity;
    await cartItem.save();

    return res.status(200).json({
      success: true,
      message: `Quantity for '${product.name}' updated to ${parsedQuantity}.`,
      data: cartItem,
    });
  } catch (err) {
    console.error("❌ Error updating quantity:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update cart quantity.",
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  deleteFromCart,
  checkoutCart,
  clearCart,
  updateCartQuantity,
};
