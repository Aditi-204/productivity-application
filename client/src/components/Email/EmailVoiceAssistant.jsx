import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const COMMANDS = {
  "read today's important emails": "Opening high-priority emails from today...",
  'reply politely': "Generating a polite reply template...",
  'summarize unread emails': "Summarizing all unread emails...",
  'create tasks from todays emails': "Extracting tasks from today's emails...",
  'show pending approvals': "Filtering emails needing approval...",
  'prepare my end of day report': "Generating your end-of-day report...",
  'show unread': "Filtering unread emails...",
  'show from hr': "Filtering HR emails...",
};

const EmailVoiceAssistant = ({ onCommand }) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState('');
  const recognitionRef = useRef(null);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
      setTranscript('');
      setResult('');
    };

    recognition.onresult = (event) => {
      const current = event.results[event.results.length - 1];
      const text = current[0].transcript.toLowerCase();
      setTranscript(text);

      if (current.isFinal) {
        const matched = Object.entries(COMMANDS).find(([cmd]) =>
          text.includes(cmd) || cmd.includes(text)
        );
        if (matched) {
          setResult(matched[1]);
          if (onCommand) onCommand(matched[0]);
          toast.success(`AI: ${matched[1]}`);
        } else {
          setResult(`I heard: "${text}". Try: ${Object.keys(COMMANDS).slice(0, 3).join(', ')}`);
        }
      }
    };

    recognition.onerror = () => {
      setListening(false);
      toast.error('Voice recognition error');
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onCommand]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  }, []);

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={listening ? stopListening : startListening}
            className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              listening
                ? 'bg-red-500/20 border border-red-500/30'
                : 'bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08]'
            }`}
          >
            <svg className={`w-5 h-5 ${listening ? 'text-red-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
            {listening && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            )}
          </motion.button>
          <div>
            <p className="text-sm font-medium text-gray-200">AI Voice Assistant</p>
            <p className="text-xs text-gray-500">
              {listening ? 'Listening...' : 'Tap to speak a command'}
            </p>
          </div>
        </div>
        {transcript && (
          <span className="text-xs text-gray-500 italic max-w-[200px] truncate">"{transcript}"</span>
        )}
      </div>
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 rounded-xl bg-gradient-to-r from-[#C4B5FD]/10 to-[#A5F3FC]/10 border border-[#C4B5FD]/20"
        >
          <p className="text-xs text-primary-300">{result}</p>
        </motion.div>
      )}
    </div>
  );
};

export default EmailVoiceAssistant;
