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
    <div className="max-w-2xl mx-auto">
      <Button
        onClick={onBack}
        variant="outline"
        className="mb-6 rounded-full h-10"
      >
        ← Back
      </Button>

      <div className="mb-6 text-center">
        <p className="text-muted-foreground text-lg font-semibold">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
        <div className="w-full bg-muted rounded-full h-3 mt-2">
          <div
            className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <Card className="border-4 border-primary shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white text-center pb-8">
          <CardTitle className="text-3xl">💬 Q&A Exercise</CardTitle>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          <div className="bg-blue-100 p-8 rounded-2xl border-4 border-primary">
            <p className="text-sm text-slate-700 font-bold mb-3">QUESTION:</p>
            <h2 className="text-3xl font-bold text-slate-900 mb-6 leading-relaxed">
              {currentQuestion.question}
            </h2>
            <Button
              onClick={handleSpeakQuestion}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-full text-lg"
            >
              🔊 Listen to Question
            </Button>
          </div>

          <Button
            onClick={() => setShowHint(!showHint)}
            variant="outline"
            className="w-full rounded-full font-bold h-11"
          >
            {showHint ? '✓ Hide Hint' : '💡 Show Hint'}
          </Button>

          {showHint && (
            <div className="bg-amber-100 p-6 rounded-2xl border-3 border-amber-600">
              <p className="text-sm text-slate-700 font-bold mb-2">HINT:</p>
              <p className="text-lg font-semibold text-slate-900">{currentQuestion.hint}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-bold text-slate-700 block mb-3">
              YOUR ANSWER:
            </label>
            <Textarea
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Write your answer here..."
              className="min-h-24 text-lg rounded-2xl border-2 border-primary p-4 text-slate-900 placeholder:text-slate-500"
            />
            <p className="text-xs text-slate-600 mt-2">
              💬 Try to write a complete sentence!
            </p>
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
              disabled={currentQuestionIndex === 0}
              className="px-8 h-14 rounded-full font-bold text-lg"
              variant="outline"
            >
              ← Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!currentScore}
              className="px-8 h-14 rounded-full font-bold text-lg bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              {isLastQuestion ? 'Finish! 🎉' : 'Next →'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
