import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { transferService } from '../services/api';
import TransferForm from '../components/forms/TransferForm';
import '../styles/Table.css';

const Transfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  // Fetch transfers
  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const response = await transferService.getAllTransfers({
        search: searchTerm,
        status: statusFilter
      });
      setTransfers(response.data);
    } catch (error) {
      console.error('Error fetching transfers:', error);
      toast.error('Failed to fetch transfers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, [searchTerm, statusFilter]);

  // Handle initiate transfer click
  const handleInitiateClick = () => {
    setEditData(null);
    setShowForm(true);
  };

  // Handle view click
  const handleViewClick = (id) => {
    // TODO: Implement view details modal or navigation
    toast.info(`View transfer ${id} details coming soon`);
  };

  // Handle edit click
  const handleEditClick = (transfer) => {
    setEditData(transfer);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transfer?')) {
      try {
        await transferService.deleteTransfer(id);
        toast.success('Transfer deleted successfully');
        fetchTransfers(); // Refresh the list
      } catch (error) {
        console.error('Error deleting transfer:', error);
        toast.error('Failed to delete transfer');
      }
    }
  };

  // Handle status update
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await transferService.updateStatus(id, newStatus);
      toast.success('Transfer status updated successfully');
      fetchTransfers(); // Refresh the list
    } catch (error) {
      console.error('Error updating transfer status:', error);
      toast.error('Failed to update transfer status');
    }
  };

  // Handle form close
  const handleFormClose = () => {
    setShowForm(false);
    setEditData(null);
  };

  // Handle form success
  const handleFormSuccess = () => {
    fetchTransfers();
  };

  return (
    <div className="page-container">
      {showForm && (
        <TransferForm
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          editData={editData}
        />
      )}

      <div className="page-header">
        <h1>Transfers</h1>
        <button className="primary-button" onClick={handleInitiateClick}>
          Initiate Transfer
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search transfers..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Transit">In Transit</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-message">Loading transfers...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Equipment</th>
                <th>Quantity</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data-message">
                    No transfers found
                  </td>
                </tr>
              ) : (
                transfers.map((transfer) => (
                  <tr key={transfer._id || transfer.id}>
                    <td>{transfer._id || transfer.id}</td>
                    <td>{transfer.equipment}</td>
                    <td>{transfer.quantity}</td>
                    <td>{transfer.fromLocation}</td>
                    <td>{transfer.toLocation}</td>
                    <td>
                      <select
                        className={`status-select ${transfer.status.toLowerCase().replace(' ', '-')}`}
                        value={transfer.status}
                        onChange={(e) => handleStatusUpdate(transfer._id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>{new Date(transfer.date).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-button view"
                          onClick={() => handleViewClick(transfer._id)}
                        >
                          View
                        </button>
                        <button 
                          className="action-button edit"
                          onClick={() => handleEditClick(transfer)}
                        >
                          Edit
                        </button>
                        <button 
                          className="action-button delete"
                          onClick={() => handleDelete(transfer._id)}
                        >
                          Delete
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
  );
};

export default Transfers; 