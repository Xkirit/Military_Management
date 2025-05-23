import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { dashboardService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    base: '',
    summary: {
      totalExpenditures: 0,
      totalPurchases: 0,
      basePersonnel: 0,
      dateRange: { start: '', end: '' }
    },
    netMovement: {
      flowingIn: 0,
      flowingOut: 0,
      netBalance: 0
    },
    assignments: { total: 0, byStatus: {} },
    expenditures: { total: 0, totalAmount: 0, byStatus: {} },
    transfersOut: { total: 0, totalQuantity: 0, byStatus: {} },
    transfersIn: { total: 0, totalQuantity: 0, byStatus: {} },
    purchases: { total: 0, totalAmount: 0, totalQuantity: 0, byStatus: {} },
    personnel: { total: 0, byDepartment: {} }
  });

  const [netMovementDetails, setNetMovementDetails] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [departmentSummary, setDepartmentSummary] = useState([]);

  const [filters, setFilters] = useState({
    department: ''
  });

  const [showNetMovement, setShowNetMovement] = useState(false);
  const [showActivities, setShowActivities] = useState(false);
  const [showDepartments, setShowDepartments] = useState(false);
  const [showPersonnel, setShowPersonnel] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching base-specific dashboard data (all-time)');
      
      const [metricsResponse, activitiesResponse, departmentsResponse] = await Promise.all([
        dashboardService.getMetrics({}), // No date filtering
        dashboardService.getRecentActivities({ limit: 20 }),
        dashboardService.getDepartmentSummary({})
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
        base: user?.base || 'Unknown',
        summary: { totalExpenditures: 0, totalPurchases: 0, basePersonnel: 0, dateRange: { start: '', end: '' } },
        netMovement: { flowingIn: 0, flowingOut: 0, netBalance: 0 },
        assignments: { total: 0, byStatus: {} },
        expenditures: { total: 0, totalAmount: 0, byStatus: {} },
        transfersOut: { total: 0, totalQuantity: 0, byStatus: {} },
        transfersIn: { total: 0, totalQuantity: 0, byStatus: {} },
        purchases: { total: 0, totalAmount: 0, totalQuantity: 0, byStatus: {} },
        personnel: { total: 0, byDepartment: {} }
      });
      setRecentActivities([]);
      setDepartmentSummary([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNetMovementDetails = async () => {
    try {
      console.log('Fetching net movement details (all-time)...');
      const response = await dashboardService.getNetMovementDetails({});
      setNetMovementDetails(response.data);
      setShowNetMovement(true);
    } catch (error) {
      console.error('Error fetching net movement details:', error);
      toast.error('Failed to fetch net movement details');
    }
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
                          (metrics.transfersOut?.total || 0) + 
                          (metrics.transfersIn?.total || 0) + 
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
        <h1>Dashboard - {metrics.base || user?.base || 'Unknown Base'}</h1>
        <button className="export-button" onClick={handleExport}>
          Export Data
        </button>
      </div>

      {/* <div className="filters-section">
        <div className="base-info">
          <h3>📍 Current Base: {metrics.base || user?.base || 'Unknown Base'}</h3>
          <p>Showing all-time data for personnel assigned to this base</p>
        </div>
      </div> */}

      {loading ? (
        <div className="loading-message">Loading dashboard data...</div>
      ) : (
        <>
          <div className="metrics-grid">
            <div 
              className="metric-card clickable net-movement-card"
              onClick={fetchNetMovementDetails}
            >
              <h3>📊 Net Movement</h3>
              <p className="metric-value">{metrics.netMovement?.netBalance || 0}</p>
              <small className="metric-subtitle">
                In: {metrics.netMovement?.flowingIn || 0} units | 
                Out: {metrics.netMovement?.flowingOut || 0} units
                <br />
                <strong>Click for details</strong>
              </small>
            </div>

            <div className="metric-card">
              <h3>💰 Base Expenditures</h3>
              <p className="metric-value">{formatCurrency(metrics.summary?.totalExpenditures || 0)}</p>
              <small className="metric-subtitle">
                All-time equipment & supplies for {metrics.base}
              </small>
            </div>

            <div className="metric-card">
              <h3>🛒 Purchase Value</h3>
              <p className="metric-value">{formatCurrency(metrics.purchases?.totalAmount || 0)}</p>
              <small className="metric-subtitle">
                {metrics.purchases?.total || 0} orders ({metrics.purchases?.totalQuantity || 0} items)
              </small>
            </div>

            <div 
              className="metric-card clickable"
              onClick={() => setShowPersonnel(true)}
            >
              <h3>👥 Base Personnel</h3>
              <p className="metric-value">{metrics.summary?.basePersonnel || 0}</p>
              <small className="metric-subtitle">Personnel assigned to {metrics.base}</small>
            </div>

            <div 
              className="metric-card clickable"
              onClick={() => setShowActivities(true)}
            >
              <h3>📋 Recent Activities</h3>
              <p className="metric-value">{recentActivities.length}</p>
              <small className="metric-subtitle">Click to view details</small>
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
                {Object.keys(metrics.transfersOut?.byStatus || {}).length === 0 ? (
                  <div className="no-data-message">No outgoing transfers found in selected period</div>
                ) : (
                  Object.entries(metrics.transfersOut.byStatus).map(([status, data]) => (
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
              <h3>🚚 Transfer Status</h3>
              <div className="status-grid">
                {Object.keys(metrics.transfersIn?.byStatus || {}).length === 0 ? (
                  <div className="no-data-message">No incoming transfers found in selected period</div>
                ) : (
                  Object.entries(metrics.transfersIn.byStatus).map(([status, data]) => (
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

      {/* Personnel Summary Modal */}
      {showPersonnel && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Personnel by Department</h2>
              <button 
                className="close-button"
                onClick={() => setShowPersonnel(false)}
              >
                ×
              </button>
            </div>
            <div className="departments-list">
              {Object.keys(metrics.personnel?.byDepartment || {}).length === 0 ? (
                <div className="no-data-message">No personnel data found</div>
              ) : (
                Object.entries(metrics.personnel.byDepartment).map(([dept, count]) => (
                  <div key={dept} className="department-item">
                    <h4>👥 {dept}</h4>
                    <div className="department-stats">
                      <span>👤 Personnel: {count}</span>
                      <span>📊 Percentage: {((count / metrics.personnel.total) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Net Movement Details Modal */}
      {showNetMovement && netMovementDetails && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Net Movement Details - {netMovementDetails.base}</h2>
              <button 
                className="close-button"
                onClick={() => setShowNetMovement(false)}
              >
                ×
              </button>
            </div>
            
            <div className="net-movement-summary">
              <div className="movement-stats">
                <div className="stat-item inflow">
                  <h4>📈 Materials Flowing In</h4>
                  <p>{netMovementDetails.summary.inflowTotal} units</p>
                  <small>{formatCurrency(netMovementDetails.summary.inflowValue)}</small>
                </div>
                <div className="stat-item outflow">
                  <h4>📉 Materials Flowing Out</h4>
                  <p>{netMovementDetails.summary.outflowTotal} units</p>
                  <small>{formatCurrency(netMovementDetails.summary.outflowValue)}</small>
                </div>
                <div className="stat-item net">
                  <h4>📊 Net Balance</h4>
                  <p className={netMovementDetails.summary.netQuantity >= 0 ? 'positive' : 'negative'}>
                    {netMovementDetails.summary.netQuantity} units
                  </p>
                  <small>{formatCurrency(netMovementDetails.summary.netValue)}</small>
                </div>
              </div>
            </div>

            <div className="movement-details">
              <div className="movement-section">
                <h3>📈 Inflow ({netMovementDetails.movements.inflow.length} items)</h3>
                <div className="movement-list">
                  {netMovementDetails.movements.inflow.length === 0 ? (
                    <div className="no-data-message">No inflow found in selected period</div>
                  ) : (
                    netMovementDetails.movements.inflow.map((item) => (
                      <div key={`${item.type}-${item.id}`} className="movement-item inflow">
                        <div className="movement-icon">
                          {item.type === 'purchase' ? '🛒' : '📦'}
                        </div>
                        <div className="movement-content">
                          <div className="movement-title">
                            <strong>{item.title}</strong>
                            <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                          <div className="movement-details-small">
                            <span>👤 {item.user}</span>
                            <span>🏢 {item.department}</span>
                            <span>📦 Qty: {item.quantity}</span>
                            {item.amount > 0 && (
                              <span>💰 {formatCurrency(item.amount)}</span>
                            )}
                            <span>📅 {formatDate(item.date)}</span>
                          </div>
                          {item.details.supplier && (
                            <div className="movement-supplier">
                              <small>Supplier: {item.details.supplier}</small>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="movement-section">
                <h3>📉 Outflow ({netMovementDetails.movements.outflow.length} items)</h3>
                <div className="movement-list">
                  {netMovementDetails.movements.outflow.length === 0 ? (
                    <div className="no-data-message">No outflow found in selected period</div>
                  ) : (
                    netMovementDetails.movements.outflow.map((item) => (
                      <div key={`${item.type}-${item.id}`} className="movement-item outflow">
                        <div className="movement-icon">
                          🚚
                        </div>
                        <div className="movement-content">
                          <div className="movement-title">
                            <strong>{item.title}</strong>
                            <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                          <div className="movement-details-small">
                            <span>👤 {item.user}</span>
                            <span>🏢 {item.department}</span>
                            <span>📦 Qty: {item.quantity}</span>
                            <span>📅 {formatDate(item.date)}</span>
                          </div>
                          {item.details.reason && (
                            <div className="movement-reason">
                              <small>Reason: {item.details.reason}</small>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 