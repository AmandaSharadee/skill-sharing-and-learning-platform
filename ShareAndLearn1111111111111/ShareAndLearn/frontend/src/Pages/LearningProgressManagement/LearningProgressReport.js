import React, { useEffect, useState, useRef } from 'react';
import NavBar from '../../Components/NavBar/NavBar';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { FaFilePdf, FaFileExcel, FaChartPie, FaChartBar, FaSync, FaFilter, FaDownload } from 'react-icons/fa';
import * as XLSX from 'xlsx';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function LearningProgressReport() {
  const [progressData, setProgressData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reportType, setReportType] = useState('pie');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const reportRef = useRef(null);
  const userId = localStorage.getItem('userID');
  
  const fetchProgressData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/learningprogress');
      if (!response.ok) {
        throw new Error('Failed to fetch learning progress data');
      }
      const data = await response.json();
      // Filter by current user
      const userProgressData = data.filter(item => item.postOwnerID === userId);
      setProgressData(userProgressData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProgressData();
  }, [userId]);

  // Filter data by date range
  const getFilteredData = () => {
    if (selectedDateRange === 'all') {
      return progressData;
    }
    
    let filteredData = [...progressData];
    
    if (selectedDateRange === 'custom' && dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      
      filteredData = progressData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
      });
    } else if (selectedDateRange === 'month') {
      const today = new Date();
      const monthAgo = new Date();
      monthAgo.setMonth(today.getMonth() - 1);
      
      filteredData = progressData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= monthAgo && itemDate <= today;
      });
    } else if (selectedDateRange === 'week') {
      const today = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);
      
      filteredData = progressData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= weekAgo && itemDate <= today;
      });
    }
    
    return filteredData;
  };
  
  // Get category statistics
  const getCategoryData = () => {
    const filteredData = getFilteredData();
    const categories = {};
    
    filteredData.forEach(item => {
      if (categories[item.category]) {
        categories[item.category]++;
      } else {
        categories[item.category] = 1;
      }
    });
    
    return {
      labels: Object.keys(categories),
      datasets: [
        {
          label: 'Learning Progress by Category',
          data: Object.values(categories),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };
  
  // Get time-based statistics (by month)
  const getTimelineData = () => {
    const filteredData = getFilteredData();
    const months = {};
    
    // Initialize months
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"];
    
    filteredData.forEach(item => {
      const date = new Date(item.date);
      const monthName = monthNames[date.getMonth()];
      
      if (months[monthName]) {
        months[monthName]++;
      } else {
        months[monthName] = 1;
      }
    });
    
    return {
      labels: Object.keys(months),
      datasets: [
        {
          label: 'Learning Progress by Month',
          data: Object.values(months),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Export to PDF
  const exportToPDF = async () => {
    const reportElement = reportRef.current;
    
    // Add print-friendly class before exporting
    reportElement.classList.add('print-friendly');
    
    const canvas = await html2canvas(reportElement);
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('landscape');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('learning-progress-report.pdf');
    
    // Remove print-friendly class after exporting
    reportElement.classList.remove('print-friendly');
  };

  // Export to Excel
  const exportToExcel = () => {
    const filteredData = getFilteredData();
    const worksheet = XLSX.utils.json_to_sheet(filteredData.map(item => ({
      Title: item.title,
      Description: item.description,
      Category: item.category,
      Date: item.date
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Learning Progress");
    XLSX.writeFile(workbook, "learning-progress-report.xlsx");
  };
  
  // Calculate statistics
  const calculateStats = () => {
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) {
      return {
        totalEntries: 0,
        mostCommonCategory: 'N/A',
        averagePerMonth: 0
      };
    }
    
    // Find most common category
    const categoryCount = {};
    filteredData.forEach(item => {
      if (categoryCount[item.category]) {
        categoryCount[item.category]++;
      } else {
        categoryCount[item.category] = 1;
      }
    });
    
    let mostCommonCategory = '';
    let highestCount = 0;
    
    Object.keys(categoryCount).forEach(category => {
      if (categoryCount[category] > highestCount) {
        highestCount = categoryCount[category];
        mostCommonCategory = category;
      }
    });
    
    // Calculate average per month
    const months = {};
    filteredData.forEach(item => {
      const yearMonth = item.date.substring(0, 7); // Format: YYYY-MM
      if (months[yearMonth]) {
        months[yearMonth]++;
      } else {
        months[yearMonth] = 1;
      }
    });
    
    const monthCount = Object.keys(months).length || 1; // Avoid division by zero
    const averagePerMonth = (filteredData.length / monthCount).toFixed(1);
    
    return {
      totalEntries: filteredData.length,
      mostCommonCategory,
      averagePerMonth
    };
  };

  const stats = calculateStats();

  return (
    <div className="glass-container">
      <NavBar />
      <div className="content-wrapper" style={{ padding: '20px' }}>
        <div className="report-header" style={{ 
          marginBottom: '30px', 
          padding: '15px 20px',
          borderRadius: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <div>
              <h2 className="form-title" style={{ 
                fontSize: '28px', 
                margin: '0', 
                color: '#333',
                textShadow: '1px 1px 2px rgba(255,255,255,0.5)'
              }}>Learning Progress Report</h2>
              <p style={{ 
                margin: '8px 0 0 0', 
                color: '#555',
                fontSize: '14px'
              }}>Track and analyze your learning journey over time</p>
            </div>
            <button 
              className="glass-button"
              onClick={fetchProgressData}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                padding: '10px 15px',
                fontSize: '15px',
                fontWeight: '500',
                backgroundColor: 'rgba(72, 187, 120, 0.2)',
                border: '1px solid rgba(72, 187, 120, 0.3)',
                transition: 'all 0.3s ease'
              }}
              title="Refresh Data"
            >
              <FaSync /> Refresh Data
            </button>
          </div>
        </div>
        
        <div className="report-controls" style={{ 
          marginBottom: '20px', 
          display: 'flex', 
          flexDirection: 'column',
          gap: '15px',
        
          padding: '15px', 
          borderRadius: '10px' 
        }}>
          {/* Filter Controls */}
          <div className="control-section" style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FaFilter /> Filter Options
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              <label>Date Range:</label>
              <select 
                className="glass-input transparent-select"
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                style={{ 
                  minWidth: '120px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <option value="all">All Time</option>
                <option value="month">Last Month</option>
                <option value="week">Last Week</option>
                <option value="custom">Custom Range</option>
              </select>
              
              {selectedDateRange === 'custom' && (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    type="date"
                    className="glass-input"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                  <span>to</span>
                  <input
                    type="date"
                    className="glass-input"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Display Options & Export Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
            {/* Chart Type Options */}
            <div className="chart-toggles" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold' }}>Chart Type:</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className={`glass-button ${reportType === 'pie' ? 'active' : ''}`}
                  onClick={() => setReportType('pie')}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '5px',
                    backgroundColor: reportType === 'pie' ? '#e3f2fd' : ''
                  }}
                >
                  <FaChartPie /> Category
                </button>
                <button 
                  className={`glass-button ${reportType === 'bar' ? 'active' : ''}`}
                  onClick={() => setReportType('bar')}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '5px',
                    backgroundColor: reportType === 'bar' ? '#e3f2fd' : ''
                  }}
                >
                  <FaChartBar /> Timeline
                </button>
              </div>
            </div>
            
            {/* Export Options */}
            <div className="export-buttons">
              <div style={{ fontWeight: 'bold', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FaDownload /> Export Report:
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="glass-button"
                  onClick={exportToPDF}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <FaFilePdf /> PDF
                </button>
                <button 
                  className="glass-button"
                  onClick={exportToExcel}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <FaFileExcel /> Excel
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="loading" style={{ textAlign: 'center', padding: '50px', fontSize: '18px', fontWeight: 'bold' }}>
            Loading report data...
          </div>
        ) : (
          <div className="report-content" ref={reportRef} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#2c3e50', fontSize: '24px', fontWeight: 'bold' }}>
              Learning Progress Summary
            </h3>
            
            <div className="stats-container" style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '30px', flexWrap: 'wrap' }}>
              <div className="stat-card" style={{ 
                backgroundColor: '#e3f2fd', 
                borderRadius: '8px', 
                padding: '15px', 
                width: '200px', 
                textAlign: 'center', 
                margin: '10px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                border: '1px solid #bbdefb'
              }}>
                <h4 style={{ color: '#1565c0', marginBottom: '10px' }}>Total Entries</h4>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#0d47a1' }}>{stats.totalEntries}</p>
              </div>
              <div className="stat-card" style={{ 
                backgroundColor: '#e8f5e9', 
                borderRadius: '8px', 
                padding: '15px', 
                width: '200px', 
                textAlign: 'center', 
                margin: '10px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                border: '1px solid #c8e6c9'
              }}>
                <h4 style={{ color: '#2e7d32', marginBottom: '10px' }}>Most Common Category</h4>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#1b5e20' }}>{stats.mostCommonCategory}</p>
              </div>
              <div className="stat-card" style={{ 
                backgroundColor: '#fff8e1', 
                borderRadius: '8px', 
                padding: '15px', 
                width: '200px', 
                textAlign: 'center', 
                margin: '10px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                border: '1px solid #ffecb3'
              }}>
                <h4 style={{ color: '#f57f17', marginBottom: '10px' }}>Avg. Per Month</h4>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#e65100' }}>{stats.averagePerMonth}</p>
              </div>
            </div>
            
            <div className="chart-container" style={{ height: '400px', marginBottom: '30px', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px' }}>
              {progressData.length === 0 ? (
                <div className="no-data" style={{ textAlign: 'center', paddingTop: '150px', color: '#757575', fontSize: '18px' }}>
                  <p>No learning progress data available for the selected time period</p>
                </div>
              ) : reportType === 'pie' ? (
                <Pie data={getCategoryData()} options={{ maintainAspectRatio: false }} />
              ) : (
                <Bar 
                  data={getTimelineData()} 
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0
                        }
                      }
                    }
                  }} 
                />
              )}
            </div>
            
            <div className="entries-list">
              <h4 style={{ marginBottom: '15px', color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '8px' }}>
                Recent Entries
              </h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e0e0e0' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f7fa', borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#34495e' }}>Title</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#34495e' }}>Category</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#34495e' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredData().slice(0, 5).map((item, index) => (
                    <tr key={index} style={{ 
                      borderBottom: '1px solid #ddd',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f5f9ff' 
                    }}>
                      <td style={{ padding: '12px', fontWeight: '500', color: '#333333' }}>{item.title}</td>
                      <td style={{ padding: '12px', color: '#2c3e50' }}>{item.category}</td>
                      <td style={{ padding: '12px', color: '#2c3e50' }}>{item.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Add print-only information that only shows in PDF/print */}
            <div className="print-only-info" style={{ marginTop: '30px', display: 'none', borderTop: '1px dashed #ccc', paddingTop: '15px' }}>
              <p style={{ textAlign: 'center', color: '#333333', fontStyle: 'italic', fontWeight: '500' }}>
                Report generated on {new Date().toLocaleDateString()} | Total records: {stats.totalEntries}
              </p>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
              @media print {
                .print-only-info {
                  display: block !important;
                  color: #000000 !important;
                  font-weight: bold !important;
                }
              }
              
              .print-friendly .stat-card {
                border: 1px solid #000 !important;
                box-shadow: none !important;
              }
              
              .print-friendly table, 
              .print-friendly th, 
              .print-friendly td {
                border: 1px solid #000 !important;
                color: #000000 !important;
              }

              .transparent-select {
                background-color: rgba(255, 255, 255, 0.2) !important;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.3);
              }

              .transparent-select option {
                background-color: rgba(240, 240, 240, 0.9);
                color: #333;
              }

              select.glass-input, input.glass-input {
                background-color: rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.3);
              }
            `}} />
          </div>
        )}
      </div>
    </div>
  );
}

export default LearningProgressReport;
