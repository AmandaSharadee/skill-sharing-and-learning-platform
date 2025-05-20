import React, { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import GoogalLogo from './img/glogo.png';
import { IoMdAdd } from "react-icons/io";
import './user.css';

function UserRegister() {
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
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [userEnteredCode, setUserEnteredCode] = useState('');
    const [skillInput, setSkillInput] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddSkill = () => {
        if (skillInput.trim()) {
            setFormData({ ...formData, skills: [...formData.skills, skillInput] });
            setSkillInput('');
        }
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

    const triggerFileInput = () => {
        document.getElementById('profilePictureInput').click();
    };

    const sendVerificationCode = async (email) => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        localStorage.setItem('verificationCode', code);
        try {
            await fetch('http://localhost:8080/sendVerificationCode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });
        } catch (error) {
            console.error('Error sending verification code:', error);
        }
    };

    const registerUser = async () => {
        try {
            const response = await fetch('http://localhost:8080/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullname: formData.fullname,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    skills: formData.skills,
                    bio: formData.bio,
                }),
            });

            if (response.ok) {
                const userId = (await response.json()).id;

                if (profilePicture) {
                    const profileFormData = new FormData();
                    profileFormData.append('file', profilePicture);
                    await fetch(`http://localhost:8080/user/${userId}/uploadProfilePicture`, {
                        method: 'PUT',
                        body: profileFormData,
                    });
                }
                
                alert('Registration successful!');
                window.location.href = '/';
            } else if (response.status === 409) {
                alert('Email already exists!');
                setIsVerificationModalOpen(false); // Close the verification modal if email exists
            } else {
                alert('Failed to register user.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during registration. Please try again.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let isValid = true;

        if (!formData.email) {
            alert("Email is required");
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            alert("Email is invalid");
            isValid = false;
        }

        if (!profilePicture) {
            alert("Profile picture is required");
            isValid = false;
        }
        if (formData.skills.length < 2) {
            alert("Please add at least two skills.");
            isValid = false;
        }
        if (!isValid) {
            return;
        }

        try {
            // Send verification code directly without checking email existence first
            // The backend should handle duplicate email checks during registration
            await sendVerificationCode(formData.email);
            setIsVerificationModalOpen(true);
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    };

    const handleVerifyCode = () => {
        const savedCode = localStorage.getItem('verificationCode');
        if (userEnteredCode === savedCode) {
            localStorage.removeItem('verificationCode');
            // Register user after successful verification
            registerUser();
        } else {
            alert('Invalid verification code. Please try again.');
        }
    };

    return (
        <div className="glass-container">
            <div className="glass-form">
                <h2 className="form-title">Create your account</h2>
                <form onSubmit={handleSubmit} className="Auth_form newscrol_from">
                    <div className="form-columns">
                        <div className="form-column">
                            <div className="Auth_formGroup">
                                <label className="Auth_label">Profile Picture</label>
                                <div className="profile-icon-container glass-profile" onClick={triggerFileInput}>
                                    {previewImage ? (
                                        <img
                                            src={previewImage}
                                            alt="Selected Profile"
                                            className="selectedimagepreview"
                                        />
                                    ) : (
                                        <FaUserCircle className="profileicon" />
                                    )}
                                </div>
                                <input
                                    id="profilePictureInput"
                                    className="hidden-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfilePictureChange}
                                />
                            </div>
                            <div className="Auth_formGroup">
                                <label className="Auth_label">Full Name</label>
                                <input
                                    className="glass-input"
                                    type="text"
                                    name="fullname"
                                    placeholder="Full Name"
                                    value={formData.fullname}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="Auth_formGroup">
                                <label className="Auth_label">Email Address</label>
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
                        </div>
                        <div className="form-column">
                            <div className="Auth_formGroup">
                                <label className="Auth_label">Password</label>
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
                            <div className="Auth_formGroup">
                                <label className="Auth_label">Phone</label>
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
                            <div className="Auth_formGroup">
                                <label className="Auth_label">Skills</label>
                                <div className='skills-container glass-skills'>
                                    {formData.skills.map((skill, index) => (
                                        <span className='skill-tag' key={index}>{skill}</span>
                                    ))}
                                </div>
                                <div className='skill-input-container'>
                                    <input
                                        className="glass-input"
                                        type="text"
                                        placeholder="Add Skill"
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                    />
                                    <button onClick={handleAddSkill} className="add-skill-btn">
                                        <IoMdAdd />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="full-width">
                        <div className="Auth_formGroup">
                            <label className="Auth_label">Bio</label>
                            <textarea
                                className="glass-input"
                                name="bio"
                                placeholder="Tell us about yourself"
                                value={formData.bio}
                                rows={3}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <button type="submit" className="glass-button">Register</button>
                        <p className="Auth_signupPrompt">
                            Already have an account? <span onClick={() => (window.location.href = '/')} className="Auth_signupLink">Sign in</span>
                        </p>
                    </div>
                </form>
                <button
                    onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
                    className="glass-google-button"
                >
                    <img src={GoogalLogo} alt='glogo' className='glogo' />
                    Sign in with Google
                </button>
            </div>

            {isVerificationModalOpen && (
                <div className="verification-modal glass-modal">
                    <div className="modal-content">
                        <h3>Verify Your Email</h3>
                        <p>Please enter the verification code sent to your email.</p>
                        <input
                            type="text"
                            value={userEnteredCode}
                            onChange={(e) => setUserEnteredCode(e.target.value)}
                            placeholder="Enter verification code"
                            className="glass-input"
                        />
                        <button onClick={handleVerifyCode} className="glass-button">Verify</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserRegister;
