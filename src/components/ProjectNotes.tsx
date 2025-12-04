import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

interface Note {
  id: string;
  content: string;
  createdAt: string;
  Author: {
    fullName: string;
    role: string;
  };
}

interface ProjectNotesProps {
  projectId: string;
}

export function ProjectNotes({ projectId }: ProjectNotesProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Reference for the scrollable container
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotes();
  }, [projectId]);

  // Auto-scroll to bottom whenever notes change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [notes]);

  const fetchNotes = async () => {
    try {
      const res = await api.get(`/projects/${projectId}/notes`);
      setNotes(res.data);
    } catch (error) {
      console.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newNote.trim()) return;

    try {
      setSubmitting(true);
      const res = await api.post(`/projects/${projectId}/notes`, { content: newNote });
      setNotes([...notes, res.data]);
      setNewNote('');
    } catch (error) {
      toast.error("Failed to post note");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[500px]">
      <div className="p-4 border-b border-gray-200 flex items-center gap-2">
        <MessageSquare className="text-[#2EC4B6]" size={20} />
        <h3 className="font-semibold text-[#0D1B2A]">Project Discussion</h3>
      </div>

      {/* Notes Feed */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scroll-smooth"
      >
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin text-gray-400" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm">
            No notes yet. Start the discussion!
          </div>
        ) : (
          notes.map((note) => {
            const isMe = note.Author.fullName === user?.name; 

            return (
              <div key={note.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs text-white font-bold
                  ${isMe ? 'bg-[#0D1B2A]' : 'bg-[#2EC4B6]'}`}
                >
                  {note.Author.fullName.charAt(0)}
                </div>

                {/* Bubble */}
                <div className={`max-w-[80%]`}>
                  <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'justify-end' : ''}`}>
                    <span className="text-xs font-bold text-gray-700">{note.Author.fullName}</span>
                    <span className="text-[10px] text-gray-400 uppercase">{note.Author.role}</span>
                  </div>
                  <div className={`p-3 rounded-lg text-sm shadow-sm whitespace-pre-wrap break-words
                    ${isMe ? 'bg-[#0D1B2A] text-white rounded-tr-none' : 'bg-white text-gray-700 border border-gray-200 rounded-tl-none'}`}
                  >
                    {note.content}
                  </div>
                  <p className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'text-right' : ''}`}>
                    {new Date(note.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200 rounded-b-xl">
        <div className="flex gap-2">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Type a note or update..."
            className="flex-1 border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#2EC4B6] resize-none h-[50px]"
            onKeyDown={(e) => {
              if(e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={submitting || !newNote.trim()}
            className="bg-[#2EC4B6] hover:bg-[#26a599] text-white px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}