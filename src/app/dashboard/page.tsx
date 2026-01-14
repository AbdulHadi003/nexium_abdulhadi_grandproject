'use client';

import NavBar from '@/components/ui/navbar';
import Alert from '@/components/ui/alert';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import useAuthGuard from '@/hooks/useAuthGuard';


type Mood = { created_at: string; mood_: number };
type Journal = { created_at: string; writing: string };
type HabitsEntry = { created_at: string; writing: string };

export default function Dashboard() {
  const loading = useAuthGuard();

  const [userName, setUserName] = useState('User');
  const [today, setToday] = useState('');
  const [lastMood, setLastMood] = useState<Mood | null>(null);
  const [todayHabits, setTodayHabits] = useState<HabitsEntry[]>([]);
  const [todayJournal, setTodayJournal] = useState<Journal | null>(null);
  const [moodStreak, setMoodStreak] = useState(0);
  const [habitStreak, setHabitStreak] = useState(0);
  const [journalStreak, setJournalStreak] = useState(0);

  useEffect(() => {
    if (loading) return;
    const user = auth.currentUser;
    if (!user) return;

    // Set user name and today's UTC date string
    setUserName(user.displayName?.split(' ')[0] || 'User');

    const nowUTC = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
    const formattedUTCDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });

    setToday(formattedUTCDate);

    const fetchData = async () => {
      const uid = user.uid;

      const [mRes, jRes, hRes] = await Promise.all([
        fetch('/api/mood/history', { method: 'POST', body: JSON.stringify({ id: uid }) }),
        fetch('/api/journal/history', { method: 'POST', body: JSON.stringify({ id: uid }) }),
        fetch('/api/habits/history', { method: 'POST', body: JSON.stringify({ id: uid }) }),
      ]);

      const [mData, jData, hData]: [Mood[], Journal[], HabitsEntry[]] = await Promise.all([
        mRes.json(),
        jRes.json(),
        hRes.json(),
      ]);

      if (mData.length) {
        setLastMood(mData.at(-1)!);
      }

      const todayJournalEntry = jData.find((j) => j.created_at.startsWith(nowUTC));
      setTodayJournal(todayJournalEntry || null);

      const todayHab = hData.filter((h) => h.created_at.startsWith(nowUTC));
      setTodayHabits(todayHab);

const fetchStreak = async (category: string) => {
        const res = await fetch('/api/streak/check-dashboard', {
          method: 'POST',
          body: JSON.stringify({ uid, category }),
        });
        const data = await res.json();
        return data.streak || 0;
      };

      const [mood, habit, journal] = await Promise.all([
        fetchStreak('mood'),
        fetchStreak('habit'),
        fetchStreak('journal'),
      ]);

      setMoodStreak(mood);
      setHabitStreak(habit);
      setJournalStreak(journal);
    };

    fetchData();
  }, [loading]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Checking authentication...</p>
      </div>
    );
  }

  const writing = todayHabits.length > 0 ? todayHabits[0].writing : '';
  const entries = writing ? writing.split(',').map((line) => line.trim()) : [];
  const yesCount = entries.filter((line) => line.includes('= yes')).length;
  const totalCount = entries.length;

  const habitsContent = todayHabits.length > 0
    ? `${yesCount}/${totalCount}`
    : 'No habits entered today.';

  return (
    <>
      <Alert />
      <NavBar />
      <br/><br/><br/>
      <div className="p-6 space-y-6 bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <h2 className="text-2xl font-bold text-gray-800">Good Morning, {userName}!</h2>
        <p className="text-gray-600">{today}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Last Mood */}
          <Card
            title="Last Mood"
            icon="ri-emotion-happy-line"
            color="from-yellow-400 to-yellow-500"
            content={lastMood ? `Score: ${lastMood.mood_}/10` : 'No entry'}
            sub={lastMood ? new Date(lastMood.created_at).toUTCString().slice(17, 22) + ' UTC' : ''}
          />

          {/* Habits Completed */}
          <Card
            title="Daily Activities Completed"
            icon="ri-task-line"
            color="from-green-400 to-green-500"
            content={habitsContent}
            sub="Today"
          />
          {/* Today's Journal */}
          <Card
            title="Today's Journal"
            icon="ri-book-open-line"
            color="from-blue-400 to-blue-500"
            content={todayJournal ? todayJournal.writing : 'No journal entry today.'}
            expandable
          />

          {/* Streaks */}
          <Card
            title="Mood Streak"
            icon="ri-emotion-happy-line"
            color="from-purple-400 to-purple-500"
            content={`${moodStreak} Days Strong!`}
          />
          <Card
            title="Daily Activities Streak"
            icon="ri-fire-line"
            color="from-orange-400 to-orange-500"
            content={`${habitStreak} Days Strong!`}
          />
          <Card
            title="Journal Streak"
            icon="ri-edit-line"
            color="from-cyan-400 to-cyan-500"
            content={`${journalStreak} Days Strong!`}
          />
        </div>
      </div>
    </>
  );
}

type CardProps = {
  title: string;
  icon: string;
  color: string;
  content: string;
  sub?: string;
  expandable?: boolean;
};

function Card({ title, icon, color, content, sub, expandable }: CardProps) {
  const [open, setOpen] = useState(!expandable);

  return (
    <div className="bg-white/70 backdrop-blur rounded-xl p-6 border border-white/50 shadow-sm">
      <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center mb-4`}>
        <i className={`${icon} text-white text-lg`}></i>
      </div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {sub && <p className="text-gray-600 text-sm mb-2">{sub}</p>}
      <div
        className={`text-gray-700 text-sm ${open ? '' : 'line-clamp-2'} ${expandable ? 'cursor-pointer' : ''}`}
        onClick={() => expandable && setOpen(!open)}
      >
        {content}
      </div>
    </div>
  );
}
