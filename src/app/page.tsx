'use client';

import AuthButtons from '@/components/ui/authbuttons';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Content */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
          <div className="max-w-xl w-full">
            {/* Logo + Headline */}
            <div className="text-center lg:text-left mb-10">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:mx-0">
                <i className="ri-heart-pulse-line text-white text-3xl"></i>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Your Mental
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600 block">
                  Wellness Journey
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Start tracking your mood, writing journals, building habits, and receiving gentle reminders for a healthier mind.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              {[
                {
                  icon: 'ri-emotion-happy-line',
                  title: 'Mood Tracking',
                  desc: 'Monitor daily emotions',
                  color: 'from-green-400 to-green-500',
                },
                {
                  icon: 'ri-book-open-line',
                  title: 'Journal Writing',
                  desc: 'Express your thoughts',
                  color: 'from-blue-400 to-blue-500',
                },
                {
                  icon: 'ri-task-line',
                  title: 'Habit Tracking',
                  desc: 'Build healthy routines',
                  color: 'from-purple-400 to-purple-500',
                },
                {
                  icon: 'ri-notification-line',
                  title: 'Smart Reminders',
                  desc: 'Daily wellness nudges',
                  color: 'from-orange-400 to-orange-500',
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="bg-white/70 backdrop-blur rounded-xl p-4 border border-white/50"
                >
                  <div
                    className={`w-10 h-10 bg-gradient-to-br ${f.color} rounded-lg flex items-center justify-center mb-3`}
                  >
                    <i className={`${f.icon} text-white text-lg`}></i>
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">{f.title}</h3>
                  <p className="text-gray-600 text-xs">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Auth Form */}
            <AuthButtons />
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden lg:flex flex-1 relative">
          <Image
            src="/images/log.jpg"
            alt="Mental Wellness"
            fill
            className="object-cover object-top rounded-l-3xl"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-indigo-500/10 to-indigo-500/20"></div>
        </div>
      </div>
    </div>
  );
}
