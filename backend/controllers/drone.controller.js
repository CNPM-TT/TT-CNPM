import droneModel from "../../database/models/drone.model.js";
import restaurantModel from "../../database/models/restaurant.model.js";

// Helper: Calculate charging time
const calculateChargingTime = (currentBattery, chargingRate = 2) => {
  const batteryNeeded = 100 - currentBattery;
  const minutesNeeded = Math.ceil(batteryNeeded / chargingRate);
  return minutesNeeded;
};

// Get all drones (Admin)
const listDrones = async (req, res) => {
  try {
    const drones = await droneModel.find({})
      .populate('assignedRestaurantId', 'name email')
      .populate('currentOrderId')
      .sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      data: drones,
      message: "Drones fetched successfully." 
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching drones." });
  }
};

// Add new drone (Admin)
const addDrone = async (req, res) => {
  try {
    const { 
      droneCode,
      assignedRestaurantId,
      maxWeight,
      maxItems
    } = req.body;

    // Check if droneCode already exists
    const existingDrone = await droneModel.findOne({ droneCode });
    if (existingDrone) {
      return res.json({ 
        success: false, 
        message: "Drone Code already exists." 
      });
    }

    const drone = new droneModel({
      droneCode,
      status: 'available',
      currentLocation: {
        latitude: 0,
        longitude: 0,
        address: 'Warehouse',
        district: ''
      },
      battery: {
        level: 100,
        isCharging: false
      },
      capacity: {
        maxWeight: maxWeight || 5,
        maxItems: maxItems || 10
      },
      assignedRestaurantId: assignedRestaurantId || null
    });

    await drone.save();
    res.json({ 
      success: true, 
      message: "Drone added successfully.",
      data: drone
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error adding drone." });
  }
};

// Update drone (Admin)
const updateDrone = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      droneCode, 
      status, 
      batteryLevel, 
      maxWeight, 
      maxItems, 
      assignedRestaurantId 
    } = req.body;

    const updateData = {};
    if (droneCode) updateData.droneCode = droneCode;
    if (status) updateData.status = status;
    if (batteryLevel !== undefined) updateData['battery.level'] = batteryLevel;
    if (maxWeight) updateData['capacity.maxWeight'] = maxWeight;
    if (maxItems) updateData['capacity.maxItems'] = maxItems;
    if (assignedRestaurantId !== undefined) {
      updateData.assignedRestaurantId = assignedRestaurantId || null;
    }

    const drone = await droneModel.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    ).populate('assignedRestaurantId', 'name email');

    if (!drone) {
      return res.json({ success: false, message: "Drone not found." });
    }

    res.json({ 
      success: true, 
      message: "Drone updated successfully.",
      data: drone
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error updating drone." });
  }
};

// Delete drone (Admin)
const removeDrone = async (req, res) => {
  try {
    const { id } = req.params;

    const drone = await droneModel.findById(id);
    if (!drone) {
      return res.json({ success: false, message: "Drone not found." });
    }

    // Check if drone is currently assigned to an order
    if (drone.currentOrderId) {
      return res.json({ 
        success: false, 
        message: "Cannot delete drone that is currently assigned to an order." 
      });
    }

    await droneModel.findByIdAndDelete(id);
    res.json({ 
      success: true, 
      message: "Drone removed successfully." 
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error removing drone." });
  }
};

// Get drones for specific restaurant
const getRestaurantDrones = async (req, res) => {
  try {
    const restaurantId = req.restaurantId; // From authRestaurant middleware

    const drones = await droneModel.find({ 
      assignedRestaurantId: restaurantId 
    }).populate('currentOrderId');

    res.json({ 
      success: true, 
      data: drones,
      message: "Restaurant drones fetched successfully." 
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching restaurant drones." });
  }
};

// Get available drones (not busy, good battery)
const getAvailableDrones = async (req, res) => {
  try {
    const { restaurantId } = req.query;

    const query = {
      status: 'available',
      'battery.level': { $gte: 20 } // At least 20% battery
    };

    if (restaurantId) {
      query.$or = [
        { assignedRestaurantId: restaurantId },
        { assignedRestaurantId: null }
      ];
    }

    const drones = await droneModel.find(query);

    res.json({ 
      success: true, 
      data: drones,
      message: "Available drones fetched successfully." 
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching available drones." });
  }
};

// Update drone status
const updateDroneStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, batteryLevel, currentLocation } = req.body;

    const updateData = {};
    if (status) {
      updateData.status = status;
      
      // If setting to charging, calculate charging time
      if (status === 'charging') {
        const drone = await droneModel.findById(id);
        if (drone) {
          const currentBattery = drone.battery?.level || 0;
          const chargingRate = drone.battery?.chargingRate || 2;
          const minutesNeeded = calculateChargingTime(currentBattery, chargingRate);
          
          updateData['battery.isCharging'] = true;
          updateData['battery.chargingStartedAt'] = new Date();
          updateData['battery.estimatedFullChargeAt'] = new Date(Date.now() + minutesNeeded * 60000);
        }
      } else if (status === 'available') {
        // When setting to available, stop charging
        updateData['battery.isCharging'] = false;
        updateData['battery.chargingStartedAt'] = null;
        updateData['battery.estimatedFullChargeAt'] = null;
      }
    }
    
    if (batteryLevel !== undefined) updateData['battery.level'] = batteryLevel;
    if (currentLocation) updateData.currentLocation = currentLocation;

    const drone = await droneModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!drone) {
      return res.json({ success: false, message: "Drone not found." });
    }

    res.json({ 
      success: true, 
      message: "Drone status updated.",
      data: drone
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error updating drone status." });
  }
};

export { 
  listDrones, 
  addDrone, 
  updateDrone, 
  removeDrone, 
  getRestaurantDrones, 
  getAvailableDrones,
  updateDroneStatus
};
