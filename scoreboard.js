import fetch from "node-fetch";
import fs from "fs-extra";

const upperBound = 14;

export const getAllScores = async (year) => {
  try {
    const response = await fetch(
      `https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=${year}`
    );
    const data = await response.json();

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

    const boxScores = await Promise.all(boxScorePromises);

    const scoreTracker = boxScores.reduce((acc, cur) => {
      const awayTeam = cur.boxscore.teams.away;
      const homeTeam = cur.boxscore.teams.home;

      return addScoreToTracker(
        addScoreToTracker(acc, homeTeam, cur.date),
        awayTeam,
        cur.date
      );
    }, {});

    return scoreTracker;
  } catch (error) {
    console.error(error);
  }
};

function addScoreToTracker(tracker, team, date) {
  const afterDate = Date.parse("2023-04-03T23:59:00Z");
  const readDate = Date.parse(date);

  if (readDate <= afterDate) return tracker;

  const runs = team.teamStats.batting.runs;
  const abbreviation = team.team.abbreviation;

  const teamName = team.team.teamName;
  const scoresLabel = "scores";

  const teamScores =
    abbreviation in tracker ? tracker[abbreviation][scoresLabel] : {};

  if (runs in teamScores || runs >= upperBound) return tracker;

  const scores = { ...teamScores, [runs]: date };
  const completed = Object.keys(scores).length;

  return {
    ...tracker,
    [abbreviation]: {
      name: teamName,
      finished: completed === upperBound ? date : false,
      [scoresLabel]: {
        ...teamScores,
        [runs]: date,
      },
    },
  };
}

const teamColors = {
  AZ: { primary: "#A71930", secondary: "#E3D4AD" },
  ATL: { primary: "#CE1141", secondary: "#13274F" },
  BAL: { primary: "#DF4601", secondary: "#000000" },
  BOS: { primary: "#BD3039", secondary: "#0C2340" },
  CHC: { primary: "#0E3386", secondary: "#CC3433" },
  CWS: { primary: "#27251F", secondary: "#C4CED4" },
  CIN: { primary: "#C6011F", secondary: "#000000" },
  CLE: { primary: "#0C2340", secondary: "#E31937" },
  COL: { primary: "#33006F", secondary: "#C4CED4" },
  DET: { primary: "#0C2340", secondary: "#FA4616" },
  HOU: { primary: "#EB6E1F", secondary: "#002D62" },
  KC: { primary: "#004687", secondary: "#BD9B60" },
  LAA: { primary: "#BA0021", secondary: "#003263" },
  LAD: { primary: "#005A9C", secondary: "#E8C4B4" },
  MIA: { primary: "#00A3E0", secondary: "#EF3340" },
  MIL: { primary: "#0A2351", secondary: "#FFC52F" },
  MIN: { primary: "#002B5C", secondary: "#D31145" },
  NYM: { primary: "#FF5910", secondary: "#002D72" },
  NYY: { primary: "#0C2340", secondary: "#C4CED4" },
  OAK: { primary: "#003831", secondary: "#EFB21E" },
  PHI: { primary: "#E81828", secondary: "#002D72" },
  PIT: { primary: "#FDB827", secondary: "#27251F" },
  SD: { primary: "#2F241D", secondary: "#FFC72C" },
  SEA: { primary: "#0C2C56", secondary: "#C4CED4" },
  SF: { primary: "#FD5A1E", secondary: "#27251F" },
  STL: { primary: "#C41E3A", secondary: "#0C2340" },
  TB: { primary: "#092C5C", secondary: "#8FBCE6" },
  TEX: { primary: "#C0111F", secondary: "#003278" },
  TOR: { primary: "#134A8E", secondary: "#E8291C" },
  WSH: { primary: "#AB0003", secondary: "#14225A" },
};

function generateHtml(scores) {
  const specialAbbreviations = ["ATL", "CLE", "PHI", "NYY", "SD"];
  const otherAbbreviations = Object.keys(scores)
    .filter((abbr) => !specialAbbreviations.includes(abbr))
    .sort();

  const createTeamRow = (abbr) => {
    const teamData = scores[abbr];
    const teamScores = teamData.scores;
    const total = Object.keys(teamScores).length;
    const teamColor = teamColors[abbr] || { primary: "", secondary: "" };

    const scoresCells = [...Array(upperBound)].map((_, index) => {
      const date = new Date(teamScores[index] || "");
      const formattedDate =
        date.getTime() > 0
          ? `${date.getMonth() + 1}/${date.getDate()}/${date
              .getFullYear()
              .toString()
              .substr(-2)}`
          : "";
      const scoreClass = formattedDate === "" ? "empty" : "date";
      return `<td class="${scoreClass}">${formattedDate}</td>`;
    });

    const teamTotalCell = `<td>${total}</td>`;

    return `<tr><td style="background-color: ${teamColor.primary}; color: ${
      teamColor.secondary
    }; text-align: center; width: 10%; font-weight: bold;">${abbr}</td>${scoresCells.join(
      ""
    )}${teamTotalCell}</tr>`;
  };

  const specialRows = specialAbbreviations.map(createTeamRow).join("");
  const otherRows = otherAbbreviations.map(createTeamRow).join("");

  const headers = Array.from(
    Array(upperBound),
    (_, idx) =>
      `<th style="background-color: white; color: black; font-weight: bold;">${
        idx
      }</th>`
  );
  headers.unshift(
    '<th style="background-color: white; color: black; font-weight: bold; width: 10%;">Abbreviation</th>'
  );

  // Find the winner based on the rules described
  const findWinner = () => {
    const eligibleSpecialAbbreviations = specialAbbreviations.filter(
      (abbr) => scores[abbr].completed !== null
    );
    if (eligibleSpecialAbbreviations.length === 0) {
      return null;
    } else if (eligibleSpecialAbbreviations.length === 1) {
      return eligibleSpecialAbbreviations[0];
    } else {
      let earliestDate = Infinity;
      let winner = null;
      eligibleSpecialAbbreviations.forEach((abbr) => {
        const date = new Date(scores[abbr].completed);
        if (date < earliestDate) {
          earliestDate = date;
          winner = abbr;
        }
      });
      return winner;
    }
  };

  const winner = findWinner();
  const winnerHtml = `<h2 style="text-align: center">The winner is: ${
    winner ? winner : "NO ONE"
  }</h2>`;

  var currentdate = new Date();
  var lastUpdated =
    "Last Updated: " +
    (currentdate.getMonth() + 1) +
    "/" +
    currentdate.getDate() +
    "/" +
    currentdate.getFullYear() +
    " @ " +
    currentdate.getHours() +
    ":" +
    currentdate.getMinutes() +
    ":" +
    currentdate.getSeconds();

  const lastUpdatedHtml = `<div style="text-align: center; margin-top: 10px">${lastUpdated}</div>`;

  return `
    <style>
      table {
        border-collapse: collapse;
        margin: 0 auto;
      }
      th,
      td {
        border: 1px solid white;
        padding: 4px;
        text-align: center;
      }
      th:first-child,
      td:first-child {
        width: 10%;
        background-color: white;
        color: black;
        font-weight: bold;
      }
      th:nth-child(-n+${upperBound + 1}),
      td:nth-child(-n+${upperBound + 1}) {
        background-color: lightgray;
        width: calc(80% / ${upperBound});
      }
      td:last-child {
        background-color: black;
        color: white;
      }
      td.date {
        background-color: lightgreen;
      }
    </style>
    ${winnerHtml}
    <table>
      <thead>
        <tr>${headers.join(
          ""
        )}<th style="background-color: white; color: black; font-weight: bold;">Total</th></tr>
      </thead>
      <tbody>
        ${specialRows}
        <tr><td colspan="${
          upperBound + 3
        }" style="height: 20px; background-color: white;"></td></tr>
        ${otherRows}
      </tbody>
    </table>
    ${lastUpdatedHtml}
  `;
}

const scores = await getAllScores(2023);
const generatedHtml = generateHtml(scores);
const filename = "index.html";

fs.writeFile(filename, generatedHtml, (err) => {
  if (err) {
    console.error(`Error writing file ${filename}: ${err}`);
  } else {
    console.log(`Successfully wrote file ${filename}`);
  }
});
