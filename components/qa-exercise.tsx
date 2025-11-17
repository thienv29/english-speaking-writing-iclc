'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface QAExerciseProps {
  lessonId: string
  onBack: () => void
}

const qaData: Record<string, any> = {
  animals: {
    questions: [
      { id: 1, question: 'What is your favorite animal?', hint: 'My favorite animal is...' },
      { id: 2, question: 'Do you have a dog or cat at home?', hint: 'I have a...' },
      { id: 3, question: 'Where do you see birds?', hint: 'I see birds in the...' },
    ]
  },
  food: {
    questions: [
      { id: 1, question: 'What is your favorite food?', hint: 'My favorite food is...' },
      { id: 2, question: 'Do you like pizza?', hint: 'Yes, I like... / No, I don\'t like...' },
      { id: 3, question: 'What do you drink for breakfast?', hint: 'I drink...' },
    ]
  },
  daily: {
    questions: [
      { id: 1, question: 'When do you run?', hint: 'I run in the...' },
      { id: 2, question: 'Do you like to jump and play?', hint: 'Yes, I like to... / No, I don\'t...' },
      { id: 3, question: 'What time do you sleep?', hint: 'I sleep at...' },
    ]
  },
  family: {
    questions: [
      { id: 1, question: 'Tell me about your mother', hint: 'My mother is...' },
      { id: 2, question: 'What does your father do?', hint: 'My father...' },
      { id: 3, question: 'Do you have a sister or brother?', hint: 'Yes, I have a... / No, I don\'t...' },
    ]
  }
}

export default function QAExercise({ lessonId, onBack }: QAExerciseProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showHint, setShowHint] = useState(false)
  const [scores, setScores] = useState<Record<number, any>>({})
  const [scoring, setScoring] = useState(false)

  const questions = qaData[lessonId].questions
  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const currentAnswer = answers[currentQuestion.id] || ''
  const currentScore = scores[currentQuestion.id]

  const handleAnswerChange = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value
    })
  }

  const handleSpeakQuestion = () => {
    const utterance = new SpeechSynthesisUtterance(currentQuestion.question)
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      alert('Please write an answer first!')
      return
    }

    setScoring(true)
    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'qa',
          question: currentQuestion.question,
          userAnswer: currentAnswer,
        }),
      })

      const result = await response.json()
      setScores({
        ...scores,
        [currentQuestion.id]: result
      })
      console.log('[v0] Q&A score:', result)
    } catch (error) {
      console.error('[v0] Scoring error:', error)
      alert('Error scoring answer. Please try again.')
    } finally {
      setScoring(false)
    }
  }

  const handleNext = () => {
    if (isLastQuestion) {
      alert('🎉 Great job! You completed all questions!')
      onBack()
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setShowHint(false)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setShowHint(false)
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

      <Card className="shadow-lg bg-gradient-to-br from-primary/10 to-primary/5 overflow-y-auto ">

        <CardContent className="p-6 space-y-4">
          {/* Question section */}
          <div className="bg-primary/5 p-5 rounded-xl">
            <p className="text-sm text-slate-700 font-bold mb-2">QUESTION:</p>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 leading-relaxed">
              {currentQuestion.question}
            </h2>
            <Button
              onClick={handleSpeakQuestion}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-full px-6"
            >
              🔊 Listen
            </Button>
          </div>

          {/* Hint toggle */}
          <Button
            onClick={() => setShowHint(!showHint)}
            variant="ghost"
            size="sm"
            className="w-full h-9 text-sm"
          >
            {showHint ? 'Hide Hint' : '💡 Show Hint'}
          </Button>

          {showHint && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <p className="text-sm text-slate-700 font-medium mb-1">Hint:</p>
              <p className="text-base italic">"{currentQuestion.hint}"</p>
            </div>
          )}

          {/* Answer input */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-900 block">
              Your answer:
            </label>
            <Textarea
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Write your answer here..."
              className="min-h-20 text-base rounded-xl border-primary/50 p-3 text-slate-900 placeholder:text-slate-400 focus:border-primary"
            />
          </div>

          {!currentScore && (
            <Button
              onClick={handleSubmitAnswer}
              disabled={scoring}
              className="w-full h-14 rounded-full font-bold text-lg bg-secondary hover:bg-secondary/90"
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
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200">
                <div className="text-center mb-6">
                  <p className="text-4xl font-bold text-green-600 mb-2">
                    {currentScore.score}/10
                  </p>
                  <p className="text-lg font-medium text-slate-600">Your Score!</p>
                </div>
                <div className="mb-6">
                  <p className="text-lg font-semibold text-slate-900 text-center mb-3">
                    {currentScore.feedback}
                  </p>
                  <p className="text-slate-700 text-center">
                    {currentScore.explanation}
                  </p>
                </div>
                <div className="text-center">
                  <Button
                    onClick={() => setScores({...scores, [currentQuestion.id]: undefined})}
                    className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-4 justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-3 rounded-full font-bold disabled:opacity-50"
        >
          ← Previous
        </Button>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-700">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          <div className="flex gap-2 mt-2 justify-center">
            {Array.from({ length: questions.length }, (_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentQuestionIndex ? 'bg-primary w-8' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
        <Button
          onClick={handleNext}
          className="px-6 py-3 rounded-full font-bold"
        >
          {isLastQuestion ? 'Finish! 🎉' : 'Next →'}
        </Button>
      </div>
    </div>
  )
}
