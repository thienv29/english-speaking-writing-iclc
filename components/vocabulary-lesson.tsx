'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface VocabularyLessonProps {
  lessonId: string
  onComplete: () => void
  onBack: () => void
}

const vocabularyData: Record<string, any> = {
  animals: {
    title: '🐾 Animals',
    words: [
      { word: 'Dog', emoji: '🐶', pronunciation: 'dawg', sentence: 'The dog runs in the park.' },
      { word: 'Cat', emoji: '🐱', pronunciation: 'kat', sentence: 'The cat is sleeping on the bed.' },
      { word: 'Bird', emoji: '🐦', pronunciation: 'burd', sentence: 'The bird sings in the morning.' },
    ]
  },
  food: {
    title: '🍎 Food & Drinks',
    words: [
      { word: 'Apple', emoji: '🍎', pronunciation: 'ap-ul', sentence: 'I eat a red apple every day.' },
      { word: 'Pizza', emoji: '🍕', pronunciation: 'peet-za', sentence: 'We eat pizza on Friday.' },
      { word: 'Milk', emoji: '🥛', pronunciation: 'milk', sentence: 'Drink milk for strong bones.' },
    ]
  },
  daily: {
    title: '📅 Daily Activities',
    words: [
      { word: 'Run', emoji: '🏃', pronunciation: 'run', sentence: 'I run every morning.' },
      { word: 'Jump', emoji: '⛹️', pronunciation: 'jump', sentence: 'Kids jump and play at school.' },
      { word: 'Sleep', emoji: '😴', pronunciation: 'sleep', sentence: 'I sleep 8 hours every night.' },
    ]
  },
  family: {
    title: '👨‍👩‍👧‍👦 Family',
    words: [
      { word: 'Mother', emoji: '👩', pronunciation: 'muh-thur', sentence: 'My mother loves me very much.' },
      { word: 'Father', emoji: '👨', pronunciation: 'fah-thur', sentence: 'My father plays soccer with me.' },
      { word: 'Sister', emoji: '👧', pronunciation: 'sis-tur', sentence: 'My sister helps me with homework.' },
    ]
  }
}

export default function VocabularyLesson({ lessonId, onComplete, onBack }: VocabularyLessonProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const lesson = vocabularyData[lessonId]
  const currentWord = lesson.words[currentWordIndex]
  const isLastWord = currentWordIndex === lesson.words.length - 1

  const handleSpeakWord = () => {
    const utterance = new SpeechSynthesisUtterance(currentWord.word)
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }

  const handleSpeakSentence = () => {
    const utterance = new SpeechSynthesisUtterance(currentWord.sentence)
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }

  const handleNext = () => {
    if (isLastWord) {
      onComplete()
    } else {
      setCurrentWordIndex(currentWordIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      <Button
        onClick={onBack}
        variant="outline"
        className="mb-6 rounded-full h-10"
      >
        ← Back to Lessons
      </Button>

      {/* Progress */}
      <div className="mb-6 text-center">
        <p className="text-muted-foreground text-lg font-semibold">
          Word {currentWordIndex + 1} of {lesson.words.length}
        </p>
        <div className="w-full bg-muted rounded-full h-3 mt-2">
          <div
            className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-300"
            style={{ width: `${((currentWordIndex + 1) / lesson.words.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Card */}
      <Card className="border-4 border-primary shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white text-center pb-8">
          <CardTitle className="text-4xl mb-4">{lesson.title}</CardTitle>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          {/* Word Display */}
          <div className="text-center">
            <div className="text-9xl mb-6">{currentWord.emoji}</div>
            <h2 className="text-5xl font-bold text-primary mb-4">{currentWord.word}</h2>
            <p className="text-2xl text-muted-foreground italic">
              /{currentWord.pronunciation}/
            </p>
          </div>

          {/* Audio Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleSpeakWord}
              className="h-16 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90"
            >
              🔊 Say Word
            </Button>
            <Button
              onClick={handleSpeakSentence}
              className="h-16 rounded-2xl text-lg font-bold bg-secondary hover:bg-secondary/90"
            >
              🎤 Say Sentence
            </Button>
          </div>

          {/* Example Sentence */}
          <div className="bg-accent/30 p-6 rounded-2xl border-2 border-accent">
            <p className="text-sm text-muted-foreground font-semibold mb-2">EXAMPLE SENTENCE:</p>
            <p className="text-xl font-semibold text-foreground leading-relaxed">
              {currentWord.sentence}
            </p>
          </div>

          {/* Navigation */}
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
              className="px-8 h-14 rounded-full font-bold text-lg bg-primary hover:bg-primary/90"
            >
              {isLastWord ? 'Practice Now 🎯' : 'Next →'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
