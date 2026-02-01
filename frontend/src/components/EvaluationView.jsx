import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart2, RefreshCw, Activity, Target, Zap, Shield, GitMerge } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const KPICard = ({ title, value, icon: Icon, color }) => (
    <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <Icon size={18} color={color} />
            <span>{title}</span>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {(value * 100).toFixed(1)}%
        </div>
    </div>
);

const ConfusionMatrix = ({ data }) => {
    if (!data) return null;
    const { tp, tn, fp, fn } = data;
    return (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GitMerge size={18} /> Confusion Matrix
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '8px', textAlign: 'center', fontSize: '0.9rem' }}>
                <div></div>
                <div style={{ fontWeight: 600 }}>Pred: Real</div>
                <div style={{ fontWeight: 600 }}>Pred: Fake</div>

                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>Actual: Real</div>
                <div style={{ background: '#e8f5e9', padding: '1rem', borderRadius: '4px', border: '1px solid #c8e6c9' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#2e7d32' }}>{tn}</div>
                    <div style={{ fontSize: '0.7rem', color: '#666' }}>True Negative</div>
                </div>
                <div style={{ background: '#fff3e0', padding: '1rem', borderRadius: '4px', border: '1px solid #ffe0b2' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ef6c00' }}>{fp}</div>
                    <div style={{ fontSize: '0.7rem', color: '#666' }}>False Positive</div>
                </div>

                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>Actual: Fake</div>
                <div style={{ background: '#ffebee', padding: '1rem', borderRadius: '4px', border: '1px solid #ffcdd2' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#c62828' }}>{fn}</div>
                    <div style={{ fontSize: '0.7rem', color: '#666' }}>False Negative</div>
                </div>
                <div style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '4px', border: '1px solid #bbdefb' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1565c0' }}>{tp}</div>
                    <div style={{ fontSize: '0.7rem', color: '#666' }}>True Positive</div>
                </div>
            </div>
        </div>
    );
};

const ROCCurve = ({ rocData, aucScore }) => {
    if (!rocData || rocData.length === 0) return null;

    const data = {
        datasets: [
            {
                label: `ROC Curve (AUC = ${aucScore})`,
                data: rocData, // {x, y}
                borderColor: '#673ab7',
                backgroundColor: 'rgba(103, 58, 183, 0.1)',
                fill: true,
                tension: 0.2
            },
            {
                label: 'Random Chance',
                data: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
                borderColor: '#ccc',
                borderDash: [5, 5],
                pointRadius: 0
            }
        ]
    };

    const options = {
        responsive: true,
        scales: {
            x: { type: 'linear', min: 0, max: 1, title: { display: true, text: 'False Positive Rate' } },
            y: { type: 'linear', min: 0, max: 1, title: { display: true, text: 'True Positive Rate' } }
        }
    };

    return (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>📈 ROC Analysis</h3>
            <Line data={data} options={options} />
        </div>
    );
};

const ProgressBar = ({ label, value, color, desc }) => (
    <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 600 }}>{label}</span>
            <span style={{ fontWeight: 700, color: color }}>{(value * 100).toFixed(1)}%</span>
        </div>
        <div style={{ width: '100%', height: '12px', background: 'var(--bg-secondary)', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${value * 100}%`, height: '100%', background: color, borderRadius: '6px', transition: 'width 1s ease-out' }}></div>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{desc}</p>
    </div>
);

const EvaluationView = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load cache on mount
        axios.get('http://localhost:8000/evaluate/cache')
            .then(res => { if (res.data) setMetrics(res.data); })
            .catch(err => console.error("Cache load failed", err));
    }, []);

    const runEvaluation = async () => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:8000/evaluate');
            setMetrics(res.data);
        } catch (err) {
            alert("Evaluation failed. Check console.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!metrics && !loading) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                <BarChart2 size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                <p>No metrics found. Run an evaluation to benchmark the model.</p>
                <button className="btn-primary" onClick={runEvaluation} style={{ marginTop: '1rem' }}>
                    Run Benchmark
                </button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Model Performance</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Benchmarking on 'Cosmos' & 'Challenge' datasets</p>
                </div>
                <button
                    onClick={runEvaluation}
                    disabled={loading}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '0.6rem 1.2rem',
                        background: 'white',
                        border: '1px solid var(--text-primary)',
                        borderRadius: '8px',
                        cursor: loading ? 'wait' : 'pointer',
                        fontWeight: 600
                    }}
                >
                    <RefreshCw size={18} className={loading ? "spin" : ""} />
                    {loading ? "Benchmarking..." : "Re-run Evaluation"}
                </button>
            </div>

            {metrics && (
                <>
                    {/* KPI Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        <KPICard title="Accuracy" value={metrics.accuracy} icon={Target} color="#2196F3" />
                        <KPICard title="Precision" value={metrics.precision} icon={Activity} color="#9C27B0" />
                        <KPICard title="Recall" value={metrics.recall} icon={Zap} color="#FF9800" />
                        <KPICard title="ROC AUC" value={metrics.auc_score || 0} icon={Shield} color="#673ab7" />
                    </div>

                    {/* Advanced Stats: Charts */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                        <ConfusionMatrix data={metrics.confusion_matrix} />
                        <ROCCurve rocData={metrics.roc_curve} aucScore={metrics.auc_score} />
                    </div>

                    {/* Progress Bars */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>🛡️ Robustness Analysis</h3>
                            <ProgressBar
                                label="Stability Score"
                                value={metrics.robustness}
                                color="#4CAF50"
                                desc="Resistance to noise, blur, and compression artifacts."
                            />
                        </div>

                        <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>📝 Explainability Quality</h3>
                            <ProgressBar
                                label="Report Quality"
                                value={metrics.explanation_quality}
                                color="#2196F3"
                                desc="Completeness and structural integrity of generated forensic reports."
                            />
                        </div>
                    </div>
                </>
            )}

            <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
};

export default EvaluationView;
