import React, { useState } from "react";
import axios from "axios";
import Modal from "../Modal/Modal";
import "./Contact.scss";
import logo from "../../assets/contactsection.png";

function Contact() {
  // Make sure these match your Strapi collection field names exactly
  const [form, setForm] = useState({
    Name: "",
    Email: "",
    PhoneNumber: "",
    Action: "buy",
    Message: "",
  });

  const [modal, setModal] = useState({
    show: false,
    success: false,
    title: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    return form.Name.trim() && form.Email.trim() && form.Message.trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setModal({
        show: true,
        success: false,
        title: "Validation Error",
        message: "Please fill all required fields!",
      });
      return;
    }

    const payload = {
      data: {
        name: form.Name,
        email: form.Email,
        phone: form.PhoneNumber || "",
        action: form.Action,
        message: form.Message,
      },
    };

    console.log("Sending payload to Strapi:", JSON.stringify(payload, null, 2));

    setLoading(true);

    try {
      const res = await axios.post(
        "https://beautiful-festival-b6c8d86f22.strapiapp.com/api/contacts",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer fb4f79cc58081c6ccc735d86a012f47217ceb6e25bece384533b3c5a2281796bc6cd836cfdb6dcd94ed83d59461c2bda92694ef2ef538472895c3fb4e76e9580cecafdfd59cc83fc812fadc5cbb55b3651df9c5a64d7bc6f4071543a9478cb2a90e00f39878eafe15dabcb8e21a84447929f654af52b001385007348a0563713",
          },
        }
      );

      console.log("Strapi response:", res.data);

      setModal({
        show: true,
        success: true,
        title: "Message Sent 🎉",
        message: "Thank you! Your enquiry has been saved.",
      });

      setForm({ Name: "", Email: "", PhoneNumber: "", Action: "buy", Message: "" });
    } catch (error) {
      console.error("Error saving contact:", error.response?.data || error.message);

      setModal({
        show: true,
        success: false,
        title: "Oops!",
        message: "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact-section" id="Contact">
      <div className="container">
        {/* LEFT FORM BOX */}
        <div className="contact-form-box">
          <h2 className="form-title">Enquiry</h2>
          <p className="form-subtitle">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="Name"
                value={form.Name}
                onChange={handleChange}
                placeholder="Name"
                required
              />
            </div>

            <div className="form-group">
              <input
                type="email"
                name="Email"
                value={form.Email}
                onChange={handleChange}
                placeholder="Email Id"
                required
              />
            </div>

            <div className="form-group">
              <input
                type="tel"
                name="PhoneNumber"
                value={form.PhoneNumber}
                onChange={handleChange}
                placeholder="Phone no."
              />
            </div>

            <div className="form-group radio-group">
              <label>Want to</label>
              <label>
                <input
                  type="radio"
                  name="Action"
                  value="buy"
                  checked={form.Action === "buy"}
                  onChange={handleChange}
                />
                <span> Buy </span>
              </label>
              <label>
                <input
                  type="radio"
                  name="Action"
                  value="sell"
                  checked={form.Action === "sell"}
                  onChange={handleChange}
                />
                <span> Sell </span>
              </label>
            </div>

            <div className="form-group">
              <textarea
                name="Message"
                value={form.Message}
                onChange={handleChange}
                placeholder="Write here"
                required
              />
            </div>

            <div className="btn-container">
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? "Sending..." : "Submit"}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT INFO BOX */}
        <div className="contact-info">
          <img src={logo} alt="Aha Rasam" className="company-logo" />
          <h3 className="company-name">Aha! Rasam</h3>
          <p className="company-address">
            Gut No. 65, Property No. 317, Siddheshwar BK, Pali - Bhira Road,
            <br />
            Taluka Sudhagad, District Raigarh, Maharashtra,
            <br />
            India, 410205
          </p>
        </div>
      </div>

      {/* Modal */}
      <Modal
        show={modal.show}
        success={modal.success}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal({ ...modal, show: false })}
      />
    </section>
  );
}

export default Contact;
