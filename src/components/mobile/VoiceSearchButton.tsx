'use client';

import { Mic, MicOff } from 'lucide-react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useEffect } from 'react';

interface VoiceSearchButtonProps {
  onTranscript: (text: string) => void;
}

export default function VoiceSearchButton({ onTranscript }: VoiceSearchButtonProps) {
  const { isListening, transcript, isSupported, startListening, stopListening } =
    useVoiceInput();

  useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  if (!isSupported) {
    return null;
  }

  return (
    <button
      onClick={isListening ? stopListening : startListening}
      className={`p-3 rounded-full min-w-[44px] min-h-[44px] transition-all ${
        isListening
          ? 'bg-red-600 animate-pulse'
          : 'bg-blue-600 hover:bg-blue-700'
      }`}
      aria-label={isListening ? 'Stop listening' : 'Start voice search'}
    >
      {isListening ? (
        <MicOff className="w-5 h-5 text-white" />
      ) : (
        <Mic className="w-5 h-5 text-white" />
      )}
    </button>
  );
}
