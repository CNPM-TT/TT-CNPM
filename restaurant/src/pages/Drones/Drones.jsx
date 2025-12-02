import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { url } from '../../config';
import './Drones.css';

const Drones = () => {
  const [drones, setDrones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyDrones();
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchMyDrones, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMyDrones = async () => {
    try {
      const token = localStorage.getItem('restaurant-token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await axios.get(`${url}/api/drone/restaurant/my-drones`, {
        headers: { token }
      });

      if (response.data.success) {
        setDrones(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching drones:', error);
      toast.error('Failed to fetch drones');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#10b981';
      case 'delivering': return '#f59e0b';
      case 'maintenance': return '#ef4444';
      case 'charging': return '#3b82f6';
      case 'offline': return '#6b7280';
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return '✅';
      case 'delivering': return '🚀';
      case 'charging': return '⚡';
      case 'maintenance': return '🔧';
      case 'offline': return '📴';
      default: return '❓';
    }
  };

  if (loading) {
    return <div className="loading-container">Loading drones...</div>;
  }

  return (
    <div className="restaurant-drones-container">
      <div className="drones-header">
        <h1>My Drones</h1>
        <button className="refresh-btn" onClick={fetchMyDrones}>
          🔄 Refresh
        </button>
      </div>

      {drones.length === 0 ? (
        <div className="no-drones">
          <h2>No Drones Assigned</h2>
          <p>Contact admin to get drones assigned to your restaurant.</p>
        </div>
      ) : (
        <>
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
                <h3>Delivering</h3>
                <p>{drones.filter(d => d.status === 'delivering').length}</p>
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

          <div className="drones-grid">
            {drones.map((drone) => (
              <div key={drone._id} className="drone-card">
                <div className="drone-card-header">
                  <h3>{drone.droneCode}</h3>
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(drone.status) }}
                  >
                    {getStatusIcon(drone.status)} {drone.status}
                  </span>
                </div>

                <div className="drone-card-body">
                  <div className="drone-info-row">
                    <div className="info-label">Battery</div>
                    <div className="info-value">
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
                        <small className="charging-time">
                          ⚡ {getChargingTimeRemaining(drone)}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="drone-info-row">
                    <div className="info-label">Capacity</div>
                    <div className="info-value">
                      {drone.capacity?.maxWeight || 0} kg / {drone.capacity?.maxItems || 0} items
                    </div>
                  </div>

                  <div className="drone-info-row">
                    <div className="info-label">Location</div>
                    <div className="info-value location-text">
                      📍 {drone.currentLocation?.address || 'Unknown'}
                    </div>
                  </div>

                  {drone.specifications && (
                    <>
                      <div className="drone-info-row">
                        <div className="info-label">Model</div>
                        <div className="info-value">{drone.specifications.model}</div>
                      </div>
                      <div className="drone-info-row">
                        <div className="info-label">Speed</div>
                        <div className="info-value">{drone.specifications.speed} km/h</div>
                      </div>
                      <div className="drone-info-row">
                        <div className="info-label">Range</div>
                        <div className="info-value">{drone.specifications.range} km</div>
                      </div>
                    </>
                  )}

                  {drone.currentOrderId && (
                    <div className="current-order-alert">
                      📦 Currently delivering order
                    </div>
                  )}
                </div>

                <div className="drone-card-footer">
                  {drone.status === 'available' ? (
                    <button className="use-drone-btn" disabled>
                      Ready for Orders
                    </button>
                  ) : drone.status === 'delivering' ? (
                    <button className="tracking-btn" disabled>
                      🗺️ Track Delivery
                    </button>
                  ) : (
                    <button className="unavailable-btn" disabled>
                      Not Available
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Drones;
