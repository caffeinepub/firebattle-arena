import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Transaction {
    transactionType: TransactionType;
    description: string;
    timestamp: bigint;
    amount: bigint;
}
export interface RevenueReport {
    totalCommissionProfit: bigint;
    totalPrizesDistributed: bigint;
    totalEntryFeesCollected: bigint;
}
export interface Result {
    userId: Principal;
    totalPoints: bigint;
    position: bigint;
    tournamentId: bigint;
    kills: bigint;
}
export interface Notification {
    notificationType: NotificationType;
    isRead: boolean;
    message: string;
    timestamp: bigint;
}
export interface Tournament {
    matchType: MatchType;
    status: TournamentStatus;
    title: string;
    participants: Array<Principal>;
    mapType: string;
    roomPassword?: string;
    totalSlots: bigint;
    entryFee: bigint;
    currentSlots: bigint;
    roomId?: string;
    dateTime: bigint;
    prizePool: bigint;
}
export interface RoomCredentials {
    roomPassword: string;
    roomId: string;
}
export interface DashboardStats {
    completedTournamentsCount: bigint;
    activeTournamentsCount: bigint;
    recentTransactions: Array<Transaction>;
    totalUsers: bigint;
    totalRevenue: bigint;
    totalCommissionEarned: bigint;
}
export interface UserProfile {
    freeFireUID: string;
    referralCode: string;
    username: string;
    totalWins: bigint;
    email: string;
    referredBy?: string;
    isBanned: boolean;
    phoneNumber: string;
    walletBalance: bigint;
}
export enum MatchType {
    duo = "duo",
    solo = "solo",
    squad = "squad"
}
export enum NotificationType {
    result = "result",
    matchReminder = "matchReminder",
    walletUpdate = "walletUpdate"
}
export enum TournamentStatus {
    active = "active",
    upcoming = "upcoming",
    cancelled = "cancelled",
    completed = "completed"
}
export enum TransactionType {
    credit = "credit",
    debit = "debit"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addFunds(amount: bigint): Promise<void>;
    adjustWallet(userId: Principal, amount: bigint, isCredit: boolean, reason: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    banUser(userId: Principal): Promise<void>;
    createTournament(title: string, matchType: MatchType, entryFee: bigint, prizePool: bigint, mapType: string, dateTime: bigint, totalSlots: bigint): Promise<bigint>;
    deleteTournament(tournamentId: bigint): Promise<void>;
    editTournament(tournamentId: bigint, title: string, matchType: MatchType, entryFee: bigint, prizePool: bigint, mapType: string, dateTime: bigint, totalSlots: bigint): Promise<void>;
    getAllTournaments(): Promise<Array<[bigint, Tournament]>>;
    getAllUsers(): Promise<Array<[Principal, UserProfile]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<DashboardStats>;
    getNotifications(): Promise<Array<Notification>>;
    getResults(tournamentId: bigint): Promise<Array<Result>>;
    getRevenueReport(): Promise<RevenueReport>;
    getRoomCredentials(tournamentId: bigint): Promise<RoomCredentials | null>;
    getTournament(tournamentId: bigint): Promise<Tournament | null>;
    getTournamentParticipants(tournamentId: bigint): Promise<Array<Principal>>;
    getTransactionHistory(): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    joinTournament(tournamentId: bigint): Promise<void>;
    leaveTournament(tournamentId: bigint): Promise<void>;
    markNotificationAsRead(index: bigint): Promise<void>;
    register(username: string, email: string, freeFireUID: string, phoneNumber: string, referredByCode: string | null): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    unbanUser(userId: Principal): Promise<void>;
    uploadResults(tournamentId: bigint, resultsList: Array<[Principal, bigint, bigint]>): Promise<void>;
    uploadRoomCredentials(tournamentId: bigint, roomId: string, roomPassword: string): Promise<void>;
}
