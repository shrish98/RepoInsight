import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

const cleanMarkdownForTTS = (text) => {
  if (!text) return '';
  return text
    .replace(/```[\s\S]*?```/g, ' Code snippet omitted. ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/#+\s/g, '')
    .replace(/[*_~]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/[-*+]\s/g, '')
    .trim();
};

const iconButton = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-md transition-colors disabled:opacity-40';

export default function VoiceChatControls({ setQuestion, isAsking, isReady, latestAgentMessage }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

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
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (transcript.trim()) setQuestion(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
  }, [setQuestion]);

  useEffect(() => {
    if (!isSpeechEnabled || !latestAgentMessage || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = cleanMarkdownForTTS(latestAgentMessage);
    if (cleanText) window.speechSynthesis.speak(new SpeechSynthesisUtterance(cleanText));
  }, [latestAgentMessage, isSpeechEnabled]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    window.speechSynthesis?.cancel();
    try {
      recognitionRef.current?.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  const toggleSpeechOutput = () => {
    if (isSpeechEnabled) window.speechSynthesis?.cancel();
    setIsSpeechEnabled((on) => !on);
  };

  return (
    <div className="flex items-center">
      {supported && (
        <button
          type="button"
          onClick={toggleListening}
          disabled={isAsking || !isReady}
          aria-pressed={isListening}
          title={isListening ? 'Stop listening' : 'Ask out loud'}
          aria-label={isListening ? 'Stop listening' : 'Ask out loud'}
          className={`${iconButton} ${isListening ? 'bg-danger-soft text-danger' : 'text-ink-2 hover:bg-sunken hover:text-ink'}`}
        >
          {isListening ? <MicOff className="h-[18px] w-[18px]" /> : <Mic className="h-[18px] w-[18px]" />}
        </button>
      )}
      <button
        type="button"
        onClick={toggleSpeechOutput}
        aria-pressed={isSpeechEnabled}
        title={isSpeechEnabled ? 'Stop reading answers aloud' : 'Read answers aloud'}
        aria-label={isSpeechEnabled ? 'Stop reading answers aloud' : 'Read answers aloud'}
        className={`${iconButton} ${isSpeechEnabled ? 'bg-accent-soft text-accent' : 'text-ink-2 hover:bg-sunken hover:text-ink'}`}
      >
        {isSpeechEnabled ? <Volume2 className="h-[18px] w-[18px]" /> : <VolumeX className="h-[18px] w-[18px]" />}
      </button>
    </div>
  );
}
