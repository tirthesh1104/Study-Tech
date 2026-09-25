import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, UserRole, User, ChatInteraction } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

interface ChatbotProps {
  user: User;
  context: string;
  userRole: UserRole;
  actions: { [key: string]: (...args: any[]) => Promise<any> };
}

// ─── GROQ FREE API ───────────────────────────────────────────────
// Free forever at console.groq.com — no credit card needed
// Get your free key at: https://console.groq.com/keys
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant'; // free & fast
// ─────────────────────────────────────────────────────────────────

const buildSystemPrompt = (context: string) => `
You are SmartCampus AI — a highly intelligent, friendly campus assistant.
Perform exactly like ChatGPT (GPT-4). ONLY respond in English. No narrator text.

PERSONALITY:
- Warm, enthusiastic, helpful like a great mentor
- Use emojis naturally (✨🚀🎓📚💡)
- Use markdown: **bold**, ## headers, bullet lists, numbered lists, code blocks
- Give thorough, complete answers

CAPABILITIES:

1. COMPLETE LEARNING ROADMAPS
When asked how to learn anything (Python, Java, ML, DSA, etc.):
- Full phase-by-phase roadmap with weeks/months
- Free resources (YouTube channels, websites, books)
- Hands-on projects at each stage with timelines

2. NOTES & STUDY MATERIAL
When asked for notes on any subject:
- Format: Overview → Key Concepts → Explanation → Examples → Quick Revision
- Subjects: Maths, Physics, Chemistry, CS, DSA, Algorithms, Web Dev, ML, Electronics, Mechanical, Civil, Management, Economics
- Faculty notes available at: SmartCampus Portal → Resources → Faculty Notes

3. STUDY PLANNER (this week):
- Monday: Maths (Integration by Parts), Physics (Wave Optics), CS (Binary Trees)
- Tuesday: Chemistry (SN1/SN2 Reactions), Maths (Differential Equations), Electronics (Op-Amps)
- Wednesday: CS (Dijkstra's Algorithm), Physics (Thermodynamics), Management (Project Planning)
- Thursday: DSA (Heaps & Priority Queues), Web Dev (React Hooks), ML (Neural Networks)
- Friday: Algorithms (Dynamic Programming), Chemistry (Electrochemistry), Soft Skills
- Saturday: Full Revision + Practice Tests + Assignments
If student asks what they missed — give exact topics + catch-up plan.

4. CAREER GUIDANCE: roadmaps, job roles, salaries, freelancing tips

5. EXAM PREP: mock questions, revision plans, strategies

6. DASHBOARD NAVIGATION:
You can help the user navigate to different parts of their dashboard.
If a user asks to see something (e.g., "show me my attendance", "go to live classes"), use the available tools to navigate.

Always end with a helpful follow-up tip or question.
Current context: ${context}
`;

const callGroq = async (
  messages: { role: 'user' | 'assistant' | 'system' | 'tool'; content?: string; tool_calls?: any[]; tool_call_id?: string; name?: string }[],
  tools?: any[]
): Promise<any> => {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      tools,
      tool_choice: 'auto',
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as any;
    throw new Error(err?.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json() as any;
  return data?.choices?.[0]?.message;
};

const renderMd = (text: string): string => {
  let h = text
    .replace(/```[\w]*\n?([\s\S]*?)```/g, (_: string, c: string) =>
      `<pre style="background:#0d1117;border:1px solid #30363d;border-radius:8px;padding:12px;overflow-x:auto;margin:8px 0;font-size:12px;"><code style="color:#e6edf3;font-family:monospace;">${c.trim()}</code></pre>`)
    .replace(/`([^`\n]+)`/g, '<code style="background:rgba(79,70,229,0.2);color:#a5b4fc;padding:1px 6px;border-radius:4px;font-family:monospace;font-size:12px;">$1</code>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:13.5px;font-weight:700;margin:8px 0 3px;color:#e2e8f0;">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:15px;font-weight:700;margin:10px 0 4px;color:#a5b4fc;">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:16px;font-weight:800;margin:12px 0 5px;color:#818cf8;">$1</h1>')
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong style="font-weight:700;color:#a5b4fc;">$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em style="color:#34d399;font-style:normal;font-weight:600;">$1</em>')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #374151;margin:10px 0;">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:#60a5fa;text-decoration:underline;">$1</a>');

  h = h.replace(/((?:^\d+\. .+$\n?)+)/gm, (m: string) => {
    const items = m.trim().split('\n').map((l: string) => `<li style="margin-bottom:3px;">${l.replace(/^\d+\. /, '')}</li>`).join('');
    return `<ol style="padding-left:18px;margin:6px 0;">${items}</ol>`;
  });
  h = h.replace(/((?:^[*\-] .+$\n?)+)/gm, (m: string) => {
    const items = m.trim().split('\n').map((l: string) => `<li style="margin-bottom:3px;">${l.replace(/^[*\-] /, '')}</li>`).join('');
    return `<ul style="padding-left:18px;margin:6px 0;">${items}</ul>`;
  });

  return h.split(/\n\n+/).map((b: string) => {
    if (/^<(h[123]|ul|ol|pre|hr)/.test(b)) return b;
    const inner = b.replace(/\n/g, '<br>');
    return inner.trim() ? `<p style="margin-bottom:7px;line-height:1.65;">${inner}</p>` : '';
  }).join('');
};

const Chatbot: React.FC<ChatbotProps> = ({ user, context, userRole, actions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [interactions, setInteractions] = useLocalStorage<ChatInteraction[]>('interaction_analytics', []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showClear, setShowClear] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const systemPrompt = buildSystemPrompt(context);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 80); }, [isOpen]);

  const recordInteraction = (query: string, response: string) => {
    const newInteraction: ChatInteraction = {
      id: `chat-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      query,
      response,
      timestamp: new Date().toISOString()
    };
    setInteractions([...interactions, newInteraction]);
  };

  const send = useCallback(async (text: string) => {
    const t = text.trim();
    if (!t || isLoading) return;
    const userMsg: ChatMessage = { sender: 'user', text: t };
    setMessages(prev => {
      const next = [...prev, userMsg];
      (async () => {
        setIsLoading(true);
        try {
          const groqMessages: any[] = [
            { role: 'system', content: systemPrompt },
            ...next.map(m => ({
              role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
              content: m.text,
            })),
          ];

          // Define tools for Groq based on the actions prop
          const tools = Object.keys(actions).map(actionName => {
              if (actionName === 'navigate_to_tab') {
                  return {
                      type: 'function',
                      function: {
                          name: 'navigate_to_tab',
                          description: 'Navigate to a specific tab in the dashboard',
                          parameters: {
                              type: 'object',
                              properties: {
                                  tab: {
                                      type: 'string',
                                      description: 'The name of the tab to navigate to'
                                  }
                              },
                              required: ['tab']
                          }
                      }
                  };
              }
              if (actionName === 'find_student') {
                return {
                    type: 'function',
                    function: {
                        name: 'find_student',
                        description: 'Find a student by name and show their details',
                        parameters: {
                            type: 'object',
                            properties: {
                                studentName: {
                                    type: 'string',
                                    description: 'The full or partial name of the student'
                                }
                            },
                            required: ['studentName']
                        }
                    }
                };
              }
              return null;
          }).filter(Boolean);

          let response = await callGroq(groqMessages, tools.length > 0 ? tools : undefined);

          // Handle Tool Calls
          if (response?.tool_calls) {
              const toolCalls = response.tool_calls;
              groqMessages.push(response);

              for (const call of toolCalls) {
                  const args = JSON.parse(call.function.arguments);
                  const result = await actions[call.function.name](...Object.values(args));
                  groqMessages.push({
                      role: 'tool',
                      tool_call_id: call.id,
                      name: call.function.name,
                      content: String(result)
                  });
              }

              // Second call to get final text
              response = await callGroq(groqMessages);
          }

          const botMsg: ChatMessage = { sender: 'bot', text: response?.content || "I'm not sure how to respond to that." };
          setMessages(prev => [...prev, botMsg]);
          recordInteraction(t, botMsg.text);
        } catch (e) {
          console.error('Groq call failed:', e);
          setMessages(prev => [...prev, { sender: 'bot', text: 'Error connecting to SmartCampus AI. Please try again later.' }]);
        } finally {
          setIsLoading(false);
          inputRef.current?.focus();
        }
      })();
      return next;
    });
    setInput('');
  }, [systemPrompt, isLoading, actions, interactions, user]);

  const chips = [
    { l: '🐍 Learn Python', t: 'How do I learn Python from scratch? Give me a complete roadmap.' },
    { l: '📅 Missed Today?', t: 'I was absent today. What was covered? Give me a catch-up plan.' },
    { l: '📝 DS Notes', t: 'Give me complete notes on Data Structures — Linked Lists, Trees, Graphs.' },
    { l: '💼 Careers', t: 'Best career paths after CS degree? Include salaries and skills needed.' },
    { l: '🧪 Exam Plan', t: 'Create a 30-day exam preparation plan for me.' },
  ];

  return (
    <>
      {isOpen && (
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'bottom right', height: '580px' }}
          className="fixed bottom-24 right-8 w-[22rem] bg-gray-900 border border-indigo-500/25 rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gray-800/70 border-b border-gray-700/50 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg shadow-md">🎓</div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">SmartCampus AI</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <button onClick={() => setZoom(p => Math.max(0.75, +(p - 0.1).toFixed(1)))} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors" title="Zoom Out">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
              </button>
              <span className="text-[10px] font-mono text-indigo-400 w-7 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(p => Math.min(1.4, +(p + 0.1).toFixed(1)))} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors" title="Zoom In">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              </button>
              <button onClick={() => setShowClear(true)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors ml-1" title="Clear Chat">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ minHeight: 0 }}>
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="text-5xl mb-3">✨</div>
                <p className="text-white font-bold text-base mb-1">Hi! I'm SmartCampus AI</p>
                <p className="text-gray-400 text-xs leading-relaxed">Ask me about study plans, notes, exam prep, career paths, or anything academic!</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 self-end ${m.sender === 'user' ? 'bg-gray-700 border border-gray-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
                  {m.sender === 'user' ? '👤' : '🤖'}
                </div>
                <div className={`max-w-[80%] px-3 py-2.5 rounded-2xl text-sm shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                    : 'bg-gray-800 text-gray-100 border border-gray-700/50 rounded-tl-none'
                }`}>
                  {m.sender === 'bot'
                    ? <div dangerouslySetInnerHTML={{ __html: renderMd(m.text) }} />
                    : m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm flex-shrink-0">🤖</div>
                <div className="bg-gray-800 border border-gray-700/50 px-3 py-2.5 rounded-2xl rounded-tl-none flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.3s]"></div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Chips */}
          <div className="px-3 py-2 flex flex-wrap gap-1.5 border-t border-gray-800 flex-shrink-0">
            {chips.map((c, i) => (
              <button key={i} onClick={() => { setInput(c.t); inputRef.current?.focus(); }}
                className="text-[10px] font-semibold px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full hover:bg-indigo-500/20 transition-all">
                {c.l}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 pb-3 flex-shrink-0">
            <div className="flex items-end gap-2 bg-gray-800 border border-gray-700 rounded-2xl px-3 py-2 focus-within:border-indigo-500 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 90) + 'px';
                }}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder="Ask anything..."
                rows={1}
                className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none resize-none text-sm"
                style={{ minHeight: '22px', maxHeight: '90px' }}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || isLoading}
                className="p-1 text-indigo-400 hover:text-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-gray-600 mt-1 text-center">Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      )}

      {/* Clear Confirm */}
      {showClear && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-xs w-full text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="text-white font-bold mb-2">Clear Chat History?</h3>
            <p className="text-gray-400 text-sm mb-5">All messages will be removed.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowClear(false)} className="px-4 py-2 bg-gray-700 text-white rounded-xl font-semibold text-sm hover:bg-gray-600">Cancel</button>
              <button onClick={() => { setMessages([]); setShowClear(false); }} className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-500">Clear</button>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg shadow-indigo-500/30 hover:scale-110 transition-transform z-50"
        aria-label={isOpen ? 'Close chatbot' : 'Open chatbot'}
      >
        {isOpen
          ? <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          : <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        }
      </button>
    </>
  );
};

export default Chatbot;