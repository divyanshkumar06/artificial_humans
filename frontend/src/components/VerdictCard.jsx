import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { Radar } from 'react-chartjs-2';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

const VerdictCard = ({ result }) => {
    const [expanded, setExpanded] = useState(false);

    if (!result) return null;

    const { is_misinfo, technical_stats, explanation } = result;

    // Design Logic
    const theme = is_misinfo
        ? { bg: 'var(--risk-bg)', color: 'var(--risk-red)', icon: AlertTriangle, title: 'HIGH RISK DETECTED' }
        : { bg: 'var(--safe-bg)', color: 'var(--safe-green)', icon: CheckCircle, title: 'LIKELY AUTHENTIC' };

    // PDF Export Logic
    const downloadPDF = async () => {
        const input = document.getElementById('verdict-card-container');
        try {
            const canvas = await html2canvas(input, { useCORS: true, scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`ShieldAI_Report_${Date.now()}.pdf`);
        } catch (err) {
            console.error("PDF Export failed", err);
            alert("Failed to generate PDF. Check console.");
        }
    };

    // Radar Data
    const radarData = {
        labels: ['Digital DNA', 'Semantic Alignment', 'Factual Grounding'],
        datasets: [
            {
                label: 'Confidence Signals',
                data: [
                    technical_stats.ai_prob * 100,
                    technical_stats.consistency * 100,
                    is_misinfo ? 20 : 90 // Heuristic for Factual Grounding based on verdict
                ],
                backgroundColor: is_misinfo ? 'rgba(220, 53, 69, 0.2)' : 'rgba(40, 167, 69, 0.2)',
                borderColor: is_misinfo ? '#dc3545' : '#28a745',
                borderWidth: 2,
            },
        ],
    };

    const radarOptions = {
        scales: {
            r: {
                beginAtZero: true,
                max: 100,
                ticks: { display: false },
                grid: { color: '#e9ecef' }
            }
        },
        plugins: { legend: { display: false } }
    };

    return (
        <motion.div
            id="verdict-card-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                overflow: 'hidden'
            }}
        >
            {/* 1. Verdict Header */}
            <div style={{
                padding: '2rem',
                background: theme.bg,
                borderBottom: `1px solid ${is_misinfo ? '#f5c6cb' : '#c3e6cb'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <theme.icon size={32} color={theme.color} />
                    <div>
                        <h2 style={{ margin: 0, color: theme.color, fontSize: '1.5rem' }}>{theme.title}</h2>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Confidence Score: <b>{is_misinfo ? (technical_stats.ai_prob * 100).toFixed(1) : (technical_stats.consistency * 100).toFixed(1)}%</b>
                        </p>
                    </div>
                </div>

                {/* Export Button */}
                <button
                    onClick={downloadPDF}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '0.6rem 1.2rem',
                        background: 'rgba(255,255,255,0.5)',
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        color: theme.color,
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                >
                    <Download size={18} /> Save Report
                </button>
            </div>

            {/* 2. Visual Data Section */}
            <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                    <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Forensic Signal Radar</h4>
                    <div style={{ height: '200px' }}>
                        <Radar data={radarData} options={radarOptions} />
                    </div>
                </div>

                <div>
                    <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Detailed Risk Metrics</h4>

                    {/* NEW: Quick Check Status Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>

                        {/* Image Status Card */}
                        <div style={{
                            padding: '1rem',
                            borderRadius: '8px',
                            background: technical_stats.ai_prob > 0.5 ? '#fff5f5' : '#f0fff4',
                            border: `1px solid ${technical_stats.ai_prob > 0.5 ? '#feb2b2' : '#9ae6b4'}`,
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                                {technical_stats.ai_prob > 0.5 ? '🤖' : '📸'}
                            </div>
                            <div style={{ fontWeight: 700, color: technical_stats.ai_prob > 0.5 ? '#c53030' : '#2f855a', marginBottom: '0.25rem' }}>
                                {technical_stats.ai_prob > 0.5 ? 'AI Generated' : 'Real Photo'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                                Media Source
                            </div>
                        </div>

                        {/* Text Status Card */}
                        <div style={{
                            padding: '1rem',
                            borderRadius: '8px',
                            background: technical_stats.consistency < 0.28 ? '#fff5f5' : '#f0fff4',
                            border: `1px solid ${technical_stats.consistency < 0.28 ? '#feb2b2' : '#9ae6b4'}`,
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                                {technical_stats.consistency < 0.28 ? '⚠️' : '✅'}
                            </div>
                            <div style={{ fontWeight: 700, color: technical_stats.consistency < 0.28 ? '#c53030' : '#2f855a', marginBottom: '0.25rem' }}>
                                {technical_stats.consistency < 0.28 ? 'Misleading' : 'Accurate'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                                Caption Match
                            </div>
                        </div>

                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* 1. AI Probability Metric */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                <span>Synthetic Media Probability</span>
                                <b>{(technical_stats.ai_prob * 100).toFixed(1)}%</b>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${technical_stats.ai_prob * 100}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    style={{
                                        height: '100%',
                                        background: technical_stats.ai_prob > 0.5 ? 'var(--risk-red)' : 'var(--safe-green)',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                        </div>

                        {/* 2. Semantic Consistency Metric */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                <span>Caption-Image Alignment</span>
                                <b>{(technical_stats.consistency * 100).toFixed(1)}%</b>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${technical_stats.consistency * 100}%` }}
                                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                                    style={{
                                        height: '100%',
                                        background: technical_stats.consistency < 0.28 ? 'var(--risk-red)' : 'var(--safe-green)', // Updated threshold to 0.28
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                        </div>

                        {/* 3. Global Context Metric (Heuristic) */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                <span>Context Verification</span>
                                <b>{is_misinfo ? 'Low' : 'High'} Confidence</b>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: is_misinfo ? '30%' : '90%' }}
                                    transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                                    style={{
                                        height: '100%',
                                        background: is_misinfo ? '#ffc107' : '#17a2b8', // Yellow for low confidence, Blue for high
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* 3. Deep Dive Accordion */}
            <div style={{ borderTop: '1px solid var(--border-light)' }}>
                <button
                    onClick={() => setExpanded(!expanded)}
                    style={{
                        width: '100%',
                        padding: '1.5rem 2rem',
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        fontWeight: 600
                    }}
                >
                    <span>📄 View Evidence Report</span>
                    {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {expanded && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        style={{ padding: '0 2rem 2rem', color: '#444', lineHeight: '1.6', overflow: 'hidden' }}
                    >
                        <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                            <ReactMarkdown components={{
                                strong: ({ node, ...props }) => <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }} {...props} />,
                                ul: ({ node, ...props }) => <ul style={{ paddingLeft: '20px', marginBottom: '1rem' }} {...props} />,
                                li: ({ node, ...props }) => <li style={{ marginBottom: '0.5rem' }} {...props} />
                            }}>
                                {explanation}
                            </ReactMarkdown>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default VerdictCard;
