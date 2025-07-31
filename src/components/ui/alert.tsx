'use client';

import { useEffect } from 'react';
import { auth } from '@/lib/firebase';
import axios from 'axios';

type Entry = { created_at: string }; // Shared type for mood/journal/habit

const Alert = () => {
  useEffect(() => {
    const checkAlerts = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const uid = user.uid;
      const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

      // Step 1: Check if alert already exists
      const alertRes = await fetch('/api/alerts/history', {
        method: 'POST',
        body: JSON.stringify({ id: uid, date: today }),
        headers: { 'Content-Type': 'application/json' },
      });

      const alertData = await alertRes.json();
      if (alertData.exists) return; // Exit if alert already exists

      // Step 2: Check mood, journal, and habit history
      const [moodRes, journalRes, habitRes] = await Promise.all([
        axios.post('/api/mood/history', { id: uid }),
        axios.post('/api/journal/history', { id: uid }),
        axios.post('/api/habits/history', { id: uid }),
      ]);

      const mood = moodRes.data as Entry[];
      const journal = journalRes.data as Entry[];
      const habit = habitRes.data as Entry[];

      const missing: string[] = [];

      const hasMood = mood.some((entry) => entry.created_at.startsWith(today));
      const hasJournal = journal.some((entry) => entry.created_at.startsWith(today));
      const hasHabit = habit.some((entry) => entry.created_at.startsWith(today));

      if (!hasMood) missing.push('mood');
      if (!hasJournal) missing.push('journal');
      if (!hasHabit) missing.push('habit');

      if (missing.length === 0) return;

      const message = `Alert! You have not entered your ${missing.join(' and ')} for today`;

      // Step 3: Insert alert
      await fetch('/api/alerts/insert', {
        method: 'POST',
        body: JSON.stringify({ id: uid, date: today, message }),
        headers: { 'Content-Type': 'application/json' },
      });
    };

    checkAlerts();
  }, []);

  return null; // Silent component
};

export default Alert;
