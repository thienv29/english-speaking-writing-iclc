'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface LessonSelectorProps {
  onSelectLesson: (lessonId: string) => void
}

const lessons = [
  {
    id: 'animals',
    title: '🐾 Animals',
    description: 'Learn animal names and sounds',
    emoji: '🐶',
    color: 'from-orange-400 to-red-500'
  },
]

export default function LessonSelector({ onSelectLesson }: LessonSelectorProps) {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4 animate-bounce">
          🌟 Learn English Fun! 🌟
        </h1>
        <p className="text-xl text-muted-foreground mb-2">
          Choose a lesson and practice speaking and writing
        </p>
      </div>

      {/* Lesson Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {lessons.map((lesson) => (
          <Card
            key={lesson.id}
            className={`bg-gradient-to-br ${lesson.color} cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl border-4 border-white`}
          >
            <CardHeader className="pb-2">
              <div className="text-6xl mb-3">{lesson.emoji}</div>
              <CardTitle className="text-2xl text-white">{lesson.title}</CardTitle>
              <CardDescription className="text-white/90 text-lg">
                {lesson.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => onSelectLesson(lesson.id)}
                className="w-full bg-white text-lg h-12 font-bold rounded-full hover:bg-blue-50 text-primary"
              >
                Start Learning 🚀
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
