function addToCart(proId) {
  $.ajax({
    url: `/add-to-cart/${proId}`,
    method: "get",
    success: (response) => {
      if (response.status) {
        let count = $("#cart-count").html();
        count = parseInt(count) + 1;
        $("#cart-count").html(count);
      }
    },
  });
}

function changeQuantity(cartId, proId, userId, count) {
  console.log(
    "Cart id" + cartId,
    +"Prod Id" + proId,
    +"User Id" + userId,
    "Count" + count
  );
  let quantity = parseInt(document.getElementById(proId).innerHTML);
  console.log("The quantity is", quantity);
  $.ajax({
    url: "/change-product-quantity",
    data: {
      user: userId,
      cart: cartId,
      product: proId,
      count: count,
      quantity: quantity,
    },
    method: "post",
    success: (response) => {
      alert(response.total.total);
      //alert(response);
      if (response.removeProduct) {
        alert("Product removed from cart");
        location.reload();
      } else {
        document.getElementById(proId).innerHTML = quantity + count;

        document.getElementById("total").innerHTML = response.total.total;
      }
    },
  });
}

function razorpayPayment(order) {
  var options = {
    key: "rzp_test_5Qo2oPveYygxci", // Enter the Key ID generated from the Dashboard
    amount: order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    currency: "INR",
    name: "Acme Corp",
    description: "Test Transaction",
    image: "https://example.com/your_logo",
    order_id: order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1

    handler: function (response) {
      alert(response.razorpayPayment_id);
      alert(response.razorpay_order_id);
      alert(response.razorpay_signature);
      verifyPayment(response, order);
    },
    callback_url: "https://eneqd3r9zrjok.x.pipedream.net/",
    prefill: {
      name: "JERRIN tHOMAS",
      email: "jerrinmachu@gmail.com",
      contact: "9999999999",
    },
    notes: {
      address: "Razorpay Corporate Office",
    },
    theme: {
      color: "#3399cc",
    },
  };
  var rzp1 = new Razorpay(options);
  rzp1.open();
  // document.getElementById("rzp-button1").onclick = function (e) {

  //   e.preventDefault();
  // };
}

$("#checkout-form").submit((e) => {
  e.preventDefault();
  $.ajax({
    url: "/place-order",
    method: "post",
    data: $("#checkout-form").serialize(),
    success: (response) => {
      if (response.codSuccess) {
        location.href = "/order-success";
      } else {
        razorpayPayment(response);
      }
    },
  });
});

function verifyPayment(payment, order) {
  $.ajax({
    url: "/verify-payment",
    data: {
      payment,
      order,
    },

    method: "post",
  });
}
