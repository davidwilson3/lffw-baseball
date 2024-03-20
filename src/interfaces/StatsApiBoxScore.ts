export interface Venue {
  id: number;
  name: string;
  link: string;
}

export interface League {
  id: number;
  name: string;
  link: string;
}

export interface Sport {
  id: number;
  link: string;
  name: string;
}

export interface GameRecord {
  wins: number;
  losses: number;
  ties: number;
  pct: string;
}

export interface BattingStats {
    flyOuts: number;
    groundOuts: number;
    runs: number;
    doubles: number;
    triples: number;
    homeRuns: number;
    strikeOuts: number;
    baseOnBalls: number;
    intentionalWalks: number;
    hits: number;
    hitByPitch: number;
    avg: string;
    atBats: number;
    obp: string;
    slg: string;
    ops: string;
    caughtStealing: number;
    stolenBases: number;
    stolenBasePercentage: string;
    groundIntoDoublePlay: number;
    groundIntoTriplePlay: number;
    plateAppearances: number;
    totalBases: number;
    rbi: number;
    leftOnBase: number;
    sacBunts: number;
    sacFlies: number;
    catchersInterference: number;
    pickoffs: number;
    atBatsPerHomeRun: string;
  }
  
  export interface PitchingStats {
    groundOuts: number;
    airOuts: number;
    runs: number;
    doubles: number;
    triples: number;
    homeRuns: number;
    strikeOuts: number;
    baseOnBalls: number;
    intentionalWalks: number;
    hits: number;
    hitByPitch: number;
    atBats: number;
    obp: string;
    caughtStealing: number;
    stolenBases: number;
    stolenBasePercentage: string;
    numberOfPitches: number;
    era: string;
    inningsPitched: string;
    saveOpportunities: number;
    earnedRuns: number;
    whip: string;
    battersFaced: number;
    outs: number;
    completeGames: number;
    shutouts: number;
    pitchesThrown: number;
    balls: number;
    strikes: number;
    strikePercentage: string;
    hitBatsmen: number;
    balks: number;
    wildPitches: number;
    pickoffs: number;
    groundOutsToAirouts: string;
    rbi: number;
    pitchesPerInning: string;
    runsScoredPer9: string;
    homeRunsPer9: string;
    inheritedRunners: number;
    inheritedRunnersScored: number;
    catchersInterference: number;
    sacBunts: number;
    sacFlies: number;
    passedBall: number;
  }
  
  export interface FieldingStats {
    caughtStealing: number;
    stolenBases: number;
    stolenBasePercentage: string;
    assists: number;
    putOuts: number;
    errors: number;
    chances: number;
    passedBall: number;
    pickoffs: number;
  }
  
  export interface TeamStats {
    batting: BattingStats;
    pitching: PitchingStats;
    fielding: FieldingStats;
  }
  

export interface Team {
  allStarStatus: string;
  id: number;
  name: string;
  link: string;
  season: number;
  venue: Venue;
  teamCode: string;
  fileCode: string;
  abbreviation: string;
  teamName: string;
  locationName: string;
  firstYearOfPlay: string;
  league: League;
  sport: Sport;
  shortName: string;
  record: GameRecord;
  parentOrgName: string;
  parentOrgId: number;
  franchiseName: string;
  clubName: string;
  active: boolean;
}

export interface Player {
  // Define player properties if needed
}

export interface TeamPlayers {
  batters: number[];
  pitchers: number[];
  bench: number[];
  bullpen: number[];
  battingOrder: number[];
  // Define other player lists if needed
}

export interface TeamInfoField {
  label: string;
  value: string;
}

export interface TeamInfo {
  title: string;
  fieldList: TeamInfoField[];
}

export interface BoxscoreTeam {
  team: Team;
  teamStats: TeamStats;
  players: TeamPlayers;
  batters: number[]; // List of player IDs
  pitchers: number[]; // List of player IDs
  bench: number[]; // List of player IDs
  bullpen: number[]; // List of player IDs
  battingOrder: number[]; // List of player IDs
  info: TeamInfo[];
  note: TeamInfo[];
}

export interface Official {
  id: number;
  fullName: string;
  link: string;
}

export interface GameOfficial {
  official: Official;
  officialType: string;
}

export interface GameInfo {
  label: string;
  value: string;
}

export interface TopPerformer {
  // Define properties for top performers if needed
}

export interface BoxscoreResponse {
  copyright: string;
  teams: {
    away: BoxscoreTeam;
    home: BoxscoreTeam;
  };
  officials: GameOfficial[];
  info: GameInfo[];
  pitchingNotes: any[]; // Can define a specific type if needed
  topPerformers: TopPerformer[]; // Define specific type if needed
}
