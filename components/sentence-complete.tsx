'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SentenceCompleteProps {
  lessonId: string
  onBack: () => void
}

const sentenceCompleteData: Record<string, any> = {
  animals: {
    exercises: [
      { id: 1, partial: 'The ___ runs in the park.', answer: 'dog', word: 'dog' },
      { id: 2, partial: 'I have a ___ at home.', answer: 'cat', word: 'cat' },
      { id: 3, partial: 'The ___ sings a beautiful song.', answer: 'bird', word: 'bird' },
    ]
  },
  food: {
    exercises: [
      { id: 1, partial: 'I eat a red ___ every day.', answer: 'apple', word: 'apple' },
      { id: 2, partial: 'We eat ___ on Friday night.', answer: 'pizza', word: 'pizza' },
      { id: 3, partial: 'Drink ___ for strong bones.', answer: 'milk', word: 'milk' },
    ]
  },
  daily: {
    exercises: [
      { id: 1, partial: 'I ___ every morning.', answer: 'run', word: 'run' },
      { id: 2, partial: 'Children ___ and play at school.', answer: 'jump', word: 'jump' },
      { id: 3, partial: 'I ___ 8 hours every night.', answer: 'sleep', word: 'sleep' },
    ]
  },
  family: {
    exercises: [
      { id: 1, partial: 'My ___ loves me very much.', answer: 'mother', word: 'mother' },
      { id: 2, partial: 'My ___ plays soccer with me.', answer: 'father', word: 'father' },
      { id: 3, partial: 'My ___ helps me with homework.', answer: 'sister', word: 'sister' },
    ]
  }
}

export default function SentenceComplete({ lessonId, onBack }: SentenceCompleteProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [scores, setScores] = useState<Record<number, any>>({})
  const [scoring, setScoring] = useState(false)

  const exercises = sentenceCompleteData[lessonId].exercises
  const currentExercise = exercises[currentExerciseIndex]
  const isLastExercise = currentExerciseIndex === exercises.length - 1
  const currentAnswer = answers[currentExercise.id] || ''
  const currentScore = scores[currentExercise.id]

  const handleAnswerChange = (value: string) => {
    setAnswers({
      ...answers,
      [currentExercise.id]: value
    })
  }

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      alert('Please fill in the blank first!')
      return
    }

    setScoring(true)
    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'complete',
          partial: currentExercise.partial,
          targetWord: currentExercise.answer,
          userAnswer: currentAnswer,
        }),
      })

      const result = await response.json()
      setScores({
        ...scores,
        [currentExercise.id]: result
      })
      console.log('[v0] Completion score:', result)
    } catch (error) {
      console.error('[v0] Scoring error:', error)
      alert('Error scoring answer. Please try again.')
    } finally {
      setScoring(false)
    }
  }

  const handleNext = () => {
    if (isLastExercise) {
      alert('🎉 Amazing! You completed all exercises!')
      onBack()
    } else {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1)
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

      <Card className="bg-gradient-to-br from-accent/10 to-accent/5 overflow-y-auto max-h-[70vh] shadow-lg">
       

        <CardContent className="p-8 space-y-6">
          <div className="bg-yellow-200 p-8 rounded-2xl">
            <p className="text-sm text-slate-700 font-bold mb-4">COMPLETE THE SENTENCE:</p>
            <p className="text-2xl font-bold text-slate-900 leading-relaxed mb-4">
              {currentExercise.partial.split('___').map((part: string, index: number) => (
                <span key={index}>
                  {part}
                  {index < currentExercise.partial.split('___').length - 1 && (
                    <span className="text-orange-600 font-bold text-3xl"> ___ </span>
                  )}
                </span>
              ))}
            </p>
            <p className="text-sm text-slate-700 font-semibold">The missing word starts with: <span className="font-bold text-orange-700">{currentExercise.answer.charAt(0).toUpperCase()}</span></p>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 block mb-3">
              MISSING WORD:
            </label>
            <Input
              type="text"
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Type the missing word..."
              className="h-14 text-lg rounded-2xl p-4 text-slate-900 placeholder:text-slate-500"
            />
          </div>

          {!currentScore && (
            <Button
              onClick={handleSubmitAnswer}
              disabled={scoring}
              className="w-full h-14 rounded-full font-bold text-lg bg-accent hover:bg-accent/90"
            >
              {scoring ? '⏳ Checking...' : '✓ Submit & Score'}
            </Button>
          )}

          {scoring && (
            <div className="text-center py-4">
              <p className="text-slate-700 font-semibold">Analyzing your answer...</p>
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
          disabled={currentExerciseIndex === 0}
          className="px-6 py-3 rounded-full font-bold disabled:opacity-50"
        >
          ← Previous
        </Button>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-700">
            Exercise {currentExerciseIndex + 1} of {exercises.length}
          </p>
          <div className="flex gap-2 mt-2 justify-center">
            {Array.from({ length: exercises.length }, (_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentExerciseIndex ? 'bg-accent w-8' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
        <Button
          onClick={handleNext}
          className="px-6 py-3 rounded-full font-bold"
        >
          {isLastExercise ? 'Finish! 🎉' : 'Next →'}
        </Button>
      </div>
    </div>
  )
}
