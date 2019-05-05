
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const urlencodedParser = bodyParser.urlencoded({
    extended: false
})

app.set('view engine', 'pug');
app.set('views', './views');

const databaseFile = './database.db';
const db = new sqlite3.Database(databaseFile);

function initDB(db) {
    //Big O: 1
    //initialize the database
    db.serialize(function () {
        //Big O: 1
        //create tutor table and student table in database
        db.run('CREATE TABLE IF NOT EXISTS tutor(id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, name VARCHAR(256), username VARCHAR(256), password VARCHAR(256), subject , location )');
        db.run('CREATE TABLE IF NOT EXISTS student(id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, name VARCHAR(256), username VARCHAR(256), password VARCHAR(256), subject VARCHAR(256), locationReq )');
    });
}

app.get('/register', function (req, res) {
    //Big O: 1
    //takes user to register page
    res.sendFile(__dirname + '/' + "register.htm");
});

app.get('/', function (req, res) {
    //Big O: 1
    //sends user to signin page
    res.sendFile(__dirname + "/" + "Login.htm");
});

app.post('/register', urlencodedParser, function (req, res) {
    //Big O: n
    //puts user's username, password, and title (tutor or student) into table, depending on if they're are a student or tutor
    let username = req.body.username;
    let password = req.body.password;
    let person = req.body.user;

    if (person == 'tutor') {
        let prom2 = findusername(db, username);
        prom2.then(function (data) {
            //Big O: 1
            //runs if inputted username matches a username in the database
            //sends page saying username already exists
            res.send('This username already exists');
        }).catch(function (err) {
            //Big O: 1
            //runs if inputted username does not match a username in the database and enters user information into database
            db.run(`insert into tutor(username, password) VALUES ('${username}', '${password}')`);
            res.sendFile(__dirname + "/" + "Login.htm");
        });

    } else {
        let prom3 = findusernamestudent(db, username);
        prom3.then(function (data) {
            //Big O: 1
            //runs if inputted username matches a username in the database
            //sends page saying username already exists
            res.send('This username already exists');
        }).catch(function (err) {
            //Big O: 1
            //runs if inputted username does not match a username in the database and enters user information into database
            db.run(`insert into student(username, password) VALUES ('${username}', '${password}')`);
            res.sendFile(__dirname + "/" + "Login.htm");
        });

    };


});

function findusername(db, username) {
    //Big O: 1
    //looks for username in database
    let prom2 = new Promise(function (resolve, reject) {
        //Big O: n
        let usernameexists = false;
        let data = undefined;
        db.each(`SELECT * from tutor where username = '${username}'`, function (err, row) {
            //sets variable data to be one row from a table from database
            usernameexists = true;
            data = row;
        }, function (err) {
            //Big O: 1
            //if username exists it resolves the data from the database, if username doesn't exist it rejects false
            if (!usernameexists) {
                reject(false);
            } else {
                resolve(data);
            }
        });
    });
    return prom2;
}

function findusernamestudent(db, username) {
    //Big O: 1
    //looks for username in database
    let prom2 = new Promise(function (resolve, reject) {
        //Big O: n
        let usernameexists = false;
        let data = undefined;
        db.each(`SELECT * from student where username = '${username}'`, function (err, row) {
            //Big O: 1
            //sets variable data to be one row from a table from database
            usernameexists = true;
            data = row;
        }, function (err) {
            //Big O: 1
            //if username exists it resolves the data from the database, if username doesn't exist it rejects false
            if (!usernameexists) {
                reject(false);
            } else {
                resolve(data);
            }
        });
    });
    return prom2;
}

app.post('/tutor', urlencodedParser, function (req, res) {
    //Big O: n
    //opens the tutor page when the tutor submits their username and password
    let username = req.body.username;
    let password = req.body.password;
    let prom = validatetutor(username, password);
    let students = [];
    prom.then(function (resolve) {
        //Big O: 1
        //calls promise to put student data into a linked list
        let stuprom = studentlist();
        stuprom.then(function (data) {
            //Big O: n
            //renders the tutor pgae with the size of the linked list, the data of the students, and the tutor's username
            students = data.toArray();
            res.render("tutor", { number: data.size(), students: students, username: username });
        }).catch(function (err) {
            //Big O: 1
            res.send(err);
        })
    })
        .catch(function (err) {
            //Big O: 1
            //renders if username or password is incorrect
            res.send("username or password is incorrect");
        })
});


app.post('/student', urlencodedParser, function (req, res) {
    //Big O: n
    //opens the student page when the tutor submits their username and password
    let username = req.body.username;
    let password = req.body.password;
    let prom = validate(username, password);
    prom.then(function (resolve) {
        //Big O: n
        //renders the student page with the student's username
        res.render("index", { username: username });
    })
        .catch(function (err) {
            //Big O: 1
            //renders if username or password is incorrect
            res.send("username or password is incorrect")
        })

});

app.post('/userinput', urlencodedParser, function (req, res) {
    //Big O: n
    //enters the student's inputted location, subject, and username into the table
    let location = req.body.location;
    let subject = req.body.subject;
    let username = req.body.username;
    console.log(username);
    console.log(subject + location);
    db.run(`UPDATE student SET subject = '${subject}', locationReq = '${location}' WHERE username = '${username}'`);

    res.send(JSON.stringify({
        status: 'ok'
    }))
});

function studentlist() {
    //Big O: 1
    //puts the student table into a linked list
    let stuprom = new Promise(function (resolve, reject) {
        //Big O: n
        //gets data from database
        let students = new LList();
        db.each(`SELECT * from student`,
            function (err, row) {
                //Big O: n
                //add to linked list
                students.add(row);
            },
            function (err, numRows) {
                //Big O: 1
                //resolve final linked list or rejects false if linked list doesn't exist
                if (students.size() != 0) {
                    resolve(students);
                } else {
                    reject(false);
                }
            });
    })
    return stuprom;


}

function validate(username, password) {
    //Big O: 1
    //validates student information for signin
    let promval = new Promise(function (resolve, reject) {
        //Big O: n
        //gets data from database
        let uname = false

        db.each(`SELECT * from student where username ='${username}' and password = '${password}'`,
            function (err, row) {
                //Big O: 1
                uname = true
            },
            function (err, numRows) {
                //Big O: 1
                if (uname) {
                    resolve(true)
                } else {
                    reject(false)
                }

            });
    })
    return promval;
}

function validatetutor(username, password) {
    //Big O: 1
    //validates tutor information for signin
    let promval = new Promise(function (resolve, reject) {
        //Big O: n
        //gets data from database
        let uname = false

        db.each(`SELECT * from tutor where username ='${username}' and password = '${password}'`,
            function (err, row) {
                //Big O: 1
                uname = true
            },
            function (err, numRows) {
                //Big O: 1
                if (uname) {
                    resolve(true)
                } else {
                    reject(false)
                }

            });
    })
    return promval;
}

let server = app.listen(8080, function () {
    let host = server.address().address
    let port = server.address().port
    console.log('Listening on port 8080');
});

initDB(db);

