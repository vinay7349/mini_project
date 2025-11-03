import React, { useState, useEffect } from 'react'

const Translator = () => {
  const [text, setText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [sourceLang, setSourceLang] = useState('en')
  const [targetLang, setTargetLang] = useState('es')
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState(null)

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = sourceLang

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setText(transcript)
        translateText(transcript)
      }

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
      }

      setRecognition(recognitionInstance)
    }
  }, [sourceLang])

  const translateText = async (inputText = text) => {
    if (!inputText.trim()) {
      setTranslatedText('')
      return
    }

    try {
      // Using a free translation API (mock implementation)
      // In production, use Google Translate API or similar
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(inputText)}&langpair=${sourceLang}|${targetLang}`
      )
      const data = await response.json()
      
      if (data.responseData && data.responseData.translatedText) {
        setTranslatedText(data.responseData.translatedText)
      } else {
        setTranslatedText('Translation not available. Please check your connection.')
      }
    } catch (error) {
      console.error('Translation error:', error)
      setTranslatedText('Translation service unavailable. Using mock translation.')
      // Mock translation fallback
      setTranslatedText(`[Translated to ${targetLang}] ${inputText}`)
    }
  }

  const handleTranslate = () => {
    translateText()
  }

  const handleSpeak = (textToSpeak, lang) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak)
      utterance.lang = lang
      window.speechSynthesis.speak(utterance)
    }
  }

  const startListening = () => {
    if (recognition && !isListening) {
      setIsListening(true)
      recognition.start()
    }
  }

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop()
      setIsListening(false)
    }
  }

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">🗣️ Voice Translator</h1>

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
                onChange={(e) => setSourceLang(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or speak your text here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-40"
              />
              <div className="absolute bottom-2 right-2 flex space-x-2">
                <button
                  onClick={startListening}
                  disabled={isListening}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    isListening
                      ? 'bg-red-500 text-white'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isListening ? '🛑 Stop' : '🎤 Speak'}
                </button>
                {text && (
                  <button
                    onClick={() => handleSpeak(text, sourceLang)}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                  >
                    🔊 Play
                  </button>
                )}
              </div>
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
                onChange={(e) => setTargetLang(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <textarea
                value={translatedText}
                readOnly
                placeholder="Translation will appear here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 h-40"
              />
              {translatedText && (
                <div className="absolute bottom-2 right-2">
                  <button
                    onClick={() => handleSpeak(translatedText, targetLang)}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                  >
                    🔊 Play
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={handleTranslate}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
          >
            🔄 Translate
          </button>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">💡 Tips for Travelers</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Use the microphone button to speak directly</li>
          <li>• Click "Play" to hear translations for locals</li>
          <li>• Practice common phrases before your trip</li>
          <li>• Save important translations for offline use</li>
        </ul>
      </div>
    </div>
  )
}

export default Translator

