
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { AnalysisResult } from '../types';

interface ChatbotProps {
    analysisResults: AnalysisResult[];
}

const API_KEY = process.env.API_KEY;

const Chatbot: React.FC<ChatbotProps> = ({ analysisResults }) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        const initChat = async () => {
            if (!API_KEY) {
                setIsLoading(false);
                setMessages([{ role: 'model', text: "API Key is not configured. The chatbot cannot be initialized." }]);
                return;
            }

            try {
                setIsLoading(true);
                const ai = new GoogleGenAI({ apiKey: API_KEY });
                const analysisSummary = "Here is the vehicle damage assessment summary:\n" +
                    analysisResults.map(r => 
                        `Image analysis found ${r.analysis.damages.length} damages with a total estimated cost of INR ${r.analysis.totalEstimatedCostINR}. ` +
                        `Damages include: ${r.analysis.damages.map(d => `${d.severity} ${d.damageType} on the ${d.location}`).join(', ') || 'None'}.`
                    ).join('\n');
                
                const newChat = ai.chats.create({
                    model: 'gemini-3-flash-preview',
                    config: {
                        systemInstruction: 'You are a helpful AI assistant for a vehicle damage analysis tool. Your name is VDA-Bot. You are friendly, concise, and your goal is to answer user questions about their damage report, repair costs, insurance claims, and next steps. You already have the full damage report context.'
                    }
                });
                
                const response: GenerateContentResponse = await newChat.sendMessage({ message: analysisSummary + "\n\nPlease greet the user and let them know you are ready to help with any questions about their report." });

                setMessages([{ role: 'model', text: response.text }]);
                setChat(newChat);
            } catch(e) {
                console.error("Chatbot initialization failed", e);
                setMessages([{ role: 'model', text: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
            } finally {
                setIsLoading(false);
            }
        };
        initChat();
    }, [analysisResults]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !chat || isLoading) return;
        
        const userMessage = { role: 'user' as const, text: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const response: GenerateContentResponse = await chat.sendMessage({ message: currentInput });
            setMessages(prev => [...prev, { role: 'model', text: response.text }]);
        } catch(e) {
            console.error("Chatbot send message failed", e);
            setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an error. Could you please rephrase your question?" }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-brand-dark/50 rounded-lg p-4 flex flex-col h-[60vh] border border-gray-800">
            <div className="flex-grow overflow-y-auto mb-4 pr-2 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-xl shadow-md ${msg.role === 'user' ? 'bg-brand-primary text-white' : 'bg-gray-700 text-gray-200'}`}>
                           <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && messages.length > 0 && (
                    <div className="flex justify-start">
                         <div className="bg-gray-700 text-gray-200 px-4 py-3 rounded-xl">
                            <div className="flex items-center space-x-2">
                                <span className="h-2 w-2 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-brand-primary rounded-full animate-bounce"></span>
                            </div>
                         </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="flex-shrink-0 flex items-center border-t border-gray-700 pt-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about your report..."
                    className="flex-grow bg-gray-800 text-white placeholder-gray-400 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-300 focus:shadow-glow-primary-light border border-gray-700 transition-shadow"
                    disabled={isLoading || !chat}
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading || !chat || !input.trim()}
                    className="ml-4 px-6 py-2 bg-brand-secondary text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-glow-primary disabled:bg-gray-600 disabled:shadow-none disabled:scale-100 disabled:cursor-not-allowed transition-shadow"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
