import { useState, useEffect, useCallback, useRef } from 'react'
import type { 
  CharacterId, 
  ChatMessage, 
  CheckInAnswers, 
  MatchFoundPayload, 
  ReflectionSummary, 
  ThemedRoomId 
} from '@safespeak/shared-types'
import { 
  joinFirestoreQueue, 
  leaveFirestoreQueue, 
  getOrCreateUserId 
} from '../services/firestoreMatching'
import { 
  subscribeToChatRoom, 
  sendChatMessage, 
  setChatTyping, 
  leaveChatRoom, 
  endChatRoom,
  subscribeToGroupRoom,
  sendGroupRoomMessage
} from '../services/firestoreChat'

// Hook for 1:1 Matching Queue (Powered by Cloud Firestore)
export function useMatching(onMatchFound?: (payload: MatchFoundPayload) => void) {
  const [isSearching, setIsSearching] = useState(false)
  const [matchData, setMatchData] = useState<MatchFoundPayload | null>(null)
  const onMatchFoundRef = useRef(onMatchFound)

  useEffect(() => {
    onMatchFoundRef.current = onMatchFound
  }, [onMatchFound])

  const joinQueue = useCallback((characterId: CharacterId, checkin: CheckInAnswers) => {
    setIsSearching(true)
    sessionStorage.removeItem('current_match')

    console.log('[SafeSpeak Firebase] Enqueuing user for 1:1 match...')
    joinFirestoreQueue(characterId, checkin, (payload) => {
      console.log('[SafeSpeak Firebase] Match event received:', payload)
      setIsSearching(false)
      setMatchData(payload)
      if (onMatchFoundRef.current) {
        onMatchFoundRef.current(payload)
      }
    })
  }, [])

  const leaveQueue = useCallback(() => {
    setIsSearching(false)
    leaveFirestoreQueue()
  }, [])

  return { isSearching, matchData, socketConnected: true, joinQueue, leaveQueue }
}

// Hook for Live 1:1 Chat (Powered by Cloud Firestore)
export function useChat(
  roomId: string, 
  myCharacterId: CharacterId, 
  myTag: string, 
  language: string = 'English'
) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isPeerTyping, setIsPeerTyping] = useState(false)
  const [crisisAlert, setCrisisAlert] = useState<{ tier: number; reason: string } | null>(null)
  const [nudgeAlert, setNudgeAlert] = useState<{ tier: number; triggerWord: string } | null>(null)
  const [moderationBlocked, setModerationBlocked] = useState<{ reason: string; category?: string } | null>(null)
  const [peerLeft, setPeerLeft] = useState<{ hasLeft: boolean; reason?: string } | null>(null)
  const [reflectionSummary, setReflectionSummary] = useState<ReflectionSummary | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  const myUserId = getOrCreateUserId()
  const currentMatchRaw = sessionStorage.getItem('current_match')
  const currentMatch: MatchFoundPayload | null = currentMatchRaw ? JSON.parse(currentMatchRaw) : null
  const peerLanguage = currentMatch?.peerLanguage || 'English'
  const peerTag = currentMatch?.peerTag || 'Peer'

  useEffect(() => {
    startTimeRef.current = Date.now()

    const unsubscribe = subscribeToChatRoom(roomId, myUserId, {
      onMessages: (msgs) => {
        setMessages(msgs)
      },
      onTyping: (isTyping) => {
        setIsPeerTyping(isTyping)
      },
      onPeerLeft: (reason) => {
        setPeerLeft({ hasLeft: true, reason })
      },
      onChatEnded: (summary) => {
        setReflectionSummary(summary)
        sessionStorage.setItem('reflection_summary', JSON.stringify(summary))
      },
    })

    return () => {
      unsubscribe()
    }
  }, [roomId, myUserId])

  const sendMessage = useCallback(async (text: string, isVoice: boolean = false) => {
    if (!text.trim()) return

    const result = await sendChatMessage(
      roomId,
      myUserId,
      myCharacterId,
      myTag,
      language,
      text,
      isVoice,
      peerLanguage
    )

    if (result.crisisTier === 2) {
      setCrisisAlert({ tier: 2, reason: result.error || 'Crisis alert' })
    } else if (result.crisisTier === 1) {
      setNudgeAlert({ tier: 1, triggerWord: text })
    }

    if (result.moderationBlocked) {
      setModerationBlocked(result.moderationBlocked)
    }
  }, [roomId, myUserId, myCharacterId, myTag, language, peerLanguage])

  const sendTypingStart = useCallback(() => {
    setChatTyping(roomId, myUserId, true)
  }, [roomId, myUserId])

  const sendTypingStop = useCallback(() => {
    setChatTyping(roomId, myUserId, false)
  }, [roomId, myUserId])

  const leaveChat = useCallback(async () => {
    await leaveChatRoom(roomId, myUserId)
    sessionStorage.removeItem('current_match')
  }, [roomId, myUserId])

  const endChat = useCallback(async () => {
    const summary = await endChatRoom(
      roomId,
      myUserId,
      myCharacterId,
      peerTag,
      messages,
      startTimeRef.current
    )
    setReflectionSummary(summary)
    sessionStorage.setItem('reflection_summary', JSON.stringify(summary))
  }, [roomId, myUserId, myCharacterId, peerTag, messages])

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

// Hook for Themed Group Rooms (Powered by Cloud Firestore)
export function useGroupRoom(
  roomId: ThemedRoomId, 
  myCharacterId: CharacterId, 
  myTag: string, 
  language: string = 'English'
) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [participantCount, setParticipantCount] = useState(6)
  const [crisisAlert, setCrisisAlert] = useState<{ tier: number; reason: string } | null>(null)
  const myUserId = getOrCreateUserId()

  useEffect(() => {
    const unsubscribe = subscribeToGroupRoom(roomId, (msgs) => {
      setMessages(msgs)
      setParticipantCount(Math.max(4, Math.min(18, msgs.length + 4)))
    })

    return () => {
      unsubscribe()
    }
  }, [roomId])

  const sendGroupMessage = useCallback(async (text: string) => {
    if (!text.trim()) return

    const result = await sendGroupRoomMessage(
      roomId,
      myUserId,
      myCharacterId,
      myTag,
      language,
      text
    )

    if (result.crisisTier === 2) {
      setCrisisAlert({ tier: 2, reason: result.error || 'Crisis alert' })
    }
  }, [roomId, myUserId, myCharacterId, myTag, language])

  return {
    messages,
    participantCount,
    activeCount: participantCount,
    crisisAlert,
    sendGroupMessage,
  }
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
