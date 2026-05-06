import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DetectionPage.css';
import { prediction } from '../api/predict_api';
import { demoResult } from '../constants/demo';
import { diseaseInfo } from '../constants/diseaseInfo';
import { skinReports } from '../api/predict_api';
import { useAuth } from '../Auth/auth';

export default function DetectionPage() {
  const {userData, cookies, isEmpty} = useAuth();
  const fileInputRef = useRef(null);
  
  // State Management
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [saveReport, setSaveReport] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // --- NEW METADATA STATE ---
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [localization, setLocalization] = useState('back');
  const [dbInfo, setDbInfo] = useState(null);

  // --- NEW: MODEL SELECTION STATE ---
  const [selectedModel, setSelectedModel] = useState('model3'); // Default to the best model

  const modelOptions = [
    { id: 'model1', name: 'Custom CNN', desc: 'Baseline Architecture' },
    { id: 'model2', name: 'Fusion Model', desc: 'Image + Metadata' },
    { id: 'model3', name: 'Hybrid ViT', desc: 'CNN + Transformer (Best)' },
  ];

  // Fixed Lists for Select Inputs
  const localizationOptions = [
    'abdomen', 'acral', 'back', 'chest', 'ear', 'face', 
    'foot', 'genital', 'hand', 'lower extremity', 'neck', 
    'scalp', 'trunk', 'unknown', 'upper extremity'
  ];

  const navigate = useNavigate();

  const data = demoResult;

  useEffect(() => {
    if(isEmpty(userData) && isEmpty(cookies)) navigate("/signup")
  },[userData,cookies])

  // 1. File Handling Logic
  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert("Please upload a valid image file.");
      return;
    }
    setRawFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
      setResult(null);
      setProgress(0);
    };
    reader.readAsDataURL(file);
  };

  // 2. Drag & Drop Handlers
  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // 3. Simulated CNN Analysis
const startAnalysis = async () => {
  if (!uploadedImage || !rawFile) return;
  setIsAnalyzing(true);
  setProgress(0);
  setError(null);

  // 1. Prediction Logic (Image -> Python Model)
  const predictData = new FormData();
  predictData.append('image', rawFile);
  predictData.append('age', age);
  predictData.append('gender', gender);
  predictData.append('localization', localization);
  predictData.append('model_choice', selectedModel);
  await delay(1000);
  setProgress(10);
  try {
    const response = await prediction(predictData);
    const resultData = response.data;

    if (resultData.success) {
      // Enrich results with names/descriptions from your constants
      const enrichedResults = resultData.data.all_predictions.map(pred => ({
        ...pred,
        ...diseaseInfo[pred.label]
      }));
      await delay(1000);
      setProgress(25);
      const finalResult = {
        topMatch: enrichedResults[0],
        fullList: enrichedResults
      };
      await delay(1000);
      setProgress(45);
      // console.log(finalResult);
      setResult(finalResult); // Update UI
      await delay(1000);
      setProgress(60);

      // 2. Save Report Logic (Image -> Cloudinary -> Database)
      const selectedModelDetails = modelOptions.find(opt => opt.id === selectedModel);
      await delay(1000);
      setProgress(70);
      const reportFormData = new FormData();
      reportFormData.append('image', rawFile); // Sending actual file for Cloudinary
      reportFormData.append('age', age);
      reportFormData.append('gender', gender);
      reportFormData.append('localization', localization);
      reportFormData.append('modelId', selectedModelDetails.id);
      reportFormData.append('modelName', selectedModelDetails.name);
      // Stringify the object so Multer/Zod can handle it
      reportFormData.append('analysisResult', JSON.stringify(finalResult)); 
      await delay(1000);
      setProgress(85);
      // console.log(reportFormData);
      const save = await skinReports(reportFormData); 
      if(save.data.success){ 
        setSaveReport(true)
        setDbInfo({
          id: save.data.reportId,
          createdAt: save.data.createdAt
        });
      }
      
      console.log("Report saved and Cloudinary URL generated!");
      setProgress(100);
    }

  } catch (err) {
    console.error("Operation Error:", err);
    const msg = err.response?.data?.error || "Server error during process.";
    setError(Array.isArray(msg) ? msg : [msg]);
  } finally {
    setIsAnalyzing(false);
  }
};
      // const interval = setInterval(() => {
    //   setProgress((prev) => {
    //     if (prev >= 100) {
    //       clearInterval(interval);
    //       setIsAnalyzing(false);
    //       setResult({
    //         condition: "Eczema",
    //         confidence: 94.2,
    //         severity: "Moderate"
    //       });
    //       return 100;
    //     }
    //     return prev + 5;
    //   });
    // }, 150);

  const reset = () => {
    setUploadedImage(null);
    setResult(null);
    setProgress(0);
    setError(null);
    setDbInfo(null)
    setSaveReport(false);
    setAge(''); 
    if(fileInputRef.current){
      fileInputRef.current.value = '';
    }
  };

  const viewResults = () => {
    if (result) {
      const selectedModelDetails = modelOptions.find(opt => opt.id === selectedModel);

      navigate('/result', { 
        state: { 
          result, 
          image: uploadedImage, 
          age, 
          gender, 
          localization,
          // Pass the name and description of the model used
          modelUsed: selectedModelDetails,
          dbInfo: dbInfo
        } 
      });
    }
    reset();
  }


  return (
    <div className="detection-container">
      <div className="content-wrapper">
        
        <header className="header-section fade-in">
          <h1 className="title">Skin <span className="gradient-text">Analysis</span></h1>
          <p className="subtitle">High-precision CNN detection for dermatological conditions.</p>
        </header>
        {/* --- NEW: MODEL SELECTOR TABS --- */}
        {!isAnalyzing && !result && (
          <div className="model-selector fade-in">
            {modelOptions.map((model) => (
              <div 
                key={model.id}
                className={`model-tab ${selectedModel === model.id ? 'active' : ''}`}
                onClick={() => setSelectedModel(model.id)}
              >
                <span className="model-name">{model.name}</span>
                <span className="model-desc">{model.desc}</span>
              </div>
            ))}
          </div>
        )}

        <div className="upload-card fade-in delay-1">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => handleFile(e.target.files[0])} 
            hidden 
            accept="image/*"
          />

          {!uploadedImage ? (
            <div 
              className={`drop-zone ${isDragging ? 'dragging' : ''}`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current.click()}
            >
              <div className="icon-circle">
                <i className="fa-solid fa-cloud-arrow-up"></i>
              </div>
              <h3 className="upload-title">Click or Drag Image Here</h3>
              <p className="upload-subtitle">JPG or PNG (Max 10MB)</p>
            </div>
          ) : (
            <div className="preview-container">
              <div className="image-wrapper">
                <img src={uploadedImage} alt="Preview" className="preview-img" />
                {isAnalyzing && <div className="scan-bar"></div>}
              </div>
              {/* --- METADATA FORM SECTION --- */}
                {!result && !isAnalyzing && (
                  <div className="metadata-form fade-in">
                    <h4 className="form-title">Patient Information</h4>
                    
                    <div className="input-group">
                      <label>Age</label>
                      <input 
                        type="number" 
                        placeholder="Enter age" 
                        value={age} 
                        onChange={(e) => setAge(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="input-group">
                      <label>Gender</label>
                      <select value={gender} onChange={(e) => setGender(e.target.value)} className="form-select">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </div>

                    <div className="input-group">
                      <label>Anatomical Site</label>
                      <select value={localization} onChange={(e) => setLocalization(e.target.value)} className="form-select">
                        {localizationOptions.map(opt => (
                          <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

              {/* Progress UI */}
              {isAnalyzing && (
                <div className="analysis-status">
                  <div className="progress-text">
                    <span><i className="fa-solid fa-microchip fa-spin"></i> Analyzing...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!isAnalyzing && !result && (
                <div className="btn-group">
                  <button className="btn-main" onClick={startAnalysis}>
                    <i className="fa-solid fa-bolt"></i> Run Analysis
                  </button>
                  <button className="btn-outline" onClick={reset}>Cancel</button>
                </div>
              )}

              {/* Results View */}
              {result && saveReport &&  (
                <div className="result-box fade-in">
                  <div className="result-header">
                    <i className="fa-solid fa-circle-check"></i>
                    <h4>Detection Successful</h4>
                  </div>
                  <div className='result-body'>
                  <div className="result-details">
                    <p>Condition: <strong>{result.topMatch.name}</strong></p>
                    <p>Confidence: <strong>{result.topMatch.confidence*100}%</strong></p>
                  </div>
                  <div className='btn-group'>
                    <button className="btn-main-tell" onClick={viewResults}>View Full Report</button>
                    <button className="btn-main-tell" onClick={reset}>Analyze Another</button>
                  </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="result-box fade-in">
                  <div className="result-header">
                    <i className="fa-solid fa-circle-check"></i>
                    <h4>Detection Failed</h4>
                  </div>
                  <div className='result-body'>
                  <div className="result-details">
                    <p>Error: <strong>{error}</strong></p>
                  </div>
                  <button className="btn-main-tell" onClick={reset}>Analyze Another</button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
        
        <div className="tips-grid fade-in delay-2">
            <h3 className="section-title">Tips for Best Results</h3>
            <div className="grid-layout" >
              <TipCard 
                title="Good Lighting" 
                desc="Use natural light." 
                iconClass="fa-solid fa-sun" 
              />
              <TipCard 
                title="Clear Focus" 
                desc="Avoid blurry shots." 
                iconClass="fa-solid fa-bullseye" 
              />
              <TipCard 
                title="Close-up" 
                desc="Focus on the area." 
                iconClass="fa-solid fa-magnifying-glass-plus" 
              />
              <TipCard 
                title="Angles" 
                desc="Try different views." 
                iconClass="fa-solid fa-rotate" 
              />
            </div>
          </div>
      </div>
    </div>
  );
}



function TipCard({ title, desc, iconClass }) {
  return (
    <div className="tip-card">
      <div className="tip-icon-box">
        <i className={`${iconClass} tip-icon`}></i>
      </div>
      <div>
        <h4 className="tip-title">{title}</h4>
        <p className="tip-desc">{desc}</p>
      </div>
    </div>
  );
}