import foodModel from "../../database/models/food.model.js";
import fs from "fs";
import userModel from "../../database/models/user.model.js";
import cloudinary from "../middleware/cloudinary.config.js";

//add food (for admin - no restaurantId)
const addFood = async (req, res) => {
  // Cloudinary provides the image URL in the 'path' property
  const image_url = req.file.path;

  const food = new foodModel({
    available: req.body.available,
    veg: req.body.veg,
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    image: image_url, // Save the Cloudinary URL to the database
  });

  try {
    await food.save();
    res.json({ success: true, message: "Food added." });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error adding Food." });
  }
};

//add food by restaurant (with restaurantId from token)
const addFoodByRestaurant = async (req, res) => {
  const image_url = req.file.path;

  console.log("Restaurant ID from token:", req.restaurantId); // Debug log

  const food = new foodModel({
    available: req.body.available,
    veg: req.body.veg,
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    image: image_url,
    restaurantId: req.restaurantId, // From authRestaurant middleware
  });

  try {
    await food.save();
    console.log("Food saved with restaurantId:", food.restaurantId); // Debug log
    res.json({ success: true, message: "Food added successfully.", data: food });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error adding Food." });
  }
};

//get foods
const getFoods = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    
    // If restaurantId is provided, filter by restaurant
    const filter = restaurantId ? { restaurantId } : {};
    
    const foods = await foodModel.find(filter).populate('restaurantId', 'name address city rating');
    res.json({ success: true, data: foods });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error loading food datas." });
  }
};
//get foods by restaurant ID (for restaurant menu page)
const getFoodsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const foods = await foodModel.find({ restaurantId });
    
    res.json({ 
      success: true, 
      data: foods,
      message: "Restaurant menu fetched successfully." 
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error loading restaurant menu." });
  }
};

//get my foods (for restaurant panel - using token)
const getMyFoods = async (req, res) => {
  try {
    const restaurantId = req.restaurantId; // From authRestaurant middleware
    console.log("Fetching foods for restaurant:", restaurantId); // Debug log
    
    const foods = await foodModel.find({ restaurantId });
    console.log("Found", foods.length, "foods"); // Debug log
    
    res.json({ 
      success: true, 
      data: foods,
      message: "Your menu fetched successfully." 
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error loading your menu." });
  }
};

const getFoodById = async (req, res) =>{
  try{
    const food = await foodModel.findById(req.params.id)
    if(food){
      res.json({ success: true, data: food });
    }else{
      res.json({ success: false, message: "No food details found." });
    }
  }catch(error){
    console.log(error)
    res.json({ success: false, message: "Error loading food data." });
  }
}

//update food status
const updateFoodStatus = async (req, res) => {
  const foodId = req.params.id;

  try {
    const food = await foodModel.findById(foodId);

    if (!food) {
      return res
        .status(404)
        .json({ success: false, message: "Food not found." });
    }

    // If restaurantId exists in request (from authRestaurant middleware)
    // Check if the food belongs to this restaurant
    if (req.restaurantId && food.restaurantId) {
      if (food.restaurantId.toString() !== req.restaurantId.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: "You don't have permission to update this food." 
        });
      }
    }

    food.name = req.body.name;
    food.price = req.body.price;
    food.available = req.body.available;

    await food.save();

    res.json({ success: true, message: "Food status updated." });
  } catch (error) {
    console.error("Error updating food status:", error);
    res
      .status(500)
      .json({ success: false, message: "Error updating food price." });
  }
};
// const updateFoodPrice = async (req, res) => {
//   const foodId = req.params.id;

//   try {
//     const food = await foodModel.findById(foodId);

//     if (!food) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Food not found." });
//     }

//     food.price = req.body.price;

//     await food.save();

//     res.json({ success: true, message: "Food price updated." });
//   } catch (error) {
//     console.error("Error updating food price:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Error updating food price." });
//   }
// };

//remover food
// const removeFood = async (req, res) => {
//   try {
//     const food = await foodModel.findById(req.body.id);
//     fs.unlink(`uploads/${food.image}`, () => {});

//     await foodModel.findByIdAndDelete(req.body.id);
//     res.json({ success: true, message: "Food removed." });
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: "Error deleting Food." });
//   }
// };
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    
    if (!food) {
      return res.json({ success: false, message: "Food not found." });
    }

    // If restaurantId exists in request (from authRestaurant middleware)
    // Check if the food belongs to this restaurant
    if (req.restaurantId && food.restaurantId) {
      if (food.restaurantId.toString() !== req.restaurantId.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: "You don't have permission to delete this food." 
        });
      }
    }
    
    // Comment out old local file deletion (doesn't work with Cloudinary)
    // fs.unlink(`uploads/${food.image}`, () => {});
    
    // Delete from Cloudinary instead
    if (food.image && food.image.includes('cloudinary.com')) {
      // Extract public_id from URL
      // From: https://res.cloudinary.com/.../upload/v123/tomato/1234-burger.jpg.jpg
      // Get: tomato/1234-burger.jpg
      const parts = food.image.split('/upload/')[1]; // Get everything after "/upload/"
      const publicId = parts.split('/').slice(1).join('/'); // Skip version, get "tomato/1234-burger.jpg.jpg"
      const finalId = publicId.substring(0, publicId.lastIndexOf('.')); // Remove last .jpg -> "tomato/1234-burger.jpg"
      console.log('Deleting from Cloudinary with public_id:', finalId);
      await cloudinary.uploader.destroy(finalId);
    }

    await foodModel.findByIdAndDelete(req.body.id);
    
    // Remove from all user carts
    await userModel.updateMany(
      {},
      { $unset: { [`cartData.${req.body.id}`]: "" } }
    );
    
    res.json({ success: true, message: "Food removed." });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error deleting Food." });
  }
};
export { addFood, addFoodByRestaurant, getFoodById, getFoods, getFoodsByRestaurant, getMyFoods, removeFood, updateFoodStatus };
