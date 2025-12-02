import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { url } from '../../config';
import './Drones.css';

const Drones = () => {
  const [drones, setDrones] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentDrone, setCurrentDrone] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [formData, setFormData] = useState({
    droneCode: '',
    maxWeight: 5,
    maxItems: 10,
    assignedRestaurantId: ''
  });

  useEffect(() => {
    fetchDrones();
    fetchRestaurants();
  }, []);

  const fetchDrones = async () => {
    try {
      const response = await axios.get(`${url}/api/drone/list`);
      if (response.data.success) {
        setDrones(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching drones:', error);
      toast.error('Failed to fetch drones');
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(`${url}/api/restaurant/admin/list`);
      if (response.data.success) {
        setRestaurants(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const handleAddDrone = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${url}/api/drone/add`, formData);
      if (response.data.success) {
        toast.success('Drone added successfully!');
        setShowAddModal(false);
        setFormData({ droneCode: '', maxWeight: 5, maxItems: 10, assignedRestaurantId: '' });
        fetchDrones();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error adding drone:', error);
      toast.error('Failed to add drone');
    }
  };

  const handleUpdateDrone = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${url}/api/drone/update/${currentDrone._id}`,
        formData
      );
      if (response.data.success) {
        toast.success('Drone updated successfully!');
        setShowEditModal(false);
        setCurrentDrone(null);
        fetchDrones();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error updating drone:', error);
      toast.error('Failed to update drone');
    }
  };

  const handleDeleteDrone = async (id) => {
    if (!window.confirm('Are you sure you want to delete this drone?')) return;
    
    try {
      const response = await axios.delete(`${url}/api/drone/remove/${id}`);
      if (response.data.success) {
        toast.success('Drone deleted successfully!');
        fetchDrones();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error deleting drone:', error);
      toast.error('Failed to delete drone');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const response = await axios.put(`${url}/api/drone/status/${id}`, { status });
      if (response.data.success) {
        toast.success('Drone status updated!');
        fetchDrones();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const openEditModal = (drone) => {
    setCurrentDrone(drone);
    setFormData({
      droneCode: drone.droneCode,
      maxWeight: drone.capacity?.maxWeight || 5,
      maxItems: drone.capacity?.maxItems || 10,
      assignedRestaurantId: drone.assignedRestaurantId?._id || '',
      status: drone.status,
      batteryLevel: drone.battery?.level || 100
    });
    setShowEditModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#10b981';
      case 'busy': return '#f59e0b';
      case 'maintenance': return '#ef4444';
      case 'charging': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getBatteryColor = (battery) => {
    if (battery >= 60) return '#10b981';
    if (battery >= 30) return '#f59e0b';
    return '#ef4444';
  };

  const getChargingTimeRemaining = (drone) => {
    if (!drone.battery?.isCharging || !drone.battery?.estimatedFullChargeAt) return null;
    
    const now = new Date();
    const estimatedTime = new Date(drone.battery.estimatedFullChargeAt);
    const minutesRemaining = Math.max(0, Math.ceil((estimatedTime - now) / 60000));
    
    if (minutesRemaining === 0) return 'Almost done';
    if (minutesRemaining < 60) return `${minutesRemaining} min`;
    
    const hours = Math.floor(minutesRemaining / 60);
    const mins = minutesRemaining % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="drones-container">
      <div className="drones-header">
        <h1>Drone Management</h1>
        <button className="add-btn" onClick={() => setShowAddModal(true)}>
          + Add New Drone
        </button>
      </div>

      <div className="drones-stats">
        <div className="stat-card">
          <div className="stat-icon">🚁</div>
          <div className="stat-info">
            <h3>Total Drones</h3>
            <p>{drones.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Available</h3>
            <p>{drones.filter(d => d.status === 'available').length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚀</div>
          <div className="stat-info">
            <h3>Busy</h3>
            <p>{drones.filter(d => d.status === 'busy').length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔋</div>
          <div className="stat-info">
            <h3>Charging</h3>
            <p>{drones.filter(d => d.status === 'charging').length}</p>
          </div>
        </div>
      </div>

      <div className="drones-table-container">
        <table className="drones-table">
          <thead>
            <tr>
              <th>Drone Code</th>
              <th>Status</th>
              <th>Battery</th>
              <th>Capacity</th>
              <th>Assigned Restaurant</th>
              <th>Location</th>
              <th>Model</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drones.map((drone) => (
              <tr key={drone._id}>
                <td className="drone-id">{drone.droneCode}</td>
                <td>
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(drone.status) }}
                  >
                    {drone.status}
                  </span>
                </td>
                <td>
                  <div className="battery-container">
                    <div 
                      className="battery-bar" 
                      style={{ 
                        width: `${drone.battery?.level || 0}%`,
                        backgroundColor: getBatteryColor(drone.battery?.level || 0)
                      }}
                    ></div>
                    <span className="battery-text">{drone.battery?.level || 0}%</span>
                  </div>
                  {drone.battery?.isCharging && (
                    <small style={{ color: '#3b82f6', fontWeight: '600', marginTop: '4px', display: 'block' }}>
                      ⚡ {getChargingTimeRemaining(drone)}
                    </small>
                  )}
                </td>
                <td>{drone.capacity?.maxWeight || 0} kg / {drone.capacity?.maxItems || 0} items</td>
                <td>{drone.assignedRestaurantId?.name || 'Unassigned'}</td>
                <td className="location-cell">
                  {drone.currentLocation?.address || 'Unknown'}
                </td>
                <td>{drone.specifications?.model || 'N/A'}</td>
                <td className="actions-cell">
                  <button 
                    className="edit-btn"
                    onClick={() => openEditModal(drone)}
                  >
                    ✏️
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteDrone(drone._id)}
                  >
                    🗑️
                  </button>
                  {drone.status !== 'available' && (
                    <button 
                      className="status-btn"
                      onClick={() => handleUpdateStatus(drone._id, 'available')}
                    >
                      Set Available
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Drone Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Drone</h2>
            <form onSubmit={handleAddDrone}>
              <div className="form-group">
                <label>Drone Code *</label>
                <input
                  type="text"
                  value={formData.droneCode}
                  onChange={(e) => setFormData({...formData, droneCode: e.target.value.toUpperCase()})}
                  required
                  placeholder="e.g., DRONE-007"
                />
              </div>
              <div className="form-group">
                <label>Max Weight (kg) *</label>
                <input
                  type="number"
                  value={formData.maxWeight}
                  onChange={(e) => setFormData({...formData, maxWeight: e.target.value})}
                  required
                  min="1"
                  max="20"
                />
              </div>
              <div className="form-group">
                <label>Max Items *</label>
                <input
                  type="number"
                  value={formData.maxItems}
                  onChange={(e) => setFormData({...formData, maxItems: e.target.value})}
                  required
                  min="1"
                  max="50"
                />
              </div>
              <div className="form-group">
                <label>Assign to Restaurant (Optional)</label>
                <select
                  value={formData.assignedRestaurantId}
                  onChange={(e) => setFormData({...formData, assignedRestaurantId: e.target.value})}
                >
                  <option value="">Unassigned</option>
                  {restaurants.map(rest => (
                    <option key={rest._id} value={rest._id}>
                      {rest.name} ({rest.restaurantCode})
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Drone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Drone Modal */}
      {showEditModal && currentDrone && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Drone: {currentDrone.droneCode}</h2>
            <form onSubmit={handleUpdateDrone}>
              <div className="form-group">
                <label>Drone Code</label>
                <input
                  type="text"
                  value={formData.droneCode}
                  onChange={(e) => setFormData({...formData, droneCode: e.target.value.toUpperCase()})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="available">Available</option>
                  <option value="delivering">Delivering</option>
                  <option value="charging">Charging</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              <div className="form-group">
                <label>Battery (%)</label>
                <input
                  type="number"
                  value={formData.batteryLevel}
                  onChange={(e) => setFormData({...formData, batteryLevel: e.target.value})}
                  min="0"
                  max="100"
                />
              </div>
              <div className="form-group">
                <label>Max Weight (kg)</label>
                <input
                  type="number"
                  value={formData.maxWeight}
                  onChange={(e) => setFormData({...formData, maxWeight: e.target.value})}
                  min="1"
                  max="20"
                />
              </div>
              <div className="form-group">
                <label>Max Items</label>
                <input
                  type="number"
                  value={formData.maxItems}
                  onChange={(e) => setFormData({...formData, maxItems: e.target.value})}
                  min="1"
                  max="50"
                />
              </div>
              <div className="form-group">
                <label>Assign to Restaurant</label>
                <select
                  value={formData.assignedRestaurantId}
                  onChange={(e) => setFormData({...formData, assignedRestaurantId: e.target.value})}
                >
                  <option value="">Unassigned</option>
                  {restaurants.map(rest => (
                    <option key={rest._id} value={rest._id}>
                      {rest.name} ({rest.restaurantCode})
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Update Drone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drones;
