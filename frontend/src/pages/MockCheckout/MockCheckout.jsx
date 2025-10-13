import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./mockCheckout.css";
import { assets } from "../../assets/assets";

function MockCheckout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: "",
    expiry: "",
    cvc: "",
    name: "",
  });

  useEffect(() => {
    if (!orderId) {
      navigate("/");
    }
  }, [orderId, navigate]);

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    
    // Format card number with spaces
    if (name === "cardNumber") {
      value = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim();
      if (value.length > 19) return;
    }
    
    // Format expiry MM/YY
    if (name === "expiry") {
      value = value.replace(/\D/g, "");
      if (value.length >= 2) {
        value = value.slice(0, 2) + "/" + value.slice(2, 4);
      }
      if (value.length > 5) return;
    }
    
    // Format CVC (3 digits)
    if (name === "cvc") {
      value = value.replace(/\D/g, "");
      if (value.length > 3) return;
    }
    
    setCardData({ ...cardData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      navigate(`/verify?success=true&orderId=${orderId}`);
    }, 2000);
  };

  return (
    <div className="mock-checkout">
      <div className="checkout-container">
        <div className="checkout-header">
          <img src={assets.logo} alt="logo" className="checkout-logo" />
          <h2>Complete Your Payment</h2>
          <p className="test-mode-badge">🔒 Test Mode - No Real Charge</p>
        </div>

        <div className="checkout-body">
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Total Amount</span>
              <span className="amount">₹{amount}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="payment-form">
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                name="cardNumber"
                value={cardData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                required
              />
              <div className="card-icons">
                <img src={assets.card} alt="visa" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="text"
                  name="expiry"
                  value={cardData.expiry}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  required
                />
              </div>
              <div className="form-group">
                <label>CVC</label>
                <input
                  type="text"
                  name="cvc"
                  value={cardData.cvc}
                  onChange={handleInputChange}
                  placeholder="123"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Cardholder Name</label>
              <input
                type="text"
                name="name"
                value={cardData.name}
                onChange={handleInputChange}
                placeholder="JOHN DOE"
                required
              />
            </div>

            <button type="submit" className="pay-button" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Processing...
                </>
              ) : (
                `Pay ₹${amount}`
              )}
            </button>

            <p className="security-note">
              <span>🔒</span> Your payment information is secure
            </p>
            <p className="test-note">
              💡 This is a demo payment page. Enter any card details to continue.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MockCheckout;
