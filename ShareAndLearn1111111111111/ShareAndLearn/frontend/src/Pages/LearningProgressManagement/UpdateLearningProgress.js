import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';

function UpdateLearningProgress() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    category: '',
    postOwnerID: '',
    postOwnerName: '',
    imageUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAchievement = async () => {
      try {
        const response = await fetch(`http://localhost:8080/learningprogress/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch achievement');
        }
        const data = await response.json();
        setFormData(data);
        if (data.imageUrl) {
          setPreviewImage(`http://localhost:8080/learningprogress/images/${data.imageUrl}`);
        }
      } catch (error) {
        console.error('Error fetching LearningProgress data:', error);
        alert('Error loading achievement data');
      }
    };
    fetchAchievement();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = formData.imageUrl;
      
      // Upload new image if selected
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        
        const uploadResponse = await fetch('http://localhost:8080/learningprogress/upload', {
          method: 'POST',
          body: uploadFormData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Image upload failed');
        }
        imageUrl = await uploadResponse.text();
      }

      // Update achievement data
      const updatedData = { ...formData, imageUrl };
      const response = await fetch(`http://localhost:8080/learningprogress/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        alert('Achievement updated successfully!');
        window.location.href = '/allLearningProgress';
      } else {
        throw new Error('Failed to update achievement');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'An error occurred during update');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-container">
      <NavBar />
      <div className="glass-form">
        <h2 className="form-title">Update Learning Progress</h2>
        <form onSubmit={handleSubmit} className="Auth_form">
          <div className="Auth_formGroup">
            <label className="Auth_label">Upload Image</label>
            {previewImage && (
              <div className="image-preview">
                <img src={previewImage} alt="Preview" />
              </div>
            )}
            <input
              className="glass-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="Auth_formGroup">
            <label className="Auth_label">Title</label>
            <input
              className="glass-input"
              name="title"
              placeholder="Enter title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="Auth_formGroup">
            <label className="Auth_label">Description</label>
            <textarea
              className="glass-input"
              name="description"
              placeholder="Enter description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={3}
            />
          </div>

          <div className="Auth_formGroup">
            <label className="Auth_label">Category</label>
            <select
              className="glass-input"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
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
            <label className="Auth_label">Date</label>
            <input
              className="glass-input"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>

          <button type="submit" className="glass-button" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Progress'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdateLearningProgress;