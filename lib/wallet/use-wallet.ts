'use client';

import { useContext } from 'react';
import { WalletContext } from './provider';

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within <WalletProvider>');
  return ctx;
}
