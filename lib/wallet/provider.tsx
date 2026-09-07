'use client';

import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * Docs-safe stub. Real Keplr/cosmes integration is NOT wired here so the
 * documentation site never prompts for wallet / cross-site access.
 *
 * App product surfaces that need wallets should use a separate package, not
 * the docs site root layout.
 */

export interface WalletState {
  address: string | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address] = useState<string | null>(null);

  const connect = useCallback(async () => {
    console.info(
      '[terp-docs] Wallet connect is disabled in the documentation site.',
    );
  }, []);

  const disconnect = useCallback(() => {}, []);

  const value = useMemo<WalletState>(
    () => ({
      address,
      isConnecting: false,
      connect,
      disconnect,
    }),
    [address, connect, disconnect],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
