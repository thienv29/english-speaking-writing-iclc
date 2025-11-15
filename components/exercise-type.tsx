'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ExerciseTypeProps {
  onSelectExercise: (type: string) => void
  onBack: () => void
}

const exerciseTypes = [
  {
    id: 'qa',
    title: '💬 Q&A Exercise',
    description: 'Answer questions with complete sentences',
    icon: '❓',
    color: 'from-blue-400 to-cyan-500'
  },
  {
    id: 'sentence',
    title: '✍️ Make a Sentence',
    description: 'Use new words to create sentences',
    icon: '📝',
    color: 'from-green-400 to-emerald-500'
  },
  {
    id: 'completion',
    title: '🎯 Complete the Sentence',
    description: 'Fill in the missing words',
    icon: '✏️',
    color: 'from-yellow-400 to-orange-500'
  },
]

export default function ExerciseType({ onSelectExercise, onBack }: ExerciseTypeProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Button
        onClick={onBack}
        variant="outline"
        className="mb-6 rounded-full h-10"
      >
        ← Back
      </Button>

      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-primary mb-3">
          Choose Your Exercise!
        </h2>
        <p className="text-lg text-muted-foreground">
          Pick an exercise type to practice
        </p>
      </div>

      {/* Exercise Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {exerciseTypes.map((exercise) => (
          <Card
            key={exercise.id}
            className={`bg-gradient-to-br ${exercise.color} cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl border-4 border-white`}
          >
            <CardHeader className="pb-2">
              <div className="text-6xl mb-3">{exercise.icon}</div>
              <CardTitle className="text-xl text-slate-900 font-bold">{exercise.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-800 mb-4 font-semibold text-base">{exercise.description}</p>
              <Button
                onClick={() => onSelectExercise(exercise.id)}
                className="w-full bg-slate-900 text-white text-base h-11 font-bold rounded-full hover:bg-slate-800"
              >
                Start {exercise.title.split(' ')[0]}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
