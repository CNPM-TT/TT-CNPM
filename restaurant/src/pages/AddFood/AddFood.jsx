import React, { useState } from "react";
import "./AddFood.css";
import { DOMAIN } from "../../config";
import axios from "axios";
import { toast } from "react-toastify";

function AddFood() {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    available: isAvailable,
    veg: "",
  });

  const handleVegChange = (e) => {
    const isVeg = e.target.value === "true";
    setData((prevData) => ({ ...prevData, veg: isVeg }));
  };

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("restaurant-token");
    if (!token) {
      toast.error("Please login first");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", Number(data.price));
    formData.append("category", data.category);
    formData.append("available", Boolean(data.available));
    formData.append("veg", Boolean(data.veg));
    formData.append("image", image);

    try {
      const response = await axios.post(
        `${DOMAIN}/api/food/restaurant/add`,
        formData,
        {
          headers: {
            token: token,
          },
        }
      );

      if (response.data.success) {
        setData({
          name: "",
          description: "",
          price: "",
          category: "",
          available: isAvailable,
          veg: "",
        });
        setImage(false);
        setLoading(false);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error adding food");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="add-food">
        <h2>Add New Food Item</h2>
        <form className="flex-col" onSubmit={onSubmitHandler}>
          <div className="add-image-upload flex-col">
            <p>Upload Image *</p>
            <label htmlFor="image">
              {image ? (
                <img
                  src={URL.createObjectURL(image)}
                  alt="upload image"
                  style={{ maxWidth: "120px", maxHeight: "120px", borderRadius: "10px" }}
                />
              ) : (
                <div className="upload-placeholder">
                  <span>📷 Click to upload</span>
                </div>
              )}
            </label>
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="image"
              accept="image/*"
              required
              hidden
            />
          </div>
          <div className="add-product-name flex-col">
            <p>Product Name *</p>
            <input
              onChange={onChangeHandler}
              value={data.name}
              type="text"
              required
              name="name"
              placeholder="Type here"
            />
          </div>
          <div className="add-product-desc flex-col">
            <p>Product Description *</p>
            <textarea
              onChange={onChangeHandler}
              value={data.description}
              required
              name="description"
              rows="6"
              placeholder="Write content here..."
            />
          </div>
          <div className="add-category-price">
            <div className="add-category flex-col">
              <p>Product Category *</p>
              <select
                name="category"
                onChange={onChangeHandler}
                value={data.category}
                required
              >
                <option value="">- Select a category -</option>
                <option value="Starter">Starter</option>
                <option value="Momos">Momos</option>
                <option value="Soup">Soup</option>
                <option value="Rice & Noodles">Rice & Noodles</option>
                <option value="Special Combo">Special Combo</option>
                <option value="Deserts">Deserts</option>
                <option value="Special Drinks">Special Drinks</option>
                <option value="Hot Drinks">Hot Drinks</option>
              </select>
            </div>
            <div className="add-price flex-col">
              <p>Product Price *</p>
              <input
                onChange={onChangeHandler}
                value={data.price}
                type="number"
                name="price"
                placeholder="₹100"
                required
              />
            </div>
          </div>
          <div className="add-availibility">
            <p>Product Available *</p>
            <input
              onChange={(e) => {
                setIsAvailable(e.target.checked);
                setData((prevData) => ({
                  ...prevData,
                  available: e.target.checked,
                }));
              }}
              checked={isAvailable}
              type="checkbox"
            />
          </div>
          <div className="add-veg">
            <div className="veg-option">
              <input
                type="radio"
                id="veg"
                name="veg"
                value="true"
                checked={data.veg === true}
                onChange={handleVegChange}
              />
              <label htmlFor="veg">Veg</label>
            </div>
            <div className="veg-option">
              <input
                type="radio"
                id="nonveg"
                name="veg"
                value="false"
                checked={data.veg === false}
                onChange={handleVegChange}
              />
              <label htmlFor="nonveg">Non veg</label>
            </div>
          </div>
          <button type="submit" className="add-btn" disabled={loading}>
            {loading ? "Adding Food..." : "Add Food"}
          </button>
        </form>
      </div>
    </>
  );
}

export default AddFood;
