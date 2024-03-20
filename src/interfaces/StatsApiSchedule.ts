export interface LeagueRecord {
    wins: number;
    losses: number;
    pct: string;
  }
  
  export interface Team {
    id: number;
    name: string;
    link: string;
  }
  
  export interface Status {
    abstractGameState: string;
    codedGameState: string;
    detailedState: string;
    statusCode: string;
    startTimeTBD: boolean;
    abstractGameCode: string;
  }
  
  export interface Venue {
    id: number;
    name: string;
    link: string;
  }
  
  export interface Game {
    gamePk: number;
    gameGuid: string;
    link: string;
    gameType: string;
    season: string;
    gameDate: string;
    officialDate: string;
    status: Status;
    teams: {
      away: {
        leagueRecord: LeagueRecord;
        score: number;
        team: Team;
        isWinner: boolean;
        splitSquad: boolean;
        seriesNumber?: number;
      };
      home: {
        leagueRecord: LeagueRecord;
        score: number;
        team: Team;
        isWinner: boolean;
        splitSquad: boolean;
        seriesNumber?: number;
      };
    };
    venue: Venue;
    content: {
      link: string;
    };
    isTie: boolean;
    gameNumber: number;
    publicFacing: boolean;
    doubleHeader: string;
    gamedayType: string;
    tiebreaker: string;
    calendarEventID: string;
    seasonDisplay: string;
    dayNight: string;
    scheduledInnings: number;
    reverseHomeAwayStatus: boolean;
    inningBreakLength: number;
    gamesInSeries?: number;
    seriesGameNumber?: number;
    seriesDescription: string;
    recordSource: string;
    ifNecessary: string;
    ifNecessaryDescription: string;
  }
  
  export interface DateInfo {
    date: string;
    totalItems: number;
    totalEvents: number;
    totalGames: number;
    totalGamesInProgress: number;
    games: Game[];
    events: any[]; // You might want to create a proper interface for events if needed
  }
  
  export interface ResponseData {
    totalItems: number;
    totalEvents: number;
    totalGames: number;
    totalGamesInProgress: number;
    dates: DateInfo[];
  }
  