import React from 'react';
import { motion } from 'framer-motion';

const ScanningOverlay = ({ imageSrc }) => {
    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '400px',
            background: '#000',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--accent-black)'
        }}>
            {/* Background Image (Darkened) */}
            <img
                src={imageSrc}
                alt="Scanning"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    opacity: 0.5,
                    filter: 'grayscale(100%)'
                }}
            />

            {/* Grid Overlay */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: 'linear-gradient(#00ff0033 1px, transparent 1px), linear-gradient(90deg, #00ff0033 1px, transparent 1px)',
                backgroundSize: '50px 50px',
                opacity: 0.3
            }}></div>

            {/* Laser Scan Line */}
            <motion.div
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: '#00ff00',
                    boxShadow: '0 0 20px #00ff00, 0 0 40px #00ff00',
                    zIndex: 10
                }}
            />

            {/* Text Overlay */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                color: '#00ff00',
                fontFamily: 'monospace',
                fontSize: '1rem',
                fontWeight: 'bold',
                textShadow: '0 0 10px #00ff00'
            }}>
                <TypingText text="INITIALIZING DEEPFAKE SENSORS... ANALYZING PIXELS... EXTRACTING METADATA..." />
            </div>

            {/* Corner Brackets */}
            <Corner top={10} left={10} />
            <Corner top={10} right={10} rotate={90} />
            <Corner bottom={10} right={10} rotate={180} />
            <Corner bottom={10} left={10} rotate={270} />
        </div>
    );
};

// Helper for Corner Brackets
const Corner = ({ top, bottom, left, right, rotate }) => (
    <div style={{
        position: 'absolute',
        top, bottom, left, right,
        width: '30px',
        height: '30px',
        borderTop: '4px solid #00ff00',
        borderLeft: '4px solid #00ff00',
        transform: `rotate(${rotate || 0}deg)`,
        boxShadow: '0 0 10px #00ff0033'
    }} />
);

// Helper for Typing Effect
const TypingText = ({ text }) => {
    return (
        <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        >
            {text}
        </motion.span>
    );
};

export default ScanningOverlay;
