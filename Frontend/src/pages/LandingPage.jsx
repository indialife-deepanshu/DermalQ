import React from 'react';
import './LandingPage.css';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

export const LandingPage = () => {
  const navigate = useNavigate();

  const redirectToHome = () => {
    navigate("/home");
  }
  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="logo">Derma<span>IQ</span></div>
        <ul className="nav-links">
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/home">How it Works</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
        <button className="btn-primary" onClick={redirectToHome}>Get Started</button>
      </nav>


      <header className="hero">
        <div className="hero-content">
          <h1 className="fade-in-up">Precision Skin Analysis Powered by <span>CNN</span></h1>
          <p className="fade-in-up delay-1">
            Upload a photo and let our advanced Neural Networks detect potential skin conditions in seconds. 
            Fast, reliable, and accessible.
          </p>
          <div className="hero-btns fade-in-up delay-2">
            <button className="btn-main" onClick={redirectToHome}>Analyze Now</button>
            <button className="btn-outline">Learn More</button>
          </div>
        </div>
        <div className="hero-image fade-in-right">
        <div className="scanner-box">
            <div className="scan-line"></div>
            <img 
                src="Main.png" 
                alt="Skin Analysis Technology" 
                className="main-hero-img"
            />
            </div>
        </div>
      </header>


      <section className="features">
        <div className="feature-card">
          <h3>89.03% Accuracy</h3>
          <p>Trained on thousands of clinical images for high-fidelity detection.</p>
        </div>
        <div className="feature-card">
          <h3>Instant Results</h3>
          <p>Real-time processing using optimized Convolutional Neural Networks.</p>
        </div>
        <div className="feature-card">
          <h3>Privacy First</h3>
          <p>Your data is encrypted and used only for analysis purposes.</p>
        </div>
      </section>
    </div>
  );
};

