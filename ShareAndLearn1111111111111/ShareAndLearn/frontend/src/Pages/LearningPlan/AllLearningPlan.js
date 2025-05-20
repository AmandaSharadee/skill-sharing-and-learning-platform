import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './post.css';
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { IoIosCreate } from "react-icons/io";
import { BsFillGridFill, BsListUl } from "react-icons/bs";
import { MdOutlineAnalytics } from "react-icons/md";
import Modal from 'react-modal';
import NavBar from '../../Components/NavBar/NavBar';
import { HiCalendarDateRange } from "react-icons/hi2";
Modal.setAppElement('#root');

function AllLearningPlan() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchOwnerName, setSearchOwnerName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/learningplan');
        setPosts(response.data);
        setFilteredPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  const getEmbedURL = (url) => {
    try {
      if (url.includes('youtube.com/watch')) {
        const videoId = new URL(url).searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return url;
    } catch (error) {
      console.error('Invalid URL:', url);
      return '';
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:8080/learningplan/${id}`);
        alert('Post deleted successfully!');
        setFilteredPosts(filteredPosts.filter((post) => post.id !== id));
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post.');
      }
    }
  };

  const handleUpdate = (id) => {
    window.location.href = `/updateLearningPlan/${id}`;
  };

  const openModal = (mediaUrl) => {
    setSelectedMedia(mediaUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMedia(null);
    setIsModalOpen(false);
  };

  const renderPostByTemplate = (post) => {
    if (!post.templateID) {
      return <div className="template template-default">Invalid template ID</div>;
    }

    switch (post.templateID) {
      case 1:
        return (
          <div className="post-card">
            <div className='user-details-card'>
              <div className='name-section-post'>
                <p className='post-owner-name'>{post.postOwnerName}</p>
              </div>
              {post.postOwnerID === localStorage.getItem('userID') && (
                <div className='action-buttons'>
                  <FaEdit onClick={() => handleUpdate(post.id)} className='action-btn-icon' />
                  <RiDeleteBin6Fill onClick={() => handleDelete(post.id)} className='action-btn-icon' />
                </div>
              )}
            </div>
            <div className="post-details">
              <h3 className="post-title">{post.title}</h3>
              <p className="post-dates"><HiCalendarDateRange /> {post.startDate} to {post.endDate}</p>
              <p className="post-category">Category: {post.category}</p>
              <p className="post-description">{post.description}</p>
            </div>
            <div className="media-collage">
              {post.imageUrl && (
                <div className="media-item" onClick={() => openModal(`http://localhost:8080/learningplan/planImages/${post.imageUrl}`)}>
                  <img src={`http://localhost:8080/learningplan/planImages/${post.imageUrl}`} alt={post.title} />
                </div>
              )}
              {post.contentURL && (
                <div className="media-item">
                  <iframe src={getEmbedURL(post.contentURL)} title={post.title} frameBorder="0" allowFullScreen></iframe>
                </div>
              )}
            </div>
            <div className="tags-preview">
              {post.tags?.map((tag, index) => (
                <span key={index} className="tag">#{tag}</span>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="post-card">
            <div className='user-details-card'>
              <div className='name-section-post'>
                <p className='post-owner-name'>{post.postOwnerName}</p>
              </div>
              {post.postOwnerID === localStorage.getItem('userID') && (
                <div className='action-buttons'>
                  <FaEdit onClick={() => handleUpdate(post.id)} className='action-btn-icon' />
                  <RiDeleteBin6Fill onClick={() => handleDelete(post.id)} className='action-btn-icon' />
                </div>
              )}
            </div>
            <div className="post-details">
              <h3 className="post-title">{post.title}</h3>
              <p className="post-dates"><HiCalendarDateRange /> {post.startDate} to {post.endDate}</p>
              <p className="post-category">Category: {post.category}</p>
              <p className="post-description">{post.description}</p>
            </div>
            <div className="media-collage">
              {post.imageUrl && (
                <div className="media-item" onClick={() => openModal(`http://localhost:8080/learningplan/planImages/${post.imageUrl}`)}>
                  <img src={`http://localhost:8080/learningplan/planImages/${post.imageUrl}`} alt={post.title} />
                </div>
              )}
              {post.contentURL && (
                <div className="media-item">
                  <iframe src={getEmbedURL(post.contentURL)} title={post.title} frameBorder="0" allowFullScreen></iframe>
                </div>
              )}
            </div>
            <div className="tags-preview">
              {post.tags?.map((tag, index) => (
                <span key={index} className="tag">#{tag}</span>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="post-card">
            <div className='user-details-card'>
              <div className='name-section-post'>
                <p className='post-owner-name'>{post.postOwnerName}</p>
              </div>
              {post.postOwnerID === localStorage.getItem('userID') && (
                <div className='action-buttons'>
                  <FaEdit onClick={() => handleUpdate(post.id)} className='action-btn-icon' />
                  <RiDeleteBin6Fill onClick={() => handleDelete(post.id)} className='action-btn-icon' />
                </div>
              )}
            </div>
            <div className="post-details">
              <h3 className="post-title">{post.title}</h3>
              <p className="post-dates"><HiCalendarDateRange /> {post.startDate} to {post.endDate}</p>
              <p className="post-category">Category: {post.category}</p>
              <p className="post-description">{post.description}</p>
            </div>
            <div className="media-collage">
              {post.imageUrl && (
                <div className="media-item" onClick={() => openModal(`http://localhost:8080/learningplan/planImages/${post.imageUrl}`)}>
                  <img src={`http://localhost:8080/learningplan/planImages/${post.imageUrl}`} alt={post.title} />
                </div>
              )}
              {post.contentURL && (
                <div className="media-item">
                  <iframe src={getEmbedURL(post.contentURL)} title={post.title} frameBorder="0" allowFullScreen></iframe>
                </div>
              )}
            </div>
            <div className="tags-preview">
              {post.tags?.map((tag, index) => (
                <span key={index} className="tag">#{tag}</span>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="template template-default">
            <p>Unknown template ID: {post.templateID}</p>
          </div>
        );
    }
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
              placeholder="Search by owner name..."
              value={searchOwnerName}
              onChange={(e) => {
                const value = e.target.value;
                setSearchOwnerName(value);
                setFilteredPosts(
                  posts.filter((post) =>
                    post.postOwnerName.toLowerCase().includes(value.toLowerCase())
                  )
                );
              }}
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
              onClick={() => (window.location.href = '/addLearningPlan')}
              className="new-post-button"
            >
              <IoIosCreate size={20} />
              <span>New Plan</span>
            </button>
          </div>

          <div className={`posts-container ${viewMode}`}>
            {filteredPosts.length === 0 ? (
              <div className="empty-posts">
                <p>No posts found. Please create a new learning plan.</p>
                <button onClick={() => (window.location.href = '/addLearningPlan')} className="create-post-button">
                  Create New Plan
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div key={post.id} className='post-card'>
                  {renderPostByTemplate(post)}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Media Modal"
        className="media-modal"
        overlayClassName="media-modal-overlay"
      >
        <button className="close-modal-btn" onClick={closeModal}>×</button>
        {selectedMedia && (
          <img src={selectedMedia} alt="Full Media" className="modal-media" />
        )}
      </Modal>
    </div>
  );
}

export default AllLearningPlan;