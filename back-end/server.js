var mysql = require('mysql');
var AWS = require('aws-sdk');
var uuid = require('uuid');
const csv = require('csv-parser');
const fs = require('fs');
const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const app = express();
const cors = require('cors');
var md5 = require('md5');
var https = require("https");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
app.use("/", router);

app.use(bodyParser.urlencoded({
  extended: true,
  limit: '50mb'
}));
app.use(bodyParser.json({ limit: '50mb' }));


app.use(cors({
  origin: '*'
}));

var answer_ongoing = {};

var s3 = new AWS.S3({
  'region': 'us-east-1'
});

function answer_question(user_name, answer, res) {
  var is_answering = answer_ongoing[user_name];

  if (is_answering == undefined) {
    res.end("{\"result\":\"no_question\"}");
    return;
  }

  //Get the correct answer
  con.query("SELECT good AS correct FROM questions WHERE id=\"" + is_answering + "\"", function (err, result) {
    if (err) throw err;
    var correct = "";

    switch(answer){
      case "un":
        correct = 1;
        break;
      case "deux":
        correct = 2;
        break;
      case "trois":
        correct = 3;
        break;
      case "quatre":
        correct = 4;
        break;
      case "oui":
        correct = 1;
        break;
      case "non":
        correct = 2;
        break;
    }

    delete answer_ongoing[user_name];
    if (correct == result[0].correct) {
      //Bonne réponse
      con.query("UPDATE scores SET score = score +1 WHERE id_user=(SELECT id FROM users WHERE username=\"" + user_name + "\")", function (err, result) {
        if (err) throw err;
      });
      res.end("{\"result\":\"good\"}");
    } else {
      //Mauvaise réponse
      res.end("{\"result\":\"bad\"}");
    }
  });


}

function uploadAudio(audio, type, response, name, username) {
  var params = {
    Body: audio,
    Bucket: "bucket-big-data-audios",
    Key: name,
    ACL: 'public-read',
    ContentLength: audio.length,
    ContentType: `audio/${type}`
  }
  s3.putObject(params, function (err, data) {
    if (err) {
      console.error(err);
      response.status(500);
      response.send('Internal server error.');
    } else {
      //Get answer
      //https://ae4f7ig3bofzfyjfoq5ch4kdai0jmcrd.lambda-url.us-east-1.on.aws/?bucket=bucket-big-data-audios&key=4d0a490f-3e94-47b0-b5ec-6ae13d808131.mp3

      var options = {
        host: "ae4f7ig3bofzfyjfoq5ch4kdai0jmcrd.lambda-url.us-east-1.on.aws",
        path: "/?bucket=bucket-big-data-audios&key=" + name
      }; 

      var req = https.request(options, function (res) {
        var str = ""; 

        res.on('data', function (chunk) {
          str += chunk;
        });

        res.on('end', function () {
          console.log("User: " + username + " answered " + str);
          answer_question(username, str, response);
        });
      }); 

      req.on('error', function (err) {
          console.log('Error message: ' + err);
      });     

      req.end();
      
    }
  });
}

var con = mysql.createConnection({
  host: "database-big-data.chwyebrxxj4p.us-east-1.rds.amazonaws.com",
  user: "admin",
  password: "ryugifeageafgaofhogaoiuavg",
  port: "3306"
});

var dbExists = false;

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected to database!");

  const creation_db = new Promise((resolve, reject) => {

    const check_db = new Promise((resolve, reject) => {
      //Check if database exists
      con.query("SELECT count(*) AS existsornot FROM information_schema.SCHEMATA WHERE (SCHEMA_NAME = 'db');", function (err, result) {
        if (err) throw err;
        if (result[0].existsornot == 0) {
          console.log("Database does not exists! Creating it!");
        } else {
          console.log("Database exists, skipping setup.");
          dbExists = true;

          //TODO: Remove in prod, used to reset database every time it launches
          if (dbExists) con.query("DROP DATABASE db", function (err, result) {
            if (err) throw err;
            console.log("Database deleted (You can remove it for production)");
          });
          dbExists = false;
          //End of test code

        }
        resolve('Success!');
      });

    });

    check_db.then((value) => {

      //Creating database if needed
      if (!dbExists) con.query("CREATE DATABASE db", function (err, result) {
        if (err) throw err;
        console.log("Database created");
      });

      //SELECTING DB anyway
      con.query("USE db", function (err, result) {
        if (err) throw err;
        console.log("Database selected");
      });

      //Adding tables if needed
      if (!dbExists) con.query("CREATE TABLE questions (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, question VARCHAR(255) NOT NULL, question_type INT NOT NULL, good INT NOT NULL, answer1 VARCHAR(255),answer2 VARCHAR(255),answer3 VARCHAR(255),answer4 VARCHAR(255))", function (err, result) {
        if (err) throw err;
        console.log("Question table created");
      });

      if (!dbExists) con.query("CREATE TABLE users (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) NOT NULL UNIQUE, email VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, country VARCHAR(255) NOT NULL, gender VARCHAR(255) NOT NULL)", function (err, result) {
        if (err) throw err;
        console.log("Users table created");
      });

      if (!dbExists) con.query("CREATE TABLE answered (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) NOT NULL, id_question INT NOT NULL, FOREIGN KEY (username) REFERENCES users(username), FOREIGN KEY (id_question) REFERENCES questions(id))", function (err, result) {
        if (err) throw err;
        console.log("answered table created");
      });

      if (!dbExists) con.query("CREATE TABLE scores (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, id_user INT NOT NULL UNIQUE, score INT, FOREIGN KEY (id_user) REFERENCES users(id))", function (err, result) {
        if (err) throw err;
        console.log("Scores table created");
        resolve('Success!');
      });
      //End of table creation

    });
  });

  creation_db.then((value) => {


    //Loading questions
    //Need to use await for table to be created before csv load
    fs.createReadStream('questions.csv')
      .pipe(csv({separator: ','}))
      .on('data', (row) => {
        let json_str = JSON.stringify(row);
        let json = JSON.parse(json_str);
        //Exemple de json: {"Name":"Présidents","Question":"Quel est l'actuel président de la république","Type":"2","Answer1":"Emmanuel Macron","Answer2":"JL Mélenchon","Answer3":"Poutou","Answer4":"Maman"}
        if (!dbExists) con.query("INSERT INTO questions(name, question, question_type, good, answer1, answer2, answer3, answer4) VALUES (\"" + json["Name"] + "\",\"" + json["Question"] + "\"," + json["Type"] + "," + json["Good"] + ",\"" + json["Answer1"] + "\",\"" + json["Answer2"] + "\",\"" + json["Answer3"] + "\",\"" + json["Answer4"] + "\")", function (err, result) {
          if (err) throw err;
        });

      })
      .on('end', () => {
        console.log('CSV file successfully processed');
      })
      .on("error", function (error) {
        console.log(error.message);
      });



    //Listing possible GET/POST requests

    //Do not forget Content-Type: application/json in the headers!!!
    app.post('/get_question', async (req, res) => {
      var body = await req.body;

      var username = body.user;

      //Check if a specific theme is asked
      var theme = body.theme;

      //Check if user exists, if not, create the account of the user
      const check_user = new Promise((resolve, reject) => {
        con.query("SELECT EXISTS(SELECT * from users WHERE username=\"" + username + "\") AS existsornot;", function (err, result) {
          if (err) throw err;
          if (result[0].existsornot == 0) {
            revoque("User does not exist")
          } else {
            resolve('Success!');
          }
        });
      });

      check_user.then((value) => {
        //Selecting a random question

        //Check theme required
        var query = "";
        if (theme == undefined) {
          query = "SELECT * FROM questions WHERE id NOT IN (SELECT id_question FROM answered WHERE username = \"" + username + "\") ORDER BY RAND() LIMIT 1";
        } else {
          query = "SELECT * FROM questions WHERE name LIKE \"%" + theme + "%\" AND id NOT IN (SELECT id_question FROM answered WHERE username = \"" + username + "\") ORDER BY RAND() LIMIT 1"
        }
        con.query(query, function (err, result) {
          if (err) throw err;
          if (result[0] == undefined) {
            res.end(JSON.stringify("No answer found!"));
          } else {
            //On ajout la question à la liste des déja répondues
            if (!dbExists) con.query("INSERT INTO answered(username, id_question) VALUES (\"" + username + "\"," + result[0].id + ")", function (err, result) {
              if (err) throw err;
            });

            answer_ongoing[username] = result[0].id;
            var json_envoie = result[0];
            delete json_envoie["good"];
            res.status(200).end(JSON.stringify(json_envoie));
          }
        });
      }).catch(() => {
        res.status(400).json({ message: "User unknown. Cannot get question" });
      });

    });


    app.post('/send_audio', async (req, res) => {
      var body = await req.body;
      var username = body.user;

      var audio = body.audio;

      console.log("Uploading audio to S3");
      var audio_upload = Buffer.from(audio, 'base64');
      var name = uuid.v4() + ".mp3";

      fs.writeFile("./audios/not_" + name, audio, {encoding: 'base64'}, function(err) {
        ffmpeg("./audios/not_" + name).outputOption('-map_channel 0.0.0')
        .save("./audios/" + name)
        .on('error', (err) => {
            console.log(`An error occurred: ${err.message}`);
        })
        .on('end', () => {
            fs.readFile("./audios/" + name, function (err, data ) {
              uploadAudio(data, "mp3", res, name, username);
              //Suppression des view fichiers
              fs.unlinkSync("./audios/not_" + name);
              fs.unlinkSync("./audios/" + name);
              // ...
            });
        })
      });

      
      

    });

    app.get('/get_score', async (req, res) => {
      var searched_user = req.query.user;
      con.query("SELECT score FROM scores WHERE id_user=(SELECT id FROM users WHERE username=\"" + searched_user + "\")", function (err, result) {
        if (err) throw err;
        if (result[0] != undefined) {
          res.status(200).json(result[0]);
        } else {
          res.status(400).send({ message: "User not found" });
        }
      });


    });

    app.get('/get_leaderboard', async (req, res) => {
      var size = req.query.size;
      if (size == undefined) size = 10;
      con.query("SELECT users.username, users.country,scores.score, RANK() OVER (ORDER BY scores.score DESC) as ranking FROM scores LEFT JOIN users ON ( users.id = scores.id_user) LIMIT " + size, function (err, result) {
        if (err) throw err;
        res.status(200).json(result);
      });

    });

    app.get('/getmyuser', async (req, res) => {
      var username = req.query.user;

      con.query("SELECT users.username, users.country,scores.score, RANK() OVER (ORDER BY scores.score DESC) as ranking FROM scores LEFT JOIN users ON ( users.id = scores.id_user) WHERE id_user=(SELECT id FROM users WHERE username=\"" + username + "\")", function (err, result) {
        if (err) throw err;
        if (result[0] != undefined) {
          res.status(200).json(result[0]);
        } else {
          res.status(400).send({ message: "User not found" });
        }
      });

    })

    app.post('/login', async (req, res) => {
      var body = await req.body;

      var user = body.user;

      // check if user credentials are okay
      const check_user = new Promise((resolve, reject) => {
        con.query("SELECT * from users WHERE username=\"" + user.username + "\";", function (err, result) {
          if (err) throw err;

          var json = JSON.parse(JSON.stringify(result));
          if (json.length != 0) {
            var hashedPassword = md5(user.password);

            if (hashedPassword == json[0].password) {
              resolve(json[0]);
            } else {
              reject('Credentials wrong');
            }
          } else {
            reject("No user found");
          }
        });
      });

      check_user.then((data) => {
        return res.status(200).json({ username: data.username, email: data.email, country: data.country, gender: data.gender })
      }).catch(() => {
        return res.status(409).send({ message: "Username and/or password not correct" })
      });

    })

    app.post('/register', async (req, res) => {
      var body = await req.body;
      var user = body.user;

      // check if username is taken, otherwise create new account for the user
      const check_user = new Promise((resolve, reject) => {
        con.query("SELECT EXISTS(SELECT * from users WHERE username=\"" + user.username + "\" OR email=\"" + user.email + "\") AS existsornot;", function (err, result) {
          if (err) throw err;
          if (result[0].existsornot == 0) {
            if (!dbExists) con.query("INSERT INTO users(username, email, password, country, gender) VALUES (\"" + user.username + "\", \"" + user.email + "\", MD5(\"" + user.password + "\"), \"" + user.country + "\", \"" + user.gender + "\")", function (err, result) {
              if (err) throw err;
              if (!dbExists) con.query("INSERT INTO scores(id_user, score) VALUES (" + "(SELECT id FROM users WHERE username=\"" + user.username + "\")" + ",0)", function (err, result) {
                if (err) throw err;
                resolve('Success!');
              });
            });
          } else {
            reject('Username or email already taken');
          }

        });
      });

      check_user.then(() => {
        return res.status(201).send({ message: "User created" })
      }).catch(() => {
        return res.status(409).send({ message: "Username and/or email already taken" })
      });
    })

    app.get('/get_themes', async (req, res) => {
      con.query("SELECT DISTINCT name AS theme FROM questions", function (err, result) {
        if (err) throw err;
        var json = [];
        var compteur = -1;
        result.forEach(function (result) {
          compteur++;
          json[compteur] = result.theme;
        });
        res.end(JSON.stringify(json));
      });


    });

    //Lancement du serveur
    app.listen(8080, () => {
      console.log("Started server on PORT 8080");
    })


  });
});