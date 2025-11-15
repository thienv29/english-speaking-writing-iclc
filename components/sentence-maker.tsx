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
    <div className="w-4xl mx-auto">
      <Button
        onClick={onBack}
        variant="outline"
        className="mb-6 rounded-full h-10"
      >
        ← Back
      </Button>

      <div className="mb-6 text-center">
        <p className="text-muted-foreground text-lg font-semibold">
          Word {currentWordIndex + 1} of {words.length}
        </p>
        <div className="w-full bg-muted rounded-full h-3 mt-2">
          <div
            className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-300"
            style={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }}
          />
        </div>
      </div>

      <Card className="border-4 border-secondary shadow-2xl">
        <CardContent className="p-8 space-y-6">
          <div className="text-center">
            <div className="text-8xl mb-4">{currentWord.emoji}</div>
            <div className="bg-green-200 p-6 rounded-2xl border-4 border-secondary inline-block">
              <p className="text-4xl font-bold text-slate-900">{currentWord.word.toUpperCase()}</p>
            </div>
          </div>

          <div className="bg-green-100 p-6 rounded-2xl border-2 border-secondary">
            <p className="text-lg font-bold text-slate-900 text-center">
              Create a sentence using the word: <span className="text-green-700 font-bold">{currentWord.word}</span>
            </p>
          </div>

          <Button
            onClick={() => setShowExample(!showExample)}
            variant="outline"
            className="w-full rounded-full font-bold h-11"
          >
            {showExample ? '✓ Hide Example' : '💡 Show Example'}
          </Button>

          {showExample && (
            <div className="bg-amber-100 p-6 rounded-2xl border-3 border-amber-600">
              <p className="text-sm text-slate-700 font-bold mb-2">EXAMPLE:</p>
              <p className="text-lg font-semibold text-slate-900 italic">"{currentWord.example}"</p>
            </div>
          )}

          <div>
            <label className="text-sm font-bold text-slate-700 block mb-3">
              YOUR SENTENCE:
            </label>
            <Textarea
              value={currentSentence}
              onChange={(e) => handleSentenceChange(e.target.value)}
              placeholder={`Write a sentence with "${currentWord.word}"...`}
              className="min-h-24 text-lg rounded-2xl border-2 border-secondary p-4 text-slate-900 placeholder:text-slate-500"
            />
            <p className="text-xs text-slate-600 mt-2">
              📝 Be creative and make a meaningful sentence!
            </p>
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
            <div className="bg-green-50 border-4 border-green-400 rounded-2xl p-6">
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

          <div className="flex gap-4 justify-center pt-4">
            <Button
              onClick={handlePrevious}
              disabled={currentWordIndex === 0}
              className="px-8 h-14 rounded-full font-bold text-lg"
              variant="outline"
            >
              ← Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!currentScore}
              className="px-8 h-14 rounded-full font-bold text-lg bg-secondary hover:bg-secondary/90 disabled:opacity-50"
            >
              {isLastWord ? 'Finish! 🎉' : 'Next →'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
