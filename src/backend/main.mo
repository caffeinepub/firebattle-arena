import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Map "mo:core/Map";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type TransactionType = {
    #credit;
    #debit;
  };

  type TournamentStatus = {
    #upcoming;
    #active;
    #completed;
    #cancelled;
  };

  type NotificationType = {
    #matchReminder;
    #result;
    #walletUpdate;
  };

  type MatchType = {
    #solo;
    #duo;
    #squad;
  };

  type UserProfile = {
    username : Text;
    email : Text;
    freeFireUID : Text;
    phoneNumber : Text;
    walletBalance : Nat;
    totalWins : Nat;
    isBanned : Bool;
    referralCode : Text;
    referredBy : ?Text;
  };

  type Transaction = {
    amount : Nat;
    transactionType : TransactionType;
    description : Text;
    timestamp : Int;
  };

  type Tournament = {
    title : Text;
    matchType : MatchType;
    entryFee : Nat;
    prizePool : Nat;
    mapType : Text;
    dateTime : Int;
    totalSlots : Nat;
    currentSlots : Nat;
    participants : [Principal];
    roomId : ?Text;
    roomPassword : ?Text;
    status : TournamentStatus;
  };

  type Result = {
    tournamentId : Nat;
    userId : Principal;
    position : Nat;
    kills : Nat;
    totalPoints : Nat;
  };

  type Notification = {
    message : Text;
    notificationType : NotificationType;
    isRead : Bool;
    timestamp : Int;
  };

  type RoomCredentials = {
    roomId : Text;
    roomPassword : Text;
  };

  type DashboardStats = {
    totalUsers : Nat;
    totalRevenue : Nat;
    activeTournamentsCount : Nat;
    completedTournamentsCount : Nat;
    totalCommissionEarned : Nat;
    recentTransactions : [Transaction];
  };

  type RevenueReport = {
    totalEntryFeesCollected : Nat;
    totalPrizesDistributed : Nat;
    totalCommissionProfit : Nat;
  };

  // Persistent storage using Maps
  let userProfiles = Map.empty<Principal, UserProfile>();
  let transactions = Map.empty<Principal, List.List<Transaction>>();
  let tournaments = Map.empty<Nat, Tournament>();
  let results = Map.empty<Nat, List.List<Result>>();
  let notifications = Map.empty<Principal, List.List<Notification>>();
  var platformCommission : Nat = 0;
  var totalEntryFees : Nat = 0;
  var totalPrizesDistributed : Nat = 0;
  var nextTournamentId : Nat = 1;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ============ User Profile Functions (Required by Frontend) ============

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ============ User Registration ============

  public shared ({ caller }) func register(username : Text, email : Text, freeFireUID : Text, phoneNumber : Text, referredByCode : ?Text) : async () {
    // Anyone can register (including guests/anonymous)
    if (userProfiles.containsKey(caller)) {
      Runtime.trap("User already registered");
    };

    let newUser : UserProfile = {
      username;
      email;
      freeFireUID;
      phoneNumber;
      walletBalance = 0;
      totalWins = 0;
      isBanned = false;
      referralCode = generateReferralCode(caller);
      referredBy = referredByCode;
    };

    userProfiles.add(caller, newUser);
  };

  // ============ Wallet Functions ============

  public shared ({ caller }) func addFunds(amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add funds");
    };

    let user = userProfiles.get(caller).unwrap();
    if (user.isBanned) {
      Runtime.trap("User is banned");
    };

    let updatedUser : UserProfile = {
      username = user.username;
      email = user.email;
      freeFireUID = user.freeFireUID;
      phoneNumber = user.phoneNumber;
      walletBalance = user.walletBalance + amount;
      totalWins = user.totalWins;
      isBanned = user.isBanned;
      referralCode = user.referralCode;
      referredBy = user.referredBy;
    };

    userProfiles.add(caller, updatedUser);

    addTransaction(caller, amount, #credit, "Funds added to wallet");
    addNotification(caller, "Wallet credited with " # amount.toText(), #walletUpdate);
  };

  public query ({ caller }) func getTransactionHistory() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transaction history");
    };

    switch (transactions.get(caller)) {
      case (?txList) { txList.toArray() };
      case null { [] };
    };
  };

  // ============ Tournament Management ============

  public shared ({ caller }) func createTournament(
    title : Text,
    matchType : MatchType,
    entryFee : Nat,
    prizePool : Nat,
    mapType : Text,
    dateTime : Int,
    totalSlots : Nat
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create tournaments");
    };

    let tournamentId = nextTournamentId;
    nextTournamentId += 1;

    let newTournament : Tournament = {
      title;
      matchType;
      entryFee;
      prizePool;
      mapType;
      dateTime;
      totalSlots;
      currentSlots = 0;
      participants = [];
      roomId = null;
      roomPassword = null;
      status = #upcoming;
    };

    tournaments.add(tournamentId, newTournament);
    tournamentId;
  };

  public shared ({ caller }) func editTournament(
    tournamentId : Nat,
    title : Text,
    matchType : MatchType,
    entryFee : Nat,
    prizePool : Nat,
    mapType : Text,
    dateTime : Int,
    totalSlots : Nat
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can edit tournaments");
    };

    let tournament = tournaments.get(tournamentId).unwrap();

    let updatedTournament : Tournament = {
      title;
      matchType;
      entryFee;
      prizePool;
      mapType;
      dateTime;
      totalSlots;
      currentSlots = tournament.currentSlots;
      participants = tournament.participants;
      roomId = tournament.roomId;
      roomPassword = tournament.roomPassword;
      status = tournament.status;
    };

    tournaments.add(tournamentId, updatedTournament);
  };

  public shared ({ caller }) func deleteTournament(tournamentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete tournaments");
    };

    tournaments.remove(tournamentId);
  };

  public shared ({ caller }) func joinTournament(tournamentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can join tournaments");
    };

    let user = userProfiles.get(caller).unwrap();
    if (user.isBanned) {
      Runtime.trap("User is banned");
    };

    let tournament = tournaments.get(tournamentId).unwrap();

    // Check if already joined
    for (participant in tournament.participants.vals()) {
      if (Principal.equal(participant, caller)) {
        Runtime.trap("Already joined this tournament");
      };
    };

    if (tournament.currentSlots >= tournament.totalSlots) {
      Runtime.trap("Tournament is full");
    };

    switch (tournament.status) {
      case (#active) { Runtime.trap("Tournament already started") };
      case (#completed) { Runtime.trap("Tournament already completed") };
      case (#cancelled) { Runtime.trap("Tournament is cancelled") };
      case (#upcoming) {};
    };

    if (user.walletBalance < tournament.entryFee) {
      Runtime.trap("Insufficient wallet balance");
    };

    // Deduct entry fee
    let updatedUser : UserProfile = {
      username = user.username;
      email = user.email;
      freeFireUID = user.freeFireUID;
      phoneNumber = user.phoneNumber;
      walletBalance = user.walletBalance - tournament.entryFee;
      totalWins = user.totalWins;
      isBanned = user.isBanned;
      referralCode = user.referralCode;
      referredBy = user.referredBy;
    };

    userProfiles.add(caller, updatedUser);

    // Update tournament
    let updatedTournament : Tournament = {
      title = tournament.title;
      matchType = tournament.matchType;
      entryFee = tournament.entryFee;
      prizePool = tournament.prizePool;
      mapType = tournament.mapType;
      dateTime = tournament.dateTime;
      totalSlots = tournament.totalSlots;
      currentSlots = tournament.currentSlots + 1;
      participants = (tournament.participants).concat([caller]);
      roomId = tournament.roomId;
      roomPassword = tournament.roomPassword;
      status = tournament.status;
    };

    tournaments.add(tournamentId, updatedTournament);

    // Track platform commission (10% of entry fee)
    let commission = tournament.entryFee * 10 / 100;
    platformCommission += commission;
    totalEntryFees += tournament.entryFee;

    addTransaction(caller, tournament.entryFee, #debit, "Entry fee for tournament: " # tournament.title);
    addNotification(caller, "Successfully joined tournament: " # tournament.title, #matchReminder);
  };

  public shared ({ caller }) func leaveTournament(tournamentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can leave tournaments");
    };

    let tournament = tournaments.get(tournamentId).unwrap();

    switch (tournament.status) {
      case (#active) { Runtime.trap("Cannot leave tournament after it has started") };
      case (#completed) { Runtime.trap("Tournament already completed") };
      case (#cancelled) { Runtime.trap("Tournament is cancelled") };
      case (#upcoming) {};
    };

    // Check if user is participant
    var isParticipant = false;
    for (participant in tournament.participants.vals()) {
      if (Principal.equal(participant, caller)) {
        isParticipant := true;
      };
    };

    if (not isParticipant) {
      Runtime.trap("Not a participant in this tournament");
    };

    // Refund entry fee
    let user = userProfiles.get(caller).unwrap();
    let updatedUser : UserProfile = {
      username = user.username;
      email = user.email;
      freeFireUID = user.freeFireUID;
      phoneNumber = user.phoneNumber;
      walletBalance = user.walletBalance + tournament.entryFee;
      totalWins = user.totalWins;
      isBanned = user.isBanned;
      referralCode = user.referralCode;
      referredBy = user.referredBy;
    };

    userProfiles.add(caller, updatedUser);

    // Remove from participants
    let newParticipants = tournament.participants.filter(func(p) { not Principal.equal(p, caller) });

    let updatedTournament : Tournament = {
      title = tournament.title;
      matchType = tournament.matchType;
      entryFee = tournament.entryFee;
      prizePool = tournament.prizePool;
      mapType = tournament.mapType;
      dateTime = tournament.dateTime;
      totalSlots = tournament.totalSlots;
      currentSlots = tournament.currentSlots - 1;
      participants = newParticipants;
      roomId = tournament.roomId;
      roomPassword = tournament.roomPassword;
      status = tournament.status;
    };

    tournaments.add(tournamentId, updatedTournament);

    addTransaction(caller, tournament.entryFee, #credit, "Refund for leaving tournament: " # tournament.title);
  };

  public query ({ caller }) func getRoomCredentials(tournamentId : Nat) : async ?RoomCredentials {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view room credentials");
    };

    let tournament = tournaments.get(tournamentId).unwrap();

    // Check if caller is participant
    var isParticipant = false;
    for (participant in tournament.participants.vals()) {
      if (Principal.equal(participant, caller)) {
        isParticipant := true;
      };
    };

    if (not isParticipant) {
      Runtime.trap("Only participants can view room credentials");
    };

    // Check if within 10 minutes of match start
    let currentTime = Time.now();
    let tenMinutesInNanos = 10 * 60 * 1_000_000_000;

    if (currentTime < tournament.dateTime or currentTime > (tournament.dateTime + tenMinutesInNanos)) {
      return null;
    };

    switch (tournament.roomId, tournament.roomPassword) {
      case (?rid, ?rpwd) {
        ?{ roomId = rid; roomPassword = rpwd };
      };
      case _ { null };
    };
  };

  public shared ({ caller }) func uploadRoomCredentials(tournamentId : Nat, roomId : Text, roomPassword : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can upload room credentials");
    };

    let tournament = tournaments.get(tournamentId).unwrap();

    let updatedTournament : Tournament = {
      title = tournament.title;
      matchType = tournament.matchType;
      entryFee = tournament.entryFee;
      prizePool = tournament.prizePool;
      mapType = tournament.mapType;
      dateTime = tournament.dateTime;
      totalSlots = tournament.totalSlots;
      currentSlots = tournament.currentSlots;
      participants = tournament.participants;
      roomId = ?roomId;
      roomPassword = ?roomPassword;
      status = tournament.status;
    };

    tournaments.add(tournamentId, updatedTournament);
  };

  public query ({ caller }) func getTournament(tournamentId : Nat) : async ?Tournament {
    // Anyone can view tournament details (public information)
    tournaments.get(tournamentId);
  };

  public query ({ caller }) func getAllTournaments() : async [(Nat, Tournament)] {
    // Anyone can view all tournaments (public information)
    tournaments.entries().toArray();
  };

  // ============ Results and Leaderboard ============

  public shared ({ caller }) func uploadResults(tournamentId : Nat, resultsList : [(Principal, Nat, Nat)]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can upload results");
    };

    let tournament = tournaments.get(tournamentId).unwrap();

    var resultRecords = List.empty<Result>();

    for ((userId, position, kills) in resultsList.vals()) {
      let points = calculatePoints(position, kills);

      let result : Result = {
        tournamentId;
        userId;
        position;
        kills;
        totalPoints = points;
      };

      resultRecords.add(result);

      // Distribute prizes for top 3
      if (position == 1 or position == 2 or position == 3) {
        let prizeAmount = calculatePrize(tournament.prizePool, position);
        creditPrize(userId, prizeAmount, tournament.title);

        if (position == 1) {
          incrementWins(userId);
        };
      };

      addNotification(userId, "Results uploaded for tournament: " # tournament.title, #result);
    };

    results.add(tournamentId, resultRecords);

    // Update tournament status to completed
    let updatedTournament : Tournament = {
      title = tournament.title;
      matchType = tournament.matchType;
      entryFee = tournament.entryFee;
      prizePool = tournament.prizePool;
      mapType = tournament.mapType;
      dateTime = tournament.dateTime;
      totalSlots = tournament.totalSlots;
      currentSlots = tournament.currentSlots;
      participants = tournament.participants;
      roomId = tournament.roomId;
      roomPassword = tournament.roomPassword;
      status = #completed;
    };

    tournaments.add(tournamentId, updatedTournament);
  };

  public query ({ caller }) func getResults(tournamentId : Nat) : async [Result] {
    // Anyone can view results (public information)
    switch (results.get(tournamentId)) {
      case (?resList) { resList.toArray() };
      case null { [] };
    };
  };

  // ============ Notifications ============

  public shared ({ caller }) func markNotificationAsRead(index : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };

    switch (notifications.get(caller)) {
      case (?notifList) {
        let notifArray = notifList.toArray();
        if (index >= notifArray.size()) {
          Runtime.trap("Invalid notification index");
        };

        let updatedArray = Array.tabulate(notifArray.size(), func(i) {
          if (i == index) {
            {
              message = notifArray[i].message;
              notificationType = notifArray[i].notificationType;
              isRead = true;
              timestamp = notifArray[i].timestamp;
            };
          } else {
            notifArray[i];
          };
        });

        notifications.add(caller, List.fromArray<Notification>(updatedArray));
      };
      case null { Runtime.trap("No notifications found") };
    };
  };

  public query ({ caller }) func getNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };

    switch (notifications.get(caller)) {
      case (?notifList) { notifList.toArray() };
      case null { [] };
    };
  };

  // ============ Admin Panel Functions ============

  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view dashboard stats");
    };

    var activeTournaments = 0;
    var completedTournaments = 0;

    for ((_, tournament) in tournaments.entries()) {
      switch (tournament.status) {
        case (#active) { activeTournaments += 1 };
        case (#completed) { completedTournaments += 1 };
        case _ {};
      };
    };

    // Get recent transactions (last 20)
    var allTransactions = List.empty<Transaction>();
    for ((_, txList) in transactions.entries()) {
      allTransactions := txList;
    };

    let txArray = allTransactions.toArray();
    let recentTx = if (txArray.size() > 20) {
      Array.tabulate(20, func(i) { txArray[i] });
    } else {
      txArray;
    };

    {
      totalUsers = userProfiles.size();
      totalRevenue = totalEntryFees;
      activeTournamentsCount = activeTournaments;
      completedTournamentsCount = completedTournaments;
      totalCommissionEarned = platformCommission;
      recentTransactions = recentTx;
    };
  };

  public query ({ caller }) func getAllUsers() : async [(Principal, UserProfile)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };

    userProfiles.entries().toArray();
  };

  public shared ({ caller }) func banUser(userId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can ban users");
    };

    let user = userProfiles.get(userId).unwrap();

    let updatedUser : UserProfile = {
      username = user.username;
      email = user.email;
      freeFireUID = user.freeFireUID;
      phoneNumber = user.phoneNumber;
      walletBalance = user.walletBalance;
      totalWins = user.totalWins;
      isBanned = true;
      referralCode = user.referralCode;
      referredBy = user.referredBy;
    };

    userProfiles.add(userId, updatedUser);
  };

  public shared ({ caller }) func unbanUser(userId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can unban users");
    };

    let user = userProfiles.get(userId).unwrap();

    let updatedUser : UserProfile = {
      username = user.username;
      email = user.email;
      freeFireUID = user.freeFireUID;
      phoneNumber = user.phoneNumber;
      walletBalance = user.walletBalance;
      totalWins = user.totalWins;
      isBanned = false;
      referralCode = user.referralCode;
      referredBy = user.referredBy;
    };

    userProfiles.add(userId, updatedUser);
  };

  public shared ({ caller }) func adjustWallet(userId : Principal, amount : Nat, isCredit : Bool, reason : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can adjust wallets");
    };

    let user = userProfiles.get(userId).unwrap();

    let newBalance = if (isCredit) {
      user.walletBalance + amount;
    } else {
      if (user.walletBalance < amount) {
        Runtime.trap("Insufficient balance for debit");
      };
      user.walletBalance - amount;
    };

    let updatedUser : UserProfile = {
      username = user.username;
      email = user.email;
      freeFireUID = user.freeFireUID;
      phoneNumber = user.phoneNumber;
      walletBalance = newBalance;
      totalWins = user.totalWins;
      isBanned = user.isBanned;
      referralCode = user.referralCode;
      referredBy = user.referredBy;
    };

    userProfiles.add(userId, updatedUser);

    let txType = if (isCredit) { #credit } else { #debit };
    addTransaction(userId, amount, txType, "Admin adjustment: " # reason);
  };

  public query ({ caller }) func getRevenueReport() : async RevenueReport {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view revenue report");
    };

    {
      totalEntryFeesCollected = totalEntryFees;
      totalPrizesDistributed = totalPrizesDistributed;
      totalCommissionProfit = platformCommission;
    };
  };

  public query ({ caller }) func getTournamentParticipants(tournamentId : Nat) : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view tournament participants");
    };

    let tournament = tournaments.get(tournamentId).unwrap();
    tournament.participants;
  };

  // ============ Helper Functions ============

  func generateReferralCode(principal : Principal) : Text {
    "REF" # (principal.hash() % 1_000_000).toText();
  };

  func addTransaction(userId : Principal, amount : Nat, txType : TransactionType, description : Text) {
    let transaction : Transaction = {
      amount;
      transactionType = txType;
      description;
      timestamp = Time.now();
    };

    let currentTxList = switch (transactions.get(userId)) {
      case (?list) { list };
      case null { List.empty<Transaction>() };
    };

    currentTxList.add(transaction);
    transactions.add(userId, currentTxList);
  };

  func addNotification(userId : Principal, message : Text, notifType : NotificationType) {
    let notification : Notification = {
      message;
      notificationType = notifType;
      isRead = false;
      timestamp = Time.now();
    };

    let currentNotifList = switch (notifications.get(userId)) {
      case (?list) { list };
      case null { List.empty<Notification>() };
    };

    currentNotifList.add(notification);
    notifications.add(userId, currentNotifList);
  };

  func calculatePoints(position : Nat, kills : Nat) : Nat {
    let positionPoints = if (position == 1) { 10 }
    else if (position == 2) { 8 }
    else if (position == 3) { 6 }
    else if (position == 4) { 4 }
    else if (position == 5) { 2 }
    else { 1 };

    positionPoints + kills;
  };

  func calculatePrize(prizePool : Nat, position : Nat) : Nat {
    let grossPrize = if (position == 1) {
      prizePool * 50 / 100;
    } else if (position == 2) {
      prizePool * 30 / 100;
    } else if (position == 3) {
      prizePool * 20 / 100;
    } else {
      0;
    };

    // Deduct 10% platform commission
    let commission = grossPrize * 10 / 100;
    grossPrize - commission;
  };

  func creditPrize(userId : Principal, amount : Nat, tournamentTitle : Text) {
    let user = userProfiles.get(userId).unwrap();

    let updatedUser : UserProfile = {
      username = user.username;
      email = user.email;
      freeFireUID = user.freeFireUID;
      phoneNumber = user.phoneNumber;
      walletBalance = user.walletBalance + amount;
      totalWins = user.totalWins;
      isBanned = user.isBanned;
      referralCode = user.referralCode;
      referredBy = user.referredBy;
    };

    userProfiles.add(userId, updatedUser);
    totalPrizesDistributed += amount;

    addTransaction(userId, amount, #credit, "Prize for tournament: " # tournamentTitle);
    addNotification(userId, "Prize credited: " # amount.toText(), #walletUpdate);
  };

  func incrementWins(userId : Principal) {
    let user = userProfiles.get(userId).unwrap();

    let updatedUser : UserProfile = {
      username = user.username;
      email = user.email;
      freeFireUID = user.freeFireUID;
      phoneNumber = user.phoneNumber;
      walletBalance = user.walletBalance;
      totalWins = user.totalWins + 1;
      isBanned = user.isBanned;
      referralCode = user.referralCode;
      referredBy = user.referredBy;
    };

    userProfiles.add(userId, updatedUser);
  };
};
