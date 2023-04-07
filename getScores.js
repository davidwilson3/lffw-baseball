import fetch from "node-fetch";

export const GetAllScores = (year) => {
  fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=${year}`)
    .then((response) => response.json())
    .then((data) => {
      const games = data.dates.flatMap((date) =>
        date.games.filter(
          (game) => game.gameType === "R" && game.status.statusCode === "F"
        )
      );
      const boxScorePromises = games.map((game) => {
        const gameId = game.gamePk;
        const gameDate = game.gameDate;
        const officialDate = game.officialDate;
        return fetch(`https://statsapi.mlb.com/api/v1/game/${gameId}/boxscore`)
          .then((response) => response.json())
          .then((boxscore) => {
            return {
              date: officialDate == null ? gameDate : officialDate,
              boxscore: boxscore,
            };
          });
      });

      Promise.all(boxScorePromises)
        .then((boxScores) => {
          const scoreTracker = boxScores.reduce((acc, cur) => {
            const awayTeam = cur.boxscore.teams.away;
            const homeTeam = cur.boxscore.teams.home;

            return addScoreToTracker(
              addScoreToTracker(acc, homeTeam, cur.date),
              awayTeam,
              cur.date
            );
          }, {});

          console.log(scoreTracker);
          return scoreTracker
        })
        .catch((error) => console.error(error));
    })
    .catch((error) => console.error(error));
};

function addScoreToTracker(tracker, team, date) {
  const upperBound = 13;
  const afterDate = Date.parse("2023-04-03T23:59:00Z");
  const readDate = Date.parse(date);

  if (readDate <= afterDate) return tracker;

  const runs = team.teamStats.batting.runs;
  const abbreviation = team.team.abbreviation;

  const teamName = team.team.teamName;
  const scores = "scores";

  const teamScores =
    abbreviation in tracker ? tracker[abbreviation][scores] : {};

  if ((runs in teamScores) | (runs > upperBound)) return tracker;

  return {
    ...tracker,
    [abbreviation]: {
      name: teamName,
      [scores]: {
        ...teamScores,
        [runs]: date,
      },
    },
  };
}


GetAllScores(2023);
