import React from 'react';
import './ResultPage.css';
import { useEffect , useMemo, useRef} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ResultPage = () => {
    const reportRef = useRef();
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state;

    useEffect(() => {
    if (!state?.result) {
      navigate('/detect');
    }
    }, [state, navigate]);

    if (!state?.result) {
        return null;
    }

    const { result, image, age, gender, localization, modelUsed, dbInfo } = state;

    // Generate metadata once when component mounts
    // const reportMeta = useMemo(() => ({
    //     date: new Date().toLocaleDateString('en-US', { 
    //         year: 'numeric', month: 'long', day: 'numeric' 
    //     }),
    //     time: new Date().toLocaleTimeString('en-US', { 
    //         hour: '2-digit', minute: '2-digit' 
    //     }),
    //     id: `REP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    // }), []);

    const reportMeta = useMemo(() => {
        const dateObj = dbInfo?.createdAt ? new Date(dbInfo.createdAt) : new Date();
        return {
            date: dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            id: dbInfo?.id || "PENDING" // Use the real ID from your nanoid() field
        };
    }, [dbInfo]);

    // const data = {
    //     image: "https://tse4.mm.bing.net/th/id/OIP.rp_-7NUOvGL1955LURg8sgHaFj?rs=1&pid=ImgDetMain&o=7&rm=3", // Replace with state image
    //     result: {
    //       condition: "Melanoma",
    //       confidence: 88.4,
    //       severity: "high",
    //       description: "The most dangerous form of skin cancer. It forms in the melanocytes (pigment-producing cells). Early detection is critical for successful treatment.",
    //       recommendations: [
    //         "Consult a dermatologist immediately for a biopsy.",
    //         "Avoid further sun exposure on the affected area.",
    //         "Keep a photo log of the lesion to track changes."
    //       ],
    //       topPredictions: [
    //         { condition: "Melanoma", confidence: 88.4 },
    //         { condition: "Basal Cell Carcinoma", confidence: 7.2 },
    //         { condition: "Benign Mole", confidence: 2.1 },
    //         { condition: "Vascular Lesion", confidence: 1.5 }
    //       ]
    //     }
    // };

    // const { result, image } = data;

    // console.log(result);

    const newAnalysis = () => {
        navigate("/detect");
    }

    const giveFeedback = () => {
        navigate("/contact");
    }

    // --- FUNCTIONALITY: PRINT ---
    const handlePrint = () => {
        window.print();
    };

    // --- FUNCTIONALITY: DOWNLOAD PDF ---
    const handleDownload = async () => {
        const element = reportRef.current;
        // Use a higher scale for better PDF quality
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Skin_Report_${reportMeta.id}.pdf`);
    };

    return (
    <div className="result-container" ref={reportRef}>
      <div className="max-width-wrapper">
        
        {/* Header */}
        <div className="header-flex no-print">
          <div>
            <h1 className="text-3xl font-bold">Analysis <span className="gradient-text">Results</span></h1>
            <p className="subtitle">Detailed report of your skin condition analysis</p>
          </div>
          <div style={{display: 'flex', gap: '10px'}}>
            <button className="btn" onClick={handlePrint}>Print</button>
            <button className="btn btn-primary" onClick={handleDownload}>Download Report</button>
          </div>
        </div>

        <div className="results-grid">
          
          {/* Left Column */}
          <div className="left-col">
            <div className="custom-card">
              <img src={image} alt="Analyzed lesion" className="analyzed-img" crossOrigin="anonymous"/>
            </div>

            <div className="custom-card card-padding" style={{textAlign: 'center'}}>
              <h3 className="card-title" style={{justifyContent: 'center'}}>Primary Detection</h3>
              <h2 style={{fontSize: '1.5rem', marginBottom: '10px'}}>{result.topMatch.name}</h2>
              <span className={`severity-badge ${result.topMatch.severity}`}>
                {result.topMatch.severity} RISK
              </span>
              
              <div style={{marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px'}}>
                <div className="chart-label-flex">
                  <span>Confidence</span>
                  <span>{result.topMatch.confidence*100}%</span>
                </div>
                <div className="bar-bg">
                  <div className="bar-fill" style={{width: `${result.topMatch.confidence*100}%`}}></div>
                </div>
              </div>
            </div>

            <div className="custom-card metadata-card">
                <div className="card-padding">
                  <h3 className="card-title">Clinical & System Context</h3>
                  <div className="meta-stack">
                    
                    {/* Patient Metadata */}
                    <div className="meta-row">
                      <span className="meta-icon">👤</span>
                      <span className="meta-text">
                        <strong>Patient:</strong> {age} yrs | {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </span>
                    </div>

                    <div className="meta-row">
                      <span className="meta-icon">📍</span>
                      <span className="meta-text">
                        <strong>Site:</strong> {localization.charAt(0).toUpperCase() + localization.slice(1)}
                      </span>
                    </div>

                    {/* Model Info */}
                    <div className="meta-row">
                      <span className="meta-icon">🤖</span>
                      <span className="meta-text">
                        <strong>Model:</strong> {modelUsed?.name || "Standard CNN"}
                      </span>
                    </div>

                    <hr style={{margin: '15px 0', border: 'none', borderTop: '1px solid rgba(0,0,0,0.05)'}} />

                    {/* Report Info */}
                    <div className="meta-row">
                      <span className="meta-icon">📅</span>
                      <span className="meta-text">{reportMeta.date}</span>
                    </div>

                    <div className="meta-row">
                      <span className="meta-icon">🕒</span>
                      <span className="meta-text">{reportMeta.time}</span>
                    </div>

                    <div className="meta-row">
                      <span className="meta-icon">📄</span>
                      <span className="meta-text">
                        <strong>ID:</strong> {reportMeta.id}
                      </span>
                    </div>

                  </div>
                </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-col">
            <div className="custom-card card-padding">
              <h3 className="card-title">About This Condition</h3>
              <p style={{lineHeight: '1.6', color: '#4b5563'}}>{result.topMatch.description}</p>
            </div>

            <div className="custom-card card-padding">
              <h3 className="card-title">Probability Breakdown</h3>
              <div className="chart-container">
                {result.fullList.map((pred, i) => (
                  <div key={i} className="chart-row">
                    <div className="chart-label-flex">
                      <span>{pred.name}</span>
                      <span>{pred.confidence*100}%</span>
                    </div>
                    <div className="bar-bg">
                      <div className="bar-fill" style={{
                        width: `${pred.confidence*100}%`,
                        background: pred.confidence > 50 ? '#0082f3' : '#94a3b8'
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>


            <div className="custom-card card-padding">
              <h3 className="card-title">Recommendations</h3>
              <ul className="rec-list">
                {result.topMatch.recommendations.map((rec, i) => (
                  <li key={i} className="rec-item">
                    <span className="rec-number">{i + 1}</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{marginTop: '20px', display: 'flex', gap: '15px'}}>
                <button className="btn" style={{flex: 1}} onClick={newAnalysis}>New Analysis</button>
                <button className="btn btn-primary" style={{flex: 1}} onClick={giveFeedback}>Give Feedback</button>
            </div>
          </div>

        </div>
      </div>
    </div>
    );
}

export default ResultPage;
