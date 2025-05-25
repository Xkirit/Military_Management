import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useTransfers, useDeleteTransfer, useUpdateTransfer, useUpdateTransferStatus } from '../hooks/useQueries';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import TransferForm from '../components/forms/TransferForm';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import '../styles/Table.css';

const Transfers = () => {
  const { user } = useAuth();
  const { canUpdateTransfer, canDeleteTransfer, canCreateTransfer } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [directionFilter, setDirectionFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  // Use React Query for caching
  const { 
    data: transfers = [], 
    isLoading: loading,
    error 
  } = useTransfers({
    search: searchTerm,
    status: statusFilter
  });

  const deleteTransferMutation = useDeleteTransfer();
  const updateTransferMutation = useUpdateTransfer();
  const updateTransferStatusMutation = useUpdateTransferStatus();

  // Handle API errors
  React.useEffect(() => {
    if (error) {
      toast.error('Failed to fetch transfers');
    }
  }, [error]);

  // Determine transfer direction relative to user's base
  const getTransferDirection = (transfer) => {
    if (!user?.base) return 'Unknown';
    
    if (transfer.sourceBaseId === user.base) {
      return 'outgoing'; // User's base is sending
    } else if (transfer.destinationBaseId === user.base) {
      return 'incoming'; // User's base is receiving
    }
    return 'unknown';
  };

  // Filter transfers based on search, status, and direction
  const filteredTransfers = transfers.filter(transfer => {
    const direction = getTransferDirection(transfer);
    
    const matchesSearch = !searchTerm || 
      transfer.equipment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.fromLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.toLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.sourceBaseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.destinationBaseId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || transfer.status === statusFilter;
    const matchesDirection = !directionFilter || direction === directionFilter;
    
    return matchesSearch && matchesStatus && matchesDirection;
  });

  // Handle initiate transfer click
  const handleInitiateClick = () => {
    setEditData(null);
    setShowForm(true);
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
        await deleteTransferMutation.mutateAsync(id);
        toast.success('Transfer deleted successfully');
        // Data will automatically refresh due to query invalidation
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            'Failed to delete transfer';
        toast.error(errorMessage);
      }
    }
  };

  // Handle status update
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateTransferStatusMutation.mutateAsync({ 
        id, 
        status: newStatus 
      });
      toast.success('Transfer status updated successfully');
      // Data will automatically refresh due to query invalidation
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to update transfer status';
      toast.error(errorMessage);
    }
  };

  // Handle form close
  const handleFormClose = () => {
    setShowForm(false);
    setEditData(null);
  };

  // Handle form success - no need to manually refresh, React Query will handle it
  const handleFormSuccess = () => {
    // Data will automatically refresh due to query invalidation in mutations
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
        <div className="page-title-section">
          <h1>
            Equipment Transfers - {user?.base || 'Unknown Base'}
          </h1>
          <p className="page-subtitle">Manage equipment transfers between bases and locations</p>
        </div>
        {canCreateTransfer() && (
          <button className="primary-button" onClick={handleInitiateClick}>
            <FaPlus />
            Initiate Transfer
          </button>
        )}
      </div>

      <div className="filters-section">
        <div className="search-group">
          <input
            type="text"
            placeholder="Search transfers, equipment, bases..."
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
            <option value="In Transit">In Transit</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="filter-group">
          <select
            className="filter-select"
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value)}
          >
            <option value="">All Directions</option>
            <option value="incoming">↓ Incoming</option>
            <option value="outgoing">↑ Outgoing</option>
          </select>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h3>
            Transfer Records ({filteredTransfers.length})
          </h3>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading-message">
              <div className="loading-spinner"></div>
              Loading transfers...
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Direction</th>
                  <th>
                    Equipment
                  </th>
                  <th>Quantity</th>
                  <th>From Base</th>
                  <th>To Base</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransfers.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="no-data-message">
                      <div>No transfers found</div>
                      <small>Try adjusting your search or filters</small>
                    </td>
                  </tr>
                ) : (
                  filteredTransfers.map((transfer) => {
                    const direction = getTransferDirection(transfer);
                    return (
                      <tr key={transfer._id || transfer.id}>
                        <td>
                          <code className="code-cell">
                            {(transfer._id || transfer.id).slice(-6)}
                          </code>
                        </td>
                        <td>
                          <span className={`direction-text direction-${direction}`}>
                            {direction === 'incoming' ? (
                              <>
                                <FaArrowDown /> IN
                              </>
                            ) : direction === 'outgoing' ? (
                              <>
                                <FaArrowUp /> OUT
                              </>
                            ) : (
                              '?'
                            )}
                          </span>
                        </td>
                        <td className="text-cell">{transfer.equipment}</td>
                        <td className="center-cell">
                          {transfer.quantity}
                        </td>
                        <td className="text-cell">
                          <strong className="primary-text">{transfer.sourceBaseId}</strong>
                          
                        </td>
                        <td className="text-cell">
                          <strong className="primary-text">{transfer.destinationBaseId}</strong>
                       
                        </td>
                        <td>
                          <select
                            className={`status-select status-${transfer.status.toLowerCase().replace(' ', '-')}`}
                            value={transfer.status}
                            onChange={(e) => handleStatusUpdate(transfer._id, e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="center-cell">
                          {new Date(transfer.createdAt || transfer.date).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="action-buttons">
                            {canUpdateTransfer(transfer.requestedBy) && (
                              <button 
                                className="action-button edit"
                                onClick={() => handleEditClick(transfer)}
                                title="Edit Transfer"
                              >
                                <FaEdit />
                              </button>
                            )}
                            {canDeleteTransfer(transfer.requestedBy) && (
                              <button 
                                className="action-button delete"
                                onClick={() => handleDelete(transfer._id)}
                                title="Delete Transfer"
                              >
                                <FaTrash />
                              </button>
                            )}
                            {!canUpdateTransfer(transfer.requestedBy) && !canDeleteTransfer(transfer.requestedBy) && (
                              <span className="no-actions">No actions available</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transfers; 