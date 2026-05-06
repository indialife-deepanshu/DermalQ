import React from 'react';
import ReactDOM from 'react-dom';
import './ProfileCard.css';
import { useAuth } from "../../Auth/auth"; 
import { NavLink } from "react-router-dom";

const Profile = ({ setProfileMode }) => {
  const { userData } = useAuth();

  // Close modal function
  const closeProfile = () => setProfileMode(false);

  // Helper to get initials from name
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // We use createPortal to ensure the modal is at the root of the HTML body
  return ReactDOM.createPortal(
    <div className="profile-modal-overlay" onClick={closeProfile}>
      <div 
        className="profile-modal-card" 
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside
      >
        <button className="profile-close-btn" onClick={closeProfile}>
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="profile-header">
          <div className="avatar-initials-wrapper">
            <div className="avatar-initials">
              {getInitials(userData?.name || userData?.username)}
            </div>
            <div className="online-badge"></div>
          </div>
          <h2 className="profile-name">{userData?.name || "User Name"}</h2>
          <p className="profile-email">{userData?.email || "user@example.com"}</p>
        </div>

        <div className="profile-stats">
          <div className="stat-box">
            <span className="stat-num">{userData.totalScans || 0}</span>
            <span className="stat-txt">Scans</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">
              {userData?.lastActive || "Today"} 
            </span>
            <span className="stat-txt">Last Active</span>
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn-action-primary">
            <NavLink to="/history" style={{color: 'white'}} onClick={closeProfile}><i className="fa-solid fa-clock-history"></i> My History</NavLink>
          </button>
          <button className="btn-action-outline">
            <i className="fa-solid fa-microchip"></i> Settings
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Profile;