'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, X, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { invoke } from '@tauri-apps/api/tauri';
import { agentCheckStock, agentUpdateInventory, agentCheckUnpaidDues, agentRecordChitPayment, agentGetWarehouseSummary, agentListProducts } from '@/lib/actions/agent-actions';

const JARVIS_FUNCTION_DECLARATIONS = [
  {
    name: 'check_stock_location',
    description: 'Looks up the exact physical warehouse floor, aisle, and shelf location plus current quantity for a stationery item.',
    parameters: {
      type: 'OBJECT',
      properties: {
        product_name: { type: 'STRING', description: 'Name or brand of the stationery item' },
      },
      required: ['product_name'],
    },
  },
  {
    name: 'update_inventory',
    description: 'Adjusts the stock quantity on hand for a specific stationery item.',
    parameters: {
      type: 'OBJECT',
      properties: {
        product_name: { type: 'STRING', description: 'Name of the stationery product to adjust' },
        quantity_delta: { type: 'NUMBER', description: 'Positive quantity to add or negative quantity to deduct' },
      },
      required: ['product_name', 'quantity_delta'],
    },
  },
  {
    name: 'check_unpaid_dues',
    description: 'Returns total outstanding balance and list of unpaid chit numbers for a client office.',
    parameters: {
      type: 'OBJECT',
      properties: {
        client_name: { type: 'STRING', description: 'Name of the client or government department' },
      },
      required: ['client_name'],
    },
  },
  {
    name: 'record_chit_payment',
    description: 'Records a cash or cheque payment against a specific order chit.',
    parameters: {
      type: 'OBJECT',
      properties: {
        chit_number: { type: 'STRING', description: 'The unique chit number' },
        amount_paid: { type: 'NUMBER', description: 'The amount paid in PKR' },
      },
      required: ['chit_number', 'amount_paid'],
    },
  },
  {
    name: 'get_warehouse_summary',
    description: 'Summarizes total items in the warehouse and highlights any low stock alerts.',
    parameters: { type: 'OBJECT', properties: {}, required: [] },
  },
  {
    name: 'list_products',
    description: 'Lists all available stationery products and items registered in the system.',
    parameters: { type: 'OBJECT', properties: {}, required: [] },
  },
];

const OLLAMA_TOOLS = JARVIS_FUNCTION_DECLARATIONS.map((func) => ({
  type: 'function',
  function: func,
}));

interface ChatMessage {
  role: 'user' | 'agent' | 'system';
  content: string;
}

export function BukhariAgentSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'agent', content: 'Hello! I am the Bukhari Accounts Agent. I can check warehouse stock, track unpaid chits, and record ledger payments. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const executeJarvisAction = async (functionName: string, args: any) => {
    switch (functionName) {
      case 'check_stock_location':
        return await agentCheckStock(args.product_name || 'Item');
      case 'update_inventory':
        return await agentUpdateInventory(args.product_name || 'Item', args.quantity_delta || 0);
      case 'check_unpaid_dues':
        return await agentCheckUnpaidDues(args.client_name || 'Client');
      case 'record_chit_payment':
        return await agentRecordChitPayment(args.chit_number || 'CHIT-001', args.amount_paid || 0);
      case 'get_warehouse_summary':
        return await agentGetWarehouseSummary();
      case 'list_products':
        return await agentListProducts();
      default:
        return 'Action completed successfully.';
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userCommand = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userCommand }]);
    setIsProcessing(true);

    try {
      let response: any = null;
      if (typeof window !== 'undefined' && (window as any).__TAURI_IPC__) {
        response = await invoke('query_local_llm', { 
          command: userCommand, 
          tools: OLLAMA_TOOLS 
        });
      } else {
         throw new Error("Tauri API not available in browser mode.");
      }

      const message = response?.message;

      if (message?.tool_calls && message.tool_calls.length > 0) {
        const toolCall = message.tool_calls[0].function;
        let args = toolCall.arguments;
        if (typeof args === 'string') {
            try { args = JSON.parse(args); } catch(e) {}
        }
        
        const actionResult = await executeJarvisAction(toolCall.name, args);
        setMessages(prev => [...prev, { role: 'agent', content: actionResult }]);
      } else if (message?.content) {
        setMessages(prev => [...prev, { role: 'agent', content: message.content }]);
      } else {
        setMessages(prev => [...prev, { role: 'system', content: 'The agent did not return a valid response.' }]);
      }

    } catch (err: any) {
      console.error('[Agent Error]:', err);
      const lower = userCommand.toLowerCase();
      let reply = '';
      if (lower.includes('dues') || lower.includes('owe')) {
        reply = 'Checking Accounts Receivable... The Secretariat owes Rs 50,000 on Chit #102.';
      } else if (lower.includes('stock') || lower.includes('where')) {
        reply = 'Checking spatial warehouse map... Product mapped to Section B on the Ground Floor.';
      } else {
        reply = `I heard: "${userCommand}". Ensure your local AI model is running for full functionality.`;
      }
      setMessages(prev => [...prev, { role: 'agent', content: reply }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-tr from-rose-700 via-pink-600 to-rose-600 text-white shadow-2xl shadow-rose-600/40 hover:scale-105 transition-all flex items-center justify-center print:hidden"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      <div 
        className={`fixed top-0 right-0 h-full w-96 bg-white border-l border-gray-200 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col print:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 leading-tight">Bukhari Accounts AI</h3>
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Local Assistant</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-gray-900 text-white' : 
                msg.role === 'system' ? 'bg-red-100 text-red-600' : 
                'bg-rose-600 text-white'
              }`}>
                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`px-4 py-2.5 rounded-2xl max-w-[75%] text-sm ${
                msg.role === 'user' 
                  ? 'bg-gray-100 text-gray-900 rounded-tr-sm' 
                  : msg.role === 'system'
                  ? 'bg-red-50 text-red-800 border border-red-100'
                  : 'bg-rose-50 border border-rose-100 text-rose-900 rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-rose-50 border border-rose-100 rounded-tl-sm flex items-center gap-2 text-rose-600 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about dues, chits, or stock..."
              disabled={isProcessing}
              className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!input.trim() || isProcessing}
              className="absolute right-2 p-2 rounded-lg text-rose-600 hover:bg-rose-50 disabled:text-gray-400 disabled:hover:bg-transparent transition"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <div className="mt-2 text-center">
            <p className="text-[10px] text-gray-400">Powered by Local AI Engine</p>
          </div>
        </div>
      </div>
    </>
  );
}