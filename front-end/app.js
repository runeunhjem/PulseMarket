require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const flash = require("connect-flash");

const PORT = process.env.PORT || 3001;

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const apiRouter = require("./routes/api");
const productRoutes = require("./routes/products");
const searchRouter = require("./routes/search");
const cartRouter = require("./routes/cart");
const ordersRouter = require("./routes/orders");
const dashboardRouter = require("./routes/dashboard");
const adminCategoryRoutes = require("./routes/adminCategories");
const adminBrandRoutes = require("./routes/adminBrands");
const adminOrdersRoutes = require("./routes/adminOrders");
const adminUserRoutes = require("./routes/adminUsers");
const adminMembershipRoutes = require("./routes/adminMemberships");
const adminRoleRoutes = require("./routes/adminRoles");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(logger("dev"));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Session and flash
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());

app.use((req, res, next) => {
  res.locals.requestPath = req.path;
  next();
});

// Make logged-in user accessible in all views, including cart count
app.use(async (req, res, next) => {
  res.locals.user = null;

  if (req.session.user) {
    res.locals.user = req.session.user;

    try {
      const token = req.cookies.token;
      if (token) {
        const axios = require("axios");
        const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

        const response = await axios.get(`${BACKEND_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const cartItems = response.data.data;
        const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
        res.locals.user.cartCount = cartCount;
      }
    } catch (err) {
      console.error("Failed to fetch cart count:", err.message);
    }
  }

  next();
});

// Make flash messages accessible in all views
app.use((req, res, next) => {
  res.locals.messages = {
    success: req.flash("success"),
    error: req.flash("error"),
  };
  next();
});

// Routes
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/api", apiRouter);
app.use("/products", productRoutes);
app.use("/search", searchRouter);
app.use("/cart", cartRouter);
app.use("/orders", ordersRouter);
app.use("/dashboard", dashboardRouter);
app.use("/admin/categories", adminCategoryRoutes);
app.use("/admin/brands", adminBrandRoutes);
app.use("/admin/orders", adminOrdersRoutes);
app.use("/admin/users", adminUserRoutes);
app.use("/admin/memberships", adminMembershipRoutes);
app.use("/admin/roles", adminRoleRoutes);

// 404 handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error", {
    title: "Error",
    filters: {},
    error: err,
  });
});

app.listen(PORT, () => {
  console.log(`✅ PulseMarket front-end running on http://localhost:${PORT}`);
});

module.exports = app;
