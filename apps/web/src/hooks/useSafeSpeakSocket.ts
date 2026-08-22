import { useState, useEffect, useCallback, useRef } from 'react'
import { getSocket } from '../services/socket'
import type { CharacterId, ChatMessage, CheckInAnswers, MatchFoundPayload, ReflectionSummary } from '@safespeak/shared-types'

// Hook for 1:1 Matching Queue
export function useMatching(onMatchFound?: (payload: MatchFoundPayload) => void) {
  const [isSearching, setIsSearching] = useState(false)
  const [matchData, setMatchData] = useState<MatchFoundPayload | null>(null)
  const socket = getSocket()

  useEffect(() => {
    const handleMatchFound = (payload: MatchFoundPayload) => {
      setIsSearching(false)
      setMatchData(payload)
      sessionStorage.setItem('current_match', JSON.stringify(payload))
      if (onMatchFound) {
        onMatchFound(payload)
      }
    }

    socket.on('match_found', handleMatchFound)

    return () => {
      socket.off('match_found', handleMatchFound)
    }
  }, [socket, onMatchFound])

  const joinQueue = useCallback((characterId: CharacterId, checkin: CheckInAnswers) => {
    setIsSearching(true)
    socket.emit('join_queue', {
      characterId,
      checkin,
      preferredLanguages: checkin.languages || ['English'],
    })
  }, [socket])

  const leaveQueue = useCallback(() => {
    setIsSearching(false)
    socket.emit('leave_queue')
  }, [socket])

  return { isSearching, matchData, joinQueue, leaveQueue }
}

// Hook for Live 1:1 Chat
export function useChat(roomId: string, myCharacterId: CharacterId, myTag: string, language: string = 'English') {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isPeerTyping, setIsPeerTyping] = useState(false)
  const [crisisAlert, setCrisisAlert] = useState<{ tier: number; reason: string } | null>(null)
  const [nudgeAlert, setNudgeAlert] = useState<{ tier: number; triggerWord: string } | null>(null)
  const [moderationBlocked, setModerationBlocked] = useState<{ reason: string; category?: string } | null>(null)
  const [reflectionSummary, setReflectionSummary] = useState<ReflectionSummary | null>(null)
  const socket = getSocket()

  useEffect(() => {
    socket.emit('join_chat_room', {
      roomId,
      character: myCharacterId,
      tag: myTag,
      language,
    })

    const handleNewMessage = (msg: ChatMessage) => {
      setMessages((prev) => {
        // Prevent duplicates
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    }

    const handlePeerTyping = ({ isTyping }: { isTyping: boolean }) => {
      setIsPeerTyping(isTyping)
    }

    const handleCrisisAlert = (data: { tier: number; reason: string }) => {
      setCrisisAlert(data)
    }

    const handleNudgeAlert = (data: { tier: number; triggerWord: string }) => {
      setNudgeAlert(data)
    }

    const handleModerationBlocked = (data: { reason: string; category?: string }) => {
      setModerationBlocked(data)
    }

    const handleChatEnded = ({ summary }: { summary: ReflectionSummary }) => {
      setReflectionSummary(summary)
      sessionStorage.setItem('reflection_summary', JSON.stringify(summary))
    }

    socket.on('new_message', handleNewMessage)
    socket.on('peer_typing', handlePeerTyping)
    socket.on('crisis_alert', handleCrisisAlert)
    socket.on('nudge_alert', handleNudgeAlert)
    socket.on('moderation_blocked', handleModerationBlocked)
    socket.on('chat_ended', handleChatEnded)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('peer_typing', handlePeerTyping)
      socket.off('crisis_alert', handleCrisisAlert)
      socket.off('nudge_alert', handleNudgeAlert)
      socket.off('moderation_blocked', handleModerationBlocked)
      socket.off('chat_ended', handleChatEnded)
    }
  }, [socket, roomId, myCharacterId, myTag, language])

  const sendMessage = useCallback((text: string, isVoice: boolean = false) => {
    if (!text.trim()) return
    socket.emit('send_message', {
      roomId,
      text: text.trim(),
      isVoice,
    })
  }, [socket, roomId])

  const sendTypingStart = useCallback(() => {
    socket.emit('typing_start', { roomId })
  }, [socket, roomId])

  const sendTypingStop = useCallback(() => {
    socket.emit('typing_stop', { roomId })
  }, [socket, roomId])

  const endChat = useCallback(() => {
    socket.emit('end_chat', { roomId })
  }, [socket, roomId])

  const dismissNudge = useCallback(() => {
    setNudgeAlert(null)
  }, [])

  return {
    messages,
    isPeerTyping,
    crisisAlert,
    nudgeAlert,
    moderationBlocked,
    reflectionSummary,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
    endChat,
    dismissNudge,
  }
}

// Hook for Themed Group Rooms
export function useGroupRoom(roomId: string, characterId: CharacterId, tag: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [activeCount, setActiveCount] = useState(8)
  const [crisisAlert, setCrisisAlert] = useState<{ tier: number; reason: string } | null>(null)
  const socket = getSocket()

  useEffect(() => {
    socket.emit('join_group_room', { roomId, character: characterId, tag })

    const handleNewMessage = (msg: ChatMessage) => {
      if (msg.roomId === roomId) {
        setMessages((prev) => [...prev, msg])
      }
    }

    const handleRoomCount = (data: { roomId: string; count: number }) => {
      if (data.roomId === roomId) {
        setActiveCount(data.count)
      }
    }

    const handleCrisisAlert = (data: { tier: number; reason: string }) => {
      setCrisisAlert(data)
    }

    socket.on('new_message', handleNewMessage)
    socket.on('group_room_count', handleRoomCount)
    socket.on('crisis_alert', handleCrisisAlert)

    return () => {
      socket.emit('leave_group_room', { roomId })
      socket.off('new_message', handleNewMessage)
      socket.off('group_room_count', handleRoomCount)
      socket.off('crisis_alert', handleCrisisAlert)
    }
  }, [socket, roomId, characterId, tag])

  const sendGroupMessage = useCallback((text: string) => {
    if (!text.trim()) return
    socket.emit('send_message', {
      roomId,
      text: text.trim(),
    })
  }, [socket, roomId])

  return {
    messages,
    activeCount,
    crisisAlert,
    sendGroupMessage,
  }
}

// Hook for Browser Speech STT & TTS
export function useSpeechVoice() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-IN' // Supports mixed English/Indian dialects

      recognition.onstart = () => {
        setIsRecording(true)
        setError(null)
      }

      recognition.onresult = (event: any) => {
        let current = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          current += event.results[i][0].transcript
        }
        setTranscript(current)
      }

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error)
        setError(event.error)
        setIsRecording(false)
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current = recognition
    }
  }, [])

  const startListening = useCallback((langCode: string = 'en-IN') => {
    if (recognitionRef.current) {
      setTranscript('')
      recognitionRef.current.lang = langCode
      try {
        recognitionRef.current.start()
      } catch (e) {
        console.warn('Recognition already started')
      }
    } else {
      setError('Browser does not support Speech Recognition. You can type instead.')
    }
  }, [])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsRecording(false)
  }, [])

  const speakText = useCallback((text: string, lang: string = 'en-US') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang === 'Hindi' ? 'hi-IN' : lang === 'Telugu' ? 'te-IN' : lang === 'Tamil' ? 'ta-IN' : 'en-US'
      utterance.rate = 0.95
      utterance.pitch = 1.0
      window.speechSynthesis.speak(utterance)
    }
  }, [])

  return {
    isRecording,
    transcript,
    error,
    startListening,
    stopListening,
    speakText,
  }
}
