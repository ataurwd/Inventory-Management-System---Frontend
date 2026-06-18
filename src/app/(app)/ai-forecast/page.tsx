"use client";

import React from 'react';
import { Chatbox } from '../../../components/ai/Chatbox';
import { useAuth } from '../../../hooks/useAuth';
import { Bot, PlusCircle, PenSquare, Trash2, PackageSearch } from 'lucide-react';

export default function AIAssistantPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6 h-full flex flex-col pb-6 m-10">
      <div className="flex flex-col gap-4 border-b border-border pb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient mb-2">AI Inventory Assistant</h1>
          <p className="text-muted-foreground">Your intelligent companion for managing catalog, stock levels, and operations.</p>
        </div>
      </div>

      <div className="flex-1 min-h-[600px] flex flex-col lg:flex-row gap-6">


        {/* Full Height Chatbox Area */}
        <div className="flex-1 bg-card rounded-xl border shadow-sm flex flex-col overflow-hidden">
          {isAdmin ? (
            <Chatbox inline={true} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              You do not have permission to access the AI Assistant.
            </div>
          )}
        </div>
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <div className="bg-card/45 backdrop-blur-md border border-border/80 shadow-md rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-50"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6 border-b border-border/40 pb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary border border-primary/20 shadow-inner">
                  <Bot className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-foreground">I can help you:</h2>
              </div>
              
              <ul className="space-y-5">
                <li className="flex gap-3 text-sm text-muted-foreground items-start group/item">
                  <div className="p-1.5 bg-green-500/10 rounded-md text-green-500 border border-green-500/20 group-hover/item:scale-110 transition-transform">
                    <PlusCircle className="h-4 w-4 shrink-0" />
                  </div>
                  <span className="leading-snug"><strong className="text-foreground block mb-0.5">Add Products</strong>Create new items in the catalog.</span>
                </li>
                <li className="flex gap-3 text-sm text-muted-foreground items-start group/item">
                  <div className="p-1.5 bg-purple-500/10 rounded-md text-purple-500 border border-purple-500/20 group-hover/item:scale-110 transition-transform">
                    <PackageSearch className="h-4 w-4 shrink-0" />
                  </div>
                  <span className="leading-snug"><strong className="text-foreground block mb-0.5">Check Stock</strong>Query current stock levels and alerts.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl p-4 text-xs text-muted-foreground text-center shadow-sm flex flex-col items-center gap-2 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"></div>
             <div className="relative z-10 flex flex-col items-center gap-1.5">
                <span className="font-bold text-primary/70 uppercase tracking-widest text-[10px]">Pro Tip</span>
                <span className="italic leading-relaxed">{"Try asking, \"What is the stock for Apples?\" or \"Add a new product called Banana\""}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
