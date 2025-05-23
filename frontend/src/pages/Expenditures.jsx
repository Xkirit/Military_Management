import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { expenditureService } from '../services/api';
import ExpenditureForm from '../components/forms/ExpenditureForm';
import '../styles/Table.css';

const Expenditures = () => {
  const [expenditures, setExpenditures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  // Fetch expenditures
  const fetchExpenditures = async () => {
    try {
      setLoading(true);
      const response = await expenditureService.getAllExpenditures();
      setExpenditures(response.data);
    } catch (error) {
      console.error('Error fetching expenditures:', error);
      toast.error('Failed to fetch expenditures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenditures();
  }, []);

  // Filter expenditures based on search, category, and status
  const filteredExpenditures = expenditures.filter(expenditure => {
    const matchesSearch = !searchTerm || 
      expenditure.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expenditure.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expenditure.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expenditure.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || expenditure.category === categoryFilter;
    const matchesStatus = !statusFilter || expenditure.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handle record expenditure click
  const handleRecordClick = () => {
    setEditData(null);
    setShowForm(true);
  };

  // Handle view click
  const handleViewClick = (id) => {
    // TODO: Implement view details modal or navigation
    toast.info(`View expenditure ${id} details coming soon`);
  };

  // Handle edit click
  const handleEditClick = (expenditure) => {
    setEditData(expenditure);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expenditure?')) {
      try {
        await expenditureService.deleteExpenditure(id);
        toast.success('Expenditure deleted successfully');
        fetchExpenditures(); // Refresh the list
      } catch (error) {
        console.error('Error deleting expenditure:', error);
        toast.error('Failed to delete expenditure');
      }
    }
  };

  // Handle status update
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await expenditureService.updateStatus(id, { status: newStatus });
      toast.success('Expenditure status updated successfully');
      fetchExpenditures(); // Refresh the list
    } catch (error) {
      console.error('Error updating expenditure status:', error);
      toast.error('Failed to update expenditure status');
    }
  };

  // Handle form close
  const handleFormClose = () => {
    setShowForm(false);
    setEditData(null);
  };

  // Handle form success
  const handleFormSuccess = () => {
    fetchExpenditures();
  };

  return (
    <div className="page-container">
      {showForm && (
        <ExpenditureForm
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          editData={editData}
        />
      )}

      <div className="page-header">
        <h1>Expenditures</h1>
        <button className="primary-button" onClick={handleRecordClick}>
          Record Expenditure
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search expenditures..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Equipment">Equipment</option>
          <option value="Training">Training</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Operations">Operations</option>
          <option value="Personnel">Personnel</option>
          <option value="Medical">Medical</option>
          <option value="Other">Other</option>
        </select>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Processing">Processing</option>
          <option value="Completed">Completed</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-message">Loading expenditures...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Department</th>
                <th>Budget Year</th>
                <th>Quarter</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenditures.length === 0 ? (
                <tr>
                  <td colSpan="10" className="no-data-message">
                    No expenditures found
                  </td>
                </tr>
              ) : (
                filteredExpenditures.map((expenditure) => (
                  <tr key={expenditure._id || expenditure.id}>
                    <td>{expenditure._id?.slice(-6) || expenditure.id}</td>
                    <td>{expenditure.category}</td>
                    <td>{expenditure.description}</td>
                    <td>${expenditure.amount?.toLocaleString() || '0'}</td>
                    <td>{expenditure.department}</td>
                    <td>{expenditure.budgetYear}</td>
                    <td>Q{expenditure.quarter}</td>
                    <td>{expenditure.paymentMethod}</td>
                    <td>
                      <select
                        className={`status-select ${expenditure.status.toLowerCase()}`}
                        value={expenditure.status}
                        onChange={(e) => handleStatusUpdate(expenditure._id || expenditure.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-button view"
                          onClick={() => handleViewClick(expenditure._id || expenditure.id)}
                        >
                          View
                        </button>
                        <button 
                          className="action-button edit"
                          onClick={() => handleEditClick(expenditure)}
                        >
                          Edit
                        </button>
                        <button 
                          className="action-button delete"
                          onClick={() => handleDelete(expenditure._id || expenditure.id)}
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

export default Expenditures; 