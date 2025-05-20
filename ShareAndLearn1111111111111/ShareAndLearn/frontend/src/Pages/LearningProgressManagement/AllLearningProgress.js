import React, { useEffect, useState } from 'react';
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import NavBar from '../../Components/NavBar/NavBar';
import { IoIosCreate } from "react-icons/io";
import { BsFillGridFill, BsListUl } from "react-icons/bs";
import { FaChartLine } from "react-icons/fa";
import Modal from 'react-modal';

Modal.setAppElement('#root');

function AllLearningProgress() { //USE STATE MANAGEMENT
  const [progressData, setProgressData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [isModalOpen, setIsModalOpen] = useState(false); //Controls the visibility of the image modal.
  const [selectedImage, setSelectedImage] = useState(null);//Stores the image to display in the modal.
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    fetch('http://localhost:8080/learningprogress')
      .then((response) => response.json())
      .then((data) => {
        setProgressData(data);
        setFilteredData(data);
      })
      .catch((error) => console.error('Error fetching LearningProgress data:', error));
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = progressData.filter(
      (learningprogress) =>
        learningprogress.title.toLowerCase().includes(query) ||
        learningprogress.description.toLowerCase().includes(query)
    );
    setFilteredData(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Learning Progress?')) {
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

  const openModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setIsModalOpen(false);
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
              placeholder="Search learningprogress by title or description"
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
              <span>New Learning Progress</span>
            </button>
            <button 
              onClick={() => (window.location.href = '/learningProgressReport')}
              className="new-post-button"
              style={{ marginLeft: '10px', backgroundColor: '#4CAF50' }}
            >
              <FaChartLine size={20} />
              <span>Analytics</span>
            </button>
          </div>

          <div className={`posts-container ${viewMode}`}>
            {filteredData.length === 0 ? (
              <div className="empty-posts">
                <p>No learningprogress found. Please create a new learning progress.</p>
                <button 
                  onClick={() => (window.location.href = '/addLearningProgress')}
                  className="create-post-button"
                >
                  Create New Learning Progress
                </button>
              </div>
            ) : (
              filteredData.map((progress) => (
                <div key={progress.id} className="post-card">
                  <div className="user-details-card">
                    <div className="name-section-post">
                      <p className="post-owner-name">{progress.postOwnerName}</p>
                      <p className="post-date">{progress.date}</p>
                    </div>
                    {progress.postOwnerID === userId && (
                      <div className="action-buttons">
                        <FaEdit
                          onClick={() => (window.location.href = `/updateLearningProgress/${progress.id}`)}
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
                    <p className="post-description">{progress.description}</p>
                    {progress.imageUrl && (
                      <div className="media-item" onClick={() => openModal(`http://localhost:8080/learningprogress/images/${progress.imageUrl}`)}>
                        <img 
                          src={`http://localhost:8080/learningprogress/images/${progress.imageUrl}`}
                          alt="Learning Progress"
                          className="post-image"
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
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Image Modal"
        className="media-modal"
        overlayClassName="media-modal-overlay"
      >
        <button className="close-modal-btn" onClick={closeModal}>×</button>
        <img src={selectedImage} alt="Full size" className="modal-media" />
      </Modal>
    </div>
  );
}

export default AllLearningProgress;
