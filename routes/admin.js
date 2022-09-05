var express = require("express");
var router = express.Router();
var productHelper = require("../helpers/product-helpers");

/* GET users listing. */
router.get("/", function (req, res, next) {
  productHelper.getAllProducts().then((products) => {
    res.render("admin/view-products", { admin: true, products });
  });
});

router.get("/add-products", function (req, res) {
  res.render("admin/add-products");
});

router.post("/add-product", (req, res) => {
  // console.log(req.body);
  let data = {
    Name: req.body.Name,
    Category: req.body.Category,
    Price: parseInt(req.body.Price),
    Description: req.body.Description,
  };
  productHelper.addProduct(data, (id) => {
    let image = req.files.Image;
    image.mv("./public/product-images/" + id + ".jpg", (err, done) => {
      if (!err) {
        res.render("admin/add-products");
      } else {
        console.log(err);
      }
    });
  });
});

router.get("/delete-product/:id", (req, res) => {
  const id = req.params.id;
  console.log(id);

  productHelper.deleteProduct(id).then((response) => {
    res.redirect("/admin/");
  });
});

router.get("/edit-product/:id", (req, res) => {
  const id = req.params.id;
  productHelper.getProductDetails(id).then((product) => {
    // console.log(product);
    res.render("admin/edit-product", { product });
  });
});

router.post("/edit-product/:id", (req, res) => {
  console.log("Hi,Hello");
  const id = req.params.id;
  productHelper.updateProductDetails(id, req.body).then(() => {
    console.log("Hi updated");
    res.redirect("/admin");
    if (req.files.Image) {
      let image = req.files.Image;
      image.mv("./public/product-images/" + id + ".jpg", (err, done) => {
        if (!err) {
          res.render("admin/add-products");
        } else {
          console.log(err);
        }
      });
    }
  });
});

module.exports = router;
