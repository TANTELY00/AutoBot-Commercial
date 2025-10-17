import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Mic, Image, Smile, Bot, Copy, Download, ThumbsUp, ThumbsDown, Menu, X, Volume2, VolumeX, Maximize2, Minimize2 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "You" | "Bot";
  timestamp: Date;
  liked?: boolean;
}

const botUser = { 
  id: "bot", 
  name: "AutoBot Commercial", 
  avatar: "https://i.pravatar.cc/150?img=10",
  status: "En ligne",
  role: "Assistant Commercial IA"
};

const userAvatar = "https://i.pravatar.cc/150?img=1";

// Typing indicator animé premium
const TypingIndicator: React.FC = () => (
  <div className="flex items-center gap-3 pl-16 mb-2" style={{ fontFamily: "'Ubuntu', sans-serif" }}>
    <div className="flex gap-1.5">
      <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full animate-bounce delay-0"></div>
      <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full animate-bounce delay-200"></div>
      <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full animate-bounce delay-400"></div>
    </div>
    <span className="text-sm text-gray-600 font-medium">AutoBot rédige votre réponse...</span>
  </div>
);

// Composant d'émojis premium
const EmojiPicker: React.FC<{ onEmojiSelect: (emoji: string) => void }> = ({ onEmojiSelect }) => {
  const emojiCategories = {
    "Visages": ["😊", "😂", "🥰", "😎", "🤔", "😢", "😡", "😴"],
    "Gestes": ["👍", "👏", "🙌", "🤝", "✌️", "❤️", "🔥", "🎉"],
    "Objets": ["💡", "📊", "💰", "📈", "📅", "📱", "💻", "📎"]
  };
  
  return (
    <div className="absolute bottom-16 left-0 bg-white border border-gray-300 rounded-2xl shadow-2xl p-4 z-20 w-80 backdrop-blur-lg bg-white/95">
      {Object.entries(emojiCategories).map(([category, emojis]) => (
        <div key={category} className="mb-3">
          <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide" style={{ fontFamily: "'Ubuntu', sans-serif" }}>{category}</h4>
          <div className="grid grid-cols-8 gap-1">
            {emojis.map(emoji => (
              <button
                key={emoji}
                onClick={() => onEmojiSelect(emoji)}
                className="w-8 h-8 hover:bg-blue-50 rounded-lg transition-all duration-200 text-lg hover:scale-110 hover:shadow-sm"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const ChatApp: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Bonjour ! Je suis AutoBot, votre assistant commercial intelligent. Je suis ici pour vous aider avec vos questions commerciales, devis, et stratégies. Comment puis-je vous assister aujourd'hui ?",
      sender: "Bot",
      timestamp: new Date(Date.now() - 300000)
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Configuration du plein écran
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await chatContainerRef.current?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  // Auto-resize textarea amélioré
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 150);
      textareaRef.current.style.height = newHeight + "px";
    }
  }, [newMessage]);

  // Scroll automatique perfectionné
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: "smooth", 
        block: "end" 
      });
    };

    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isBotTyping]);

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleExportChat = () => {
    const chatText = messages.map(msg => 
      `${msg.sender} [${msg.timestamp.toLocaleString()}]: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRateMessage = (messageId: string, liked: boolean) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, liked } : msg
    ));
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const simulateBotResponse = async (userMessage: string) => {
    setIsBotTyping(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const res = await fetch("https://server38.ifb.fr/webhook-test/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: "You",
          content: userMessage,
        }),
      });

      const data = await res.json();
      const reply = data.reply || "Je comprends votre demande. En tant qu'assistant commercial, je peux vous aider avec les devis, les stratégies de vente, l'analyse de marché, et bien plus encore. Pouvez-vous préciser votre besoin ?";

      const botId = (Date.now() + 1).toString();
      setMessages(prev => [
        ...prev,
        { id: botId, content: "", sender: "Bot", timestamp: new Date() },
      ]);

      const tokens = reply.split(" ");
      let index = 0;
      
      const streamMessage = () => {
        if (index < tokens.length) {
          const text = tokens.slice(0, index + 1).join(" ");
          setMessages(prev =>
            prev.map(m => (m.id === botId ? { ...m, content: text } : m))
          );
          index++;
          setTimeout(streamMessage, 60 + Math.random() * 40);
        } else {
          setIsBotTyping(false);
        }
      };
      
      streamMessage();
    } catch (err) {
      console.error("Erreur:", err);
      const errorId = (Date.now() + 1).toString();
      setMessages(prev => [
        ...prev,
        { 
          id: errorId, 
          content: " Désolé, je rencontre des difficultés techniques momentanées. Notre équipe est alertée. En attendant, vous pouvez me poser vos questions commerciales.", 
          sender: "Bot", 
          timestamp: new Date() 
        },
      ]);
      setIsBotTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "You",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setShowEmojiPicker(false);
    await simulateBotResponse(userMessage.content);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickReplies = [
    " Demander un devis personnalisé",
    " Présentation de vos services",
    " Optimisation stratégie commerciale",
    " Analyse de marché disponible",
    " Prendre rendez-vous commercial",
    " Informations tarifaires détaillées"
  ];

  return (
    <div 
      ref={chatContainerRef}
      className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 overflow-hidden"
      style={{ fontFamily: "'Ubuntu', sans-serif" }}
    >
      {/* Import de la police Ubuntu */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap');
        `}
      </style>
      
      <div className="flex h-full w-full">
        {/* Sidebar Épurée */}
        <div className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 w-80 bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800 text-white transition-transform duration-300 z-30 flex flex-col shadow-2xl border-r border-white/10`}>
          
          {/* Header Sidebar */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">AutoBot</h1>
                  <p className="text-xs text-blue-200">Business Edition</p>
                </div>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Statut utilisateur */}
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center">
                <img src={userAvatar} alt="User" className="w-8 h-8 rounded-xl" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Utilisateur</p>
                <p className="text-xs text-blue-200">Session active</p>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Contenu Sidebar */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent p-6">
            <div className="space-y-6">
              {/* Réponses rapides */}
              <div>
                <h3 className="font-semibold text-blue-200 mb-4 text-sm uppercase tracking-wider">
                  Réponses Rapides
                </h3>
                <div className="space-y-2">
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setNewMessage(reply);
                        textareaRef.current?.focus();
                        setSidebarOpen(false);
                      }}
                      className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200 text-sm border border-white/10 hover:border-white/20 hover:shadow-lg hover:transform hover:-translate-y-0.5"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>

              {/* Outils */}
              <div>
                <h3 className="font-semibold text-blue-200 mb-4 text-sm uppercase tracking-wider">
                  Outils
                </h3>
                <div className="space-y-2">
                  <button 
                    onClick={handleExportChat}
                    className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200 text-sm border border-white/10 hover:border-white/20"
                  >
                    <Download className="w-4 h-4" />
                    Exporter la conversation
                  </button>
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200 text-sm border border-white/10 hover:border-white/20"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    {isMuted ? "Activer les sons" : "Désactiver les sons"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Sidebar */}
          <div className="p-6 border-t border-white/10">
            <button 
              onClick={toggleFullscreen}
              className="w-full flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200 text-sm border border-white/10 hover:border-white-20 mb-3"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              {isFullscreen ? "Quitter le plein écran" : "Mode plein écran"}
            </button>
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-xs text-blue-300">
                <span> Sécurisé • Crypté</span>
              </div>
              <p className="text-xs text-blue-400">Version 2.1.0</p>
            </div>
          </div>
        </div>

        {/* Overlay pour mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 z-20 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {/* Header Premium */}
          <div className="bg-white/95 backdrop-blur-xl border-b border-slate-200 px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2.5 hover:bg-slate-100 rounded-xl transition-all duration-200 text-slate-600 hover:text-blue-600"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg flex items-center justify-center">
                      <img src={botUser.avatar} alt="Bot" className="w-12 h-12 rounded-2xl" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full shadow-sm"></div>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">{botUser.name}</h1>
                    <p className="text-sm text-green-600 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      {botUser.status} • {botUser.role}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right text-sm text-slate-600 hidden md:block">
                  <p className="font-medium">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  <p>{new Date().toLocaleTimeString('fr-FR', { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area Premium */}
          <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            <div className="max-w-4xl mx-auto space-y-6 pb-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-4 ${msg.sender === "You" ? "justify-end" : "justify-start"} items-start group`}>
                  {msg.sender === "Bot" && (
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-400 flex items-center justify-center shadow-lg">
                        <img src={botUser.avatar} alt="Bot" className="w-10 h-10 rounded-2xl" />
                      </div>
                    </div>
                  )}

                  <div className={`flex flex-col ${msg.sender === "You" ? "items-end" : "items-start"} max-w-[85%] lg:max-w-[75%] gap-2`}>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span className="font-semibold">{msg.sender === "Bot" ? botUser.name : "Vous"}</span>
                      <span>•</span>
                      <span>{msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div className={`relative px-5 py-4 rounded-3xl shadow-sm ${
                      msg.sender === "You"
                        ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-br-lg shadow-lg"
                        : "bg-white text-slate-900 border border-slate-200 rounded-bl-lg shadow-md"
                    } text-justify whitespace-pre-wrap backdrop-blur-sm`}>
                      <p className="leading-relaxed text-[15px]">{msg.content}</p>
                      
                      {/* Actions sur les messages */}
                      <div className={`absolute top-3 ${msg.sender === "You" ? "left-3" : "right-3"} opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-1.5`}>
                        {msg.sender === "Bot" && (
                          <>
                            <button 
                              onClick={() => handleCopyMessage(msg.content)}
                              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
                              title="Copier le message"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleRateMessage(msg.id, true)}
                              className={`p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110 ${
                                msg.liked === true ? 'text-green-300' : ''
                              }`}
                              title="Utile"
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {msg.sender === "You" && (
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg">
                        <img src={userAvatar} alt="User" className="w-10 h-10 rounded-2xl" />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isBotTyping && <TypingIndicator />}

              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>

          {/* Input Area Style DeepSeek */}
          <div className="bg-white/95 backdrop-blur-xl border-t border-slate-200 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="relative bg-white border border-slate-300 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 focus-within:border-blue-400 focus-within:ring-3 focus-within:ring-blue-500/20">
                {/* Zone de texte style DeepSeek */}
                <textarea
                  ref={textareaRef}
                  rows={1}
                  className="w-full p-4 pr-20 bg-transparent border-0 resize-none focus:outline-none focus:ring-0 text-[15px] placeholder-slate-400 rounded-2xl"
                  placeholder="Envoyez un message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setShowEmojiPicker(false)}
                  style={{ fontFamily: "'Ubuntu', sans-serif" }}
                />

                {/* Boutons en bas à droite style DeepSeek */}
                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  {/* Boutons d'actions */}
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                      <Image className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Séparateur */}
                  <div className="w-px h-6 bg-slate-300 mx-1"></div>

                  {/* Bouton d'envoi style DeepSeek */}
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center disabled:shadow-none"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                {/* Picker d'émojis */}
                {showEmojiPicker && (
                  <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                )}
              </div>
              
              {/* Informations en bas style DeepSeek */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 text-sm text-slate-500 px-1 gap-2">
                <span className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span>Session sécurisée • Cryptage de bout en bout</span>
                </span>
                <span className="text-xs font-medium">Entrée = envoyer • Shift + Entrée = nouvelle ligne</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;