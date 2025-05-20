import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import NavBar from '../../Components/NavBar/NavBar';
import './UpdateUserProfile.css';

function UpdateUserProfile() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    phone: '',
    skills: [],
    bio: '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();
  const [skillInput, setSkillInput] = useState('');

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput] });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetch(`http://localhost:8080/user/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        return response.json();
      })
      .then((data) => setFormData(data))
      .catch((error) => console.error('Error:', error));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8080/user/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        if (profilePicture) {
          const formData = new FormData();
          formData.append('file', profilePicture);
          await fetch(`http://localhost:8080/user/${id}/uploadProfilePicture`, {
            method: 'PUT',
            body: formData,
          });
        }
        alert('Profile updated successfully!');
        navigate('/userProfile');
      } else {
        alert('Failed to update profile.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="uglass-container">
      <NavBar />
      <div className="uglass-content">
        <h1 className="glass-heading">Update Profile</h1>
        <form onSubmit={handleSubmit} className="uglass-form">
          <div className="form-left">
            <div className="glass-input-group">
              <label className="glass-label">Full Name</label>
              <input
                className="glass-input"
                type="text"
                name="fullname"
                placeholder="Enter your full name"
                value={formData.fullname}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="glass-input-group">
              <label className="glass-label">Email Address</label>
              <input
                className="glass-input"
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="glass-input-group">
              <label className="glass-label">Password</label>
              <input
                className="glass-input"
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="glass-input-group">
              <label className="glass-label">Phone</label>
              <input
                className="glass-input"
                type="text"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => {
                  const re = /^[0-9\b]{0,10}$/;
                  if (re.test(e.target.value)) {
                    handleInputChange(e);
                  }
                }}
                maxLength="10"
                pattern="[0-9]{10}"
                title="Please enter exactly 10 digits."
                required
              />
            </div>
            <div className="glass-input-group">
              <label className="glass-label">Bio</label>
              <textarea
                className="glass-input"
                name="bio"
                placeholder="Bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>
          
          <div className="form-right">
            <div className="glass-input-group">
              <label className="glass-label">Skills</label>
              <div className="skills-container">
                {formData.skills.map((skill, index) => (
                  <span className="skill-tag" key={index}>
                    {skill}
                    <span className="skill-remove" onClick={() => handleRemoveSkill(skill)}>×</span>
                  </span>
                ))}
              </div>
              <div className="skill-input">
                <input
                  className="glass-input"
                  type="text"
                  placeholder="Add a skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                />
                <button type="button" className="glass-button-small" onClick={handleAddSkill}>
                  <IoMdAdd />
                </button>
              </div>
            </div>

            <div className="glass-input-group">
              <label className="glass-label">Profile Picture</label>
              <div className="profile-upload">
                <div className="profile-preview">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" />
                  ) : formData.profilePicturePath ? (
                    <img
                      src={`http://localhost:8080/uploads/profile/${formData.profilePicturePath}`}
                      alt="Current Profile"
                    />
                  ) : (
                    <div className="no-image">Select Image</div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="glass-input"
                />
              </div>
            </div>
          </div>
          
          <div className="button-container">
            <button type="submit" className="glass-button">
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateUserProfile;
