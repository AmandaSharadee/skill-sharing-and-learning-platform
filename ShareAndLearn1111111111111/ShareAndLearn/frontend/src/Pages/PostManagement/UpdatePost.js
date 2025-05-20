import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../../Components/NavBar/NavBar';

function UpdatePost() {
  const { id } = useParams(); // Get the post ID from the URL
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(''); // New state for category
  const [existingMedia, setExistingMedia] = useState([]); // Initialize as an empty array
  const [newMedia, setNewMedia] = useState([]); // New media files to upload
  const [newMediaPreviews, setNewMediaPreviews] = useState([]); // Add this state
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    // Fetch the post details
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/posts/${id}`);
        const post = response.data;
        setTitle(post.title || ''); // Ensure title is not undefined
        setDescription(post.description || ''); // Ensure description is not undefined
        setCategory(post.category || ''); // Set category
        setExistingMedia(post.media || []); // Ensure media is an array
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error('Error fetching post:', error);
        alert('Failed to fetch post details.');
        setLoading(false); // Set loading to false even if there's an error
      }
    };

    fetchPost();
  }, [id]);

  const handleDeleteMedia = async (mediaUrl) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this media file?');
    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/posts/${id}/media`, {
        data: { mediaUrl },
      });
      setExistingMedia(existingMedia.filter((url) => url !== mediaUrl)); // Remove from UI
      alert('Media file deleted successfully!');
    } catch (error) {
      console.error('Error deleting media file:', error);
      alert('Failed to delete media file.');
    }
  };

  const validateVideoDuration = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        if (video.duration > 30) {
          reject(`Video ${file.name} exceeds the maximum duration of 30 seconds.`);
        } else {
          resolve();
        }
      };

      video.onerror = () => {
        reject(`Failed to load video metadata for ${file.name}.`);
      };
    });
  };

  const validateMedia = async (files) => {
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    const maxImageCount = 3;
    const maxVideoCount = 1;

    let totalImageCount = existingMedia.filter(url => !url.endsWith('.mp4')).length;
    let totalVideoCount = existingMedia.filter(url => url.endsWith('.mp4')).length;

    const newImageCount = files.filter(file => file.type.startsWith('image/')).length;
    const newVideoCount = files.filter(file => file.type === 'video/mp4').length;

    if (totalImageCount + newImageCount > maxImageCount) {
      throw new Error(`Maximum ${maxImageCount} images allowed. You can only add ${maxImageCount - totalImageCount} more images.`);
    }

    if (totalVideoCount + newVideoCount > maxVideoCount) {
      throw new Error(`Maximum ${maxVideoCount} video allowed. You cannot add more videos.`);
    }

    for (const file of files) {
      if (file.size > maxFileSize) {
        throw new Error(`File ${file.name} exceeds the maximum size of 50MB.`);
      }

      if (!file.type.startsWith('image/') && file.type !== 'video/mp4') {
        throw new Error(`Unsupported file type: ${file.type}`);
      }

      if (file.type === 'video/mp4') {
        await validateVideoDuration(file);
      }
    }
  };

  const handleNewMediaChange = async (e) => {
    try {
      const files = Array.from(e.target.files);
      await validateMedia(files);
      setNewMedia(files);

      // Create previews for new files
      const previews = files.map(file => ({
        url: URL.createObjectURL(file),
        type: file.type
      }));
      setNewMediaPreviews(previews);
    } catch (error) {
      e.target.value = '';
      alert(error.message);
    }
  };

  // Add cleanup for preview URLs
  useEffect(() => {
    return () => {
      newMediaPreviews.forEach(preview => URL.revokeObjectURL(preview.url));
    };
  }, [newMediaPreviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      newMedia.forEach((file) => formData.append('newMediaFiles', file));

      await axios.put(`http://localhost:8080/posts/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Post updated successfully!');
      navigate('/allPost');
    } catch (error) {
      console.error('Error updating post:', error);
      alert(error.response?.data?.message || 'Failed to update post.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className=''>
        <NavBar/>
        <div className='glass-container'>
          <div className="glass-form">
            <h2 className="form-title">Update Post</h2>
            <form onSubmit={handleSubmit} className="Auth_form">
              <div className="Auth_formGroup">
                <label className="Auth_label">Title</label>
                <input
                  className="glass-input"
                  type="text"
                  placeholder="Enter post title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="Auth_formGroup">
                <label className="Auth_label">Description</label>
                <textarea
                  className="glass-input"
                  placeholder="Enter post description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                />
              </div>
              <div className="Auth_formGroup">
                <label className="Auth_label">Category</label>
                <select
                  className="glass-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="" disabled>Select Category</option>
                  <option value="Tech">Tech</option>
                  <option value="Programming">Programming</option>
                  <option value="Cooking">Cooking</option>
                  <option value="Photography">Photography</option>
                </select>
              </div>
              <div className="Auth_formGroup">
                <label className="Auth_label">Media</label>
                <div className='seket_media'>
                  {existingMedia.map((mediaUrl, index) => (
                    <div key={`existing-${index}`} className="media-preview">
                      {mediaUrl.endsWith('.mp4') ? (
                        <video controls className='media_file_se glass-input'>
                          <source src={`http://localhost:8080${mediaUrl}`} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img className='media_file_se glass-input' src={`http://localhost:8080${mediaUrl}`} alt={`Media ${index}`} />
                      )}
                      <button
                        className='rem_btn'
                        type="button"
                        onClick={() => handleDeleteMedia(mediaUrl)}
                      >
                        X
                      </button>
                    </div>
                  ))}
                  {newMediaPreviews.map((preview, index) => (
                    <div key={`preview-${index}`} className="media-preview">
                      {preview.type === 'video/mp4' ? (
                        <video controls className='media_file_se glass-input'>
                          <source src={preview.url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img className='media_file_se glass-input' src={preview.url} alt={`New media ${index}`} />
                      )}
                      <button
                        className='rem_btn'
                        type="button"
                        onClick={() => {
                          URL.revokeObjectURL(preview.url);
                          setNewMediaPreviews(prev => prev.filter((_, i) => i !== index));
                          setNewMedia(prev => prev.filter((_, i) => i !== index));
                        }}
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  className="glass-input"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,video/mp4"
                  multiple
                  onChange={handleNewMediaChange}
                />
              </div>
              <button type="submit" className="glass-button">Update Post</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdatePost;
