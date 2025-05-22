// src/pages/ViewHistory.js
import React, { useState, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { healthAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';

// Register Chart.js components
Chart.register(...registerables);

const ViewHistory = () => {
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    type: 'all'
  });

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const response = await healthAPI.getHealthRecords({
        startDate: filter.startDate || undefined,
        endDate: filter.endDate || undefined,
        type: filter.type === 'all' ? undefined : filter.type
      });
      
      if (response.data && response.data.data) {
        setHealthRecords(response.data.data);
      } else {
        setHealthRecords([]);
        setError('Invalid data structure received from server');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch health records');
      console.error('Error fetching health records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchHealthData();
  };

  const handleDeleteClick = (record) => {
    setConfirmDelete(record);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    
    try {
      setDeleteLoading(true);
      console.log('Deleting health record with ID:', confirmDelete._id);
      
      // Try the delete operation
      await healthAPI.deleteHealthRecord(confirmDelete._id);
      
      // Remove the record from state
      setHealthRecords(prevRecords => 
        prevRecords.filter(record => record._id !== confirmDelete._id)
      );
      
      // Reset confirmation state
      setConfirmDelete(null);
      
    } catch (err) {
      console.error('Error details:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to delete record');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  // Check if user can delete the record
  const canDelete = (record) => {
    if (!currentUser || !record) return false;
    
    // Doctors can ONLY delete records they created
    if (currentUser.role === 'doctor') {
      return record.doctor && record.doctor._id === currentUser.id;
    }
    
    // Patients can ONLY delete records they created themselves (self-recorded)
    if (currentUser.role === 'patient') {
      return !record.doctor; // Only allow deleting self-recorded entries (no doctor field)
    }
    
    return false;
  };

  // Prepare chart data
  const getChartData = (dataType) => {
    if (!healthRecords.length) return null;
    
    const sortedRecords = [...healthRecords].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const labels = sortedRecords.map(record => new Date(record.date).toLocaleDateString());
    let data = [];
    
    switch (dataType) {
      case 'bloodPressure':
        return {
          labels,
          datasets: [
            {
              label: 'Systolic',
              data: sortedRecords.map(record => record.bloodPressure?.systolic || null),
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              tension: 0.2
            },
            {
              label: 'Diastolic',
              data: sortedRecords.map(record => record.bloodPressure?.diastolic || null),
              borderColor: 'rgb(54, 162, 235)',
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              tension: 0.2
            }
          ]
        };
      case 'heartRate':
        data = sortedRecords.map(record => record.heartRate || null);
        break;
      case 'weight':
        data = sortedRecords.map(record => record.weight || null);
        break;
      case 'glucoseLevel':
        data = sortedRecords.map(record => record.glucoseLevel || null);
        break;
      default:
        return null;
    }
    
    return {
      labels,
      datasets: [
        {
          label: dataType.charAt(0).toUpperCase() + dataType.slice(1),
          data,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.2
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        mode: 'index',
        intersect: false
      },
      title: {
        display: true,
        text: 'Health Data Over Time'
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Value'
        }
      }
    }
  };

  return (
    <div className="view-history">
      <h1>Health Records History</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this health record from {new Date(confirmDelete.date).toLocaleDateString()}?</p>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="btn btn-danger" 
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={handleCancelDelete}
                disabled={deleteLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="filter-form">
        <form onSubmit={handleFilterSubmit}>
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="startDate">Start Date</label>
              <input 
                type="date" 
                id="startDate" 
                name="startDate"
                value={filter.startDate}
                onChange={handleFilterChange}
                className="form-control"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="endDate">End Date</label>
              <input 
                type="date" 
                id="endDate" 
                name="endDate"
                value={filter.endDate}
                onChange={handleFilterChange}
                className="form-control"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="type">Data Type</label>
              <select 
                id="type" 
                name="type"
                value={filter.type}
                onChange={handleFilterChange}
                className="form-control"
              >
                <option value="all">All Data</option>
                <option value="bloodPressure">Blood Pressure</option>
                <option value="heartRate">Heart Rate</option>
                <option value="weight">Weight</option>
                <option value="glucoseLevel">Glucose Level</option>
              </select>
            </div>
            
            <button type="submit" className="btn btn-primary">Filter</button>
          </div>
        </form>
      </div>
      
      {loading ? (
        <div className="loading">Loading health records...</div>
      ) : healthRecords.length === 0 ? (
        <div className="no-records">
          <p>No health records found for the selected period.</p>
        </div>
      ) : (
        <div className="health-charts">
          {(filter.type === 'all' || filter.type === 'bloodPressure') && getChartData('bloodPressure') && (
            <div className="chart-container">
              <h3>Blood Pressure</h3>
              <Line data={getChartData('bloodPressure')} options={chartOptions} />
            </div>
          )}
          
          {(filter.type === 'all' || filter.type === 'heartRate') && getChartData('heartRate') && (
            <div className="chart-container">
              <h3>Heart Rate</h3>
              <Line data={getChartData('heartRate')} options={chartOptions} />
            </div>
          )}
          
          {(filter.type === 'all' || filter.type === 'weight') && getChartData('weight') && (
            <div className="chart-container">
              <h3>Weight</h3>
              <Line data={getChartData('weight')} options={chartOptions} />
            </div>
          )}
          
          {(filter.type === 'all' || filter.type === 'glucoseLevel') && getChartData('glucoseLevel') && (
            <div className="chart-container">
              <h3>Glucose Level</h3>
              <Line data={getChartData('glucoseLevel')} options={chartOptions} />
            </div>
          )}
        </div>
      )}
      
      <div className="records-table">
        <h3>Records List</h3>
        {healthRecords.length === 0 ? (
          <p>No records to display</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Blood Pressure</th>
                <th>Heart Rate</th>
                <th>Weight</th>
                <th>Glucose</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {healthRecords.map(record => (
                <tr key={record._id}>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>{record.bloodPressure ? `${record.bloodPressure.systolic}/${record.bloodPressure.diastolic}` : '-'}</td>
                  <td>{record.heartRate ? `${record.heartRate} bpm` : '-'}</td>
                  <td>{record.weight ? `${record.weight} kg` : '-'}</td>
                  <td>{record.glucoseLevel ? `${record.glucoseLevel} mg/dL` : '-'}</td>
                  <td>
                    {canDelete(record) && (
                      <button 
                        className="btn btn-delete-entry"
                        onClick={() => handleDeleteClick(record)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ViewHistory;