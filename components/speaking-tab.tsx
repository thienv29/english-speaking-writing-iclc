'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface SpeakingTabProps {
  lessonId: string
}

const vocabularyData: Record<string, any[]> = {
  animals: [
    { word: 'Dog', example: 'The dog is running', emoji: '🐶', id: 'dog' },
    { word: 'Cat', example: 'The cat is sleeping', emoji: '🐱', id: 'cat' },
    { word: 'Bird', example: 'The bird is flying', emoji: '🐦', id: 'bird' },
    { word: 'Fish', example: 'The fish is swimming', emoji: '🐠', id: 'fish' },
  ],
  food: [
    { word: 'Apple', example: 'I like red apples', emoji: '🍎', id: 'apple' },
    { word: 'Pizza', example: 'We eat pizza on Friday', emoji: '🍕', id: 'pizza' },
    { word: 'Banana', example: 'Bananas are yellow', emoji: '🍌', id: 'banana' },
    { word: 'Juice', example: 'Drink fresh juice', emoji: '🧃', id: 'juice' },
  ],
  daily: [
    { word: 'Run', example: 'I run in the morning', emoji: '🏃', id: 'run' },
    { word: 'Sleep', example: 'I sleep at night', emoji: '😴', id: 'sleep' },
    { word: 'Eat', example: 'We eat breakfast', emoji: '🍽️', id: 'eat' },
    { word: 'Play', example: 'Children play games', emoji: '🎮', id: 'play' },
  ],
  family: [
    { word: 'Mother', example: 'My mother is kind', emoji: '👩', id: 'mother' },
    { word: 'Father', example: 'My father is strong', emoji: '👨', id: 'father' },
    { word: 'Sister', example: 'My sister is smart', emoji: '👧', id: 'sister' },
    { word: 'Brother', example: 'My brother likes sports', emoji: '👦', id: 'brother' },
  ],
}

  // Helper function to convert WebM blob to WAV
  const convertToWav = async (webmBlob: Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const fileReader = new FileReader()

      fileReader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

          // Convert to WAV format
          const wavBlob = audioBufferToWav(audioBuffer)
          resolve(wavBlob)
        } catch (error) {
          console.error('[v0] Audio conversion error:', error)
          // Fallback: return original blob with correct filename
          resolve(new Blob([webmBlob], { type: 'audio/wav' }))
        }
      }

      fileReader.onerror = () => reject(new Error('Failed to read audio file'))
      fileReader.readAsArrayBuffer(webmBlob)
    })
  }

  // Simple WAV encoder
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const length = buffer.length * buffer.numberOfChannels * 2 + 44
    const arrayBuffer = new ArrayBuffer(length)
    const view = new DataView(arrayBuffer)

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }

    writeString(0, 'RIFF')
    view.setUint32(4, length - 8, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, buffer.numberOfChannels, true)
    view.setUint32(24, buffer.sampleRate, true)
    view.setUint32(28, buffer.sampleRate * buffer.numberOfChannels * 2, true)
    view.setUint16(32, buffer.numberOfChannels * 2, true)
    view.setUint16(34, 16, true)
    writeString(36, 'data')
    view.setUint32(40, length - 44, true)

    // PCM data
    let offset = 44
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]))
        view.setInt16(offset, sample * 0x7FFF, true)
        offset += 2
      }
    }

    return new Blob([view], { type: 'audio/wav' })
  }

  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    try {
      const formData = new FormData()
      formData.append('file', audioBlob, 'audio.wav')

      const response = await fetch('http://localhost:8000/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        console.log('[v0] Transcription API result:', result)

        // Handle the API response format: {"transcription":"Dog.","language":"en","language_probability":"1.00"}
        if (result.transcription) {
          // Return the transcription text if available
          if (result.transcription.trim()) {
            return result.transcription.trim()
          } else {
            return 'Could not detect any speech in the recording. Please try speaking louder or closer to the microphone.'
          }
        } else {
          return 'Transcription failed. Please try again.'
        }
      } else if (response.status === 422) {
        // No speech detected
        return 'Could not detect any speech in the recording. Please try speaking louder or closer to the microphone.'
      } else if (response.status === 400) {
        // Bad file format
        return 'The audio file format is not supported. Please try recording again.'
      } else {
        // Other errors
        console.error('[v0] Transcription API error status:', response.status)
        return 'There was an error processing your audio. Please try again later.'
      }
    } catch (error) {
      console.error('[v0] Transcription API error:', error)
      return 'Could not connect to the speech recognition service. Please check your internet connection and try again.'
    }
  }

export default function SpeakingTab({ lessonId }: SpeakingTabProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null)
  const [recordingSaved, setRecordingSaved] = useState(false)
  const [scoring, setScoring] = useState(false)
  const [score, setScore] = useState<any>(null)
  const [transcribedText, setTranscribedText] = useState<string>('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const speechRecognitionRef = useRef<any>(null)

  const vocabulary = vocabularyData[lessonId] || vocabularyData.animals
  const currentWord = vocabulary[currentWordIndex]

  const startRecording = async () => {
    try {
      // Start audio recording only
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        setTranscribedText('Processing...') // Show processing message
        setRecordingSaved(true)
        console.log('[v0] Recording finished, processing audio...')

        // Convert to WAV and send to transcription API after recording is complete
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)
        setRecordingUrl(audioUrl)

        const wavBlob = await convertToWav(audioBlob)
        const transcript = await transcribeAudio(wavBlob)
        setTranscribedText(transcript)

        await scoreRecording(currentWord.word, transcript)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingSaved(false)
      setRecordingUrl(null)
      setScore(null)
      setTranscribedText('🎤 Recording...')
    } catch (error) {
      console.error('Microphone error:', error)
      alert('Please allow microphone access')
    }
  }

  const scoreRecording = async (word: string, transcribedText: string) => {
    setScoring(true)
    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'speaking',
          targetWord: word,
          transcribedText: transcribedText,
        }),
      })

      const result = await response.json()
      setScore(result)
      console.log('[v0] Speaking score:', result)
    } catch (error) {
      console.error('[v0] Scoring error:', error)
    } finally {
      setScoring(false)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }

    // Stop speech recognition if active
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop()
    }
  }

  const handleNext = () => {
    if (currentWordIndex < vocabulary.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1)
      setRecordingUrl(null)
      setRecordingSaved(false)
      setScore(null)
      setTranscribedText('')
    }
  }

  const handlePrevious = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1)
      setRecordingUrl(null)
      setRecordingSaved(false)
      setScore(null)
      setTranscribedText('')
    }
  }

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.8
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="space-y-2 flex flex-col h-full justify-center">
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 overflow-y-auto max-h-[70vh]">
        <CardHeader className="text-center pb-2">
          <div className="text-4xl mb-2">{currentWord.emoji}</div>
          <CardTitle className="text-2xl text-primary mb-1">{currentWord.word}</CardTitle>
          <p className="text-sm text-slate-700 font-semibold">{currentWord.example}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => playAudio(currentWord.word)}
              className="bg-accent hover:bg-accent/80 text-accent-foreground px-8 py-6 text-lg rounded-full font-bold"
            >
              🔊 Say Word
            </Button>
            <Button
              onClick={() => playAudio(currentWord.example)}
              className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-8 py-6 text-lg rounded-full font-bold"
            >
              🎤 Say Sentence
            </Button>
          </div>

          {/* Recording Section */}
          <div className="bg-white rounded-xl p-6">
            <p className="text-center text-slate-900 font-bold mb-4">📢 Click to record your pronunciation:</p>
            <div className="flex gap-4 justify-center mb-4">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-8 py-6 text-lg rounded-full font-bold transition-all ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-primary hover:bg-primary/80 text-primary-foreground'
                }`}
              >
                {isRecording ? '⏹️ Recording... Stop' : '🎙️ Start Record'}
              </Button>
            </div>

            {recordingSaved && recordingUrl && (
              <div className="bg-green-50 rounded-lg p-4 mt-4">
                <p className="text-center text-green-700 font-bold mb-3">✅ Your pronunciation recorded!</p>
                <div className="flex justify-center mb-4">
                  <audio controls src={recordingUrl} className="w-full max-w-sm" />
                </div>

                {scoring && (
                  <div className="text-center py-4">
                    <p className="text-slate-700 font-semibold">Analyzing your pronunciation...</p>
                  </div>
                )}

                {score && (
                  <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4 mt-4">
                    <div className="text-center mb-3">
                      <p className="text-2xl font-bold text-blue-700">
                        Score: {score.score}/10
                      </p>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm text-slate-600 mb-1">You said:</p>
                      <p className="text-lg font-mono bg-white rounded px-3 py-2 text-center">
                        "{score.transcribedText || '[No speech detected]'}"
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-slate-900 text-center mb-2">
                      {score.feedback}
                    </p>
                    <p className="text-slate-700 text-center">
                      {score.tips}
                    </p>
                  </div>
                )}

                <p className="text-center text-slate-600 text-sm mt-3">
                  Compare your recording with the model pronunciation above
                </p>
              </div>
            )}

            {isRecording && (
              <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4 mt-4">
                <p className="text-center text-red-600 font-bold animate-pulse">
                  🔴 Recording in progress...
                </p>
                {transcribedText && (
                  <div className="mt-3">
                    <p className="text-sm text-slate-600 mb-1">You're saying:</p>
                    <p className="text-lg font-mono bg-white rounded px-3 py-2 border text-center">
                      "{transcribedText}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-4 justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentWordIndex === 0}
          className="px-6 py-3 rounded-full font-bold disabled:opacity-50"
        >
          ← Previous
        </Button>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-700">
            Word {currentWordIndex + 1} of {vocabulary.length}
          </p>
          <div className="flex gap-2 mt-2 justify-center">
            {vocabulary.map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentWordIndex ? 'bg-primary w-8' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
        <Button
          onClick={handleNext}
          disabled={currentWordIndex === vocabulary.length - 1}
          className="px-6 py-3 rounded-full font-bold disabled:opacity-50"
        >
          Next →
        </Button>
      </div>
    </div>
  )
}
