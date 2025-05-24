import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { purchaseService } from '../services/api';
import PurchaseForm from '../components/forms/PurchaseForm';
import { 
  FaPlus, 
  FaEye, 
  FaEdit, 
  FaTrash
} from 'react-icons/fa';
import '../styles/Table.css';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  // Fetch purchases
  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await purchaseService.getAllPurchases({
        search: searchTerm,
        status: statusFilter
      });
      setPurchases(response.data);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast.error('Failed to fetch purchases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [searchTerm, statusFilter]);

  // Handle new purchase request click
  const handleNewRequestClick = () => {
    setEditData(null);
    setShowForm(true);
  };

  // Handle view click
  const handleViewClick = (id) => {
    // TODO: Implement view details modal or navigation
    toast.info(`View purchase ${id} details coming soon`);
  };

  // Handle edit click
  const handleEditClick = (purchase) => {
    setEditData(purchase);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      try {
        await purchaseService.deletePurchase(id);
        toast.success('Purchase deleted successfully');
        fetchPurchases(); // Refresh the list
      } catch (error) {
        console.error('Error deleting purchase:', error);
        toast.error('Failed to delete purchase');
      }
    }
  };

  // Handle status update
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await purchaseService.updateStatus(id, newStatus);
      toast.success('Purchase status updated successfully');
      fetchPurchases(); // Refresh the list
    } catch (error) {
      console.error('Error updating purchase status:', error);
      toast.error('Failed to update purchase status');
    }
  };

  // Handle form close
  const handleFormClose = () => {
    setShowForm(false);
    setEditData(null);
  };

  // Handle form success
  const handleFormSuccess = () => {
    fetchPurchases();
  };

  return (
    <div className="page-container">
      {showForm && (
        <PurchaseForm
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          editData={editData}
        />
      )}

      <div className="page-header">
        <div className="page-title-section">
          <h1>
            Purchase Management
          </h1>
          <p className="page-subtitle">Manage equipment and supply purchase orders</p>
        </div>
        <button className="primary-button" onClick={handleNewRequestClick}>
          <FaPlus />
          New Purchase Request
        </button>
      </div>

      <div className="filters-section">
        <div className="search-group">
          <input
            type="text"
            placeholder="Search purchases..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Processing">Processing</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h3>
            Purchase Orders ({purchases.length})
          </h3>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading-message">
              <div className="loading-spinner"></div>
              Loading purchases...
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Supplier</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="no-data-message">
                      <div>No purchases found</div>
                      <small>Try adjusting your search or filters</small>
                    </td>
                  </tr>
                ) : (
                  purchases.map((purchase) => (
                    <tr key={purchase._id || purchase.id}>
                      <td>
                        <code className="code-cell">
                          {purchase._id || purchase.id}
                        </code>
                      </td>
                      <td className="text-cell">
                        <div className="item-name">{purchase.item}</div>
                        <small className="item-details">{purchase.category}</small>
                      </td>
                      <td className="center-cell">
                        {purchase.quantity}
                      </td>
                      <td className="currency-cell">
                        ${purchase.unitPrice.toLocaleString()}
                      </td>
                      <td className="currency-cell success-text">
                        ${(purchase.quantity * purchase.unitPrice).toLocaleString()}
                      </td>
                      <td>{purchase.supplier}</td>
                      <td>
                        <span className="primary-text">{purchase.department}</span>
                      </td>
                      <td>
                        <select
                          className={`status-select status-${purchase.status.toLowerCase()}`}
                          value={purchase.status}
                          onChange={(e) => handleStatusUpdate(purchase._id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Processing">Processing</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="center-cell">
                        {new Date(purchase.date).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-button view"
                            onClick={() => handleViewClick(purchase._id)}
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button 
                            className="action-button edit"
                            onClick={() => handleEditClick(purchase)}
                            title="Edit Purchase"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="action-button delete"
                            onClick={() => handleDelete(purchase._id)}
                            title="Delete Purchase"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Purchases; 