import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { claudeChat } from '../claudeApi';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export function Chatbot({ language }: { language: 'lv' | 'en' | 'ru' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = {
    lv: {
      title: "Asistents",
      placeholder: "Ierakstiet savu jautājumu...",
      greeting: "Sveiki! Esmu Ivara Bajāra virtuālais asistents. Kā varu palīdzēt ar informāciju par viņa profesionālo pieredzi vai šīs lapas funkcionalitāti?",
      buttonText: "Kā varu palīdzēt?",
    },
    en: {
      title: "Assistant",
      placeholder: "Type your question...",
      greeting: "Hello! I am Ivars Bajārs' virtual assistant. How can I help you with information about his professional experience or this website's functionality?",
      buttonText: "How can I help?",
    },
    ru: {
      title: "Ассистент",
      placeholder: "Введите ваш вопрос...",
      greeting: "Здравствуйте! Я виртуальный ассистент Иварса Баярса. Чем могу помочь с информацией о его профессиональном опыте или функциональности этого сайта?",
      buttonText: "Чем могу помочь?",
    }
  };

  const systemInstruction = `You are a helpful virtual assistant for Ivars Bajārs, a legal professional. 
Your STRICT job is to answer questions ONLY about Ivars Bajārs' professional experience, the legal services offered on this platform, and how this website works.

CRITICAL RULE: You MUST NOT answer any general knowledge questions, write code, solve math problems, or discuss topics outside of the legal services provided here and Ivars Bajārs' professional profile. If a user asks something outside this scope, politely decline and state that you can only answer questions related to the platform's legal services and Ivars Bajārs.

Website functionality:
- Users can order legal opinions (Vienkāršots atzinums, Padziļināts atzinums), document preparation (Dokumentu sagatavošana), and use the debt calculator (Parāda kalkulators).
- Users must register/login to order.
- Users can specify the date and the applicable country law (currently Latvia).
- Padziļināts atzinums (Deep opinions) and Dokumentu sagatavošana allow uploading PDF/DOCX documents.
- Based on the Padziļināts atzinums, the system can also generate procedural documents (like claims, warnings, contracts) and in-depth risk analysis.
- The site has a dashboard for users to see their generated opinions and documents.

IMPORTANT RULE ABOUT OPINIONS:
Do NOT say that Ivars Bajārs provides or prepares the opinions. 
Instead, you MUST state that the application developed by Ivars Bajārs prepares the opinions ("Ivara Bajāra izstrādātā aplikācija sagatavo atzinumus").

Professional experience of Ivars Bajārs:
- Legal professional providing clarity in complex legal matters.
- Specializes in providing professional legal opinions for peace of mind and safe decisions.
- Translates complex legal language into a clear action plan.

FORMATTING RULES:
- DO NOT use markdown formatting like asterisks (* or **) for bolding or italics.
- DO NOT use any special markdown symbols.
- Use plain text only.
- Use clear paragraph breaks for readability.
- If you need to make a list, use simple dashes (-) with a space.

Please answer in the language the user asks the question in, or default to ${language === 'lv' ? 'Latvian' : language === 'en' ? 'English' : 'Russian'}.
Keep answers concise, professional, and helpful. If you don't know something within your allowed scope, politely state that you don't have that specific information and recommend contacting Ivars directly.`;

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'greeting',
        role: 'assistant',
        text: t[language].greeting
      }]);
    }
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Sagatavo sarunu vēsturi Claude formātā
      const history = messages
        .filter(m => m.id !== 'greeting')
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.text
        }));

      // Pievieno jaunāko ziņu
      history.push({ role: 'user', content: userMessage });

      const responseText = await claudeChat(history, {
        system: systemInstruction,
        maxTokens: 1000,
      });

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        text: responseText || "Piedodiet, radās kļūda. (Sorry, an error occurred.)"
      }]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        text: "Piedodiet, radās kļūda savienojumā ar asistentu."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-6 w-80 sm:w-96 gold-panel overflow-hidden z-50 flex flex-col h-[500px] max-h-[80vh]"
          >
            <div className="bg-white/30 border-b border-black/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/40 flex items-center justify-center border border-black/5 shadow-sm">
                  <MessageCircle className="w-4 h-4 text-black/80" />
                </div>
                <h3 className="font-serif text-black text-lg font-semibold">{t[language].title}</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-black/60 hover:text-black transition-colors bg-white/30 hover:bg-white/50 rounded-md p-1.5 shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-md whitespace-pre-wrap ${
                      msg.role === 'user' 
                        ? 'bg-black/80 text-white rounded-tr-sm backdrop-blur-md' 
                        : 'bg-white/60 text-black border border-white/40 rounded-tl-sm backdrop-blur-md'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/60 border border-white/40 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md backdrop-blur-md">
                    <Loader2 className="w-4 h-4 text-black/40 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-black/10 bg-white/30">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t[language].placeholder}
                  className="w-full gold-input pl-4 pr-12 py-3 text-sm transition-colors shadow-sm"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg gold-button text-black flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-sm"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 h-14 rounded-full flex items-center justify-center transition-all duration-300 z-50 gold-button ${
          isOpen 
            ? 'w-14' 
            : 'px-6 gap-3 font-bold'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-5 h-5" />
            <span>{t[language].buttonText}</span>
          </>
        )}
      </button>
    </>
  );
}
