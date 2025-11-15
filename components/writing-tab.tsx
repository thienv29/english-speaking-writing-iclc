'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import QAExercise from './qa-exercise'
import SentenceMaker from './sentence-maker'
import SentenceComplete from './sentence-complete'

interface WritingTabProps {
  lessonId: string
}

export default function WritingTab({ lessonId }: WritingTabProps) {
  const [exerciseType, setExerciseType] = useState<'qa' | 'sentence' | 'complete' | null>(null)

  if (exerciseType === 'qa') {
    return (
      <QAExercise
        lessonId={lessonId}
        onBack={() => setExerciseType(null)}
      />
    )
  }

  if (exerciseType === 'sentence') {
    return (
      <SentenceMaker
        lessonId={lessonId}
        onBack={() => setExerciseType(null)}
      />
    )
  }

  if (exerciseType === 'complete') {
    return (
      <SentenceComplete
        lessonId={lessonId}
        onBack={() => setExerciseType(null)}
      />
    )
  }

  return (
    <div className="space-y-4 flex flex-col h-full justify-center">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-slate-900 mb-1">✍️ Choose a Writing Exercise</h2>
        <p className="text-sm text-slate-600">Pick one to test your writing skills!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* Q&A Exercise */}
        <Card
          onClick={() => setExerciseType('qa')}
          className="cursor-pointer border-2 border-secondary bg-gradient-to-br from-green-100 to-green-50 hover:shadow-lg transition-all"
        >
          <CardHeader className="text-center">
            <div className="text-4xl mb-2">💬</div>
            <CardTitle className="text-lg text-secondary">Answer Questions</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-xs text-slate-700 font-semibold mb-2">Read the question and write your answer in complete sentences</p>
            <Button className="w-full py-1 text-sm bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full">
              Start
            </Button>
          </CardContent>
        </Card>

        {/* Sentence Maker */}
        <Card
          onClick={() => setExerciseType('sentence')}
          className="cursor-pointer border-2 border-primary bg-gradient-to-br from-blue-100 to-blue-50 hover:shadow-lg transition-all"
        >
          <CardHeader className="text-center">
            <div className="text-4xl mb-2">🔤</div>
            <CardTitle className="text-lg text-primary">Make a Sentence</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-xs text-slate-700 font-semibold mb-2">Create sentences using the given vocabulary words</p>
            <Button className="w-full py-1 text-sm bg-primary hover:bg-primary/80 text-primary-foreground rounded-full">
              Start
            </Button>
          </CardContent>
        </Card>

        {/* Sentence Completion */}
        <Card
          onClick={() => setExerciseType('complete')}
          className="cursor-pointer border-2 border-accent bg-gradient-to-br from-yellow-100 to-yellow-50 hover:shadow-lg transition-all"
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
