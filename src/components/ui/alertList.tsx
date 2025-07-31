'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';

type AlertItem = {
  uid: string;
  created_at: string;
  message: string;
  message_status: 'read' | 'unread';
};

const AlertList = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const res = await fetch('/api/alerts/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.uid }),
      });

      const data = await res.json();
      setAlerts(data);
    };

    fetchAlerts();
  }, []);

  const markAsRead = async (created_at: string) => {
    const user = auth.currentUser;
    if (!user) return;

    await fetch('/api/alerts/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.uid, created_at }),
    });

    setAlerts((prev) =>
      prev.map((alert) =>
        alert.created_at === created_at ? { ...alert, message_status: 'read' } : alert
      )
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Your Alerts</h2>
      {alerts.length === 0 ? (
        <p>No alerts yet.</p>
      ) : (
        <ul className="space-y-2">
          {alerts.map((alert) => (
            <li
              key={alert.created_at}
              onClick={() => alert.message_status === 'unread' && markAsRead(alert.created_at)}
              className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                alert.message_status === 'unread' ? 'font-bold' : 'text-gray-600'
              }`}
            >
              <div>{alert.created_at}</div>
              <div>{alert.message}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AlertList;
