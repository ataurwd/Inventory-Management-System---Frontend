"use client";

import React from 'react';
import { Chatbox } from '../../../components/ai/Chatbox';
import { useAuth } from '../../../hooks/useAuth';
import { Bot, PlusCircle, PenSquare, Trash2, PackageSearch } from 'lucide-react';

export default function AIAssistantPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6 h-full flex flex-col pb-6 ">
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
                {/* Capabilities Sidebar / Banner */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bot className="h-6 w-6 text-primary" />
              <h2 className="text-lg font-semibold">I can help you:</h2>
            </div>
            
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm text-muted-foreground items-start">
                <PlusCircle className="h-5 w-5 text-green-500 shrink-0" />
                <span><strong className="text-foreground">Add Products</strong><br/>Create new items in the catalog.</span>
              </li>
              <li className="flex gap-3 text-sm text-muted-foreground items-start">
                <PenSquare className="h-5 w-5 text-blue-500 shrink-0" />
                <span><strong className="text-foreground">Update Details</strong><br/>Change prices, categories, or safety stock.</span>
              </li>
              <li className="flex gap-3 text-sm text-muted-foreground items-start">
                <Trash2 className="h-5 w-5 text-red-500 shrink-0" />
                <span><strong className="text-foreground">Delete Items</strong><br/>Remove discontinued products.</span>
              </li>
              <li className="flex gap-3 text-sm text-muted-foreground items-start">
                <PackageSearch className="h-5 w-5 text-purple-500 shrink-0" />
                <span><strong className="text-foreground">Check Stock</strong><br/>Query current stock levels and alerts.</span>
              </li>
            </ul>
          </div>

          <div className="bg-muted rounded-xl p-4 text-xs text-muted-foreground text-center">
            Tip: Try asking, "What is the stock for Apples?" or "Update the price of Milk to 4.50"
          </div>
        </div>
      </div>
    </div>
  );
}
