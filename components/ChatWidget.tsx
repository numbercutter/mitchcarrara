'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { MessageSquare, X, Send } from 'lucide-react'

interface ChatWidgetProps {
  companyId: string
  productId: string
  userId: string
  userName: string
  userEmail: string
  supabaseUrl: string
  supabaseKey: string
}

interface Message {
  id: string
  sender_id: string
  sender_name: string
  content: string
  created_at: string
}

export function ChatWidget({
  companyId,
  productId,
  userId,
  userName,
  userEmail,
  supabaseUrl,
  supabaseKey,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Initialize conversation
  useEffect(() => {
    const initializeConversation = async () => {
      const { data: existingConversation, error: fetchError } = await supabase
        .from('conversations')
        .select('id')
        .eq('company_id', companyId)
        .eq('product_id', productId)
        .eq('user_id', userId)
        .eq('status', 'open')
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching conversation:', fetchError)
        return
      }

      if (existingConversation) {
        setConversationId(existingConversation.id)
        fetchMessages(existingConversation.id)
      } else {
        const { data: newConversation, error: insertError } = await supabase
          .from('conversations')
          .insert({
            company_id: companyId,
            product_id: productId,
            user_id: userId,
            user_name: userName,
            user_email: userEmail,
            status: 'open',
          })
          .select('id')
          .single()

        if (insertError) {
          console.error('Error creating conversation:', insertError)
          return
        }

        setConversationId(newConversation.id)
      }
    }

    if (isOpen) {
      initializeConversation()
    }
  }, [isOpen, companyId, productId, userId, userName, userEmail])

  // Fetch messages
  const fetchMessages = async (convId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      return
    }

    setMessages(data)
  }

  // Subscribe to new messages
  useEffect(() => {
    if (!conversationId) return

    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [conversationId])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !conversationId) return

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        sender_name: userName,
        content: newMessage.trim(),
      })

    if (error) {
      console.error('Error sending message:', error)
      return
    }

    setNewMessage('')
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl w-96 h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Support Chat</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === userId ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender_id === userId
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="text-sm font-medium mb-1">
                    {message.sender_name}
                  </div>
                  <div className="text-sm">{message.content}</div>
                  <div className="text-xs mt-1 opacity-70">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
} 