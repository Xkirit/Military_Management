import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { dashboardService } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    summary: {
      totalExpenditures: 0,
      totalPurchases: 0,
      totalUsers: 0,
      dateRange: { start: '', end: '' }
    },
    assignments: { total: 0, byStatus: {} },
    expenditures: { total: 0, totalAmount: 0, byStatus: {} },
    transfers: { total: 0, byStatus: {} },
    purchases: { total: 0, totalAmount: 0, byStatus: {} },
    users: { total: 0, byDepartment: {} }
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [departmentSummary, setDepartmentSummary] = useState([]);

  const [filters, setFilters] = useState({
    // Default to last year to capture all data
    startDate: new Date(new Date().getFullYear() - 1, 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    department: ''
  });

  const [showActivities, setShowActivities] = useState(false);
  const [showDepartments, setShowDepartments] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data with filters:', filters);
      
      const [metricsResponse, activitiesResponse, departmentsResponse] = await Promise.all([
        dashboardService.getMetrics(filters),
        dashboardService.getRecentActivities({ limit: 20 }),
        dashboardService.getDepartmentSummary(filters)
      ]);
      
      console.log('Dashboard API responses:', {
        metrics: metricsResponse.data,
        activities: activitiesResponse.data.length,
        departments: departmentsResponse.data.length
      });
      
      setMetrics(metricsResponse.data);
      setRecentActivities(activitiesResponse.data);
      setDepartmentSummary(departmentsResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error(`Failed to fetch dashboard data: ${error.response?.data?.message || error.message}`);
      
      // Set default empty state on error
      setMetrics({
        summary: { totalExpenditures: 0, totalPurchases: 0, totalUsers: 0, dateRange: { start: '', end: '' } },
        assignments: { total: 0, byStatus: {} },
        expenditures: { total: 0, totalAmount: 0, byStatus: {} },
        transfers: { total: 0, byStatus: {} },
        purchases: { total: 0, totalAmount: 0, byStatus: {} },
        users: { total: 0, byDepartment: {} }
      });
      setRecentActivities([]);
      setDepartmentSummary([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    console.log(`Filter changed: ${name} = ${value}`);
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExport = () => {
    toast.info('Export functionality coming soon');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'Active': 'success',
      'Pending': 'warning', 
      'Completed': 'info',
      'Approved': 'success',
      'Processing': 'info',
      'Rejected': 'danger',
      'Cancelled': 'danger',
      'In Transit': 'info',
      'Delivered': 'success'
    };
    return statusMap[status] || 'secondary';
  };

  const getActivityIcon = (type) => {
    const iconMap = {
      'assignment': '👥',
      'expenditure': '💰',
      'transfer': '🚚',
      'purchase': '🛒'
    };
    return iconMap[type] || '📋';
  };

  // Calculate total transactions
  const totalTransactions = (metrics.assignments?.total || 0) + 
                          (metrics.expenditures?.total || 0) + 
                          (metrics.transfers?.total || 0) + 
                          (metrics.purchases?.total || 0);

  // Calculate total expenditures from purchases (this is the main spending)
  const totalExpendituresFromPurchases = metrics.purchases?.totalAmount || 0;
  
  // Add other expenditures from the expenditure model if any
  const otherExpenditures = metrics.expenditures?.totalAmount || 0;
  
  // Total expenditures = purchases + other expenditures
  const grandTotalExpenditures = totalExpendituresFromPurchases + otherExpenditures;

  // Debug information
  console.log('Current metrics state:', metrics);
  console.log('Total transactions calculated:', totalTransactions);
  console.log('Total expenditures breakdown:', {
    fromPurchases: totalExpendituresFromPurchases,
    otherExpenditures: otherExpenditures,
    grandTotal: grandTotalExpenditures
  });

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
          <label>Department</label>
          <select
            name="department"
            value={filters.department}
            onChange={handleFilterChange}
          >
            <option value="">All Departments</option>
            <option value="Operations">Operations</option>
            <option value="Logistics">Logistics</option>
            <option value="Training">Training</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Intelligence">Intelligence</option>
            <option value="Medical">Medical</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-message">Loading dashboard data...</div>
      ) : (
        <>
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>💰 Total Expenditures</h3>
              <p className="metric-value">{formatCurrency(grandTotalExpenditures)}</p>
              <small className="metric-subtitle">
                Purchases: {formatCurrency(totalExpendituresFromPurchases)} + Other: {formatCurrency(otherExpenditures)}
                <br />
                Period: {metrics.summary?.dateRange?.start} to {metrics.summary?.dateRange?.end}
              </small>
            </div>

            <div className="metric-card">
              <h3>🛒 Purchase Orders</h3>
              <p className="metric-value">{formatCurrency(totalExpendituresFromPurchases)}</p>
              <small className="metric-subtitle">
                Equipment & supplies ({metrics.purchases?.total || 0} orders)
              </small>
            </div>

            <div 
              className="metric-card clickable"
              onClick={() => setShowUsers(true)}
            >
              <h3>👥 Total Users</h3>
              <p className="metric-value">{metrics.summary?.totalUsers || 0}</p>
              <small className="metric-subtitle">Registered personnel</small>
            </div>

            <div 
              className="metric-card clickable"
              onClick={() => setShowActivities(true)}
            >
              <h3>📋 Recent Activities</h3>
              <p className="metric-value">{recentActivities.length}</p>
              <small className="metric-subtitle">Click to view details</small>
            </div>

            <div className="metric-card">
              <h3>📊 Total Transactions</h3>
              <p className="metric-value">{totalTransactions}</p>
              <small className="metric-subtitle">
                A:{metrics.assignments?.total || 0} | E:{metrics.expenditures?.total || 0} | T:{metrics.transfers?.total || 0} | P:{metrics.purchases?.total || 0}
              </small>
            </div>

            <div 
              className="metric-card clickable"
              onClick={() => setShowDepartments(true)}
            >
              <h3>🏢 Departments</h3>
              <p className="metric-value">{departmentSummary.length}</p>
              <small className="metric-subtitle">Click for breakdown</small>
            </div>
          </div>

          {/* Debug info card when no data */}
          {totalTransactions === 0 && (
            <div className="debug-info">
              <h3>⚠️ No Data Found</h3>
              <p>If you have data in the system but it's not showing up, try:</p>
              <ul>
                <li>Expanding the date range above</li>
                <li>Removing department filter</li>
                <li>Check browser console for errors</li>
              </ul>
              <small>Current filter: {filters.startDate} to {filters.endDate} | Dept: {filters.department || 'All'}</small>
            </div>
          )}

          <div className="status-summary">
            <div className="summary-section">
              <h3>📋 Assignment Status</h3>
              <div className="status-grid">
                {Object.keys(metrics.assignments?.byStatus || {}).length === 0 ? (
                  <div className="no-data-message">No assignments found in selected period</div>
                ) : (
                  Object.entries(metrics.assignments.byStatus).map(([status, data]) => (
                    <div key={status} className="status-item">
                      <span className={`status-badge ${getStatusBadgeClass(status)}`}>
                        {status}
                      </span>
                      <span className="status-count">{data.count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="summary-section">
              <h3>💰 Other Expenditures</h3>
              <div className="status-grid">
                {Object.keys(metrics.expenditures?.byStatus || {}).length === 0 ? (
                  <div className="no-data-message">No other expenditures found in selected period</div>
                ) : (
                  Object.entries(metrics.expenditures.byStatus).map(([status, data]) => (
                    <div key={status} className="status-item">
                      <span className={`status-badge ${getStatusBadgeClass(status)}`}>
                        {status}
                      </span>
                      <span className="status-count">{data.count}</span>
                      <span className="status-amount">{formatCurrency(data.amount)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="summary-section">
              <h3>🚚 Transfer Status</h3>
              <div className="status-grid">
                {Object.keys(metrics.transfers?.byStatus || {}).length === 0 ? (
                  <div className="no-data-message">No transfers found in selected period</div>
                ) : (
                  Object.entries(metrics.transfers.byStatus).map(([status, data]) => (
                    <div key={status} className="status-item">
                      <span className={`status-badge ${getStatusBadgeClass(status)}`}>
                        {status}
                      </span>
                      <span className="status-count">{data.count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="summary-section">
              <h3>🛒 Purchase Status</h3>
              <div className="status-grid">
                {Object.keys(metrics.purchases?.byStatus || {}).length === 0 ? (
                  <div className="no-data-message">No purchases found in selected period</div>
                ) : (
                  Object.entries(metrics.purchases.byStatus).map(([status, data]) => (
                    <div key={status} className="status-item">
                      <span className={`status-badge ${getStatusBadgeClass(status)}`}>
                        {status}
                      </span>
                      <span className="status-count">{data.count}</span>
                      <span className="status-amount">{formatCurrency(data.amount)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Recent Activities Modal */}
      {showActivities && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Recent Activities</h2>
              <button 
                className="close-button"
                onClick={() => setShowActivities(false)}
              >
                ×
              </button>
            </div>
            <div className="activities-list">
              {recentActivities.length === 0 ? (
                <div className="no-data-message">No recent activities found</div>
              ) : (
                recentActivities.map((activity) => (
                  <div key={`${activity.type}-${activity.id}`} className="activity-item">
                    <div className="activity-icon">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">
                        <strong>{activity.title}</strong>
                        <span className={`status-badge ${getStatusBadgeClass(activity.status)}`}>
                          {activity.status}
                        </span>
                      </div>
                      <div className="activity-details">
                        <span>👤 {activity.user}</span>
                        {activity.amount && (
                          <span>💰 {formatCurrency(activity.amount)}</span>
                        )}
                        {activity.category && (
                          <span>📂 {activity.category}</span>
                        )}
                        <span>📅 {formatDate(activity.date)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Department Summary Modal */}
      {showDepartments && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Department Summary</h2>
              <button 
                className="close-button"
                onClick={() => setShowDepartments(false)}
              >
                ×
              </button>
            </div>
            <div className="departments-list">
              {departmentSummary.length === 0 ? (
                <div className="no-data-message">No department data found</div>
              ) : (
                departmentSummary.map((dept) => (
                  <div key={dept._id} className="department-item">
                    <h4>🏢 {dept._id}</h4>
                    <div className="department-stats">
                      <span>💰 Total: {formatCurrency(dept.totalAmount)}</span>
                      <span>📊 Items: {dept.count}</span>
                      <span>📈 Avg: {formatCurrency(dept.totalAmount / dept.count)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Users Summary Modal */}
      {showUsers && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Users by Department</h2>
              <button 
                className="close-button"
                onClick={() => setShowUsers(false)}
              >
                ×
              </button>
            </div>
            <div className="departments-list">
              {Object.keys(metrics.users?.byDepartment || {}).length === 0 ? (
                <div className="no-data-message">No user data found</div>
              ) : (
                Object.entries(metrics.users.byDepartment).map(([dept, count]) => (
                  <div key={dept} className="department-item">
                    <h4>👥 {dept}</h4>
                    <div className="department-stats">
                      <span>👤 Users: {count}</span>
                      <span>📊 Percentage: {((count / metrics.users.total) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 