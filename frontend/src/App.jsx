import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, Search, AlertCircle, BarChart2, Layout, Eye, X } from 'lucide-react';
import Header from './components/Header';
import VerdictCard from './components/VerdictCard';
import EvaluationView from './components/EvaluationView';
import ScanningOverlay from './components/ScanningOverlay';
import HistorySidebar from './components/HistorySidebar'; // Import


function App() {
  const [view, setView] = useState('analysis'); // 'analysis' or 'evaluation'

  // Analysis State
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // NEW: Preview URL
  const [showPreview, setShowPreview] = useState(false); // NEW: Toggle Modal
  const [claim, setClaim] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [feedbackSent, setFeedbackSent] = useState(false);

  // NEW: History State
  const [history, setHistory] = useState([]);
  const [currentId, setCurrentId] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Logic Only
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      // Reset result when new file is picked
      if (result) {
        setResult(null);
        setCurrentId(null);
      }
    }
  };

  const handleAnalysis = async () => {
    if (!file || !claim) {
      alert("Please upload an image and enter a claim.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);
    setFeedbackSent(false);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('claim', claim);

    try {
      const response = await axios.post('http://localhost:8000/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const newResult = response.data;
      setResult(newResult);

      // NEW: Add to History
      const historyItem = {
        id: Date.now(),
        timestamp: new Date(),
        file: file,
        claim: claim,
        previewUrl: previewUrl,
        result: newResult
      };
      setHistory(prev => [historyItem, ...prev]);
      setCurrentId(historyItem.id);

    } catch (err) {
      console.error(err);
      setError("Analysis Failed. Ensure the Backend API is running.");
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = (item) => {
    setFile(item.file);
    setPreviewUrl(item.previewUrl);
    setClaim(item.claim);
    setResult(item.result);
    setCurrentId(item.id);
    setView('analysis');
    setFeedbackSent(false);
  };

  const sendFeedback = async (type) => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file_name', file.name);
      formData.append('feedback_type', type);
      await axios.post('http://localhost:8000/feedback', formData);
      setFeedbackSent(true);
    } catch (e) {
      console.error("Feedback failed", e);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* NEW: Left Sidebar */}
        <div style={{ borderRight: '1px solid var(--border-light)', background: 'white' }}>
          <HistorySidebar
            history={history}
            onSelect={loadHistoryItem}
            currentId={currentId}
          />
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '4rem', background: 'var(--bg-primary)' }}>

          {/* Navigation Tabs */}
          <div className="container" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '8px' }}>
              <button
                onClick={() => setView('analysis')}
                style={{
                  padding: '0.6rem 1.2rem',
                  border: 'none',
                  background: view === 'analysis' ? 'white' : 'transparent',
                  borderRadius: '6px',
                  fontWeight: 600,
                  color: view === 'analysis' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: view === 'analysis' ? 'var(--shadow-sm)' : 'none',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <Layout size={18} /> Live Analysis
              </button>
              <button
                onClick={() => setView('evaluation')}
                style={{
                  padding: '0.6rem 1.2rem',
                  border: 'none',
                  background: view === 'evaluation' ? 'white' : 'transparent',
                  borderRadius: '6px',
                  fontWeight: 600,
                  color: view === 'evaluation' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: view === 'evaluation' ? 'var(--shadow-sm)' : 'none',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <BarChart2 size={18} /> Model Evaluation
              </button>
            </div>
          </div>

          <main className="container">
            {view === 'analysis' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 40%) 1fr', gap: '3rem' }}>

                {/* LEFT COLUMN: Input Zone */}
                <section>
                  <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>1. Upload Evidence</h2>

                    {/* Drag & Drop Area */}
                    <div
                      style={{
                        border: '2px dashed var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        padding: '3rem 1rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: 'var(--bg-secondary)',
                        marginBottom: '1rem',
                        transition: 'border-color 0.2s'
                      }}
                      onClick={() => document.getElementById('fileInput').click()}
                    >
                      <input
                        id="fileInput"
                        type="file"
                        accept="image/*,video/*"
                        hidden
                        onChange={handleFileChange}
                      />
                      <UploadCloud size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
                      <p style={{ margin: 0, fontWeight: 500 }}>
                        {file ? file.name : "Click to Upload Media"}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Supports JPG, PNG, MP4
                      </p>
                    </div>

                    {/* NEW: Preview Button */}
                    {file && (
                      <button
                        onClick={() => setShowPreview(true)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '0.75rem',
                          marginBottom: '1.5rem',
                          background: 'white',
                          border: '1px solid var(--border-light)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: 'var(--text-primary)',
                          fontWeight: 500
                        }}
                      >
                        <Eye size={18} /> Preview Media
                      </button>
                    )}

                    {/* Text Input */}
                    <div style={{ marginBottom: '2rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
                        Associated Claim
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Search size={20} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
                        <input
                          type="text"
                          className="input-field"
                          style={{ paddingLeft: '40px' }}
                          placeholder="e.g. 'Fire in the city today...'"
                          value={claim}
                          onChange={(e) => setClaim(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      className="btn-primary"
                      style={{ width: '100%' }}
                      onClick={handleAnalysis}
                      disabled={loading}
                    >
                      {loading ? "Analyzing..." : "Execute Forensic Analysis"}
                    </button>

                    {error && (
                      <div style={{ marginTop: '1rem', color: 'var(--risk-red)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                        <AlertCircle size={16} />
                        {error}
                      </div>
                    )}
                  </div>

                  {/* Feedback Zone (Deliverable #7) */}
                  {result && (
                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                      <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🛠️ Help Improve ShieldAI
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        Flag incorrect results to finetune our model.
                      </p>

                      {!feedbackSent ? (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <button
                            onClick={() => sendFeedback('false_positive')}
                            style={{ flex: 1, padding: '0.5rem', background: 'none', border: '1px solid var(--border-light)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            🚩 False Positive
                          </button>
                          <button
                            onClick={() => sendFeedback('false_negative')}
                            style={{ flex: 1, padding: '0.5rem', background: 'none', border: '1px solid var(--border-light)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            ⚠️ False Negative
                          </button>
                        </div>
                      ) : (
                        <div style={{ padding: '0.75rem', background: 'var(--safe-bg)', color: 'var(--safe-green)', borderRadius: '6px', fontSize: '0.9rem', textAlign: 'center' }}>
                          ✅ Feedback Logged. Thank you!
                        </div>
                      )}
                    </div>
                  )}
                </section>

                {/* RIGHT COLUMN: Results Zone */}
                <section>
                  {loading ? (
                    <ScanningOverlay imageSrc={previewUrl} />
                  ) : result ? (
                    <VerdictCard result={result} />
                  ) : (
                    <div style={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-secondary)',
                      border: '2px dashed var(--border-light)',
                      borderRadius: 'var(--radius-lg)',
                      minHeight: '400px'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>🛡️</div>
                        <p>Ready to analyze. Upload media to begin.</p>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            ) : (
              <EvaluationView />
            )}
          </main>
        </div>
      </div>

      {/* NEW: Preview Modal */}
      {showPreview && previewUrl && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <button
              onClick={() => setShowPreview(false)}
              style={{
                position: 'absolute',
                top: '-40px', right: 0,
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              <X size={32} />
            </button>
            {file.type.startsWith('video') ? (
              <video src={previewUrl} controls style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px' }} />
            ) : (
              <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px' }} />
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
