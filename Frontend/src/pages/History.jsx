import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistoryOfUser } from '../api/auth_api';
import './History.css';
import { diseaseInfo } from '../constants/diseaseInfo';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await getHistoryOfUser();
                if(response.data.success) setHistory(response.data.history);
            } catch (err) {
                console.error("History Load Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const handleViewReport = (report) => {
        // We pass the saved data back into the ResultPage state format
        console.log(report.analysisResult)
        const enrichedResults = report.analysisResult.fullList.map(pred => ({
            ...pred,
            ...diseaseInfo[pred.label]
        }));

        const finalResult = {
            topMatch: enrichedResults[0],
            fullList: enrichedResults
        };
        navigate('/result', { 
            state: { 
                result: finalResult, 
                image: report.imageUrl, 
                age: report.age, 
                gender: report.gender, 
                localization: report.localization,
                dbInfo: { id: report.id, createdAt: report.createdAt },
                modelUsed: { name: report.modelName }
            } 
        });
    };

    if (loading) return <div className="loader">Loading your history...</div>;

    return (
        <div className="history-container">
            <div className="max-width-wrapper">
                <header className="history-header">
                    <h1 className="text-3xl font-bold" style={{color: 'black'}}>Analysis <span className="gradient-text">History</span></h1>
                    <p className="subtitle">Review your past dermatological scans and reports.</p>
                </header>

                {history.length === 0 ? (
                    <div className="empty-state">
                        <i className="fa-solid fa-folder-open"></i>
                        <h3>No analysis found</h3>
                        <button className="btn-main" onClick={() => navigate('/detect')}>Start First Analysis</button>
                    </div>
                ) : (
                    <div className="history-grid">
                        {history.map((report) => (
                            <div key={report.id} className="history-card">
                                <div className="card-image">
                                    <img src={report.imageUrl} alt="Skin Scan" />
                                    <div className="date-badge">
                                        {new Date(report.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="card-content">
                                    <span className={`result-tag ${report.analysisResult.topMatch.severity}`}>
                                        {report.analysisResult.topMatch.name}
                                    </span>
                                    <p className="meta-info">
                                        {report.localization} • {report.age} yrs
                                    </p>
                                    <button 
                                        className="btn-view" 
                                        onClick={() => handleViewReport(report)}
                                    >
                                        View Full Report
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default History;
