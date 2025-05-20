import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './post.css';
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { IoIosCreate } from "react-icons/io";
import NavBar from '../../Components/NavBar/NavBar';
import { HiCalendarDateRange } from "react-icons/hi2";
import { BsFillGridFill, BsListUl } from "react-icons/bs";
import { FaChartLine } from "react-icons/fa";

function MyLearningPlan() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchOwnerName, setSearchOwnerName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/learningplan');
        const userPosts = response.data.filter(post => post.postOwnerID === userId); // Filter posts by userID
        setPosts(userPosts);
        setFilteredPosts(userPosts); // Initially show filtered posts
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []); // Ensure this runs only once on component mount

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
      return url; // Return the original URL if it's not a YouTube link
    } catch (error) {
      console.error('Invalid URL:', url);
      return ''; // Return an empty string for invalid URLs
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:8080/learningplan/${id}`);
        alert('Post deleted successfully!');
        setFilteredPosts(filteredPosts.filter((post) => post.id !== id)); // Update the list after deletion
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post.');
      }
    }
  };

  const handleUpdate = (id) => {
    window.location.href = `/updateLearningPlan/${id}`;
  };

  const handleView = (id) => {
    window.location.href = `/learningPlanSummary/${id}`;
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query)
    );
    setFilteredPosts(filtered);
  };

  const renderPostByTemplate = (post) => {
    console.log('Rendering post:', post); // Debugging: Log the post object
    if (!post.templateID) { // Use the correct field name
      console.warn('Missing templateID for post:', post); // Warn if templateID is missing
      return <div className="template template-default">Invalid template ID</div>;
    }

    switch (post.templateID) { // Use the correct field name
      case 1:
        return (
          <div className="template_dis template-1">
            <div className='user_details_card'>
              <div>
                <div className='name_section_post'>
                  <p className='name_section_post_owner_name'>{post.postOwnerName}</p>
                </div>
              </div>
              {post.postOwnerID === localStorage.getItem('userID') && (
                <div className='action_btn_icon_post'>
                  <FaEdit
                    onClick={() => handleUpdate(post.id)} className='action_btn_icon' />
                  <RiDeleteBin6Fill
                    onClick={() => handleDelete(post.id)}
                    className='action_btn_icon' />
                  <FaChartLine 
                    onClick={() => handleView(post.id)} 
                    className='action_btn_icon' 
                    title="View Summary"
                  />
                </div>
              )}
            </div>
            <p className='template_title'>{post.title}</p>
            <p className='template_dates'><HiCalendarDateRange /> {post.startDate} to {post.endDate} </p>
            <p className='template_description'>{post.category}</p>
            <hr></hr>
            <p className='template_description' style={{ whiteSpace: "pre-line" }}>{post.description}</p>
            <div className="tags_preview">
              {post.tags?.map((tag, index) => (
                <span key={index} className="tagname">#{tag}</span>
              ))}
            </div>
            {post.imageUrl && (
              <img
                src={`http://localhost:8080/learningplan/planImages/${post.imageUrl}`}
                alt={post.title}
                className="iframe_preview_dis"
              />
            )}
            {post.contentURL && (
              <iframe
                src={getEmbedURL(post.contentURL)}
                title={post.title}
                className="iframe_preview_dis"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            )}
          </div>
        );
      case 2:
        return (
          <div className="template_dis template-2">
            <div className='user_details_card'>
              <div>
                <div className='name_section_post'>
                  <p className='name_section_post_owner_name'>{post.postOwnerName}</p>
                </div>
                
              </div>
              {post.postOwnerID === localStorage.getItem('userID') && (
                <div className='action_btn_icon_post'>
                  <FaEdit
                    onClick={() => handleUpdate(post.id)} className='action_btn_icon' />
                  <RiDeleteBin6Fill
                    onClick={() => handleDelete(post.id)}
                    className='action_btn_icon' />
                  <FaChartLine 
                    onClick={() => handleView(post.id)} 
                    className='action_btn_icon' 
                    title="View Summary"
                  />
                </div>
              )}
            </div>
            <p className='template_title'>{post.title}</p>
            <p className='template_dates'><HiCalendarDateRange /> {post.startDate} to {post.endDate} </p>
            <p className='template_description'>{post.category}</p>
            <hr></hr>
            <p className='template_description' style={{ whiteSpace: "pre-line" }}>{post.description}</p>
            <div className="tags_preview">
              {post.tags?.map((tag, index) => (
                <span key={index} className="tagname">#{tag}</span>
              ))}
            </div>
            <div className='preview_part'>
              <div className='preview_part_sub'>
                {post.imageUrl && (
                  <img
                    src={`http://localhost:8080/learningplan/planImages/${post.imageUrl}`}
                    alt={post.title}
                    className="iframe_preview"
                  />
                )}
              </div>
              <div className='preview_part_sub'>
                {post.contentURL && (
                  <iframe
                    src={getEmbedURL(post.contentURL)}
                    title={post.title}
                    className="iframe_preview"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                )}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="template_dis template-3">
            <div className='user_details_card'>
              <div>
                <div className='name_section_post'>
                  <p className='name_section_post_owner_name'>{post.postOwnerName}</p>
                </div>
                
              </div>
              {post.postOwnerID === localStorage.getItem('userID') && (
                <div className='action_btn_icon_post'>
                  <FaEdit
                    onClick={() => handleUpdate(post.id)} className='action_btn_icon' />
                  <RiDeleteBin6Fill
                    onClick={() => handleDelete(post.id)}
                    className='action_btn_icon' />
                  <FaChartLine 
                    onClick={() => handleView(post.id)} 
                    className='action_btn_icon' 
                    title="View Summary"
                  />
                </div>
              )}
            </div>
            {post.imageUrl && (
              <img
                src={`http://localhost:8080/learningplan/planImages/${post.imageUrl}`}
                alt={post.title}
                className="iframe_preview_dis"
              />
            )}
            {post.contentURL && (
              <iframe
                src={getEmbedURL(post.contentURL)}
                title={post.title}
                className="iframe_preview_dis"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            )}
            <p className='template_title'>{post.title}</p>
            <p className='template_dates'><HiCalendarDateRange /> {post.startDate} to {post.endDate} </p>
            <p className='template_description'>{post.category}</p>
            <hr></hr>
            <p className='template_description' style={{ whiteSpace: "pre-line" }}>{post.description}</p>
            <div className="tags_preview">
              {post.tags?.map((tag, index) => (
                <span key={index} className="tagname">#{tag}</span>
              ))}
            </div>
          </div>
        );
      default:
        console.warn('Unknown templateID:', post.templateID); // Warn if templateID is unexpected
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
              placeholder="Search learning plans..."
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
              onClick={() => (window.location.href = '/addLearningPlan')}
              className="new-post-button"
            >
              <IoIosCreate size={20} />
              <span>New Learning Plan</span>
            </button>
            <button 
              onClick={() => (window.location.href = `/learningPlanSummary/${userId}`)}
              className="new-post-button"
              style={{ marginLeft: '10px', backgroundColor: '#4CAF50' }}
            >
              <FaChartLine size={20} />
              <span>Analytics</span>
            </button>
          </div>

          <div className={`posts-container ${viewMode}`}>
            {filteredPosts.length === 0 ? (
              <div className="empty-posts">
                <p>No learning plans found. Please create a new one.</p>
                <button 
                  onClick={() => (window.location.href = '/addLearningPlan')}
                  className="create-post-button"
                >
                  Create New Learning Plan
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div key={post.id} className={`post-card ${viewMode}`}>
                  {renderPostByTemplate(post)}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyLearningPlan;
