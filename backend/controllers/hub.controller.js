import hubModel from "../../database/models/hub.model.js";
import droneModel from "../../database/models/drone.model.js";
import orderModel from "../../database/models/order.model.js";

// List all hubs
const listHubs = async (req, res) => {
  try {
    const hubs = await hubModel
      .find({})
      .populate('assignedDrones', 'droneCode status battery.level')
      .sort({ 'location.district': 1 });
    
    res.json({ success: true, data: hubs });
  } catch (error) {
    console.error('Error listing hubs:', error);
    res.json({ success: false, message: "Error fetching hubs." });
  }
};

// Get single hub details
const getHub = async (req, res) => {
  try {
    const { hubId } = req.params;
    
    const hub = await hubModel
      .findById(hubId)
      .populate('assignedDrones', 'droneCode status battery currentLocation')
      .populate('pendingOrders.orderId', 'userId amount status')
      .populate('pendingOrders.restaurantIds', 'name district');
    
    if (!hub) {
      return res.json({ success: false, message: "Hub not found." });
    }
    
    res.json({ success: true, data: hub });
  } catch (error) {
    console.error('Error fetching hub:', error);
    res.json({ success: false, message: "Error fetching hub details." });
  }
};

// Add new hub
const addHub = async (req, res) => {
  try {
    const { hubCode, name, location, capacity, coverageArea, operatingHours } = req.body;
    
    // Check if hub code already exists
    const existingHub = await hubModel.findOne({ hubCode: hubCode.toUpperCase() });
    if (existingHub) {
      return res.json({ success: false, message: "Hub code already exists." });
    }
    
    const newHub = new hubModel({
      hubCode: hubCode.toUpperCase(),
      name,
      location,
      status: 'active',
      capacity: capacity || { maxDrones: 20, maxOrders: 100 },
      coverageArea: coverageArea || [],
      operatingHours: operatingHours || { open: '06:00', close: '23:00' },
      assignedDrones: [],
      pendingOrders: []
    });
    
    await newHub.save();
    res.json({ success: true, message: "Hub added successfully.", data: newHub });
  } catch (error) {
    console.error('Error adding hub:', error);
    res.json({ success: false, message: "Error adding hub." });
  }
};

// Update hub
const updateHub = async (req, res) => {
  try {
    const { hubId } = req.params;
    const updateData = req.body;
    
    // If hubCode is being updated, check for duplicates
    if (updateData.hubCode) {
      updateData.hubCode = updateData.hubCode.toUpperCase();
      const existingHub = await hubModel.findOne({ 
        hubCode: updateData.hubCode,
        _id: { $ne: hubId }
      });
      if (existingHub) {
        return res.json({ success: false, message: "Hub code already exists." });
      }
    }
    
    const updatedHub = await hubModel.findByIdAndUpdate(
      hubId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedHub) {
      return res.json({ success: false, message: "Hub not found." });
    }
    
    res.json({ success: true, message: "Hub updated successfully.", data: updatedHub });
  } catch (error) {
    console.error('Error updating hub:', error);
    res.json({ success: false, message: "Error updating hub." });
  }
};

// Delete hub
const removeHub = async (req, res) => {
  try {
    const { hubId } = req.params;
    
    const hub = await hubModel.findById(hubId);
    if (!hub) {
      return res.json({ success: false, message: "Hub not found." });
    }
    
    // Check if hub has assigned drones
    if (hub.assignedDrones && hub.assignedDrones.length > 0) {
      return res.json({ 
        success: false, 
        message: "Cannot delete hub with assigned drones. Please reassign drones first." 
      });
    }
    
    // Check if hub has pending orders
    if (hub.pendingOrders && hub.pendingOrders.length > 0) {
      return res.json({ 
        success: false, 
        message: "Cannot delete hub with pending orders. Please clear orders first." 
      });
    }
    
    await hubModel.findByIdAndDelete(hubId);
    res.json({ success: true, message: "Hub deleted successfully." });
  } catch (error) {
    console.error('Error deleting hub:', error);
    res.json({ success: false, message: "Error deleting hub." });
  }
};

// Assign drone to hub
const assignDroneToHub = async (req, res) => {
  try {
    const { hubId } = req.params;
    const { droneId } = req.body;
    
    const hub = await hubModel.findById(hubId);
    if (!hub) {
      return res.json({ success: false, message: "Hub not found." });
    }
    
    const drone = await droneModel.findById(droneId);
    if (!drone) {
      return res.json({ success: false, message: "Drone not found." });
    }
    
    // Check hub capacity
    if (hub.assignedDrones.length >= hub.capacity.maxDrones) {
      return res.json({ 
        success: false, 
        message: `Hub has reached maximum capacity (${hub.capacity.maxDrones} drones).` 
      });
    }
    
    // Check if drone already assigned to this hub
    if (hub.assignedDrones.includes(droneId)) {
      return res.json({ success: false, message: "Drone already assigned to this hub." });
    }
    
    // Check if drone is assigned to another hub
    if (drone.assignedHubId && drone.assignedHubId.toString() !== hubId) {
      return res.json({ 
        success: false, 
        message: "Drone is already assigned to another hub. Please unassign first." 
      });
    }
    
    // Assign drone to hub
    hub.assignedDrones.push(droneId);
    await hub.save();
    
    // Update drone's hub assignment
    drone.assignedHubId = hubId;
    await drone.save();
    
    res.json({ success: true, message: "Drone assigned to hub successfully." });
  } catch (error) {
    console.error('Error assigning drone to hub:', error);
    res.json({ success: false, message: "Error assigning drone." });
  }
};

// Unassign drone from hub
const unassignDroneFromHub = async (req, res) => {
  try {
    const { hubId, droneId } = req.params;
    
    const hub = await hubModel.findById(hubId);
    if (!hub) {
      return res.json({ success: false, message: "Hub not found." });
    }
    
    // Remove drone from hub's assignedDrones
    hub.assignedDrones = hub.assignedDrones.filter(
      id => id.toString() !== droneId
    );
    await hub.save();
    
    // Update drone's hub assignment
    await droneModel.findByIdAndUpdate(droneId, { 
      assignedHubId: null 
    });
    
    res.json({ success: true, message: "Drone unassigned from hub successfully." });
  } catch (error) {
    console.error('Error unassigning drone:', error);
    res.json({ success: false, message: "Error unassigning drone." });
  }
};

// Get available drones for hub assignment
const getAvailableDronesForHub = async (req, res) => {
  try {
    const { hubId } = req.params;
    
    // Get drones that are not assigned to any hub or assigned to this hub
    const drones = await droneModel.find({
      $or: [
        { assignedHubId: null },
        { assignedHubId: hubId }
      ],
      status: { $in: ['available', 'charging'] }
    }).select('droneCode status battery.level currentLocation specifications');
    
    res.json({ success: true, data: drones });
  } catch (error) {
    console.error('Error fetching available drones:', error);
    res.json({ success: false, message: "Error fetching available drones." });
  }
};

// Get hub statistics
const getHubStats = async (req, res) => {
  try {
    const totalHubs = await hubModel.countDocuments({});
    const activeHubs = await hubModel.countDocuments({ status: 'active' });
    const inactiveHubs = await hubModel.countDocuments({ status: 'inactive' });
    const maintenanceHubs = await hubModel.countDocuments({ status: 'maintenance' });
    
    // Calculate total assigned drones across all hubs
    const hubs = await hubModel.find({});
    const totalAssignedDrones = hubs.reduce((sum, hub) => sum + (hub.assignedDrones?.length || 0), 0);
    
    // Calculate total pending orders
    const totalPendingOrders = hubs.reduce((sum, hub) => sum + (hub.pendingOrders?.length || 0), 0);
    
    res.json({
      success: true,
      data: {
        totalHubs,
        activeHubs,
        inactiveHubs,
        maintenanceHubs,
        totalAssignedDrones,
        totalPendingOrders
      }
    });
  } catch (error) {
    console.error('Error fetching hub stats:', error);
    res.json({ success: false, message: "Error fetching statistics." });
  }
};

export { 
  listHubs, 
  getHub, 
  addHub, 
  updateHub, 
  removeHub,
  assignDroneToHub,
  unassignDroneFromHub,
  getAvailableDronesForHub,
  getHubStats
};
