import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Tournament, TournamentParticipant } from '../types';
import { storage } from '../services/storage';
import { useAuth } from './AuthContext';
import { useWallet } from './WalletContext';

interface TournamentContextType {
  tournaments: Tournament[];
  participants: TournamentParticipant[];
  joinTournament: (tournamentId: string) => { success: boolean; message: string };
  leaveTournament: (tournamentId: string) => { success: boolean; message: string };
  isRegistered: (tournamentId: string) => boolean;
  getUserParticipantInfo: (tournamentId: string) => TournamentParticipant | undefined;
  refreshTournaments: () => void;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { refreshWallet } = useWallet();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);

  const refreshTournaments = useCallback(() => {
    setTournaments(storage.getTournaments());
    setParticipants(storage.getParticipants());
  }, []);

  useEffect(() => {
    refreshTournaments();
  }, [refreshTournaments]);

  const isRegistered = (tournamentId: string): boolean => {
    if (!user) return false;
    return storage.isUserRegistered(tournamentId, user.id);
  };

  const getUserParticipantInfo = (tournamentId: string): TournamentParticipant | undefined => {
    if (!user) return undefined;
    return participants.find(p => p.tournament_id === tournamentId && p.profile_id === user.id && p.payment_status === 'PAID');
  };

  const joinTournament = (tournamentId: string) => {
    if (!user) {
      return { success: false, message: 'Please sign in to register for tournaments.' };
    }
    const res = storage.joinTournament(user.id, tournamentId);
    if (res.success) {
      refreshTournaments();
      refreshWallet();
    }
    return res;
  };

  const leaveTournament = (tournamentId: string) => {
    if (!user) {
      return { success: false, message: 'Please sign in.' };
    }
    const res = storage.leaveTournament(user.id, tournamentId);
    if (res.success) {
      refreshTournaments();
      refreshWallet();
    }
    return res;
  };

  return (
    <TournamentContext.Provider
      value={{
        tournaments,
        participants,
        joinTournament,
        leaveTournament,
        isRegistered,
        getUserParticipantInfo,
        refreshTournaments,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournaments = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournaments must be used within a TournamentProvider');
  }
  return context;
};
