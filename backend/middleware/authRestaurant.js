import jwt from "jsonwebtoken";

const authRestaurant = async (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return res.json({
      success: false,
      message: "Not authorized. Please login again.",
    });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    // Store in req instead of req.body to avoid multer conflicts
    req.restaurantId = tokenDecode.id;
    next();
  } catch (error) {
    console.log(error);
    return res.json({ 
      success: false, 
      message: "Invalid token. Please login again." 
    });
  }
};

export default authRestaurant;
