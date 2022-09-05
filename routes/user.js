var express = require("express");
const session = require("express-session");
var router = express.Router();
var productHelper = require("../helpers/product-helpers");
var userHelper = require("../helpers/user-helpers");

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

/* GET home page. */
router.get("/", async function (req, res, next) {
  let user = req.session.user;
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelper.getCartCount(req.session.user._id);
  }

  productHelper.getAllProducts().then((products) => {
    res.render("user/view-products", {
      admin: false,
      products,
      user,
      cartCount,
    });
  });
});

router.get("/login", function (req, res, next) {
  console.log("The sessiion value is", req.session.loggedIn);
  if (req.session.loggedIn) {
    console.log("I am inside if block");
    res.redirect("/");
  } else {
    console.log("I am here inside else block");
    res.render("user/login", { logErr: req.session.Err });
    req.session.Err = false;
  }
});

router.get("/register", function (req, res, next) {
  res.render("user/register");
});

router.post("/signup", function (req, res, next) {
  userHelper.doSignup(req.body).then((response) => {
    console.log("The response is", response);
    res.redirect("/login");
  });
});

router.post("/signin", function (req, res, next) {
  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      // console.log(response);
      req.session.loggedIn = true;
      req.session.user = response.user;

      res.redirect("/");
    } else {
      req.session.Err = "Invalid username and password";
      res.redirect("/login");
    }
  });
});

router.get("/logout", function (req, res, next) {
  req.session.destroy();
  res.redirect("/");
});

router.get("/cart", verifyLogin, async function (req, res, next) {
  let cartProducts = await productHelper.getCartProducts(req.session.user._id);
  let totalValue = await userHelper.getTotalAmount(req.session.user._id);

  // console.log("Cart products are");
  // console.log(cartProducts);
  let product = cartProducts;
  res.render("user/cart", { product, user: req.session.user._id, totalValue });
});

router.get("/add-to-cart/:id", (req, res) => {
  console.log("Api call");
  userHelper.addToCart(req.params.id, req.session.user._id).then(() => {
    // res.redirect("/");
    res.json({ status: true });
  });
});

router.post("/change-product-quantity/", async (req, res, next) => {
  console.log("I am here in change product");
  userHelper.changeProductQuantity(req.body).then(async (resp) => {
    resp.total = await userHelper.getTotalAmount(req.body.user);
    console.log(resp);
    res.json(resp);
  });
});

router.get("/place-order", verifyLogin, async (req, res) => {
  let total = await userHelper.getTotalAmount(req.session.user._id);
  res.render("user/place-order", { total, user: req.session.user });
});

router.post("/place-order", async (req, res) => {
  let products = await userHelper.getCartProductList(req.body.userId);
  let totalPrice = await userHelper.getTotalAmount(req.body.userId);
  userHelper.placeOrder(req.body, products, totalPrice).then((orderId) => {
    console.log("The order id is ", orderId);
    if (req.body["payment-method"] == "COD") {
      res.json({ codStatus: true });
    } else {
      userHelper.generateRazorpay(orderId, totalPrice).then((response) => {
        res.json(response);
      });
    }
  });
});

router.get("/order-success", (req, res) => {
  res.render("user/order-success", { user: req.session.user });
});

router.get("/orders", async (req, res) => {
  console.log("user id is", req.session.user._id);
  let orders = await userHelper.getUserOrders(req.session.user._id);
  res.render("user/orders", { user: req.session.user, orders });
});

router.get("/view-order-products/:id", async (req, res) => {
  let products = await userHelper.getOrderProducts(req.params.id);
  console.log(products);
  res.render("user/view-order-products", { user: req.session.user, products });
});

router.post("/verify-payment", (req, res) => {
  console.log(req.body);
});

module.exports = router;
