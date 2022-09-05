var db = require("../config/connection");
var collection = require("../config/collections");
var objectId = require("mongodb").ObjectId;

module.exports = {
  addProduct: (product, callback) => {
    console.log(product);
    // console.log("the database", db.get());

    db.get()
      .collection("product")
      .insertOne(product)
      .then((data) => {
        console.log("the data is ", data);
        console.log("id is ", data.insertedId);
        callback(data.insertedId);
      });
  },

  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .toArray();
      resolve(products);
    });
  },

  deleteProduct: (prodId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .deleteOne({ _id: objectId(prodId) })
        .then((response) => {
          resolve(response);
        });
    });
  },

  getProductDetails: (prodId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: objectId(prodId) })
        .then((response) => {
          resolve(response);
        });
    });
  },

  updateProductDetails: (prodId, prodData) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: objectId(prodId) },
          {
            $set: {
              Name: prodData.Name,
              Description: prodData.Description,
              Price: prodData.Price,
              Category: prodData.Category,
            },
          }
        )
        .then((resp) => {
          resolve(resp);
        });
    });
  },

  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },

          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },

          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "products",
            },
          },

          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$products", 0] },
            },
          },
        ])
        .toArray();
      console.log("cart items please in cart");
      console.log(cartItems[0].products);

      resolve(cartItems);
    });
  },
};
