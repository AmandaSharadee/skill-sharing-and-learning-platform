import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import './post.css';
import NavBar from '../../Components/NavBar/NavBar';
import { HiCalendarDateRange } from "react-icons/hi2";

function UpdateLearningPost() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentURL, setContentURL] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState('');
  const [templateID, setTemplateID] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/learningplan/${id}`);
        const { title, description, contentURL, tags, imageUrl, templateID, startDate, endDate, category } = response.data;
        setTitle(title);
        setDescription(description);
        setContentURL(contentURL);
        setTags(tags);
        setExistingImage(imageUrl);
        setTemplateID(templateID);
        setStartDate(startDate);
        setEndDate(endDate);
        setCategory(category);
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    fetchPost();
  }, [id]);

  const handleAddTag = () => {
    if (tagInput.trim() !== '') {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleDeleteTag = (index) => {
    const updatedTags = tags.filter((_, i) => i !== index);
    setTags(updatedTags);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
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
      return url;
    } catch (error) {
      console.error('Invalid URL:', url);
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = existingImage;

    if (image) {
      const formData = new FormData();
      formData.append('file', image);
      try {
        const uploadResponse = await axios.post('http://localhost:8080/learningplan/planUpload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        imageUrl = uploadResponse.data;
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image.');
        return;
      }
    }

    const updatedPost = { title, description, contentURL, tags, imageUrl, postOwnerID: localStorage.getItem('userID'), templateID, startDate, endDate, category };
    try {
      await axios.put(`http://localhost:8080/learningplan/${id}`, updatedPost);
      alert('Post updated successfully!');
      window.location.href = '/allLearningPlan';
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post.');
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
              className={`template template-1 clickable ${templateID === 1 ? 'selected' : ''}`}
              onClick={() => setTemplateID(1)}
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
              {imagePreview ? (
                <div className="image-preview-achi">
                  <img src={imagePreview} alt="Preview" className="iframe_preview" />
                </div>
              ) : existingImage && (
                <div className="image-preview-achi">
                  <img src={`http://localhost:8080/learningplan/planImages/${existingImage}`} alt="Existing" className="iframe_preview" />
                </div>
              )}
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
              className={`template template-2 clickable ${templateID === 2 ? 'selected' : ''}`}
              onClick={() => setTemplateID(2)}
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
                  {imagePreview ? (
                    <div className="image-preview-achi">
                      <img src={imagePreview} alt="Preview" className="iframe_preview_new" />
                    </div>
                  ) : existingImage && (
                    <div className="image-preview-achi">
                      <img src={`http://localhost:8080/learningplan/planImages/${existingImage}`} alt="Existing" className="iframe_preview_new" />
                    </div>
                  )}
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
              className={`template template-3 clickable ${templateID === 3 ? 'selected' : ''}`}
              onClick={() => setTemplateID(3)}
            >
              <p className='template_id_one'>template 3</p>
              {imagePreview ? (
                <div className="image-preview-achi">
                  <img src={imagePreview} alt="Preview" className="iframe_preview" />
                </div>
              ) : existingImage && (
                <div className="image-preview-achi">
                  <img src={`http://localhost:8080/learningplan/planImages/${existingImage}`} alt="Existing" className="iframe_preview" />
                </div>
              )}
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
          <h2 className="form-title">Update Learning Plan</h2>
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
                  <span key={index} className="skill-tag">
                    #{tag}
                    <span onClick={() => handleDeleteTag(index)} className="remove-tag">×</span>
                  </span>
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

              <div className="Auth_formGroup">
                <label className="Auth_label">Upload Image</label>
                <input
                  className="transparent-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {(imagePreview || existingImage) && (
                  <div className="image-preview">
                    <img 
                      src={imagePreview || `http://localhost:8080/learningplan/planImages/${existingImage}`}
                      alt="Preview" 
                    />
                  </div>
                )}
              </div>
            </div>

            <button type="submit" className="glass-button">Update Plan</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateLearningPost;
