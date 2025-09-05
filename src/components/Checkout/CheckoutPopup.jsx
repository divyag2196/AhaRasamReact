import React, { useState } from "react";
import axios from "axios";

const CheckoutPopup = ({ cartData, onClose }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    contact: "",
  });

  // Calculate total cart value
  const totalAmount = cartData.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createOrder = async () => {
    try {
      // Step 1: Call Strapi backend to create Razorpay order
      const res = await axios.post(
        "http://localhost:1337/api/create-razorpay-order",
        {
          amount: totalAmount, // backend converts to paise
        }
      );

      const { razorpayOrder } = res.data;

      // Step 2: Open Razorpay Checkout
      const options = {
        key: "rzp_test_R5AxLBFpboBciJ", // 🔑 Replace with your Razorpay test key
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Aha Rasam",
        description: "Order Payment",
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            // Step 3: Verify payment & store order in Strapi
            await axios.post("http://localhost:1337/api/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userData: {
                name: form.name,
                email: form.email,
                contact: form.contact,
                productName: cartData
                  .map((i) => `${i.productName} (${i.size})`)
                  .join(", "),
                amount: totalAmount,
              },
            });

            alert("✅ Payment Verified & Order Saved!");
            localStorage.removeItem("cartList");
            window.location.href = "/?thankyou=true";
          } catch (err) {
            console.error("Verification error:", err);
            alert("Payment captured, but failed to save order.");
          }
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.contact,
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("❌ Failed to create Razorpay order");
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Checkout</h2>

        <ul>
          {cartData.map((item, idx) => (
            <li key={idx}>
              {item.productName} ({item.size}) - ₹{item.price} × {item.qty} = ₹
              {item.price * item.qty}
            </li>
          ))}
        </ul>
        <h3>Total: ₹{totalAmount}</h3>

        {/* Customer Form */}
        <input
          type="text"
          name="name"
          placeholder="Enter Name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          type="text"
          name="contact"
          placeholder="Enter Contact"
          value={form.contact}
          onChange={handleChange}
        />

        <button onClick={createOrder}>Pay Now</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default CheckoutPopup;
