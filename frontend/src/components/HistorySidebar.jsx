import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, AlertTriangle, FileText, ChevronRight } from 'lucide-react';

const HistorySidebar = ({ history, onSelect, currentId }) => {
    return (
        <div style={{
            width: '280px',
            background: 'white',
            borderRight: '1px solid var(--border-light)',
            height: '100%',
            overflowY: 'auto',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} /> Recent Scans
            </h3>

            <div style={{ flex: 1 }}>
                <AnimatePresence>
                    {history.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}
                        >
                            <p style={{ fontSize: '0.9rem' }}>No history yet.</p>
                        </motion.div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {history.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    layout
                                    onClick={() => onSelect(item)}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        background: item.id === currentId ? 'var(--bg-secondary)' : 'white',
                                        border: item.id === currentId ? '1px solid var(--accent-black)' : '1px solid var(--border-light)',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                    whileHover={{ y: -2, boxShadow: 'var(--shadow-sm)' }}
                                >
                                    {/* Status Indicator Bar */}
                                    <div style={{
                                        position: 'absolute',
                                        left: 0, top: 0, bottom: 0, width: '4px',
                                        background: item.result.is_misinfo ? 'var(--risk-red)' : 'var(--safe-green)'
                                    }} />

                                    <div style={{ marginLeft: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: item.result.is_misinfo ? 'var(--risk-red)' : 'var(--safe-green)' }}>
                                                {item.result.is_misinfo ? 'RISK DETECTED' : 'AUTHENTIC'}
                                            </span>
                                            <span style={{ fontSize: '0.7rem', color: '#888' }}>
                                                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        <p style={{
                                            margin: 0, fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)',
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                        }}>
                                            {item.claim || "Untitled Analysis"}
                                        </p>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                                            <FileText size={12} color="#888" />
                                            <span style={{ fontSize: '0.75rem', color: '#666' }}>{item.file.name}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default HistorySidebar;
