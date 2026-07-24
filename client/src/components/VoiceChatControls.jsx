import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to strip markdown symbols so TTS reads clean natural speech
const cleanMarkdownForTTS = (text) => {
    if (!text) return '';
    return text
        .replace(/```[\s\S]*?```/g, ' Code snippet omitted. ') // Replace code blocks
        .replace(/`([^`]+)`/g, '$1')                        // Remove inline backticks
        .replace(/#+\s/g, '')                               // Remove headings
        .replace(/[*_~]/g, '')                              // Remove bold/italics
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')            // Remove links, keep text
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')             // Remove images
        .replace(/[-*+]\s/g, '')                            // Remove bullet points
        .trim();
};

export default function VoiceChatControls({ 
    question, 
    setQuestion, 
    onSendMessage, 
    isAsking, 
    isReady, 
    latestAgentMessage 
}) {
    const [isListening, setIsListening] = useState(false);
    const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [supported, setSupported] = useState(true);

    const recognitionRef = useRef(null);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setSupported(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let currentTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                currentTranscript += event.results[i][0].transcript;
            }
            if (currentTranscript.trim()) {
                setQuestion(currentTranscript);
            }
        };

        recognition.onerror = (event) => {
            console.warn('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
    }, [setQuestion]);

    // Handle TTS when AI responds
    useEffect(() => {
        if (isSpeechEnabled && latestAgentMessage && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop any previous speech
            
            const cleanText = cleanMarkdownForTTS(latestAgentMessage);
            if (cleanText) {
                const utterance = new SpeechSynthesisUtterance(cleanText);
                utterance.rate = 1.0;
                utterance.pitch = 1.0;
                
                utterance.onstart = () => setIsSpeaking(true);
                utterance.onend = () => setIsSpeaking(false);
                utterance.onerror = () => setIsSpeaking(false);

                window.speechSynthesis.speak(utterance);
            }
        }
    }, [latestAgentMessage, isSpeechEnabled]);

    // Toggle Microphone Recording
    const toggleListening = () => {
        if (!supported) {
            alert('Speech recognition is not supported in your browser. Please try Google Chrome or MS Edge.');
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            // Stop any ongoing speech synthesis first
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
            }
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (e) {
                console.error("Speech recognition start error:", e);
                setIsListening(false);
            }
        }
    };

    // Toggle Voice Output (Text-to-Speech)
    const toggleSpeechOutput = () => {
        if (isSpeechEnabled) {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            setIsSpeaking(false);
            setIsSpeechEnabled(false);
        } else {
            setIsSpeechEnabled(true);
        }
    };

    return (
        <div className="flex items-center gap-2 mr-2">
            {/* Mic Toggle Button */}
            <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={toggleListening}
                disabled={isAsking || !isReady}
                title={isListening ? "Stop listening" : "Speak your question"}
                className={`p-3 rounded-xl transition-all relative flex items-center justify-center ${
                    isListening 
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/50' 
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
            >
                {isListening ? (
                    <>
                        <MicOff className="w-5 h-5 z-10" />
                        <span className="absolute inset-0 rounded-xl bg-rose-500 animate-ping opacity-50" />
                    </>
                ) : (
                    <Mic className="w-5 h-5 text-indigo-300" />
                )}
            </motion.button>

            {/* Speaker Toggle Button (TTS) */}
            <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={toggleSpeechOutput}
                title={isSpeechEnabled ? "Disable AI voice output" : "Enable AI voice output"}
                className={`p-3 rounded-xl transition-all flex items-center justify-center border ${
                    isSpeechEnabled 
                        ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300 shadow-md shadow-indigo-500/20' 
                        : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300 hover:bg-white/10'
                }`}
            >
                {isSpeechEnabled ? (
                    <div className="relative flex items-center justify-center">
                        <Volume2 className="w-5 h-5 text-indigo-400" />
                        {isSpeaking && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        )}
                    </div>
                ) : (
                    <VolumeX className="w-5 h-5" />
                )}
            </motion.button>
        </div>
    );
}
