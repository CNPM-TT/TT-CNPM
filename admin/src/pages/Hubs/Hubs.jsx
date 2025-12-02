import React, { useEffect, useState } from 'react';
import './Hubs.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { url } from '../../config';

const Hubs = () => {
  const [hubs, setHubs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDroneModal, setShowDroneModal] = useState(false);
  const [selectedHub, setSelectedHub] = useState(null);
  const [availableDrones, setAvailableDrones] = useState([]);
  
  const [formData, setFormData] = useState({
    hubCode: '',
    name: '',
    location: {
      address: '',
      district: '',
      city: 'Ho Chi Minh City',
      latitude: '',
      longitude: ''
    },
    capacity: {
      maxDrones: 20,
      maxOrders: 100
    },
    operatingHours: {
      open: '06:00',
      close: '23:00'
    },
    status: 'active'
  });

  useEffect(() => {
    fetchHubs();
    fetchStats();
  }, []);

  const fetchHubs = async () => {
    try {
      const response = await axios.get(`${url}/api/hub/list`);
      if (response.data.success) {
        setHubs(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch hubs');
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${url}/api/hub/stats`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddHub = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${url}/api/hub/add`, formData);
      if (response.data.success) {
        toast.success('Hub added successfully');
        setShowAddModal(false);
        fetchHubs();
        fetchStats();
        resetForm();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to add hub');
    }
  };

  const handleEditHub = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${url}/api/hub/${selectedHub._id}`, formData);
      if (response.data.success) {
        toast.success('Hub updated successfully');
        setShowEditModal(false);
        fetchHubs();
        resetForm();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to update hub');
    }
  };

  const handleDeleteHub = async (hubId) => {
    if (!window.confirm('Are you sure you want to delete this hub?')) return;
    
    try {
      const response = await axios.delete(`${url}/api/hub/${hubId}`);
      if (response.data.success) {
        toast.success('Hub deleted successfully');
        fetchHubs();
        fetchStats();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to delete hub');
    }
  };

  const openEditModal = (hub) => {
    setSelectedHub(hub);
    setFormData({
      hubCode: hub.hubCode,
      name: hub.name,
      location: hub.location,
      capacity: hub.capacity,
      operatingHours: hub.operatingHours,
      status: hub.status
    });
    setShowEditModal(true);
  };

  const openDroneModal = async (hub) => {
    setSelectedHub(hub);
    try {
      const response = await axios.get(`${url}/api/hub/${hub._id}/available-drones`);
      if (response.data.success) {
        setAvailableDrones(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch available drones');
    }
    setShowDroneModal(true);
  };

  const handleAssignDrone = async (droneId) => {
    try {
      const response = await axios.post(`${url}/api/hub/${selectedHub._id}/assign-drone`, {
        droneId
      });
      if (response.data.success) {
        toast.success('Drone assigned successfully');
        setShowDroneModal(false);
        fetchHubs();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to assign drone');
    }
  };

  const handleUnassignDrone = async (hubId, droneId) => {
    if (!window.confirm('Unassign this drone from hub?')) return;
    
    try {
      const response = await axios.delete(`${url}/api/hub/${hubId}/drone/${droneId}`);
      if (response.data.success) {
        toast.success('Drone unassigned successfully');
        fetchHubs();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to unassign drone');
    }
  };

  const resetForm = () => {
    setFormData({
      hubCode: '',
      name: '',
      location: {
        address: '',
        district: '',
        city: 'Ho Chi Minh City',
        latitude: '',
        longitude: ''
      },
      capacity: {
        maxDrones: 20,
        maxOrders: 100
      },
      operatingHours: {
        open: '06:00',
        close: '23:00'
      },
      status: 'active'
    });
    setSelectedHub(null);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'status-badge active',
      inactive: 'status-badge inactive',
      maintenance: 'status-badge maintenance'
    };
    return <span className={statusClasses[status]}>{status.toUpperCase()}</span>;
  };

  if (loading) {
    return <div className="hubs-loading">Loading hubs...</div>;
  }

  return (
    <div className="hubs-container">
      <div className="hubs-header">
        <h1>Hub Management</h1>
        <button className="btn-add" onClick={() => setShowAddModal(true)}>
          + Add New Hub
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-info">
            <h3>{stats.totalHubs || 0}</h3>
            <p>Total Hubs</p>
          </div>
        </div>
        <div className="stat-card active">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats.activeHubs || 0}</h3>
            <p>Active</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚁</div>
          <div className="stat-info">
            <h3>{stats.totalAssignedDrones || 0}</h3>
            <p>Assigned Drones</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>{stats.totalPendingOrders || 0}</h3>
            <p>Pending Orders</p>
          </div>
        </div>
      </div>

      {/* Hubs Table */}
      <div className="hubs-table-container">
        <table className="hubs-table">
          <thead>
            <tr>
              <th>Hub Code</th>
              <th>Name</th>
              <th>District</th>
              <th>Status</th>
              <th>Drones</th>
              <th>Capacity</th>
              <th>Hours</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hubs.map((hub) => (
              <tr key={hub._id}>
                <td><strong>{hub.hubCode}</strong></td>
                <td>{hub.name}</td>
                <td>{hub.location.district}</td>
                <td>{getStatusBadge(hub.status)}</td>
                <td>
                  <span className="drone-count">
                    {hub.assignedDrones?.length || 0} / {hub.capacity.maxDrones}
                  </span>
                </td>
                <td>
                  <span className="capacity-info">
                    {hub.capacity.maxOrders} orders
                  </span>
                </td>
                <td>
                  <span className="hours-info">
                    {hub.operatingHours.open} - {hub.operatingHours.close}
                  </span>
                </td>
                <td className="actions">
                  <button 
                    className="btn-action btn-drones" 
                    onClick={() => openDroneModal(hub)}
                    title="Manage Drones"
                  >
                    🚁
                  </button>
                  <button 
                    className="btn-action btn-edit" 
                    onClick={() => openEditModal(hub)}
                    title="Edit Hub"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-action btn-delete" 
                    onClick={() => handleDeleteHub(hub._id)}
                    title="Delete Hub"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Hub Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Hub</h2>
            <form onSubmit={handleAddHub}>
              <div className="form-row">
                <div className="form-group">
                  <label>Hub Code *</label>
                  <input
                    type="text"
                    name="hubCode"
                    value={formData.hubCode}
                    onChange={handleInputChange}
                    placeholder="HUB-XX"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hub Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="District X Hub"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Address *</label>
                  <input
                    type="text"
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>District *</label>
                  <input
                    type="text"
                    name="location.district"
                    value={formData.location.district}
                    onChange={handleInputChange}
                    placeholder="District 1"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    name="location.latitude"
                    value={formData.location.latitude}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    name="location.longitude"
                    value={formData.location.longitude}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Max Drones</label>
                  <input
                    type="number"
                    name="capacity.maxDrones"
                    value={formData.capacity.maxDrones}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Max Orders</label>
                  <input
                    type="number"
                    name="capacity.maxOrders"
                    value={formData.capacity.maxOrders}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Opening Time</label>
                  <input
                    type="time"
                    name="operatingHours.open"
                    value={formData.operatingHours.open}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Closing Time</label>
                  <input
                    type="time"
                    name="operatingHours.close"
                    value={formData.operatingHours.close}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => { setShowAddModal(false); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Add Hub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Hub Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Hub</h2>
            <form onSubmit={handleEditHub}>
              <div className="form-row">
                <div className="form-group">
                  <label>Hub Code *</label>
                  <input
                    type="text"
                    name="hubCode"
                    value={formData.hubCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hub Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Address *</label>
                  <input
                    type="text"
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>District *</label>
                  <input
                    type="text"
                    name="location.district"
                    value={formData.location.district}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Max Drones</label>
                  <input
                    type="number"
                    name="capacity.maxDrones"
                    value={formData.capacity.maxDrones}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Max Orders</label>
                  <input
                    type="number"
                    name="capacity.maxOrders"
                    value={formData.capacity.maxOrders}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => { setShowEditModal(false); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Update Hub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drone Management Modal */}
      {showDroneModal && selectedHub && (
        <div className="modal-overlay" onClick={() => setShowDroneModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <h2>Manage Drones - {selectedHub.hubCode}</h2>
            
            {/* Currently Assigned Drones */}
            <div className="drone-section">
              <h3>Assigned Drones ({selectedHub.assignedDrones?.length || 0}/{selectedHub.capacity.maxDrones})</h3>
              <div className="drone-list">
                {selectedHub.assignedDrones && selectedHub.assignedDrones.length > 0 ? (
                  selectedHub.assignedDrones.map((drone) => (
                    <div key={drone._id} className="drone-item">
                      <div className="drone-info">
                        <strong>{drone.droneCode}</strong>
                        <span className={`status-badge ${drone.status}`}>{drone.status}</span>
                        <span className="battery">🔋 {drone.battery?.level || 0}%</span>
                      </div>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleUnassignDrone(selectedHub._id, drone._id)}
                      >
                        Unassign
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No drones assigned</p>
                )}
              </div>
            </div>

            {/* Available Drones for Assignment */}
            <div className="drone-section">
              <h3>Available Drones</h3>
              <div className="drone-list">
                {availableDrones.length > 0 ? (
                  availableDrones
                    .filter(drone => !selectedHub.assignedDrones?.some(d => d._id === drone._id))
                    .map((drone) => (
                      <div key={drone._id} className="drone-item">
                        <div className="drone-info">
                          <strong>{drone.droneCode}</strong>
                          <span className={`status-badge ${drone.status}`}>{drone.status}</span>
                          <span className="battery">🔋 {drone.battery?.level || 0}%</span>
                        </div>
                        <button
                          className="btn-action btn-add"
                          onClick={() => handleAssignDrone(drone._id)}
                        >
                          Assign
                        </button>
                      </div>
                    ))
                ) : (
                  <p className="no-data">No available drones</p>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDroneModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hubs;
