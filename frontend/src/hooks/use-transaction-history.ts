'use client';

import { useState, useEffect } from 'react';

export interface Transaction {
  hash: string;
  action: string;
  timestamp: number;
  gasSaved: string;
  status: 'success' | 'pending' | 'failed';
}

export function useTransactionHistory() {
  const [history, setHistory] = useState<Transaction[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('gaim_tx_history');
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  const addTransaction = (tx: Transaction) => {
    const updated = [tx, ...history];
    setHistory(updated);
    localStorage.setItem('gaim_tx_history', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('gaim_tx_history');
  };

  return { history, addTransaction, clearHistory };
}
