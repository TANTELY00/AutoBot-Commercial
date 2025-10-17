import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Mic, Image, Smile, Bot, Copy } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "You" | "Bot";
  timestamp: Date;
}

const botUser = { id: "bot", name: "AutoBot", avatar: "https://i.pravatar.cc/150?img=10" };
const userAvatar = "https://i.pravatar.cc/150?img=1";

// Typing indicator animé (3 points)
const TypingIndicator: React.FC = () => (
  <div className="flex items-center gap-1 pl-16">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-0"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
  </div>
);

const ChatApp: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automatique
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Copier le message
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    alert("Message copié !");
  };

  // Envoyer un message
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
    setIsBotTyping(true);

    try {
      // Appel serveur (JSON {reply: "..."})
      const res = await fetch("https://server38.ifb.fr/webhook-test/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: userMessage.sender,
          content: userMessage.content,
        }),
      });

      const data = await res.json();
      const reply = data.reply;

      const botId = (Date.now() + 1).toString();
      setMessages(prev => [
        ...prev,
        { id: botId, content: "", sender: "Bot", timestamp: new Date() },
      ]);

      // Streaming mot par mot
      const tokens = reply.split(" ");
      let index = 0;
      const interval = setInterval(() => {
        index++;
        const text = tokens.slice(0, index).join(" ");
        setMessages(prev =>
          prev.map(m => (m.id === botId ? { ...m, content: text } : m))
        );
        if (index === tokens.length) {
          clearInterval(interval);
          setIsBotTyping(false);
        }
      }, 100); // 100ms par mot
    } catch (err) {
      console.error("Erreur:", err);
      setIsBotTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-600 text-white px-6 py-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg animate-pulse">
            <Bot className="w-7 h-7 text-indigo-700 animate-bounce" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wide">AutoBot Commercial</h1>
            <p className="text-sm text-green-300 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              En ligne • Prêt à vous aider
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-indigo-100">
        <div className="max-w-3xl mx-auto flex flex-col space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === "You" ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              {msg.sender === "Bot" && (
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                    <img src={botUser.avatar} alt="Bot" className="w-10 h-10 rounded-full" />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1 max-w-[70%]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {msg.sender === "Bot" ? botUser.name : "Vous"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <div
                  className={`px-5 py-3 rounded-3xl shadow-lg relative ${
                    msg.sender === "You"
                      ? "bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-br-none animate-slide-right text-justify"
                      : "bg-white text-gray-900 border border-gray-200 rounded-bl-none animate-slide-left text-justify"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                  {/* Bouton copier */}
                  {msg.sender === "Bot" && msg.content && (
                    <button
                      onClick={() => handleCopyMessage(msg.content)}
                      className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded-full transition"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>

              {msg.sender === "You" && (
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shadow-md">
                    <img src={userAvatar} alt="User" className="w-10 h-10 rounded-full" />
                  </div>
                </div>
              )}
            </div>
          ))}

          {isBotTyping && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-indigo-200 p-6 shadow-inner">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex gap-2">
              <button className="p-3 text-indigo-500 hover:text-white hover:bg-indigo-500 rounded-xl transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              <button className="p-3 text-indigo-500 hover:text-white hover:bg-indigo-500 rounded-xl transition-colors">
                <Image className="w-5 h-5" />
              </button>
              <button className="p-3 text-indigo-500 hover:text-white hover:bg-indigo-500 rounded-xl transition-colors">
                <Smile className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 relative">
              <textarea
                rows={1}
                className="w-full p-4 pr-20 bg-indigo-50 border border-indigo-300 rounded-3xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-indigo-400"
                placeholder="Tapez votre message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
              />

              <div className="absolute right-2 bottom-2 flex items-center gap-2">
                <button className="p-3 text-indigo-500 hover:text-white hover:bg-indigo-500 rounded-xl transition-colors">
                  <Mic className="w-5 h-5" />
                </button>

                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-3xl hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-pink-400/25"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 text-xs text-gray-500 px-1">
            <span>Appuyez sur Entrée pour envoyer</span>
            <span>Shift + Entrée pour une nouvelle ligne</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
