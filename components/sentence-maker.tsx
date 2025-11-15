'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface SentenceMakerProps {
  lessonId: string
  onBack: () => void
}

const sentenceMakerData: Record<string, any> = {
  animals: {
    words: [
      { word: 'dog', emoji: '🐶', example: 'The dog runs fast.' },
      { word: 'cat', emoji: '🐱', example: 'The cat is cute.' },
      { word: 'bird', emoji: '🐦', example: 'The bird sings beautifully.' },
    ]
  },
  food: {
    words: [
      { word: 'apple', emoji: '🍎', example: 'I eat an apple.' },
      { word: 'pizza', emoji: '🍕', example: 'We love pizza.' },
      { word: 'milk', emoji: '🥛', example: 'I drink milk every day.' },
    ]
  },
  daily: {
    words: [
      { word: 'run', emoji: '🏃', example: 'I run in the park.' },
      { word: 'jump', emoji: '⛹️', example: 'Children jump and play.' },
      { word: 'sleep', emoji: '😴', example: 'I sleep at night.' },
    ]
  },
  family: {
    words: [
      { word: 'mother', emoji: '👩', example: 'My mother is kind.' },
      { word: 'father', emoji: '👨', example: 'My father plays sports.' },
      { word: 'sister', emoji: '👧', example: 'My sister is smart.' },
    ]
  }
}

export default function SentenceMaker({ lessonId, onBack }: SentenceMakerProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [sentences, setSentences] = useState<Record<number, string>>({})
  const [showExample, setShowExample] = useState(false)
  const [scores, setScores] = useState<Record<number, any>>({})
  const [scoring, setScoring] = useState(false)

  const words = sentenceMakerData[lessonId].words
  const currentWord = words[currentWordIndex]
  const isLastWord = currentWordIndex === words.length - 1
  const currentSentence = sentences[currentWordIndex] || ''
  const currentScore = scores[currentWordIndex]

  const handleSentenceChange = (value: string) => {
    setSentences({
      ...sentences,
      [currentWordIndex]: value
    })
  }

  const handleSubmitSentence = async () => {
    if (!currentSentence.trim()) {
      alert('Please write a sentence first!')
      return
    }

    setScoring(true)
    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sentence',
          targetWord: currentWord.word,
          userAnswer: currentSentence,
        }),
      })

      const result = await response.json()
      setScores({
        ...scores,
        [currentWordIndex]: result
      })
      console.log('[v0] Sentence score:', result)
    } catch (error) {
      console.error('[v0] Scoring error:', error)
      alert('Error scoring sentence. Please try again.')
    } finally {
      setScoring(false)
    }
  }

  const handleNext = () => {
    if (isLastWord) {
      alert('🎉 Excellent! You created all sentences!')
      onBack()
    } else {
      setCurrentWordIndex(currentWordIndex + 1)
      setShowExample(false)
    }
  }

  const handlePrevious = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1)
      setShowExample(false)
    }
  }

  return (
    <div className="space-y-2 flex flex-col h-full justify-center w-4xl">
      <Button
        onClick={onBack}
        variant="outline"
        className="rounded-full h-10 w-fit"
      >
        ← Back
      </Button>

      <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 overflow-y-auto max-h-[70vh] shadow-lg">
        <CardContent className="p-6 space-y-4">
          {/* Header with emoji and word */}
          <div className="text-center">
            <div className="text-6xl mb-2">{currentWord.emoji}</div>
            <h1 className="text-4xl font-bold text-slate-900">{currentWord.word}</h1>
          </div>

          {/* Instruction */}
          <div className="bg-secondary/10 p-4 rounded-xl">
            <p className="text-lg font-semibold text-slate-900 text-center">
              Create a sentence using: <span className="text-secondary font-bold">"{currentWord.word}"</span>
            </p>
          </div>

          {/* Example toggle */}
          <Button
            onClick={() => setShowExample(!showExample)}
            variant="ghost"
            size="sm"
            className="w-full h-9 text-sm"
          >
            {showExample ? 'Hide Example' : '💡 Show Example'}
          </Button>

          {showExample && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <p className="text-sm text-slate-700 font-medium mb-1">Example:</p>
              <p className="text-base italic">"{currentWord.example}"</p>
            </div>
          )}

          {/* Answer input */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-900 block">
              Your sentence:
            </label>
            <Textarea
              value={currentSentence}
              onChange={(e) => handleSentenceChange(e.target.value)}
              placeholder={`Write a sentence with "${currentWord.word}"...`}
              className="min-h-20 text-base rounded-xl border-secondary/50 p-3 text-slate-900 placeholder:text-slate-400 focus:border-secondary"
            />
          </div>

          {!currentScore && (
            <Button
              onClick={handleSubmitSentence}
              disabled={scoring}
              className="w-full h-14 rounded-full font-bold text-lg bg-secondary hover:bg-secondary/90"
            >
              {scoring ? '⏳ Checking...' : '✓ Submit & Score'}
            </Button>
          )}

          {scoring && (
            <div className="text-center py-4">
              <p className="text-slate-700 font-semibold">Analyzing your sentence...</p>
            </div>
          )}

          {currentScore && (
            <div className="bg-green-50 rounded-2xl p-6">
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-green-700">
                  Score: {currentScore.score}/10
                </p>
              </div>
              <p className="text-lg font-semibold text-slate-900 text-center mb-3">
                {currentScore.feedback}
              </p>
              <p className="text-slate-700 text-center">
                {currentScore.explanation}
              </p>
            </div>
          )}

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
            Word {currentWordIndex + 1} of {words.length}
          </p>
          <div className="flex gap-2 mt-2 justify-center">
            {Array.from({ length: words.length }, (_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentWordIndex ? 'bg-secondary w-8' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
        <Button
          onClick={handleNext}
          className="px-6 py-3 rounded-full font-bold"
        >
          {isLastWord ? 'Finish! 🎉' : 'Next →'}
        </Button>
      </div>
    </div>
  )
}
