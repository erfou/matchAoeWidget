const http = require('http');
const https = require('https');
const request = require('request');
const hostname = '127.0.0.1';
const port = 8080;


const server = http.createServer((req, res) => {
    /**
     * HOW TO Make an HTTP Call - GET
     */
    // options for GET
    var optionsget = {
        host : 'aoe2.net', // here only the domain name
        // (no http/https !)
        port : 443,
        headers: {
            'Accept': 'application/json'
        },
        path : '/api/player/lastmatch?game=aoe2de&steam_id=76561198899171575', // the rest of the url with parameters if needed
        method : 'GET' // do GET
    };

    console.info('Options prepared:');
    console.info(optionsget);
    console.info('Do the GET call');

    // do the GET request
    var reqGet = https.request(optionsget, function(res) {
        console.log("statusCode: ", res.statusCode);
        // uncomment it for header details
    //  console.log("headers: ", res.headers);


        res.on('data', function(d) {
            console.info('GET result:\n');

            var lastMatchInformations = JSON.parse(d);
            playersByTeams = {};

            lastMatchInformations.last_match.players.forEach(currentPlayer => {
                
                if(playersByTeams[currentPlayer.team] === undefined) {
                    playersByTeams[currentPlayer.team] = new Array();
                }
                
                    retrieveUserData(currentPlayer.steam_id).then(
                        result => playersByTeams[currentPlayer.team].push(result),
                        error => console.log(error)
                    )
                
            });

            lastMatchInformations.last_match.players
            process.stdout.write('FINAL RESULT: ' + JSON.stringify(playersByTeams)); 
            console.info('\n\nCall completed');
        });

    });

    reqGet.end();
    reqGet.on('error', function(e) {
        console.error(e);
    });


    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

var retrieveUserData = new Promise(function (steamId, resolve, reject) {
    var optionsget = {
        host : 'aoe2.net', // here only the domain name
        // (no http/https !)
        port : 443,
        headers: {
            'Accept': 'application/json'
        },
        path : '/api/leaderboard?game=aoe2de&steam_id=' + steamId, // the rest of the url with parameters if needed
        method : 'GET' // do GET
    };

    console.info('retrieveUserData Options prepared:');
    console.info(optionsget);
    console.info('retrieveUserData Do the GET call');

    // do the GET request
    var reqGet = https.request(optionsget, function(res) {
        console.log("retrieveUserData statusCode: ", res.statusCode);

        res.on('data', function(d) {
            var user = {};
            var receivedUserData = JSON.parse(d).leaderboard[0];
            user.name = receivedUserData.name;
            user.country = receivedUserData.country;
            user.rank = receivedUserData.rank;
            user.rating = receivedUserData.rating;
            user.wins = receivedUserData.wins;
            user.losses = receivedUserData.losses;
            user.winrate = 100 * receivedUserData.wins / receivedUserData.games;
            console.log('retrieveUserData user: ' + JSON.stringify(user));
            resolve(JSON.stringify(user));
        });
    });

    reqGet.end();
    reqGet.on('error', function(e) {
        reject(e);
    });
});