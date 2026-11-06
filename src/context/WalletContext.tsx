import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Wallet, Transaction, DepositRequest, WithdrawalRequest, PaymentMethod } from '../types';
import { storage } from '../services/storage';
import { useAuth } from './AuthContext';

interface WalletContextType {
  wallet: Wallet | null;
  balance: number;
  transactions: Transaction[];
  userDeposits: DepositRequest[];
  userWithdrawals: WithdrawalRequest[];
  depositMoney: (method: PaymentMethod, amount: number, senderNumber: string, trxId: string) => { success: boolean; message: string };
  withdrawMoney: (method: PaymentMethod, amount: number, receiverNumber: string, accountType: 'Personal' | 'Agent') => { success: boolean; message: string };
  refreshWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userDeposits, setUserDeposits] = useState<DepositRequest[]>([]);
  const [userWithdrawals, setUserWithdrawals] = useState<WithdrawalRequest[]>([]);

  const refreshWallet = useCallback(() => {
    if (!user) {
      setWallet(null);
      setTransactions([]);
      setUserDeposits([]);
      setUserWithdrawals([]);
      return;
    }
    const currentWallet = storage.getWalletByProfileId(user.id);
    setWallet(currentWallet);
    setTransactions(storage.getTransactions(user.id));
    setUserDeposits(storage.getDeposits().filter(d => d.profile_id === user.id));
    setUserWithdrawals(storage.getWithdrawals().filter(w => w.profile_id === user.id));
  }, [user]);

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  const depositMoney = (method: PaymentMethod, amount: number, senderNumber: string, trxId: string) => {
    if (!user) return { success: false, message: 'You must be logged in to deposit money.' };
    const res = storage.submitDeposit(user.id, method, amount, senderNumber, trxId);
    refreshWallet();
    return res;
  };

  const withdrawMoney = (method: PaymentMethod, amount: number, receiverNumber: string, accountType: 'Personal' | 'Agent') => {
    if (!user) return { success: false, message: 'You must be logged in to withdraw money.' };
    const res = storage.submitWithdrawal(user.id, method, amount, receiverNumber, accountType);
    refreshWallet();
    return res;
  };

  const balance = wallet ? wallet.balance : 0;

  return (
    <WalletContext.Provider
      value={{
        wallet,
        balance,
        transactions,
        userDeposits,
        userWithdrawals,
        depositMoney,
        withdrawMoney,
        refreshWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
