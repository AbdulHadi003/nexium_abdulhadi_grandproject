
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center mr-4">
              <i className="ri-notification-line text-white text-xl w-6 h-6 flex items-center justify-center"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Your Alerts</h2>
          </div>
          
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-notification-off-line text-gray-400 text-2xl w-8 h-8 flex items-center justify-center"></i>
              </div>
              <p className="text-gray-500 text-lg">No alerts yet</p>
              <p className="text-gray-400 text-sm mt-1">You`ll see notifications here when they arrive</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.created_at}
                  onClick={() => alert.message_status === 'unread' && markAsRead(alert.created_at)}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md ${
                    alert.message_status === 'unread'
                      ? 'bg-gradient-to-br from-indigo-50 to-cyan-50 border-indigo-200 hover:from-indigo-100 hover:to-cyan-100'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`w-3 h-3 rounded-full mt-2 mr-4 flex-shrink-0 ${
                      alert.message_status === 'unread' ? 'bg-indigo-500' : 'bg-gray-300'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className={`text-sm text-gray-500 ${
                          alert.message_status === 'unread' ? 'font-medium' : ''
                        }`}>
                          {new Date(alert.created_at).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {alert.message_status === 'unread' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 whitespace-nowrap">
                            New
                          </span>
                        )}
                      </div>
                      <p className={`text-gray-800 ${
                        alert.message_status === 'unread' ? 'font-semibold' : 'font-normal'
                      }`}>
                        {alert.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertList;
