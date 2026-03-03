'use client';

import { useState } from 'react';
import { Bot, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatWindow } from './ChatWindow';

export const ElPilotoChat = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <ChatWindow onClose={() => setIsOpen(false)} />
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg z-50 hover:bg-blue-700 transition-colors flex items-center justify-center"
        aria-label="Abrir asistente El Piloto"
      >
        {isOpen ? <MessageSquare className="w-6 h-6" /> : <Bot className="w-8 h-8" />}
      </motion.button>
    </>
  );
};
