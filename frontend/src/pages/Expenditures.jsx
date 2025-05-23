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
      const response = await expenditureService.getAllExpenditures({
        search: searchTerm,
        category: categoryFilter,
        status: statusFilter
      });
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
  }, [searchTerm, categoryFilter, statusFilter]);

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
          <option value="Supplies">Supplies</option>
        </select>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Completed">Completed</option>
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
                <th>Date</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenditures.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data-message">
                    No expenditures found
                  </td>
                </tr>
              ) : (
                expenditures.map((expenditure) => (
                  <tr key={expenditure._id || expenditure.id}>
                    <td>{expenditure._id || expenditure.id}</td>
                    <td>{expenditure.category}</td>
                    <td>{expenditure.description}</td>
                    <td>${expenditure.amount.toLocaleString()}</td>
                    <td>{new Date(expenditure.date).toLocaleDateString()}</td>
                    <td>{expenditure.department}</td>
                    <td>
                      <span className={`status-badge ${expenditure.status.toLowerCase()}`}>
                        {expenditure.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-button view"
                          onClick={() => handleViewClick(expenditure._id)}
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
                          onClick={() => handleDelete(expenditure._id)}
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