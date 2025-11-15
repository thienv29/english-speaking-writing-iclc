'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export default function WritingTab({ lessonId }: WritingTabProps) {
  const [exerciseType, setExerciseType] = useState<'qa' | 'sentence' | 'complete' | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [scores, setScores] = useState<Record<number, any>>({})
  const [scoring, setScoring] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showExample, setShowExample] = useState(false)

  const currentLessonData = writingData[lessonId as keyof typeof writingData] || writingData.animals

  if (exerciseType === 'qa') {
    const questions = currentLessonData.qa
    const currentQuestion = questions[currentIndex]
    const isLastQuestion = currentIndex === questions.length - 1
    const currentAnswer = answers[currentIndex] || ''
    const currentScore = scores[currentIndex]

    const handleAnswerChange = (value: string) => {
      setAnswers({ ...answers, [currentIndex]: value })
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
        setScores({ ...scores, [currentIndex]: result })
      } catch (error) {
        console.error('[v0] Scoring error:', error)
      } finally {
        setScoring(false)
      }
    }

    const handleNext = () => {
      if (isLastQuestion) {
        alert('🎉 Great job! You completed all questions!')
        setExerciseType(null)
      } else {
        setCurrentIndex(currentIndex + 1)
        setShowHint(false)
      }
    }

    const handlePrevious = () => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
        setShowHint(false)
      }
    }

    return (
      <div className="space-y-4 flex flex-col h-full justify-center w-4xl">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 overflow-y-auto max-h-[70vh] shadow-lg">
          <CardContent className="p-8">
            {/* Practice Header */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 mb-6 border border-blue-100">
              <div className="grid grid-cols-2 gap-8 items-center">
                {/* LEFT: Emoji + Title */}
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

                {/* RIGHT: Clear Instructions */}
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
                  {currentQuestion.question}
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
                        onClick={() => setScores({...scores, [currentIndex]: undefined})}
                        className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Hint Popup */}
              {showHint && (
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
                        "{currentQuestion.hint}"
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
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-4 justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-6 py-3 rounded-full font-bold disabled:opacity-50"
          >
            ← Previous
          </Button>
          <div className="text-center">
            <p className="text-lg font-bold text-slate-700">
              Question {currentIndex + 1} of {questions.length}
            </p>
            <div className="flex gap-2 mt-2 justify-center">
              {Array.from({ length: questions.length }, (_, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx === currentIndex ? 'bg-primary w-8' : 'bg-slate-300'
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

  if (exerciseType === 'sentence') {
    const words = currentLessonData.sentence
    const currentWord = words[currentIndex]
    const isLastWord = currentIndex === words.length - 1
    const currentSentence = answers[currentIndex] || ''
    const currentScore = scores[currentIndex]

    const handleSentenceChange = (value: string) => {
      setAnswers({ ...answers, [currentIndex]: value })
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
        setScores({ ...scores, [currentIndex]: result })
      } catch (error) {
        console.error('[v0] Scoring error:', error)
      } finally {
        setScoring(false)
      }
    }

    const handleNext = () => {
      if (isLastWord) {
        alert('🎉 Excellent! You created all sentences!')
        setExerciseType(null)
      } else {
        setCurrentIndex(currentIndex + 1)
        setShowExample(false)
      }
    }

    const handlePrevious = () => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
        setShowExample(false)
      }
    }

    return (
      <div className="space-y-4 flex flex-col h-full justify-center w-4xl">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 overflow-y-auto max-h-[70vh] shadow-lg">
          <CardContent className="p-8">
            {/* Practice Header */}
            <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-6 mb-6 border border-green-100">
              <div className="grid grid-cols-2 gap-8 items-center">
                {/* LEFT: Emoji + Word */}
                <div className="text-center space-y-3">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl flex items-center justify-center text-5xl shadow-lg mx-auto">
                    {currentWord.emoji}
                  </div>
                  <div className="space-y-1">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                      {currentWord.word}
                    </h1>
                    <div className="h-0.5 bg-gradient-to-r from-green-400 to-teal-400 rounded-full"></div>
                  </div>
                </div>

                {/* RIGHT: Clear Instructions */}
                <div className="text-center">
                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-white/50">
                    <h3 className="text-2xl font-bold text-slate-800 mb-3">Make a Sentence</h3>
                    <p className="text-lg text-slate-700 leading-relaxed mb-4">
                      Create sentences using the given vocabulary words
                    </p>
                    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4">
                      <p className="text-3xl font-bold text-green-700">{currentWord.word}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Writing Section */}
            <div className="bg-white rounded-xl p-5">
              <p className="text-center text-slate-900 font-semibold mb-4">Create a sentence using: <span className="font-bold text-secondary">"{currentWord.word}"</span></p>

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
                        onClick={() => setScores({...scores, [currentIndex]: undefined})}
                        className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Example Popup */}
        {showExample && (
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
                  <span className="text-3xl">{currentWord.emoji}</span>
                  <p className="text-xl font-bold text-slate-900">{currentWord.word}</p>
                </div>
              </div>
              <div className="mb-6">
                <p className="text-lg text-slate-900 text-center leading-relaxed bg-green-50 rounded-lg p-4 border-2 border-green-200">
                  "{currentWord.example}"
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

        {/* Navigation */}
        <div className="flex gap-4 justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-6 py-3 rounded-full font-bold disabled:opacity-50"
          >
            ← Previous
          </Button>
          <div className="text-center">
            <p className="text-lg font-bold text-slate-700">
              Word {currentIndex + 1} of {words.length}
            </p>
            <div className="flex gap-2 mt-2 justify-center">
              {Array.from({ length: words.length }, (_, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx === currentIndex ? 'bg-secondary w-8' : 'bg-slate-300'
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

  if (exerciseType === 'complete') {
    const sentences = currentLessonData.complete
    const currentSentence = sentences[currentIndex]
    const isLastSentence = currentIndex === sentences.length - 1
    const currentAnswer = answers[currentIndex] || ''
    const currentScore = scores[currentIndex]

    const handleAnswerChange = (value: string) => {
      setAnswers({ ...answers, [currentIndex]: value })
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
            type: 'complete',
            partial: currentSentence,
            userAnswer: currentAnswer,
          }),
        })
        const result = await response.json()
        setScores({ ...scores, [currentIndex]: result })
      } catch (error) {
        console.error('[v0] Scoring error:', error)
      } finally {
        setScoring(false)
      }
    }

    const handleNext = () => {
      if (isLastSentence) {
        alert('🎉 Excellent! You completed all sentences!')
        setExerciseType(null)
      } else {
        setCurrentIndex(currentIndex + 1)
        setShowHint(false)
      }
    }

    const handlePrevious = () => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
        setShowHint(false)
      }
    }

    return (
      <div className="space-y-4 flex flex-col h-full justify-center w-4xl">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 overflow-y-auto max-h-[70vh] shadow-lg">
          <CardContent className="p-8">
            {/* Practice Header */}
            <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 rounded-2xl p-6 mb-6 border border-yellow-100">
              <div className="grid grid-cols-2 gap-8 items-center">
                {/* LEFT: Target Symbol */}
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

                {/* RIGHT: Clear Instructions */}
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
                  {currentSentence.replace('___', '____')}
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
                      <p className="text-4xl font-bold text-yellow-600 mb-2">
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
                        onClick={() => setScores({...scores, [currentIndex]: undefined})}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-6"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-4 justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-6 py-3 rounded-full font-bold disabled:opacity-50"
          >
            ← Previous
          </Button>
          <div className="text-center">
            <p className="text-lg font-bold text-slate-700">
              Sentence {currentIndex + 1} of {sentences.length}
            </p>
            <div className="flex gap-2 mt-2 justify-center">
              {Array.from({ length: sentences.length }, (_, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx === currentIndex ? 'bg-accent w-8' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <Button
            onClick={handleNext}
            className="px-6 py-3 rounded-full font-bold"
          >
            {isLastSentence ? 'Finish! 🎉' : 'Next →'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 flex flex-col h-full justify-center">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-slate-900 mb-1">✍️ Choose a Writing Exercise</h2>
        <p className="text-sm text-slate-600">Pick one to test your writing skills!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* Q&A Exercise - Blue theme */}
        <Card
          onClick={() => setExerciseType('qa')}
          className="cursor-pointer border border-primary bg-gradient-to-br from-blue-100 to-blue-50 hover:shadow-lg transition-all"
        >
          <CardHeader className="text-center">
            <div className="text-4xl mb-2">💬</div>
            <CardTitle className="text-lg text-primary">Answer Questions</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-xs text-slate-700 font-semibold mb-2">Read the question and write your answer in complete sentences</p>
            <Button className="w-full py-1 text-sm bg-primary hover:bg-primary/80 text-primary-foreground rounded-full">
              Start
            </Button>
          </CardContent>
        </Card>

        {/* Sentence Maker */}
        <Card
          onClick={() => setExerciseType('sentence')}
          className="cursor-pointer border border-secondary bg-gradient-to-br from-green-100 to-green-50 hover:shadow-lg transition-all"
        >
          <CardHeader className="text-center">
            <div className="text-4xl mb-2">🔤</div>
            <CardTitle className="text-lg text-secondary">Make a Sentence</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-xs text-slate-700 font-semibold mb-2">Create sentences using the given vocabulary words</p>
            <Button className="w-full py-1 text-sm bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full">
              Start
            </Button>
          </CardContent>
        </Card>

        {/* Sentence Completion */}
        <Card
          onClick={() => setExerciseType('complete')}
          className="cursor-pointer border border-accent bg-gradient-to-br from-yellow-100 to-yellow-50 hover:shadow-lg transition-all"
        >
          <CardHeader className="text-center">
            <div className="text-4xl mb-2">🎯</div>
            <CardTitle className="text-lg text-accent-foreground">Complete Sentence</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-xs text-slate-700 font-semibold mb-2">Fill in the missing words to complete the sentence</p>
            <Button className="w-full py-1 text-sm bg-accent hover:bg-accent/80 text-accent-foreground rounded-full">
              Start
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
