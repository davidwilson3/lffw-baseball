import fetch from "node-fetch";
import { Game, ResponseData } from "../interfaces/StatsApiSchedule";
import { BoxscoreResponse, BoxscoreTeam } from "../interfaces/StatsApiBoxScore";

const upperBound = 10; // Set your upper bound for runs

const getBoxScores = (games: Game[]) =>
  games.map(async (game) => {
    const gameId = game.gamePk;
    const gameDate = game.gameDate;
    const officialDate = game.officialDate;

    return fetch(`https://statsapi.mlb.com/api/v1/game/${gameId}/boxscore`)
      .then((response) => response.json())
      .then((boxscore) => {
        const typedBoxScore = boxscore as BoxscoreResponse
        return {
          date: officialDate == null ? gameDate : officialDate,
          boxScore: typedBoxScore,
        };
      });
  });

const getAllGames = async (year: Number) => {
  const response = await fetch(
    `https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=${year}`
  );

  const data: ResponseData = (await response.json()) as ResponseData;

  // R is regular season and F is finished
  const games: Game[] = data.dates.flatMap((date) =>
    date.games.filter(
      (game) => game.gameType === "R" && game.status.statusCode === "F"
    )
  );

  return games;
};

interface TeamStats {
  batting: {
    runs: number;
  };
}

interface TeamInfo {
  team: {
    abbreviation: string;
    teamName: string;
    // Add other necessary properties here
  };
  teamStats: TeamStats;
}

interface ScoreTracker {
  [abbreviation: string]: {
    name: string;
    finished: string | null;
    scores: { [runs: number]: string };
  };
}

function addScoreToTracker(tracker: ScoreTracker, team:BoxscoreTeam, date:string) {
  // Parse the date for comparison
  const afterDate = Date.parse("2024-01-03T23:59:00Z");
  const readDate = Date.parse(date);

  // If the game date is before or equal to the afterDate, no update needed
  if (readDate <= afterDate) {
    return tracker;
  }

  const runs = team.teamStats.batting.runs;
  const abbreviation = team.team.abbreviation;
  const teamName = team.team.teamName;
  const scoresLabel = "scores";

  // Get existing scores for the team, if any
  const teamScores =
    abbreviation in tracker ? tracker[abbreviation][scoresLabel] : {};

  // If the runs already exist in scores or runs exceed a certain limit, no update needed
  if (runs in teamScores || runs >= upperBound) {
    return tracker;
  }

  // Add the new score with the date
  const updatedScores = {
    ...teamScores,
    [runs]: date,
  };

  // Count the number of completed games
  const completed = Object.keys(updatedScores).length;

  // Update the tracker with the new score
  return {
    ...tracker,
    [abbreviation]: {
      name: teamName,
      finished: completed === upperBound ? date : null,
      [scoresLabel]: updatedScores,
    },
  };
}

export const getAllScores = async (year: Number) => {
  try {
    const games = await getAllGames(year);

    const boxScores = await Promise.all(getBoxScores(games));

    const scoreTracker = boxScores.reduce((tracker, game) => {
      const { boxScore, date } = game;
      const awayTeam = boxScore.teams.away;
      const homeTeam = boxScore.teams.home;

      // Update tracker for home team
      const updatedTrackerHome = addScoreToTracker(tracker, homeTeam, date);

      // Update tracker for away team
      const updatedTrackerAway = addScoreToTracker(
        updatedTrackerHome,
        awayTeam,
        date
      );

      return updatedTrackerAway;
    }, {});

    return scoreTracker;
  } catch (error) {
    console.error(error);
  }
};
