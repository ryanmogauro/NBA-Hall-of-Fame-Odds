const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');


const app = express();
const PORT = process.env.PORT || 3001;




// Pretrained logistic regression model weights
const modelWeights = {
  intercept: -14,
  MVP: 1.2,
  FMVP: 1,
  Championships: .9,
  DPOY: .85,
  ANFT : .75,
  AS: .7, 
  ADFT : .65,
  ARFT: .55,
  APG: .5, 
  ROY: .45, 
  ANTT: .35,
  PPG: .5, 
  RPG: .25, 
  ANST: .2,
  ARST: .15
};


// Middleware to parse JSON bodies
app.use(express.json());

app.use(cors());

const calculateProbability = (input) => {
  const linearCombination =
    modelWeights.intercept +
    modelWeights.MVP * input['MVP'] +
    modelWeights.FMVP * input['FMVP'] +
    modelWeights.Championships * input['Championships'] +
    modelWeights.DPOY * input['DPOY'] +
    modelWeights.ANFT * input['FirstTeam'] + 
    modelWeights.AS * input['AllStars'] +
    modelWeights.ADFT * input['DefFirstTeam'] + 
    modelWeights.ARFT * input['RookieFirstTeam'] + 
    modelWeights.APG * input['APG'] + 
    modelWeights.ROY * input['ROY'] + 
    modelWeights.ANTT * input['ThirdTeam'] + 
    modelWeights.PPG * input['PPG'] + 
    modelWeights.RPG * input['RPG'] + 
    modelWeights.ANST * input['SecondTeam'] +
    modelWeights.ARST * input['RookieSecondTeam']; 

  const probability = 1 / (1 + Math.exp(-linearCombination));
  return probability;
};

const processAwards = async (awardsObject) => {
  try {
      let awards = awardsObject;
      let playerMVP = 0; 
      let playerFMVP = 0; 
      let playerChampionships = 0;
      let playerDPOY = 0; 
      let playerAllStars = 0; 
      let playerFirstTeam = 0; 
      let playerSecondTeam = 0; 
      let playerThirdTeam = 0; 
      let playerRookieFirstTeam = 0; 
      let playerRookieSecondTeam = 0; 
      let playerDefFirstTeam = 0; 
      let playerROY = 0;


      // Check if the API response has the expected structure
      if (awards && awards.resultSets && awards.resultSets.length > 0) {
          const awardsData = awards.resultSets[0];
  

          // Confirm that rowSet is available in the awardsObject
          if (awardsData) {
              const awardRowSet = awardsData.rowSet;
              //console.log("current rowSet: " + awardRowSet + "\n");
              awardRowSet.forEach(row => {
                  //description header at index 4
                  
                  const awardTitle = row[4]; 

                  //degree header at index 5
                  const awardDegree = row[5];


                  if (awardTitle === 'NBA Most Valuable Player') {
                      playerMVP++;
                  }
                  if (awardTitle === 'NBA Finals Most Valuable Player') {
                      playerFMVP++;
                  }
                  if (awardTitle === 'NBA Defensive Player of the Year') {
                      playerDPOY++;
                  }
                  if(awardTitle === 'NBA All-Star'){
                    playerAllStars++;
                  }
          
                  if(awardTitle === 'All-NBA'){
                    if(awardDegree === '1'){
                      playerFirstTeam++;
                    }
                    if(awardDegree === '2'){
                      playerSecondTeam++;
                    }
                    if(awardDegree === '3'){
                      playerThirdTeam++;
                    }
                  }
                  if(awardTitle === 'All-Defensive Team' && awardDegree == '1'){
                    playerDefFirstTeam++; 
                  }
                  if(awardTitle === 'All-Rookie Team'){
                    if(awardDegree === '1'){
                      playerRookieFirstTeam++;
                    }

                    if(awardDegree === '2'){
                      playerRookieSecondTeam++;
                    }
                  }

                  if(awardTitle === 'NBA Champion'){
                    playerChampionships++;
                  }

                  if(awardTitle === 'NBA Rookie of the Year'){
                    playerROY++; 
                  }
              });

              return {
                MVP: playerMVP, 
                FMVP: playerFMVP,
                Championships: playerChampionships,
                AllStars: playerAllStars, 
                DPOY: playerDPOY, 
                FirstTeam: playerFirstTeam,
                SecondTeam: playerSecondTeam, 
                ThirdTeam: playerThirdTeam, 
                DefFirstTeam: playerDefFirstTeam, 
                RookieFirstTeam: playerRookieFirstTeam, 
                RookieSecondTeam: playerRookieSecondTeam,
                ROY: playerROY
              }
          } else {
              console.error('rowSet is not defined in the awardsObject.');
          }
      } else {
          console.error('The awards object structure is not as expected.');
      }
  } catch (error) {
      console.error('Error fetching player stats:', error);
  }
};


const mapHeadersToValues = (headers, rowSet) => {
  const result = {};
  headers.forEach((header, index) => {
    result[header] = rowSet[index];
  });
  return result;
};

const mergeStats = (regSeason, postSeason) => {
  const careerStats = {};
  for(var key in regSeason){
    careerStats[key] = regSeason[key] + postSeason[key]; 
  }
  return careerStats;
}


const processStats = async (statsObject) => {
    const regSeasonObject = statsObject.resultSets.find(set => set.name === "CareerTotalsRegularSeason");
    const postSeasonObject = statsObject.resultSets.find(set => set.name === "CareerTotalsPostSeason");
      
      
    const regSeasonHeaders = regSeasonObject.headers; 
    const regSeasonRowSet = regSeasonObject.rowSet[0]; 

    const postSeasonHeaders = postSeasonObject.headers; 
    const postSeasonRowSet = postSeasonObject.rowSet[0];

    const regSeasonStats = mapHeadersToValues(regSeasonHeaders, regSeasonRowSet);
    const postSeasonStats = mapHeadersToValues(postSeasonHeaders, postSeasonRowSet);

    return mergeStats(regSeasonStats, postSeasonStats);

}



const buildInput = (stats, awards) => {
  const gp = stats['GP']; 
  const ppg = stats['PTS'] / gp;
  const apg = stats['AST'] / gp; 
  const rpg = stats['REB'] / gp; 

  input = awards; 
  input['PPG'] = ppg; 
  input['APG'] = apg;
  input['RPG'] = rpg; 

  console.log(input);
  return input; 
}






app.get('/player-stats/:name', async (req, res) => {
  const playerName = decodeURIComponent(req.params.name);

  // Execute the Python script to get the player ID

  exec(`python "/Users/ryan/Desktop/CS/Projects/Hall of Fame odds/Server/scripts/player_id_search.py" "${playerName}"`, async (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing Python script: ${error}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (stderr) {
      console.error(`Python script error: ${stderr}`);
      return res.status(500).json({ error: 'Error in Python script' });
    }

    const playerId = stdout.trim();

    if (playerId === "Player not found") {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Fetch player stats using the retrieved player ID
    try {
      const playerStats = await axios.get('https://stats.nba.com/stats/playercareerstats', {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
          'x-nba-stats-origin': 'stats',
          'x-nba-stats-token': 'true',
          'Referer': 'https://stats.nba.com/',
          'Origin': 'https://stats.nba.com'

        },
        params: {
          PlayerID: playerId,
          PerMode: "Totals"
        }
      });

      
      const stats = playerStats.data;
      const statsDict = await processStats(stats);
      
      
      //console.log(statsDict); 
    

      const playerAwards = await axios.get('https://stats.nba.com/stats/playerawards',{
        headers: { 
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
          'x-nba-stats-origin': 'stats',
          'x-nba-stats-token': 'true',
          'Referer': 'https://stats.nba.com/',
          'Origin': 'https://stats.nba.com'
        },

        params: {
           PlayerID: playerId
        }
      });


      const awards = playerAwards.data;
      awardDict = await processAwards(awards);
      //console.log(awardDict); 


      modelInput = buildInput(statsDict, awardDict); 

      const probability = calculateProbability(modelInput);
      res.json({modelInput, probability});
    } catch (error) {
      console.error('Error fetching player stats:', error.response ? error.response.data : error.message);
      res.status(500).send('Server Error');
    }
  });
});




app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});










