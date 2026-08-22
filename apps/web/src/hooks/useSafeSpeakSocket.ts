import { useState, useEffect, useCallback, useRef } from 'react'
import { getSocket } from '../services/socket'
import type { CharacterId, ChatMessage, CheckInAnswers, MatchFoundPayload, ReflectionSummary, ThemedRoomId } from '@safespeak/shared-types'

// Hook for 1:1 Matching Queue
export function useMatching(onMatchFound?: (payload: MatchFoundPayload) => void) {
  const [isSearching, setIsSearching] = useState(false)
  const [matchData, setMatchData] = useState<MatchFoundPayload | null>(null)
  const socket = getSocket()
  const onMatchFoundRef = useRef(onMatchFound)

  useEffect(() => {
    onMatchFoundRef.current = onMatchFound
  }, [onMatchFound])

  useEffect(() => {
    const handleMatchFound = (payload: MatchFoundPayload) => {
      console.log('[SafeSpeak Frontend] Received match_found payload:', payload)
      setIsSearching(false)
      setMatchData(payload)
      sessionStorage.setItem('current_match', JSON.stringify(payload))
      if (onMatchFoundRef.current) {
        onMatchFoundRef.current(payload)
      }
    }

    socket.on('match_found', handleMatchFound)

    return () => {
      socket.off('match_found', handleMatchFound)
    }
  }, [socket])

  const joinQueue = useCallback((characterId: CharacterId, checkin: CheckInAnswers) => {
    setIsSearching(true)
    sessionStorage.removeItem('current_match')
    const charTag = `${characterId.charAt(0).toUpperCase() + characterId.slice(1)}#${Math.floor(1000 + Math.random() * 9000)}`
    console.log('[SafeSpeak Frontend] Emitting join_queue for character:', characterId)
    socket.emit('join_queue', {
      characterId,
      characterTag: charTag,
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
  const [peerLeft, setPeerLeft] = useState<{ hasLeft: boolean; reason?: string } | null>(null)
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

    const handlePeerLeft = (data: { reason?: string }) => {
      setPeerLeft({
        hasLeft: true,
        reason: data.reason || 'Your conversation partner has left the chat.',
      })
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
    socket.on('peer_left', handlePeerLeft)
    socket.on('chat_ended', handleChatEnded)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('peer_typing', handlePeerTyping)
      socket.off('crisis_alert', handleCrisisAlert)
      socket.off('nudge_alert', handleNudgeAlert)
      socket.off('moderation_blocked', handleModerationBlocked)
      socket.off('peer_left', handlePeerLeft)
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

  const leaveChat = useCallback(() => {
    socket.emit('leave_chat', { roomId })
    sessionStorage.removeItem('current_match')
  }, [socket, roomId])

  const endChat = useCallback(() => {
    socket.emit('end_chat', { roomId })
  }, [socket, roomId])

  const dismissNudge = useCallback(() => {
    setNudgeAlert(null)
  }, [])

  const resetChat = useCallback(() => {
    setMessages([])
    setPeerLeft(null)
    sessionStorage.removeItem('current_match')
  }, [])

  return {
    messages,
    isPeerTyping,
    crisisAlert,
    nudgeAlert,
    moderationBlocked,
    peerLeft,
    reflectionSummary,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
    leaveChat,
    endChat,
    dismissNudge,
    resetChat,
  }
}

// Hook for Themed Group Rooms
export function useGroupRoom(roomId: ThemedRoomId, myCharacterId: CharacterId, myTag: string, language: string = 'English') {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [participantCount, setParticipantCount] = useState(5)
  const [crisisAlert, setCrisisAlert] = useState<{ tier: number; reason: string } | null>(null)
  const socket = getSocket()

  useEffect(() => {
    socket.emit('join_group_room', {
      roomId,
      character: myCharacterId,
      tag: myTag,
      language,
    })

    const handleNewMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg])
    }

    const handleRoomCount = ({ count }: { count: number }) => {
      setParticipantCount(count)
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
  }, [socket, roomId, myCharacterId, myTag, language])

  const sendGroupMessage = useCallback((text: string) => {
    if (!text.trim()) return
    socket.emit('send_message', {
      roomId,
      text: text.trim(),
    })
  }, [socket, roomId])

  return { messages, participantCount, activeCount: participantCount, crisisAlert, sendGroupMessage }
}

// Hook for Web Speech API (STT & TTS)
export function useSpeechVoice() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true

      recognition.onresult = (event: any) => {
        let current = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          current += event.results[i][0].transcript
        }
        setTranscript(current)
      }

      recognition.onerror = (err: any) => {
        console.warn('Speech Recognition notice:', err.error)
        setError('Voice note recorded. You can edit text before sending.')
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current = recognition
    }
  }, [])

  const startListening = useCallback((lang: string = 'en-IN') => {
    setError(null)
    setTranscript('')
    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = lang
        recognitionRef.current.start()
        setIsRecording(true)
      } catch (err) {
        console.warn('Voice start warning:', err)
      }
    }
  }, [])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (err) {
        console.warn('Voice stop warning:', err)
      }
    }
    setIsRecording(false)
  }, [])

  const speakText = useCallback((text: string, lang: string = 'English') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      if (lang === 'Hindi') utterance.lang = 'hi-IN'
      else if (lang === 'Telugu') utterance.lang = 'te-IN'
      else if (lang === 'Tamil') utterance.lang = 'ta-IN'
      else utterance.lang = 'en-IN'
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
