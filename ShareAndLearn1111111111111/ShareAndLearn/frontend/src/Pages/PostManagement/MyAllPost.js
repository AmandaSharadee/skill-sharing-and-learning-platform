import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoSend } from "react-icons/io5";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { BiSolidLike } from "react-icons/bi";
import Modal from 'react-modal';
import NavBar from '../../Components/NavBar/NavBar';
import { IoIosCreate } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { GrUpdate } from "react-icons/gr";
import { FiSave } from "react-icons/fi";
import { TbPencilCancel } from "react-icons/tb";
import { FaCommentAlt } from "react-icons/fa";
import { BsFillGridFill, BsListUl } from "react-icons/bs";
import './AllPost.css';

Modal.setAppElement('#root');

function MyAllPost() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [postOwners, setPostOwners] = useState({});
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [newComment, setNewComment] = useState({});
  const [editingComment, setEditingComment] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const navigate = useNavigate();
  const loggedInUserID = localStorage.getItem('userID');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/posts');
        const userID = localStorage.getItem('userID');
        const userPosts = response.data.filter((post) => post.userID === userID);
        setPosts(userPosts);
        setFilteredPosts(userPosts);
        const userIDs = [...new Set(userPosts.map((post) => post.userID))];
        const ownerPromises = userIDs.map((userID) =>
          axios.get(`http://localhost:8080/user/${userID}`)
            .then((res) => ({
              userID,
              fullName: res.data.fullname,
            }))
            .catch((error) => {
              console.error(`Error fetching user details for userID ${userID}:`, error);
              return { userID, fullName: 'Anonymous' };
            })
        );
        const owners = await Promise.all(ownerPromises);
        const ownerMap = owners.reduce((acc, owner) => {
          acc[owner.userID] = owner.fullName;
          return acc;
        }, {});
        console.log('Post Owners Map:', ownerMap);
        setPostOwners(ownerMap);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchFollowedUsers = async () => {
      const userID = localStorage.getItem('userID');
      if (userID) {
        try {
          const response = await axios.get(`http://localhost:8080/user/${userID}/followedUsers`);
          setFollowedUsers(response.data);
        } catch (error) {
          console.error('Error fetching followed users:', error);
        }
      }
    };
    fetchFollowedUsers();
  }, []);

  const handleDelete = async (postId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (!confirmDelete) {
      return;
    }
    try {
      await axios.delete(`http://localhost:8080/posts/${postId}`);
      alert('Post deleted successfully!');
      setPosts(posts.filter((post) => post.id !== postId));
      setFilteredPosts(filteredPosts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post.');
    }
  };

  const handleUpdate = (postId) => {
    navigate(`/updatePost/${postId}`);
  };

  const handleMyPostsToggle = () => {
    if (showMyPosts) {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter((post) => post.userID === loggedInUserID));
    }
    setShowMyPosts(!showMyPosts);
  };

  const handleLike = async (postId) => {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      alert('Please log in to like a post.');
      return;
    }
    try {
      const response = await axios.put(`http://localhost:8080/posts/${postId}/like`, null, {
        params: { userID },
      });
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, likes: response.data.likes } : post
        )
      );
      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId ? { ...post, likes: response.data.likes } : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleFollowToggle = async (postOwnerID) => {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      alert('Please log in to follow/unfollow users.');
      return;
    }
    try {
      if (followedUsers.includes(postOwnerID)) {
        await axios.put(`http://localhost:8080/user/${userID}/unfollow`, { unfollowUserID: postOwnerID });
        setFollowedUsers(followedUsers.filter((id) => id !== postOwnerID));
      } else {
        await axios.put(`http://localhost:8080/user/${userID}/follow`, { followUserID: postOwnerID });
        setFollowedUsers([...followedUsers, postOwnerID]);
      }
    } catch (error) {
      console.error('Error toggling follow state:', error);
    }
  };

  const handleAddComment = async (postId) => {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      alert('Please log in to comment.');
      return;
    }
    const content = newComment[postId] || '';
    if (!content.trim()) {
      alert('Comment cannot be empty.');
      return;
    }
    try {
      const response = await axios.post(`http://localhost:8080/posts/${postId}/comment`, {
        userID,
        content,
      });
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, comments: response.data.comments } : post
        )
      );
      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId ? { ...post, comments: response.data.comments } : post
        )
      );
      setNewComment({ ...newComment, [postId]: '' });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    const userID = localStorage.getItem('userID');
    try {
      await axios.delete(`http://localhost:8080/posts/${postId}/comment/${commentId}`, {
        params: { userID },
      });
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: post.comments.filter((comment) => comment.id !== commentId) }
            : post
        )
      );
      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: post.comments.filter((comment) => comment.id !== commentId) }
            : post
        )
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleSaveComment = async (postId, commentId, content) => {
    try {
      const userID = localStorage.getItem('userID');
      await axios.put(`http://localhost:8080/posts/${postId}/comment/${commentId}`, {
        userID,
        content,
      });
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment.id === commentId ? { ...comment, content } : comment
                ),
              }
            : post
        )
      );
      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment.id === commentId ? { ...comment, content } : comment
                ),
              }
            : post
        )
      );
      setEditingComment({});
    } catch (error) {
      console.error('Error saving comment:', error);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        (post.category && post.category.toLowerCase().includes(query))
    );
    setFilteredPosts(filtered);
  };

  const openModal = (mediaUrl) => {
    setSelectedMedia(mediaUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMedia(null);
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
              placeholder="Search posts..."
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
              onClick={() => (window.location.href = '/addNewPost')}
              className="new-post-button"
            >
              <IoIosCreate size={20} />
              <span>New Post</span>
            </button>
          </div>

          <div className={`posts-container ${viewMode}`}>
            {filteredPosts.length === 0 ? (
              <div className="empty-posts">
                <p>No posts found. Please create a new post.</p>
                <button 
                  onClick={() => (window.location.href = '/addNewPost')}
                  className="create-post-button"
                >
                  Create New Post
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div key={post.id} className="post-card">
                  <div className="user-details-card">
                    <div className="name-section-post">
                      <p className="post-owner-name">{postOwners[post.userID] || 'Anonymous'}</p>
                      {post.userID !== loggedInUserID && (
                        <button
                          className={`follow-button ${followedUsers.includes(post.userID) ? 'following' : ''}`}
                          onClick={() => handleFollowToggle(post.userID)}
                        >
                          {followedUsers.includes(post.userID) ? 'Unfollow' : 'Follow'}
                        </button>
                      )}
                    </div>
                    {post.userID === loggedInUserID && (
                      <div className="action-buttons">
                        <FaEdit
                          onClick={() => handleUpdate(post.id)} 
                          className="action-btn-icon" 
                        />
                        <RiDeleteBin6Fill
                          onClick={() => handleDelete(post.id)}
                          className="action-btn-icon" 
                        />
                      </div>
                    )}
                  </div>
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-description">{post.description}</p>
                  <p className="post-category">Category: {post.category || 'Uncategorized'}</p>
                  <div className="media-collage">
                    {post.media.slice(0, 4).map((mediaUrl, index) => (
                      <div
                        key={index}
                        className={`media-item ${post.media.length > 4 && index === 3 ? 'media-overlay' : ''}`}
                        onClick={() => openModal(mediaUrl)}
                      >
                        {mediaUrl.endsWith('.mp4') ? (
                          <video controls>
                            <source src={`http://localhost:8080${mediaUrl}`} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <img src={`http://localhost:8080${mediaUrl}`} alt="Post Media" />
                        )}
                        {post.media.length > 4 && index === 3 && (
                          <div className="overlay-text">+{post.media.length - 4}</div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="like-comment-section">
                    <div className="like-button-container">
                      <BiSolidLike
                        className={post.likes?.[localStorage.getItem('userID')] ? 'unlikebtn' : 'likebtn'}
                        onClick={() => handleLike(post.id)}
                      />
                      <span className="like-count">
                        {Object.values(post.likes || {}).filter((liked) => liked).length}
                      </span>
                    </div>
                    <div className="comment-button-container">
                      <FaCommentAlt className="comment-btn" />
                      <span className="comment-count">{post.comments?.length || 0}</span>
                    </div>
                  </div>
                  <div className="comments-section">
                    <div className="add-comment-container">
                      <input
                        type="text"
                        className="add-comment-input"
                        placeholder="Write a comment..."
                        value={newComment[post.id] || ''}
                        onChange={(e) =>
                          setNewComment({ ...newComment, [post.id]: e.target.value })
                        }
                      />
                      <IoSend
                        onClick={() => handleAddComment(post.id)}
                        className="send-comment-icon"
                      />
                    </div>
                    {post.comments?.map((comment) => (
                      <div key={comment.id} className="comment-details">
                        <p>{comment.userFullName}</p>
                        {editingComment.id === comment.id ? (
                          <input
                            type="text"
                            className="edit-comment-input"
                            value={editingComment.content}
                            onChange={(e) =>
                              setEditingComment({ ...editingComment, content: e.target.value })
                            }
                            autoFocus
                          />
                        ) : (
                          <p className="comment-content">{comment.content}</p>
                        )}
                        <div className="comment-action-buttons">
                          {comment.userID === loggedInUserID && (
                            <>
                              {editingComment.id === comment.id ? (
                                <>
                                  <FiSave
                                    onClick={() =>
                                      handleSaveComment(post.id, comment.id, editingComment.content)
                                    }
                                    className="comment-btn"
                                  />
                                  <TbPencilCancel
                                    onClick={() => setEditingComment({})}
                                    className="comment-btn"
                                  />
                                </>
                              ) : (
                                <>
                                  <GrUpdate
                                    onClick={() =>
                                      setEditingComment({ id: comment.id, content: comment.content })
                                    }
                                    className="comment-btn"
                                  />
                                  <MdDelete
                                    onClick={() => handleDeleteComment(post.id, comment.id)}
                                    className="comment-btn"
                                  />
                                </>
                              )}
                            </>
                          )}
                          {post.userID === loggedInUserID && comment.userID !== loggedInUserID && (
                            <button
                              className="comment-delete-btn"
                              onClick={() => handleDeleteComment(post.id, comment.id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
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
        contentLabel="Media Modal"
        className="media-modal"
        overlayClassName="media-modal-overlay"
      >
        <button className="close-modal-btn" onClick={closeModal}>×</button>
        {selectedMedia && selectedMedia.endsWith('.mp4') ? (
          <video controls className="modal-media">
            <source src={`http://localhost:8080${selectedMedia}`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img src={`http://localhost:8080${selectedMedia}`} alt="Full Media" className="modal-media" />
        )}
      </Modal>
    </div>
  );
}

export default MyAllPost;
