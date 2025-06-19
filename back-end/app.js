const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const db = require("./models");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const initRouter = require("./routes/init");
const productRouter = require("./routes/products");
const searchRouter = require("./routes/search");
const categoriesRouter = require("./routes/categories");
const brandRoutes = require("./routes/brands");
const membershipRouter = require("./routes/memberships");
const cartRouter = require("./routes/cart");
const orderRouter = require("./routes/orders");
const roleRouter = require("./routes/roles");
const swaggerRoute = require("./routes/swaggerRoute");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/init", initRouter);
app.use("/products", productRouter);
app.use("/search", searchRouter);
app.use("/categories", categoriesRouter);
app.use("/brands", brandRoutes);
app.use("/memberships", membershipRouter);
app.use("/cart", cartRouter);
app.use("/orders", orderRouter);
app.use("/roles", roleRouter);
app.use("/doc", swaggerRoute);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error", { filters: {} });
});

module.exports = app;
