import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import './Dashboard.css';

const API_URL = 'http://localhost:5002/api';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    openingBalance: 0,
    closingBalance: 0,
    netMovement: {
      total: 0,
      purchases: 0,
      transferIn: 0,
      transferOut: 0
    },
    assignedAssets: 0,
    expendedAssets: 0
  });

  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    base: '',
    equipmentType: ''
  });

  const [showNetMovementDetails, setShowNetMovementDetails] = useState(false);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchBases();
    fetchEquipmentTypes();
  }, [filters]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/dashboard`, filters, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setMetrics(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBases = async () => {
    try {
      const response = await axios.get(`${API_URL}/bases`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setBases(response.data);
    } catch (error) {
      console.error('Error fetching bases:', error);
      toast.error('Failed to fetch bases');
    }
  };

  const fetchEquipmentTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/equipment-types`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setEquipmentTypes(response.data);
    } catch (error) {
      console.error('Error fetching equipment types:', error);
      toast.error('Failed to fetch equipment types');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExport = () => {
    toast.info('Export functionality coming soon');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button className="export-button" onClick={handleExport}>
          Export Data
        </button>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Date Range</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
          <span>to</span>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-group">
          <label>Base</label>
          <select
            name="base"
            value={filters.base}
            onChange={handleFilterChange}
          >
            <option value="">All Bases</option>
            {bases.map(base => (
              <option key={base.id} value={base.id}>
                {base.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Equipment Type</label>
          <select
            name="equipmentType"
            value={filters.equipmentType}
            onChange={handleFilterChange}
          >
            <option value="">All Types</option>
            {equipmentTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-message">Loading dashboard data...</div>
      ) : (
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Opening Balance</h3>
            <p className="metric-value">{metrics.openingBalance}</p>
          </div>

          <div className="metric-card">
            <h3>Closing Balance</h3>
            <p className="metric-value">{metrics.closingBalance}</p>
          </div>

          <div 
            className="metric-card clickable"
            onClick={() => setShowNetMovementDetails(true)}
          >
            <h3>Net Movement</h3>
            <p className="metric-value">{metrics.netMovement.total}</p>
          </div>

          <div className="metric-card">
            <h3>Assigned Assets</h3>
            <p className="metric-value">{metrics.assignedAssets}</p>
          </div>

          <div className="metric-card">
            <h3>Expended Assets</h3>
            <p className="metric-value">{metrics.expendedAssets}</p>
          </div>
        </div>
      )}

      {showNetMovementDetails && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Net Movement Details</h2>
            <div className="movement-details">
              <div className="detail-item">
                <h4>Purchases</h4>
                <p>{metrics.netMovement.purchases}</p>
              </div>
              <div className="detail-item">
                <h4>Transfer In</h4>
                <p>{metrics.netMovement.transferIn}</p>
              </div>
              <div className="detail-item">
                <h4>Transfer Out</h4>
                <p>{metrics.netMovement.transferOut}</p>
              </div>
              <div className="detail-item total">
                <h4>Total Net Movement</h4>
                <p>{metrics.netMovement.total}</p>
              </div>
            </div>
            <button 
              className="close-button"
              onClick={() => setShowNetMovementDetails(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 