'use client'

import { useState } from 'react'
import LessonSelector from '@/components/lesson-selector'
import SpeakingTab from '@/components/speaking-tab'
import WritingTab from '@/components/writing-tab'

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState('lesson')
  const [selectedLesson, setSelectedLesson] = useState<string>('animals')
  const [activeTab, setActiveTab] = useState<'speaking' | 'writing'>('speaking')

  const handleSelectLesson = (lessonId: string) => {
    setSelectedLesson(lessonId)
    setCurrentScreen('lesson')
    setActiveTab('speaking')
  }



  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 p-4 md:p-8">
      {currentScreen === 'home' && (
        <LessonSelector onSelectLesson={handleSelectLesson} />
      )}

      {currentScreen === 'lesson' && selectedLesson && (
        <div className="max-w-4xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('speaking')}
              className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all ${
                activeTab === 'speaking'
                  ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                  : 'bg-white text-primary border-2 border-primary hover:bg-blue-50'
              }`}
            >
              🎤 Speaking
            </button>
            <button
              onClick={() => setActiveTab('writing')}
              className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all ${
                activeTab === 'writing'
                  ? 'bg-secondary text-secondary-foreground shadow-lg scale-105'
                  : 'bg-white text-secondary border-2 border-secondary hover:bg-green-50'
              }`}
            >
              ✍️ Writing
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'speaking' && (
            <SpeakingTab lessonId={selectedLesson} />
          )}
          {activeTab === 'writing' && (
            <WritingTab lessonId={selectedLesson} />
          )}
        </div>
      )}
    </main>
  )
}
