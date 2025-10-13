import React, { useContext, useEffect, useState } from "react";
import "./placeOrder.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { DOMAIN } from "../../config";
import { toast } from "react-toastify";
import axios from "axios";
function PlaceOrder() {
  const { getTotalCartAmount, token, food_list, cartItems, promoApplied } =
    useContext(StoreContext);

  const navigate = useNavigate();
  const Token = localStorage.getItem("Token");
  const [dataLoading, setDataLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    apartmentNo: "",
    city: "",
    area: "",
    street: "",
    landmark: "",
    phone: "",
  });

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    setData((data) => ({ ...data, [name]: value }));
  };

  const fetchUserData = async () => {
    const email = localStorage.getItem("Email");
    setDataLoading(true);
    const response = await axios.post(
      `${DOMAIN}/api/user/getUserByEmail`,
      { email },
      { headers: { Token } }
    );
    if (response.data.success) {
      setData({
        ...data,
        name: response.data.data.name || "",
        phone: response.data.data.phoneNumber || "",
        apartmentNo: response.data.data.apartmentNo || "",
        area: response.data.data.area || "",
        landmark: response.data.data.landmark || "",
        street: response.data.data.street || "",
        city: response.data.data.city || "",
      });
      setDataLoading(false);
    } else {
      toast.error(response.data.message);
      setDataLoading(false);
    }
  };
  const placeOrder = async (e) => {
    e.preventDefault();
    
    // Validate form fields
    if (
      data.name === "" ||
      data.email === "" ||
      data.apartmentNo === "" ||
      data.city === "" ||
      data.area === "" ||
      data.street === "" ||
      data.landmark === "" ||
      data.phone === ""
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    let orderItems = [];
    food_list.map((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = item;
        itemInfo["quantity"] = cartItems[item._id];
        orderItems.push(itemInfo);
      }
    });
    
    let orderData = {
      address: data,
      items: orderItems,
      amount: promoApplied
        ? getTotalCartAmount() + 25 + 5 - 25
        : getTotalCartAmount() + 25 + 5,
      promoApplied,
    };
    
    setLoading(true);
    try {
      let response = await axios.post(
        `${DOMAIN}/api/order/placeorder`,
        orderData,
        {
          headers: {
            token,
          },
        }
      );
      if (response.data.success) {
        const { session_url } = response.data;
        setLoading(false);
        window.location.replace(session_url);
      } else {
        setLoading(false);
        toast.error(response.data.message);
      }
    } catch (error) {
      setLoading(false);
      toast.error("Error placing order. Please try again later.");
      console.error(error);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("Token")) {
      toast.warn("Please login to continue.");
      navigate("/cart");
    }
    fetchUserData();
  }, [token, navigate]);
  return (
    <>
      {getTotalCartAmount() > 0 ? (
        <>
          <form className="place-order" onSubmit={placeOrder}>
            <div className="place-order-left">
              <p className="title">Delivery Information</p>
              {dataLoading ? (
                <>
                  {" "}
                  <div className="loader-wrapper">
                    <div className="loader"></div>
                  </div>
                </>
              ) : (
                <>
                  <div className="multi-fields">
                    <input
                      required
                      name="name"
                      onChange={onChangeHandler}
                      value={data.name}
                      type="text"
                      placeholder="Full Name"
                    />
                    {/* <input
                  required
                  name="lastName"
                  onChange={onChangeHandler}
                  value={data.lastName}
                  type="text"
                  placeholder="Last Name"
                /> */}
                  </div>
                  <input
                    required
                    name="email"
                    onChange={onChangeHandler}
                    value={data.email}
                    type="email"
                    placeholder="Email Address"
                  />
                  <input
                    required
                    name="apartmentNo"
                    onChange={onChangeHandler}
                    value={data.apartmentNo}
                    type="text"
                    placeholder="Apartment no/name"
                  />
                  <div className="multi-fields">
                    <input
                      required
                      name="street"
                      onChange={onChangeHandler}
                      value={data.street}
                      type="text"
                      placeholder="Street"
                    />
                    
                    <input
                      required
                      name="area"
                      onChange={onChangeHandler}
                      
                      value={data.area}
                      type="text"
                      placeholder="Locality"
                    />
                  </div>
                  <div className="multi-fields">
                    <input
                      required
                      name="city"
                      onChange={onChangeHandler}
                      // readOnly
                      value={data.city}
                      type="text"
                      placeholder="City"
                    />
                    <input
                      
                      name="landmark"
                      onChange={onChangeHandler}
                      value={data.landmark}
                      type="text"
                      placeholder="Landmark"
                    />
                  </div>

                  <input
                    required
                    name="phone"
                    onChange={onChangeHandler}
                    value={data.phone}
                    type="number"
                    placeholder="Phone Number"
                  />
                </>
              )}
            </div>
            <div className="place-order-right">
              <div className="cart-total">
                <h2>Cart Totals</h2>
                <div>
                  <div className="cart-total-details">
                    <p>Subtotal</p>
                    <p>₹{getTotalCartAmount()}</p>
                  </div>
                  <hr />
                  <div className="cart-total-details">
                    <p>Delivery Fee + gst</p>
                    <p>₹{25}</p>
                  </div>
                  <hr />
                  <div className="cart-total-details">
                    <p>Platform Fee</p>
                    <p>₹{5}</p>
                  </div>
                  {promoApplied && (
                    <>
                      <hr />
                      <div className="cart-total-details">
                        <p>Discount</p>
                        <p>- ₹{25}</p>
                      </div>
                    </>
                  )}
                  {promoApplied ? (
                    <>
                      {" "}
                      <hr />
                      <div className="cart-total-details">
                        <p>Total</p>
                        <p>₹{getTotalCartAmount() + 25 + 5 - 25}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      {" "}
                      <hr />
                      <div className="cart-total-details">
                        <p>Total</p>
                        <p>₹{getTotalCartAmount() + 25 + 5}</p>
                      </div>
                    </>
                  )}
                </div>
                <button type="submit" className="pay-online">
                  {loading ? "Processing..." : "Proceed to Payment"}{" "}
                  <img src={assets.card} />
                </button>
              </div>
            </div>
          </form>
          {/* <button class="upi-btn" onClick={upiPayment}>
            <img src={assets.upi} alt="upi" />
          </button> */}
        </>
      ) : (
        <>
          <div className="empty-cart">
            <img src={assets.empty_cart} alt="empty cart" />
            <h2>Your cart is Empty.</h2>
            <p>
              Looks like you have not added anything to your cart. Go ahead and
              explore top categories.
            </p>
          </div>
        </>
      )}
    </>
  );
}

export default PlaceOrder;
