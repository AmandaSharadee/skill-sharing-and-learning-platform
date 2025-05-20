import React, { useState } from 'react';
import axios from 'axios';
import NavBar from '../../Components/NavBar/NavBar';
import '../UserManagement/user.css';

function AddNewPost() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [categories, setCategories] = useState('');
  const userID = localStorage.getItem('userID');

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    const maxFileSize = 50 * 1024 * 1024;

    let imageCount = 0;
    let videoCount = 0;
    const previews = [];

    for (const file of files) {
      if (file.size > maxFileSize) {
        alert(`File ${file.name} exceeds the maximum size of 50MB.`);
        window.location.reload();
      }

      if (file.type.startsWith('image/')) {
        imageCount++;
      } else if (file.type === 'video/mp4') {
        videoCount++;

        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);

        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
          if (video.duration > 30) {
            alert(`Video ${file.name} exceeds the maximum duration of 30 seconds.`);
            window.location.reload();
          }
        };
      } else {
        alert(`Unsupported file type: ${file.type}`);
        window.location.reload();
      }

      previews.push({ type: file.type, url: URL.createObjectURL(file) });
    }

    if (imageCount > 3) {
      alert('You can upload a maximum of 3 images.');
      window.location.reload();
    }

    if (videoCount > 1) {
      alert('You can upload only 1 video.');
      window.location.reload();
    }

    setMedia(files);
    setMediaPreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('userID', userID);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', categories);
    media.forEach((file, index) => formData.append(`mediaFiles`, file));

    try {
      const response = await axios.post('http://localhost:8080/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Post created successfully!');
      window.location.href = '/myAllPost';
    } catch (error) {
      console.error(error);
      alert('Failed to create post.');
      window.location.reload();
    }
  };

  return (
    <div>
      <div className=''>
        <NavBar />
        <div className='glass-container'>
          <div className="glass-form">
            <h2 className="form-title">Create New Post</h2>
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
                  value={categories}
                  onChange={(e) => setCategories(e.target.value)}
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
                  {mediaPreviews.map((preview, index) => (
                    <div key={index}>
                      {preview.type.startsWith('video/') ? (
                        <video controls className='media_file_se glass-input'>
                          <source src={preview.url} type={preview.type} />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img className='media_file_se glass-input' src={preview.url} alt={`Media Preview ${index}`} />
                      )}
                    </div>
                  ))}
                </div>
                <input
                  className="glass-input"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,video/mp4"
                  multiple
                  onChange={handleMediaChange}
                />
              </div>
              <button type="submit" className="glass-button">Create Post</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddNewPost;
