import React from 'react';
import { RoutePath } from '../../types';
import { MedicalChatLayout } from '../chatbot/MedicalChatLayout';

interface ChatbotPageProps {
  onNavigate?: (route: RoutePath) => void;
}

export const ChatbotPage: React.FC<ChatbotPageProps> = () => {
  return (
    <div className="w-full flex flex-col bg-white">
      <MedicalChatLayout />
    </div>
  );
};
