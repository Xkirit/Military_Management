import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { PERMISSIONS } from '../config/roles';
import { 
  useDashboardMetrics, 
  useDashboardActivities, 
  useDashboardDepartments, 
  useDashboardNetMovement 
} from '../hooks/useQueries';
import { 
  FaChartLine, 
  FaMoneyBillWave, 
  FaShoppingCart, 
  FaUsers, 
  FaClipboardList, 
  FaBuilding,
  FaTimes,
  FaDownload,
  FaExchangeAlt
} from 'react-icons/fa';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    canExportData, 
    isAdmin, 
    isBaseCommander, 
    isLogisticsOfficer,
    getRoleDisplayName,
    getBaseDisplayName 
  } = usePermissions();
  
  
  const [filters, setFilters] = useState({ department: '' });
  const [showNetMovement, setShowNetMovement] = useState(false);

  // Use React Query hooks for caching
  const { 
    data: metrics = {
      base: '',
      summary: { totalExpenditures: 0, totalPurchases: 0, basePersonnel: 0, dateRange: { start: '', end: '' } },
      netMovement: { flowingIn: 0, flowingOut: 0, netBalance: 0 },
      assignments: { total: 0, byStatus: {} },
      expenditures: { total: 0, totalAmount: 0, byStatus: {} },
      transfersOut: { total: 0, totalQuantity: 0, byStatus: {} },
      transfersIn: { total: 0, totalQuantity: 0, byStatus: {} },
      purchases: { total: 0, totalAmount: 0, totalQuantity: 0, byStatus: {} },
      personnel: { total: 0, byDepartment: {} }
    }, 
    isLoading: metricsLoading,
    error: metricsError 
  } = useDashboardMetrics({});

  const { 
    data: recentActivities = [], 
    isLoading: activitiesLoading,
    error: activitiesError 
  } = useDashboardActivities({ limit: 20 });

  const { 
    data: departmentSummary = [], 
    isLoading: departmentsLoading,
    error: departmentsError 
  } = useDashboardDepartments({});

  const { 
    data: netMovementDetails, 
    refetch: fetchNetMovementDetails,
    isLoading: netMovementLoading 
  } = useDashboardNetMovement({});

  // Handle any API errors
  React.useEffect(() => {
    if (metricsError) {
      toast.error(`Failed to fetch dashboard metrics: ${metricsError.response?.data?.message || metricsError.message}`);
    }
    if (activitiesError) {
      toast.error(`Failed to fetch activities: ${activitiesError.response?.data?.message || activitiesError.message}`);
    }
    if (departmentsError) {
      toast.error(`Failed to fetch departments: ${departmentsError.response?.data?.message || departmentsError.message}`);
    }
  }, [metricsError, activitiesError, departmentsError]);

  const handleNetMovementClick = async () => {
    try {
      const result = await fetchNetMovementDetails();
      if (result.data) {
        setShowNetMovement(true);
      }
    } catch (error) {
      toast.error('Failed to fetch net movement details');
    }
  };

  const handleExport = () => {
    if (!canExportData()) {
      toast.error('You do not have permission to export data');
      return;
    }
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
      'Active': 'success', 'Pending': 'warning', 'Completed': 'info',
      'Approved': 'success', 'Processing': 'info', 'Rejected': 'danger',
      'Cancelled': 'danger', 'In Transit': 'info', 'Delivered': 'success'
    };
    return statusMap[status] || 'secondary';
  };

  const getActivityIcon = (type) => {
    return null; // Removed icons for cleaner look
  };

  const totalTransactions = (metrics.assignments?.total || 0) + 
                          (metrics.expenditures?.total || 0) + 
                          (metrics.transfersOut?.total || 0) + 
                          (metrics.transfersIn?.total || 0) + 
                          (metrics.purchases?.total || 0);

  const getDashboardTitle = () => {
    if (isAdmin()) return `Admin Dashboard - All Bases`;
    if (isBaseCommander()) return `Base Commander Dashboard - ${getBaseDisplayName()}`;
    if (isLogisticsOfficer()) return `Logistics Dashboard - ${getBaseDisplayName()}`;
    return `Dashboard - ${getBaseDisplayName()}`;
  };

  const getDashboardSubtitle = () => {
    if (isAdmin()) return 'System-wide operations and management';
    if (isBaseCommander()) return 'Base operations and personnel management';
    if (isLogisticsOfficer()) return 'Procurement and supply chain management';
    return 'Limited access view';
  };

  const loading = metricsLoading || activitiesLoading || departmentsLoading;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h1>{getDashboardTitle()}</h1>
          <p className="dashboard-subtitle">{getDashboardSubtitle()}</p>
        </div>
        {canExportData() && (
          <button className="export-button" onClick={handleExport}>
            <FaDownload />
            Export Data
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-message">Loading dashboard data...</div>
      ) : (
        <>
          <div className="metrics-grid">
            <div 
              className="metric-card clickable net-movement-card"
              onClick={handleNetMovementClick}
            >
              <h3>Net Movement</h3>
              <p className="metric-value">{formatCurrency(metrics.netMovement?.netBalance || 0)}</p>
              <small className="metric-subtitle">
                In: {formatCurrency(metrics.netMovement?.flowingIn || 0)} | 
                Out: {formatCurrency(metrics.netMovement?.flowingOut || 0)}
                <br />
                <strong>Click for details</strong>
              </small>
            </div>

            <div className="metric-card">
              <h3>{isAdmin() ? 'Total Expenditures' : 'Base Expenditures'}</h3>
              <p className="metric-value">{formatCurrency(metrics.summary?.totalExpenditures || 0)}</p>
              <small className="metric-subtitle">
                {isAdmin() ? 'All bases' : `${metrics.base}`} equipment & supplies
              </small>
            </div>

            <div className="metric-card">
              <h3>Purchase Value</h3>
              <p className="metric-value">{formatCurrency(metrics.purchases?.totalAmount || 0)}</p>
              <small className="metric-subtitle">
                {metrics.purchases?.total || 0} orders ({metrics.purchases?.totalQuantity || 0} items)
              </small>
            </div>

            <div className="metric-card ">
              <h3>{isAdmin() ? 'Total Personnel' : 'Base Personnel'}</h3>
              <p className="metric-value">{metrics.summary?.basePersonnel || 0}</p>
              <small className="metric-subtitle">
                {isAdmin() ? 'All bases' : `Personnel assigned to ${metrics.base}`}
              </small>
            </div>

            <div className="metric-card ">
              <h3>Recent Activities</h3>
              <p className="metric-value">{recentActivities.length}</p>
            </div>

            <div className="metric-card ">
              <h3>Departments</h3>
              <p className="metric-value">{departmentSummary.length}</p>
             </div>
          </div>

          {totalTransactions === 0 && isAdmin() && (
            <div className="debug-info">
              <h3>No Data Found</h3>
              <p>If you have data in the system but it's not showing up, try:</p>
              <ul>
                <li>Expanding the date range above</li>
                <li>Removing department filter</li>
                <li>Check browser console for errors</li>
              </ul>
              <small>Current filter: {filters.startDate} to {filters.endDate} | Dept: {filters.department || 'All'}</small>
            </div>
          )}

          <div className="activity-log">
            <h3>Recent Activity Log</h3>
            <div className="log-container">
              {recentActivities.length === 0 ? (
                <div className="no-data-message">No recent activities found</div>
              ) : (
                recentActivities.map((activity, index) => (
                  <div key={`${activity.type}-${activity.id}-${index}`} className="log-entry">
                    <span className="log-timestamp">
                      {new Date(activity.date).toLocaleString()} {' '}
                    </span>
                    <span className="log-type">[{activity.type.toUpperCase()}] </span>
                    <span className="log-message">
                      {activity.title} - {activity.user}
                      {activity.amount && ` - ${formatCurrency(activity.amount)}`}
                      {activity.category && ` - ${activity.category}`}
                    </span>
                    <span className={`log-status status-${(activity.status || 'unknown').toLowerCase().replace(' ', '-')}`}>
                      {activity.status || 'Unknown'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
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
                <FaTimes />
              </button>
            </div>
            
            <div className="net-movement-summary">
              <div className="movement-stats">
                <div className="stat-item inflow">
                  <h4>Materials Flowing In</h4>
                  <p>{netMovementDetails.summary.inflowTotal} units</p>
                  <small>{formatCurrency(netMovementDetails.summary.inflowValue)}</small>
                </div>
                <div className="stat-item outflow">
                  <h4>Materials Flowing Out</h4>
                  <p>{netMovementDetails.summary.outflowTotal} units</p>
                  <small>{formatCurrency(netMovementDetails.summary.outflowValue)}</small>
                </div>
                <div className="stat-item net">
                  <h4>Net Balance</h4>
                  <p className={netMovementDetails.summary.netQuantity >= 0 ? 'positive' : 'negative'}>
                    {netMovementDetails.summary.netQuantity} units
                  </p>
                  <small>{formatCurrency(netMovementDetails.summary.netValue)}</small>
                </div>
              </div>
            </div>

            <div className="movement-details">
              <div className="movement-section">
                <h3>Inflow ({netMovementDetails.movements.inflow.length} items)</h3>
                <div className="movement-list">
                  {netMovementDetails.movements.inflow.length === 0 ? (
                    <div className="no-data-message">No inflow found in selected period</div>
                  ) : (
                    netMovementDetails.movements.inflow.map((item) => (
                      <div key={`${item.type}-${item.id}`} className="movement-item inflow">
                        <div className="movement-icon">
                          {item.type === 'purchase' ? <FaShoppingCart /> : <FaExchangeAlt />}
                        </div>
                        <div className="movement-content">
                          <div className="movement-title">
                            <strong>{item.title}</strong>
                            <span className={`status-badge ${getStatusBadgeClass(item.status || 'Unknown')}`}>
                              {item.status || 'Unknown'}
                            </span>
                          </div>
                          <div className="movement-details-small">
                            <span>User: {item.user}</span>
                            <span>Dept: {item.department}</span>
                            <span>Qty: {item.quantity}</span>
                            {item.amount > 0 && (
                              <span>Amount: {formatCurrency(item.amount)}</span>
                            )}
                            <span>Date: {formatDate(item.date)}</span>
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
                <h3>Outflow ({netMovementDetails.movements.outflow.length} items)</h3>
                <div className="movement-list">
                  {netMovementDetails.movements.outflow.length === 0 ? (
                    <div className="no-data-message">No outflow found in selected period</div>
                  ) : (
                    netMovementDetails.movements.outflow.map((item) => (
                      <div key={`${item.type}-${item.id}`} className="movement-item outflow">
                        <div className="movement-icon">
                          <FaExchangeAlt />
                        </div>
                        <div className="movement-content">
                          <div className="movement-title">
                            <strong>{item.title}</strong>
                            <span className={`status-badge ${getStatusBadgeClass(item.status || 'Unknown')}`}>
                              {item.status || 'Unknown'}
                            </span>
                          </div>
                          <div className="movement-details-small">
                            <span>User: {item.user}</span>
                            <span>Dept: {item.department}</span>
                            <span>Qty: {item.quantity}</span>
                            <span>Date: {formatDate(item.date)}</span>
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