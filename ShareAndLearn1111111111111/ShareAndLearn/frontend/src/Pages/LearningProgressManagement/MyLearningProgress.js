import React, { useEffect, useState } from 'react';
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import NavBar from '../../Components/NavBar/NavBar';
import { IoIosCreate } from "react-icons/io";
import { BsFillGridFill, BsListUl } from "react-icons/bs";
import { FaChartLine } from "react-icons/fa";
import '../PostManagement/AllPost.css';

function MyLearningProgress() {
  const [progressData, setProgressData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    fetch('http://localhost:8080/learningprogress')
      .then((response) => response.json())
      .then((data) => {
        const userFilteredData = data.filter((achievement) => achievement.postOwnerID === userId);
        setProgressData(userFilteredData);
        setFilteredData(userFilteredData);
      })
      .catch((error) => console.error('Error fetching LearningProgress data:', error));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this LearningProgress?')) {
      try {
        const response = await fetch(`http://localhost:8080/learningprogress/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('LearningProgress deleted successfully!');
          setFilteredData(filteredData.filter((progress) => progress.id !== id));
        } else {
          alert('Failed to delete LearningProgress.');
        }
      } catch (error) {
        console.error('Error deleting LearningProgress:', error);
      }
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = progressData.filter(
      (progress) =>
        progress.title.toLowerCase().includes(query) ||
        progress.description.toLowerCase().includes(query)
    );
    setFilteredData(filtered);
  };

  return (
    <div className="post-page">
      <NavBar />
      <div className="container">
        <div className="content-wrapper">
          <div className="search-section">
            <input
              type="text"
              className="search-input"
              placeholder="Search progress..."
              value={searchQuery}
              onChange={handleSearch}
            />
            <div className="view-toggle">
              <button
                onClick={() => setViewMode('grid')}
                className={`view-toggle-button ${viewMode === 'grid' ? 'active' : ''}`}
              >
                <BsFillGridFill size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`view-toggle-button ${viewMode === 'list' ? 'active' : ''}`}
              >
                <BsListUl size={20} />
              </button>
            </div>
            <button 
              onClick={() => (window.location.href = '/addLearningProgress')}
              className="new-post-button"
            >
              <IoIosCreate size={20} />
              <span>New Progress</span>
            </button>
            <button 
              onClick={() => (window.location.href = '/learningProgressReport')}
              className="new-post-button"
              style={{ marginLeft: '10px', backgroundColor: '#4CAF50' }}
            >
              <FaChartLine size={20} />
              <span>View Reports</span>
            </button>
          </div>

          <div className={`posts-container ${viewMode}`}>
            {filteredData.length === 0 ? (
              <div className="empty-posts">
                <p>No progress entries found. Please create a new entry.</p>
                <button 
                  onClick={() => (window.location.href = '/addLearningProgress')}
                  className="create-post-button"
                >
                  Create New Progress Entry
                </button>
              </div>
            ) : (
              filteredData.map((progress) => (
                <div key={progress.id} className="post-card">
                  <div className="user-details-card">
                    <div className="name-section-post">
                      <p className="post-owner-name">{progress.postOwnerName}</p>
                      <span className="post-date">{progress.date}</span>
                    </div>
                    {progress.postOwnerID === userId && (
                      <div className="action-buttons">
                        <FaEdit
                          onClick={() => window.location.href = `/updateLearningProgress/${progress.id}`}
                          className="action-btn-icon"
                        />
                        <RiDeleteBin6Fill
                          onClick={() => handleDelete(progress.id)}
                          className="action-btn-icon"
                        />
                      </div>
                    )}
                  </div>
                  <div className="post-details">
                    <h3 className="post-title">{progress.title}</h3>
                    <p className="post-description" style={{ whiteSpace: "pre-line" }}>
                      {progress.description}
                    </p>
                    {progress.imageUrl && (
                      <div className="media-item">
                        <img
                          src={`http://localhost:8080/learningprogress/images/${progress.imageUrl}`}
                          alt="Progress"
                          className="media-image"
                        />
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
  );
}

export default MyLearningProgress;
