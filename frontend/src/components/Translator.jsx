import React, { useState, useEffect, useRef, useCallback } from 'react'
import { translateText as translateTextAPI, detectLanguage as detectLanguageAPI, checkBackendHealth } from '../services/api'

const Translator = () => {
  const [text, setText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [sourceLang, setSourceLang] = useState('en')
  const [targetLang, setTargetLang] = useState('es')
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [detectedLang, setDetectedLang] = useState(null)
  const [autoTranslate, setAutoTranslate] = useState(true)
  const [backendStatus, setBackendStatus] = useState(null)
  const [voicesLoaded, setVoicesLoaded] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const debounceTimerRef = useRef(null)

  // Check backend health on mount
  useEffect(() => {
    const checkBackend = async () => {
      const health = await checkBackendHealth()
      setBackendStatus(health.healthy)
      if (!health.healthy) {
        console.warn('Backend is not available. Using fallback translation services.')
      }
    }
    checkBackend()
  }, [])

  // Load voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices()
        if (voices.length > 0) {
          setVoicesLoaded(true)
        }
      }
    }

    // Load voices immediately
    loadVoices()

    // Some browsers load voices asynchronously
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices
      
      // Also try loading after a short delay
      const timer = setTimeout(loadVoices, 100)
      
      return () => {
        clearTimeout(timer)
        if (window.speechSynthesis) {
          window.speechSynthesis.onvoiceschanged = null
        }
      }
    }
  }, [])

  // Language options with proper codes
  const languages = [
    { code: 'en', name: 'English', voice: 'en-US' },
    { code: 'es', name: 'Spanish', voice: 'es-ES' },
    { code: 'fr', name: 'French', voice: 'fr-FR' },
    { code: 'de', name: 'German', voice: 'de-DE' },
    { code: 'it', name: 'Italian', voice: 'it-IT' },
    { code: 'pt', name: 'Portuguese', voice: 'pt-PT' },
    { code: 'hi', name: 'Hindi', voice: 'hi-IN' },
    { code: 'kn', name: 'Kannada', voice: 'kn-IN' },
    { code: 'ja', name: 'Japanese', voice: 'ja-JP' },
    { code: 'ko', name: 'Korean', voice: 'ko-KR' },
    { code: 'zh', name: 'Chinese', voice: 'zh-CN' },
    { code: 'ar', name: 'Arabic', voice: 'ar-SA' },
    { code: 'ru', name: 'Russian', voice: 'ru-RU' },
    { code: 'nl', name: 'Dutch', voice: 'nl-NL' },
    { code: 'pl', name: 'Polish', voice: 'pl-PL' },
  ]

  // Initialize Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = getLanguageCode(sourceLang)

      recognitionInstance.onstart = () => {
        setIsListening(true)
        setError(null)
      }

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setText(transcript)
        // Auto translate if enabled
        if (autoTranslate) {
          translateText(transcript)
        }
      }

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        
        let errorMessage = 'Speech recognition error. '
        switch(event.error) {
          case 'no-speech':
            errorMessage += 'No speech detected. Please try again.'
            break
          case 'audio-capture':
            errorMessage += 'No microphone found. Please check your microphone.'
            break
          case 'not-allowed':
            errorMessage += 'Microphone permission denied. Please allow microphone access.'
            break
          default:
            errorMessage += 'Please try again.'
        }
        setError(errorMessage)
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
      }

      setRecognition(recognitionInstance)
    } else {
      setError('Speech recognition is not supported in your browser. Please use Chrome or Edge.')
    }
  }, [sourceLang, autoTranslate])

  // Update recognition language when source language changes
  useEffect(() => {
    if (recognition) {
      recognition.lang = getLanguageCode(sourceLang)
    }
  }, [sourceLang, recognition])

  // Get proper language code for speech recognition
  const getLanguageCode = (lang) => {
    const langObj = languages.find(l => l.code === lang)
    return langObj ? langObj.voice : lang
  }

  // Detect language of input text
  const detectLanguage = useCallback(async (inputText) => {
    if (!inputText.trim() || inputText.length < 3) return

    try {
      const response = await detectLanguageAPI({
        text: inputText
      })
      if (response.data.detected_language) {
        setDetectedLang(response.data.detected_language)
      }
    } catch (error) {
      console.error('Language detection error:', error)
      // Don't show error for detection failures, it's not critical
    }
  }, [])

  // Translate text with debouncing
  const translateText = useCallback(async (inputText = text) => {
    if (!inputText.trim()) {
      setTranslatedText('')
      setError(null)
      return
    }

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set loading state immediately
    setLoading(true)
    setError(null)

    // Debounce translation for 500ms
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await translateTextAPI({
          text: inputText,
          source_lang: sourceLang,
          target_lang: targetLang
        })

        if (response.data.error) {
          setError(response.data.error)
          setTranslatedText('')
        } else if (response.data.translated_text) {
          setTranslatedText(response.data.translated_text)
          setError(null)
        } else {
          setError('Translation failed. Please try again.')
          setTranslatedText('')
        }
      } catch (error) {
        console.error('Translation error:', error)
        
        // Better error messages
        let errorMessage = 'Translation failed. '
        
        if (error.message.includes('Network error') || error.message.includes('ECONNREFUSED')) {
          errorMessage += 'Backend server is not running. Please start the Flask server on port 5000.'
        } else if (error.message.includes('timeout')) {
          errorMessage += 'Request timed out. Please check your internet connection.'
        } else if (error.message.includes('unavailable')) {
          errorMessage += 'All translation services are unavailable. Please check your internet connection.'
        } else {
          errorMessage += error.response?.data?.error || error.message || 'Please try again.'
        }
        
        setError(errorMessage)
        setTranslatedText('')
      } finally {
        setLoading(false)
      }
    }, 500)
  }, [text, sourceLang, targetLang])

  // Auto-translate when text changes (if enabled)
  useEffect(() => {
    if (autoTranslate && text.trim()) {
      translateText(text)
    } else {
      setTranslatedText('')
    }
  }, [text, sourceLang, targetLang, autoTranslate, translateText])

  // Detect language when text changes (debounced)
  useEffect(() => {
    if (text.trim() && text.length > 3) {
      const timer = setTimeout(() => {
        detectLanguage(text)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      setDetectedLang(null)
    }
  }, [text, detectLanguage])

  // Handle text change
  const handleTextChange = (newText) => {
    setText(newText)
    setError(null)
  }

  // Handle language swap
  const handleSwapLanguages = () => {
    const tempLang = sourceLang
    const tempText = text
    setSourceLang(targetLang)
    setTargetLang(tempLang)
    setText(translatedText)
    setTranslatedText(tempText)
  }

  // Handle speech synthesis
  const handleSpeak = (textToSpeak, lang) => {
    if (!textToSpeak.trim()) {
      setError('No text to speak.')
      return
    }

    if (!('speechSynthesis' in window)) {
      setError('Text-to-speech is not supported in your browser. Please use Chrome, Edge, or Safari.')
      return
    }

    // Ensure voices are loaded before speaking
    const getVoices = () => {
      return new Promise((resolve) => {
        let voices = window.speechSynthesis.getVoices()
        if (voices.length > 0) {
          resolve(voices)
          return
        }
        
        // Wait for voices to load (some browsers load them asynchronously)
        const checkVoices = () => {
          voices = window.speechSynthesis.getVoices()
          if (voices.length > 0) {
            resolve(voices)
          }
        }
        
        window.speechSynthesis.onvoiceschanged = checkVoices
        
        // Timeout after 2 seconds
        setTimeout(() => {
          resolve(voices) // Return whatever we have, even if empty
        }, 2000)
      })
    }

    try {
      // Cancel any ongoing speech
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel()
      }
      
      // Wait for voices, then speak
      getVoices().then((voices) => {
        const utterance = new SpeechSynthesisUtterance(textToSpeak)
        const langObj = languages.find(l => l.code === lang)
        const targetLangCode = langObj ? langObj.voice : lang

        // Try to find a voice that matches the language
        let selectedVoice = null
        if (voices.length > 0) {
          // First, try to find an exact match
          selectedVoice = voices.find(voice => {
            const voiceLang = voice.lang.toLowerCase()
            return voiceLang === targetLangCode.toLowerCase() ||
                   voiceLang.startsWith(lang.toLowerCase()) ||
                   voiceLang.includes(targetLangCode.toLowerCase())
          })
          
          // If no exact match, try to find a voice with similar language code
          if (!selectedVoice) {
            const langPrefix = lang.split('-')[0].toLowerCase()
            selectedVoice = voices.find(voice => 
              voice.lang.toLowerCase().startsWith(langPrefix)
            )
          }
          
          // If still no match, use default voice or first available
          if (!selectedVoice) {
            selectedVoice = voices.find(voice => voice.default) || voices[0]
          }
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice
          console.log('Using voice:', selectedVoice.name, 'for language:', targetLangCode)
        }
        
        // Set language (fallback if no voice found)
        utterance.lang = targetLangCode
        utterance.rate = 1.0
        utterance.pitch = 1.0
        utterance.volume = 1.0

        // Event handlers
        utterance.onstart = () => {
          setIsSpeaking(true)
          setError(null)
          console.log('Speech started')
        }

        utterance.onend = () => {
          setIsSpeaking(false)
          console.log('Speech ended')
        }

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event.error, event)
          setIsSpeaking(false)
          
          let errorMsg = 'Unable to play audio. '
          if (event.error === 'not-allowed') {
            errorMsg = 'Speech synthesis not allowed. Please interact with the page first, then try again.'
          } else if (event.error === 'network') {
            errorMsg += 'Network error. Please check your connection.'
          } else if (event.error === 'synthesis-unavailable') {
            errorMsg += 'Speech synthesis is not available for this language.'
          } else if (event.error === 'synthesis-failed') {
            errorMsg += 'Speech synthesis failed. Please try again.'
          } else if (event.error === 'audio-busy') {
            errorMsg += 'Audio is busy. Please wait a moment.'
          } else {
            errorMsg += `Error: ${event.error || 'unknown'}. Please try again or use a different browser.`
          }
          setError(errorMsg)
        }

        // Speak the text
        try {
          window.speechSynthesis.speak(utterance)
        } catch (speakError) {
          console.error('Error calling speak:', speakError)
          setError('Failed to start speech. Please try again or use a different browser.')
          setIsSpeaking(false)
        }
      })
      
    } catch (error) {
      console.error('Error in handleSpeak:', error)
      setError('Failed to start speech synthesis. Please try again.')
      setIsSpeaking(false)
    }
  }

  // Stop speaking
  const handleStopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  // Start/stop listening
  const startListening = () => {
    if (recognition && !isListening) {
      try {
        recognition.start()
      } catch (error) {
        console.error('Error starting recognition:', error)
        setError('Unable to start voice recognition. Please try again.')
      }
    }
  }

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop()
      setIsListening(false)
    }
  }

  // Clear all
  const handleClear = () => {
    setText('')
    setTranslatedText('')
    setError(null)
    setDetectedLang(null)
    if (isListening) {
      stopListening()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">🗣️ Voice Translator</h1>
        <button
          onClick={handleSwapLanguages}
          className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
          title="Swap languages"
        >
          🔄 Swap
        </button>
      </div>

      {/* Backend Status */}
      {backendStatus === false && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded mb-4">
          <p className="font-medium">ℹ️ Backend server not detected. Using fallback translation services.</p>
          <p className="text-sm mt-1">To use the full translation service, please start the Flask backend server on port 5000.</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p className="font-medium">⚠️ {error}</p>
        </div>
      )}

      {/* Detected Language */}
      {detectedLang && detectedLang !== sourceLang && (
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-3 rounded">
          <p className="text-sm">
            💡 Detected language: <strong>{languages.find(l => l.code === detectedLang)?.name || detectedLang}</strong>
            {detectedLang !== sourceLang && (
              <button
                onClick={() => setSourceLang(detectedLang)}
                className="ml-2 underline hover:no-underline"
              >
                Use this language
              </button>
            )}
          </p>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Source Language */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                From Language
              </label>
              <select
                value={sourceLang}
                onChange={(e) => {
                  setSourceLang(e.target.value)
                  setError(null)
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Type or speak your text here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-40 resize-none"
                rows="6"
              />
              <div className="absolute bottom-2 right-2 flex space-x-2">
                {text && (
                  <button
                    onClick={handleClear}
                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                    title="Clear"
                  >
                    ✕
                  </button>
                )}
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={!recognition}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    isListening
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : recognition
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={recognition ? (isListening ? 'Stop listening' : 'Start voice input') : 'Voice input not available'}
                >
                  {isListening ? '🛑 Stop' : '🎤 Speak'}
                </button>
                {text && (
                  <button
                    onClick={() => isSpeaking ? handleStopSpeaking() : handleSpeak(text, sourceLang)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      isSpeaking 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    title={isSpeaking ? "Stop speaking" : "Listen to source text"}
                  >
                    {isSpeaking ? '⏸️' : '🔊'}
                  </button>
                )}
              </div>
              {text && (
                <div className="absolute top-2 right-2">
                  <span className="text-xs text-gray-500">{text.length} chars</span>
                </div>
              )}
            </div>
          </div>

          {/* Target Language */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                To Language
              </label>
              <select
                value={targetLang}
                onChange={(e) => {
                  setTargetLang(e.target.value)
                  setError(null)
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <textarea
                value={loading ? 'Translating...' : translatedText}
                readOnly
                placeholder={loading ? 'Translating...' : 'Translation will appear here...'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 h-40 resize-none focus:outline-none"
                rows="6"
              />
              {translatedText && !loading && (
                <div className="absolute bottom-2 right-2 flex space-x-2">
                  <button
                    onClick={() => isSpeaking ? handleStopSpeaking() : handleSpeak(translatedText, targetLang)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      isSpeaking 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                    title={isSpeaking ? "Stop speaking" : "Listen to translation"}
                  >
                    {isSpeaking ? '⏸️ Stop' : '🔊 Play'}
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(translatedText)
                        // Show brief success feedback (use a ref or state for this to avoid closure issues)
                        const prevError = error
                        setError('✓ Copied to clipboard!')
                        setTimeout(() => {
                          setError(prevError)
                        }, 2000)
                      } catch (err) {
                        setError('Failed to copy to clipboard. Please select and copy manually.')
                      }
                    }}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                    title="Copy translation"
                  >
                    📋 Copy
                  </button>
                </div>
              )}
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoTranslate"
              checked={autoTranslate}
              onChange={(e) => setAutoTranslate(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="autoTranslate" className="text-sm text-gray-700">
              Auto-translate
            </label>
          </div>

          {!autoTranslate && (
            <button
              onClick={() => translateText(text)}
              disabled={loading || !text.trim()}
              className={`bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-2 rounded-lg hover:shadow-lg transition-all font-semibold ${
                loading || !text.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? '⏳ Translating...' : '🔄 Translate'}
            </button>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h3 className="font-semibold mb-3 text-gray-800">💡 Tips for Travelers</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li>• <strong>Voice Input:</strong> Click the microphone button and speak clearly in your source language</li>
          <li>• <strong>Auto-Translate:</strong> Enable auto-translate for instant translations as you type</li>
          <li>• <strong>Listen:</strong> Click the 🔊 button to hear translations spoken aloud. Click ⏸️ to stop.</li>
          <li>• <strong>Browser Support:</strong> Text-to-speech works best in Chrome, Edge, or Safari</li>
          <li>• <strong>Swap Languages:</strong> Use the swap button to quickly reverse translation direction</li>
          <li>• <strong>Language Detection:</strong> The app can detect your input language automatically</li>
          <li>• <strong>Copy Translation:</strong> Click the copy button to copy translations to clipboard</li>
        </ul>
      </div>
    </div>
  )
}

export default Translator
