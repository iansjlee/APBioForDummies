const express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const databaseFile = './accounts.db';
const db = new sqlite3.Database(databaseFile)

app.use('/static', express.static(__dirname + '/static'));

var urlencodedParser = bodyParser.urlencoded({
  extended: false
})

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/login.htm'));
});

app.get('/register', function (req, res) {
  res.sendFile(path.join(__dirname + '/register.htm'));
});

app.post('/create', urlencodedParser, function (req, res) {
  // Prepare output in JSON format

  let p = getRecords(db, req.body.username);
  p.then(function (data) {
    db.run(`INSERT INTO accounts(username,password) VALUES(?,?)`, [req.body.username, req.body.password], function (err) {
      if (err) {
        return console.log(err.message);
      }
      // get the last insert id
      res.sendFile(path.join(__dirname + '/login.htm'));
    });

  }).catch(function (data) {
    res.send('Username is already taken');
  });
})

app.post('/authenticate', urlencodedParser, function (req, res) {
  // Prepare output in JSON format
  let a = Login(db, req.body.username, req.body.password)
  a.then(function(data){
    res.sendFile(path.join(__dirname + '/Starting.htm'));
  }).catch(function(data){
    res.send('Incorrect username or password')
  })

})

app.get('/start', function (req, res) {
  res.sendFile(path.join(__dirname + '/Starting.htm'));
});


app.get('/molecules', function (req, res) {
  res.sendFile(path.join(__dirname + '/MoleculesOfLife.htm'));
});

app.get('/photo', function (req, res) {
  res.sendFile(path.join(__dirname + '/Photosynthesis.htm'));
});

app.get('/resp', function (req, res) {
  res.sendFile(path.join(__dirname + '/Respiration.htm'));
});

app.get('/genereg', function (req, res) {
  res.sendFile(path.join(__dirname + '/GeneRegMitosisMeiosis.htm'));
});

app.get('/mend', function (req, res) {
  res.sendFile(path.join(__dirname + '/MendelianGeneticsBiotech.htm'));
});

app.get('/evo', function (req, res) {
  res.sendFile(path.join(__dirname + '/Evolution.htm'));
});

app.get('/nerv', function (req, res) {
  res.sendFile(path.join(__dirname + '/Nervous+EndocrineSystems.htm'));
});

app.get('/immune', function (req, res) {
  res.sendFile(path.join(__dirname + '/ImmuneSystemDevelopment.htm'));
});

app.get('/eco', function (req, res) {
  res.sendFile(path.join(__dirname + '/Ecology.htm'));
});

app.get('/game', function(req, res) {
    res.sendFile(path.join(_dirname + '/designproject2.0.htm'));
})



function initDB( db ){
db.serialize(function() {
db.run('CREATE TABLE IF NOT EXISTS accounts(id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, username VARCHAR(256), password VARCHAR(256))');
});
} //creates a table if it doesn't exist

function getRecords( db, username ){
 console.log('ENTER getRecords');

 let prom = new Promise( function(resolve,reject) {
   let found = false;
   let rowData = [];
   // async call
   db.each(`SELECT * FROM accounts WHERE username = '${username}'`, function(err, row) {
       found = true;
   }, function( err, numRows ) {
     if(!found){
       resolve( true );
     }
     else{
       reject(false);
     }
   });
 })

 return prom;
} //promise function

function Login( db, username, password ){
 console.log('ENTER getRecords');

 let lprom = new Promise( function(resolve,reject) {
   let check = false;
   let rowData = [];
   // async call
   db.each(`SELECT * FROM accounts WHERE username = '${username}' and password = '${password}'`, function(err, row) {
       check = true;
   }, function( err, numRows ) {
     if(check){
       resolve( true );
     }
     else{
       reject(false);
     }
   });
 })

 return lprom;
} //promise function

initDB(db);

io.on('connection', function (socket) {
  socket.on('chat message', function (msg) {
    io.emit('chat message', msg);
  });
});

http.listen(8080, function () {
  console.log('listening on *:8080');
});