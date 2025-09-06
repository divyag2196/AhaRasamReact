import React, { useState } from "react";
import axios from "axios";
import { postDataToApi } from "../../utils/Api";

const CheckoutPopup = ({ cartData, onClose }) => {
  const [form, setForm] = useState({ name: "", email: "", contact: "" });

  const totalAmount = cartData.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createOrder = async () => {
    try {
      // 1️⃣ Ask Strapi to create Razorpay order + pending Strapi order
      const res = await axios.post(
        `${process.env.REACT_APP_STRAPI_URL}/api/orders/create-razorpay-order`,
        {
          amount: totalAmount,
          customerName: form.name,
          email: form.email,
          phoneNumber: form.contact,
          items: cartData,
        }
      );

      const { razorpayOrder, strapiOrder } = res.data;

      // 2️⃣ Razorpay Checkout Options
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY, // frontend Razorpay key
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Aha Rasam",
        description: "Order Payment",
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            // 3️⃣ Update order in Strapi as "paid"
            await postDataToApi(`/api/orders/${strapiOrder.id}`, {
              data: {
                status: "paid",
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
            });

            alert("✅ Payment successful & order saved!");
            localStorage.removeItem("cartList");
            window.location.href = "/?thankyou=true";
          } catch (err) {
            console.error("Verification error:", err);
            alert("⚠️ Payment captured, but failed to update order.");
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
