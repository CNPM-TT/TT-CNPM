import restaurantModel from "../../database/models/restaurant.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Helpers
const calculateStatsFromList = (restaurants) => {
  const total = restaurants.length;
  const active = restaurants.reduce((count, restaurant) => {
    return restaurant.isActive ? count + 1 : count;
  }, 0);

  return { total, active, inactive: total - active };
};

const fetchRestaurantStats = async () => {
  const [total, active] = await Promise.all([
    restaurantModel.countDocuments({}),
    restaurantModel.countDocuments({ isActive: true }),
  ]);

  return { total, active, inactive: total - active };
};

// Login Restaurant
const loginRestaurant = async (req, res) => {
  const { email, password } = req.body;
  try {
    const restaurant = await restaurantModel.findOne({ email });
    if (!restaurant) {
      return res.json({ success: false, message: "Restaurant doesn't exist." });
    }

    if (!restaurant.isActive) {
      return res.json({ success: false, message: "Restaurant account is deactivated." });
    }

    const matchPassword = await bcrypt.compare(password, restaurant.password);
    if (!matchPassword) {
      return res.json({ success: false, message: "Incorrect password." });
    }

    const token = createToken(restaurant._id);
    return res.json({
      success: true,
      token,
      email: restaurant.email,
      name: restaurant.name,
      restaurantCode: restaurant.restaurantCode,
      message: "Restaurant logged in successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error. Try again later." });
  }
};

// Register Restaurant
const registerRestaurant = async (req, res) => {
  const { name, email, password, phoneNumber, address, city, restaurantCode } = req.body;
  try {
    // Check if restaurant already exists
    const existingRestaurant = await restaurantModel.findOne({ 
      $or: [{ email }, { restaurantCode }] 
    });
    
    if (existingRestaurant) {
      return res.json({ 
        success: false, 
        message: "Email or Restaurant Code already registered." 
      });
    }

    // Validation
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email.",
      });
    }

    if (password.length < 6) {
      return res.json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    if (!restaurantCode || restaurantCode.length < 4) {
      return res.json({
        success: false,
        message: "Restaurant code must be at least 4 characters.",
      });
    }

    // Password encryption
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Restaurant creation
    const newRestaurant = new restaurantModel({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      address,
      city,
      restaurantCode: restaurantCode.toUpperCase(),
    });

    const restaurant = await newRestaurant.save();

    // Token generation
    const token = createToken(restaurant._id);

    if (restaurant) {
      return res.json({
        success: true,
        restaurant: { 
          name, 
          email, 
          restaurantCode: restaurant.restaurantCode 
        },
        token,
        message: "Restaurant registered successfully.",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error registering restaurant." });
  }
};

// Get all restaurants
const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await restaurantModel
      .find({})
      .select('-password')
      .sort({ createdAt: -1 });
    const stats = calculateStatsFromList(restaurants);

    if (restaurants) {
      return res.json({ 
        success: true, 
        data: restaurants, 
        stats,
        message: "Restaurants fetched successfully." 
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error. Try again later." });
  }
};

// Get restaurant by email
const getRestaurantByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const restaurant = await restaurantModel.findOne({ email }).select('-password');
    if (restaurant) {
      return res.json({ 
        success: true, 
        data: restaurant, 
        message: "Restaurant found." 
      });
    } else {
      return res.json({ 
        success: false, 
        message: "Restaurant not found." 
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error. Try again later." });
  }
};

// Update restaurant profile
const updateRestaurantByEmail = async (req, res) => {
  try {
    const { email, name, phoneNumber, address, city } = req.body;
    const restaurant = await restaurantModel.findOne({ email });
    
    if (restaurant) {
      const updatedRestaurant = await restaurantModel.findOneAndUpdate(
        { email }, 
        { name, phoneNumber, address, city }, 
        { new: true }
      ).select('-password');
      
      return res.json({ 
        success: true, 
        data: updatedRestaurant, 
        message: "Restaurant updated successfully." 
      });
    } else {
      return res.json({ 
        success: false, 
        message: "Restaurant not found." 
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error. Try again later." });
  }
};

// Update restaurant status (activate/deactivate)
const updateRestaurantStatus = async (req, res) => {
  try {
    const { restaurantId, isActive } = req.body;
    const restaurant = await restaurantModel.findByIdAndUpdate(
      restaurantId,
      { isActive },
      { new: true }
    ).select('-password');
    
    if (restaurant) {
      const stats = await fetchRestaurantStats();
      return res.json({ 
        success: true, 
        data: restaurant, 
        stats,
        message: `Restaurant ${isActive ? 'activated' : 'deactivated'} successfully.` 
      });
    } else {
      return res.json({ 
        success: false, 
        message: "Restaurant not found." 
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error. Try again later." });
  }
};

// Get restaurant by ID
const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await restaurantModel.findById(id).select('-password');
    
    if (restaurant) {
      return res.json({ 
        success: true, 
        data: restaurant, 
        message: "Restaurant found." 
      });
    } else {
      return res.json({ 
        success: false, 
        message: "Restaurant not found." 
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error. Try again later." });
  }
};

// Get active restaurants list (for customer frontend)
const getRestaurantsList = async (req, res) => {
  try {
    // Allow admin to fetch full list (active + inactive) via query param
    const { scope, includeInactive } = req.query;
    const includeAll = scope === 'admin' || includeInactive === 'true';

    const restaurants = await restaurantModel
      .find(includeAll ? {} : { isActive: true })
      .select('-password')
      .sort({ rating: -1, createdAt: -1 });
    const stats = calculateStatsFromList(restaurants);
    
    return res.json({ 
      success: true, 
      data: restaurants, 
      stats,
      message: "Restaurants list fetched successfully." 
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error. Try again later." });
  }
};

export { 
  loginRestaurant, 
  registerRestaurant, 
  getAllRestaurants, 
  getRestaurantByEmail, 
  updateRestaurantByEmail,
  updateRestaurantStatus,
  getRestaurantById,
  getRestaurantsList
};
//test
