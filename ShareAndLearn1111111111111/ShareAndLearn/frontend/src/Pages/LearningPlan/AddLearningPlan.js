import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import './post.css';
import './Templates.css'; // Import the updated CSS file
import NavBar from '../../Components/NavBar/NavBar';
import { FaVideo } from "react-icons/fa";
import { FaImage } from "react-icons/fa";
import { HiCalendarDateRange } from "react-icons/hi2";

function AddLearningPlan() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentURL, setContentURL] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContentURLInput, setShowContentURLInput] = useState(false);
  const [showImageUploadInput, setShowImageUploadInput] = useState(false);
  const [templateID, setTemplateID] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const navigate = useNavigate();

  const handleAddTag = () => {
    if (tagInput.trim() !== '') {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleTemplateSelect = (id) => {
    setTemplateID(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (startDate === endDate) {
      alert("Start date and end date cannot be the same.");
      setIsSubmitting(false);
      return;
    }

    if (startDate > endDate) {
      alert("Start date cannot be greater than end date.");
      setIsSubmitting(false);
      return;
    }

    const postOwnerID = localStorage.getItem('userID');
    const postOwnerName = localStorage.getItem('userFullName');

    if (!postOwnerID) {
      alert('Please log in to add a post.');
      navigate('/');
      return;
    }

    if (tags.length < 2) {
      alert("Please add at least two tags.");
      setIsSubmitting(false);
      return;
    }

    if (!templateID) {
      alert("Please select a template.");
      setIsSubmitting(false);
      return;
    }

    try {
      let imageUrl = '';
      if (image) {
        const formData = new FormData();
        formData.append('file', image);
        const uploadResponse = await axios.post('http://localhost:8080/learningplan/planUpload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        imageUrl = uploadResponse.data;
      }

      // Create the new post object
      const newPost = {
        title,
        description,
        contentURL,
        tags,
        postOwnerID,
        postOwnerName,
        imageUrl,
        templateID,
        startDate, // New field
        endDate,   // New field
        category   // New field
      };

      // Submit the post data
      await axios.post('http://localhost:8080/learningplan', newPost);
      alert('Post added successfully!');
      navigate('/allLearningPlan');
    } catch (error) {
      console.error('Error adding post:', error);
      alert('Failed to add post.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="glass-container">
      <NavBar />
      <div className="plan-layout">
        {/* Template Selection + Preview Section */}
        <div className="template-section">
          <h2 className="section-title">Select Template</h2>
          <div className="template-preview-grid">
            <div 
              className={`template template-1 clickable ${templateID === '1' ? 'selected' : ''}`}
              onClick={() => handleTemplateSelect('1')}
            >
              <p className='template_id_one'>template 1</p>
              <p className='template_title'>{title || "Title Preview"}</p>
              <p className='template_dates'><HiCalendarDateRange /> {startDate} to {endDate} </p>
              <p className='template_description'>{category}</p>
              <hr></hr>
              <p className='template_description'>{description || "Description Preview"}</p>
              <div className="tags_preview">
                {tags.map((tag, index) => (
                  <span key={index} className="tagname">#{tag}</span>
                ))}
              </div>
              {imagePreview && <img src={imagePreview} alt="Preview" className="iframe_preview" />}
              {contentURL && (
                <iframe
                  src={getEmbedURL(contentURL)}
                  title="Content Preview"
                  className="iframe_preview"
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              )}
            </div>
            <div 
              className={`template template-2 clickable ${templateID === '2' ? 'selected' : ''}`}
              onClick={() => handleTemplateSelect('2')}
            >
              <p className='template_id_one'>template 2</p>
              <p className='template_title'>{title || "Title Preview"}</p>
              <p className='template_dates'><HiCalendarDateRange /> {startDate} to {endDate} </p>
              <p className='template_description'>{category}</p>
              <hr></hr>
              <p className='template_description'>{description || "Description Preview"}</p>
              <div className="tags_preview">
                {tags.map((tag, index) => (
                  <span key={index} className="tagname">#{tag}</span>
                ))}
              </div>
              <div className='preview_part'>
                <div className='preview_part_sub'>
                  {imagePreview && <img src={imagePreview} alt="Preview" className="iframe_preview_new" />}
                </div>
                <div className='preview_part_sub'>
                  {contentURL && (
                    <iframe
                      src={getEmbedURL(contentURL)}
                      title="Content Preview"
                      className="iframe_preview_new"
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  )}
                </div>
              </div>
            </div>
            <div 
              className={`template template-3 clickable ${templateID === '3' ? 'selected' : ''}`}
              onClick={() => handleTemplateSelect('3')}
            >
              <p className='template_id_one'>template 3</p>
              {imagePreview && <img src={imagePreview} alt="Preview" className="iframe_preview" />}
              {contentURL && (
                <iframe
                  src={getEmbedURL(contentURL)}
                  title="Content Preview"
                  className="iframe_preview"
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              )}
              <p className='template_title'>{title || "Title Preview"}</p>
              <p className='template_dates'><HiCalendarDateRange /> {startDate} to {endDate} </p>
              <p className='template_description'>{category}</p>
              <hr></hr>
              <p className='template_description'>{description || "Description Preview"}</p>
              <div className="tags_preview">
                {tags.map((tag, index) => (
                  <span key={index} className="tagname">#{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="glass-form">
          <h2 className="form-title">Create Learning Plan</h2>
          <form onSubmit={handleSubmit} className="Auth_form">
            <div className="Auth_formGroup">
              <label className="Auth_label">Title</label>
              <input
                className="transparent-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="Auth_formGroup">
              <label className="Auth_label">Tags</label>
              <div className='skills-container glass-skills'>
                {tags.map((tag, index) => (
                  <span key={index} className="skill-tag">#{tag}</span>
                ))}
              </div>
              <div className='skill-input-container'>
                <input
                  className="transparent-input"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add Tag"
                />
                <button onClick={handleAddTag} className="add-skill-btn">
                  <IoMdAdd />
                </button>
              </div>
            </div>

            <div className="Auth_formGroup">
              <label className="Auth_label">Description</label>
              <textarea
                className="transparent-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
              />
            </div>

            <div className="from_input_con">
              <div className="Auth_formGroup">
                <label className="Auth_label">Start Date</label>
                <input
                  className="transparent-input"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="Auth_formGroup">
                <label className="Auth_label">End Date</label>
                <input
                  className="transparent-input"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="Auth_formGroup">
              <label className="Auth_label">Category</label>
              <select
                className="transparent-input"
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

            <div className="media-controls">
              <button type="button" className="glass-button-small" onClick={() => setShowContentURLInput(!showContentURLInput)}>
                <FaVideo /> Add Video
              </button>
              <button type="button" className="glass-button-small" onClick={() => setShowImageUploadInput(!showImageUploadInput)}>
                <FaImage /> Add Image
              </button>
            </div>

            {showContentURLInput && (
              <div className="Auth_formGroup">
                <label className="Auth_label">Content URL</label>
                <input
                  className="transparent-input"
                  type="url"
                  value={contentURL}
                  onChange={(e) => setContentURL(e.target.value)}
                  placeholder="Enter video URL"
                />
              </div>
            )}

            {showImageUploadInput && (
              <div className="Auth_formGroup">
                <label className="Auth_label">Upload Image</label>
                <input
                  className="transparent-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>
            )}

            <button type="submit" className="glass-button" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Plan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddLearningPlan;