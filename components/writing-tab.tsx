'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface WritingTabProps {
  lessonId: string
}

// Writing exercises data
const writingData = {
  animals: {
    qa: [
      { id: 1, question: 'What is your favorite animal?', hint: 'My favorite animal is...' },
      { id: 2, question: 'Do you have a dog or cat at home?', hint: 'I have a...' },
      { id: 3, question: 'Where do you see birds?', hint: 'I see birds in the...' },
    ],
    sentence: [
      { word: 'dog', emoji: '🐶', example: 'The dog runs fast.' },
      { word: 'cat', emoji: '🐱', example: 'The cat is cute.' },
      { word: 'bird', emoji: '🐦', example: 'The bird sings beautifully.' },
    ],
    complete: [
      'The ___ is jumping.',
      'I see a ___ in the sky.',
      'My ___ is very friendly.'
    ]
  },
  food: {
    qa: [
      { id: 1, question: 'What is your favorite food?', hint: 'My favorite food is...' },
      { id: 2, question: 'Do you like pizza?', hint: 'Yes, I like... / No, I don\'t...' },
      { id: 3, question: 'What do you drink for breakfast?', hint: 'I drink...' },
    ],
    sentence: [
      { word: 'apple', emoji: '🍎', example: 'I eat an apple.' },
      { word: 'pizza', emoji: '🍕', example: 'We love pizza.' },
      { word: 'milk', emoji: '🥛', example: 'I drink milk every day.' },
    ],
    complete: [
      'I eat an ___ every day.',
      'My favorite ___ is pizza.',
      'I drink ___ with my breakfast.'
    ]
  },
  daily: {
    qa: [
      { id: 1, question: 'When do you run?', hint: 'I run in the...' },
      { id: 2, question: 'Do you like to jump and play?', hint: 'Yes, I like to... / No, I don\'t...' },
      { id: 3, question: 'What time do you sleep?', hint: 'I sleep at...' },
    ],
    sentence: [
      { word: 'run', emoji: '🏃', example: 'I run in the park.' },
      { word: 'jump', emoji: '⛹️', example: 'Children jump and play.' },
      { word: 'sleep', emoji: '😴', example: 'I sleep at night.' },
    ],
    complete: [
      'I ___ every morning.',
      'Children like to ___ and play.',
      'I ___ at 9 PM.'
    ]
  },
  family: {
    qa: [
      { id: 1, question: 'Tell me about your mother', hint: 'My mother is...' },
      { id: 2, question: 'What does your father do?', hint: 'My father...' },
      { id: 3, question: 'Do you have a sister or brother?', hint: 'Yes, I have a... / No, I don\'t...' },
    ],
    sentence: [
      { word: 'mother', emoji: '👩', example: 'My mother is kind.' },
      { word: 'father', emoji: '👨', example: 'My father plays sports.' },
      { word: 'sister', emoji: '👧', example: 'My sister is smart.' },
    ],
    complete: [
      'My ___ is very nice.',
      'My ___ plays sports.',
      'My ___ is 10 years old.'
    ]
  }
}

type ExerciseType = 'qa' | 'sentence' | 'complete'

interface Exercise {
  type: ExerciseType
  index: number
  data: any
}

export default function WritingTab({ lessonId }: WritingTabProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [scores, setScores] = useState<Record<number, any>>({})
  const [scoring, setScoring] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showExample, setShowExample] = useState(false)

  // Create combined exercise sequence: QA → Sentence → Complete (for each lesson item)
  const createExerciseSequence = (lessonData: any): Exercise[] => {
    const exercises: Exercise[] = []
    const numItems = Math.max(lessonData.qa?.length || 0, lessonData.sentence?.length || 0, lessonData.complete?.length || 0)

    for (let i = 0; i < numItems; i++) {
      // QA exercises
      if (lessonData.qa?.[i]) {
        exercises.push({
          type: 'qa' as const,
          index: i,
          data: lessonData.qa[i]
        })
      }
      // Sentence exercises
      if (lessonData.sentence?.[i]) {
        exercises.push({
          type: 'sentence' as const,
          index: i,
          data: lessonData.sentence[i]
        })
      }
      // Complete exercises
      if (lessonData.complete?.[i]) {
        exercises.push({
          type: 'complete' as const,
          index: i,
          data: lessonData.complete[i]
        })
      }
    }

    return exercises
  }

  const exerciseSequence = createExerciseSequence(writingData[lessonId as keyof typeof writingData] || writingData.animals)
  const currentExercise = exerciseSequence[currentExerciseIndex]
  const isLastExercise = currentExerciseIndex === exerciseSequence.length - 1
  const currentAnswer = answers[currentExerciseIndex] || ''
  const currentScore = scores[currentExerciseIndex]

  const handleAnswerChange = (value: string) => {
    setAnswers({ ...answers, [currentExerciseIndex]: value })
  }

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      alert('Please write your answer first!')
      return
    }
    setScoring(true)
    try {
      let requestData: any = {
        type: currentExercise.type,
        userAnswer: currentAnswer,
      }

      if (currentExercise.type === 'qa') {
        requestData.question = currentExercise.data.question
      } else if (currentExercise.type === 'sentence') {
        requestData.targetWord = currentExercise.data.word
      } else if (currentExercise.type === 'complete') {
        requestData.partial = currentExercise.data
      }

      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      })
      const result = await response.json()
      setScores({ ...scores, [currentExerciseIndex]: result })
    } catch (error) {
      console.error('[v0] Scoring error:', error)
    } finally {
      setScoring(false)
    }
  }

  const handleNext = () => {
    if (isLastExercise) {
      alert('🎉 Excellent! You completed all writing exercises!')
    } else {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
      setShowHint(false)
      setShowExample(false)
    }
  }

  const handlePrevious = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1)
      setShowHint(false)
      setShowExample(false)
    }
  }

  // Render different UI based on exercise type
  const renderExerciseContent = () => {
    const { type, data } = currentExercise

    if (type === 'qa') {
      return (
        <>
          {/* Practice Header - Blue Theme */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 mb-6 border border-blue-100">
            <div className="grid grid-cols-2 gap-8 items-center">
              <div className="text-center space-y-3">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center text-5xl shadow-lg mx-auto">
                  💬
                </div>
                <div className="space-y-1">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                    Answer Questions
                  </h1>
                  <div className="h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-white/50">
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">Practice Writing Answers</h3>
                  <p className="text-lg text-slate-700 leading-relaxed mb-4">
                    Read each question and write a complete answer
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Writing Section */}
          <div className="bg-white rounded-xl p-5">
            <div className="bg-primary/5 p-5 rounded-xl mb-4">
              <p className="text-sm text-slate-700 font-bold mb-2">QUESTION:</p>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 leading-relaxed">
                {data.question}
              </h2>
            </div>

            <Button
              onClick={() => setShowHint(true)}
              variant="ghost"
              size="sm"
              className="w-full h-9 text-sm mb-3"
            >
              💡 Show Hint
            </Button>

            <div className="space-y-3 mb-4">
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
          </div>
        </>
      )
    } else if (type === 'sentence') {
      return (
        <>
          {/* Practice Header - Green Theme */}
          <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-6 mb-6 border border-green-100">
            <div className="grid grid-cols-2 gap-8 items-center">
              <div className="text-center space-y-3">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl flex items-center justify-center text-5xl shadow-lg mx-auto">
                  {data.emoji}
                </div>
                <div className="space-y-1">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                    {data.word}
                  </h1>
                  <div className="h-0.5 bg-gradient-to-r from-green-400 to-teal-400 rounded-full"></div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-white/50">
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">Make a Sentence</h3>
                  <p className="text-lg text-slate-700 leading-relaxed mb-4">
                    Create sentences using the given vocabulary words
                  </p>
                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4">
                    <p className="text-3xl font-bold text-green-700">{data.word}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Writing Section */}
          <div className="bg-white rounded-xl p-5">
            <p className="text-center text-slate-900 font-semibold mb-4">Create a sentence using: <span className="font-bold text-secondary">"{data.word}"</span></p>

            <Button
              onClick={() => setShowExample(true)}
              variant="ghost"
              size="sm"
              className="w-full h-9 text-sm mb-3"
            >
              💡 Show Example
            </Button>

            <div className="space-y-3 mb-4">
              <label className="text-sm font-semibold text-slate-900 block">
                Your sentence:
              </label>
              <Textarea
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder={`Write a sentence with "${data.word}"...`}
                className="min-h-20 text-base rounded-xl border-secondary/50 p-3 text-slate-900 placeholder:text-slate-400 focus:border-secondary"
              />
            </div>
          </div>
        </>
      )
    } else if (type === 'complete') {
      return (
        <>
          {/* Practice Header - Yellow Theme */}
          <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 rounded-2xl p-6 mb-6 border border-yellow-100">
            <div className="grid grid-cols-2 gap-8 items-center">
              <div className="text-center space-y-3">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-5xl shadow-lg mx-auto">
                  🎯
                </div>
                <div className="space-y-1">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                    Complete Sentence
                  </h1>
                  <div className="h-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-white/50">
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">Fill in the Missing Word</h3>
                  <p className="text-lg text-slate-700 leading-relaxed mb-4">
                    Complete the sentence with the right word
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Writing Section */}
          <div className="bg-white rounded-xl p-5">
            <div className="bg-accent/10 p-5 rounded-xl mb-4">
              <p className="text-2xl font-bold text-slate-900 text-center">
                {data.replace('___', '____')}
              </p>
            </div>

            <div className="space-y-3 mb-4">
              <label className="text-sm font-semibold text-slate-900 block">
                Your answer:
              </label>
              <Textarea
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Write the missing word..."
                className="min-h-16 text-base rounded-xl border-accent/50 p-3 text-slate-900 placeholder:text-slate-400 focus:border-accent"
              />
            </div>
          </div>
        </>
      )
    }
  }

  return (
    <div className="space-y-4 flex flex-col h-full justify-center w-4xl">
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 overflow-y-auto max-h-[70vh] shadow-lg">
        <CardContent className="p-8">
          {renderExerciseContent()}

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
                  <div className="mb-4">
                    <img
                      src="/izzy/24 1014 - Mascot Guidlines emotions-01.png"
                      alt="Izzy mascot celebrating"
                      className="w-20 h-20 mx-auto mb-3"
                    />
                  </div>
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
                    onClick={() => setScores({...scores, [currentExerciseIndex]: undefined})}
                    className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Hint Popup */}
          {showHint && currentExercise.type === 'qa' && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200">
                <div className="text-center mb-6">
                  <div className="mb-4">
                    <img
                      src="/izzy/24 1014 - Mascot Guidlines emotions-05.png"
                      alt="Izzy mascot helping"
                      className="w-20 h-20 mx-auto mb-3"
                    />
                  </div>
                  <p className="text-2xl font-bold text-blue-600 mb-2">Hint</p>
                </div>
                <div className="mb-6">
                  <p className="text-lg text-slate-900 text-center leading-relaxed">
                    "{currentExercise.data.hint}"
                  </p>
                </div>
                <div className="text-center">
                  <Button
                    onClick={() => setShowHint(false)}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6"
                  >
                    Got it! 🎯
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Example Popup */}
          {showExample && currentExercise.type === 'sentence' && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200">
                <div className="text-center mb-6">
                  <div className="mb-4">
                    <img
                      src="/izzy/24 1014 - Mascot Guidlines emotions-05.png"
                      alt="Izzy mascot helping"
                      className="w-20 h-20 mx-auto mb-3"
                    />
                  </div>
                  <p className="text-2xl font-bold text-green-600 mb-2">Example</p>
                  <div className="text-center mb-2">
                    <span className="text-3xl">{currentExercise.data.emoji}</span>
                    <p className="text-xl font-bold text-slate-900">{currentExercise.data.word}</p>
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-lg text-slate-900 text-center leading-relaxed bg-green-50 rounded-lg p-4 border-2 border-green-200">
                    "{currentExercise.data.example}"
                  </p>
                </div>
                <div className="text-center">
                  <Button
                    onClick={() => setShowExample(false)}
                    className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6"
                  >
                    I understand! 💡
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
          disabled={currentExerciseIndex === 0}
          className="px-6 py-3 rounded-full font-bold disabled:opacity-50"
        >
          ← Previous
        </Button>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-700">
            Exercise {currentExerciseIndex + 1} of {exerciseSequence.length}
          </p>
          <div className="flex gap-2 mt-2 justify-center">
            {Array.from({ length: exerciseSequence.length }, (_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentExerciseIndex ? 'bg-secondary w-8' : 'bg-slate-300'
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
