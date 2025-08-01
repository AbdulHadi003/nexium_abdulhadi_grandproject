'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';

type AlertItem = {
  uid: string;
  created_at: string;
  message: string;
  message_status: 'read' | 'unread';
};

interface Props {
  label: string;
  route: string;
}

const NavigateButtonWithBadge = ({ label, route }: Props) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const res = await fetch('/api/alerts/all', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: user.uid }),
        });

        const data: AlertItem[] = await res.json();
        const unread = data.filter((alert) => alert.message_status === 'unread');
        setUnreadCount(unread.length);
      } catch (error) {
        console.error('Failed to fetch unread alerts:', error);
      }
    };

    fetchUnread();
  }, []);

  return (
    <Link href={`/${route}`}>
      <div className="relative inline-block">
        <button className="px-4 py-2 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white text-sm font-medium hover:brightness-110 transition-all shadow-sm">
          {label}
        </button>
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full shadow">
            {unreadCount}
          </span>
        )}
      </div>
    </Link>
  );
};

export default NavigateButtonWithBadge;
