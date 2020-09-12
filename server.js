const express = require("express");
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const connection = mysql.createPool({
    host: '164.125.219.21',
    port: 13306,
    user: 'root',
    password: 'qwer1234',
    database: 'vision',
    waitForConnections: true,
    connectionLimit: 1000,
    queueLimit: 0,
});

app.use(cors());

app.listen(3000, function(){
    console.log("Start Server");
});


app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});


app.get("/api/test", (req, res) => {
    res.json({"message" : "hello world"});
});

app.get("/api/beacon", (req, res) => {
    connection.query("SELECT * FROM beacon;", function (error, result) {
        if (error) {
            console.log(error);
            res.status(400).json({message: error.message});
        } else {
            console.log('result', result);
            res.json({
                    'status': 'success',
                    'result' : result
                }
            );
        }
    });
});

app.get("/api/arduino", (req, res) => {
    connection.query("SELECT * FROM arduino;", function (error, result) {
        if (error) {
            console.log(error);
            res.status(400).json({message: error.message});
        } else {
            console.log('result', result);
            res.json({
                    'status': 'success',
                    'result' : result
                }
            );
        }
    });
});

app.post("/api/beacon", (req, res) => {
    const sql = 'INSERT INTO beacon' + '(id, name, connect_time, disconnect_time)' + 'VALUES (?,?,?,?)';
    const values = [req.body.id, req.body.name, req.body.connect_time, req.body.disconnect_time];
    connection.query(sql, values, function (error, result) {
            if (error) {
                console.log(error);
                res.status(400).json({message: error.message});
            } else {
                console.log('result', result);
                res.json({
                        'status': 'success',
                    }
                );
            }
        }
    );
});

app.post("/api/arduino", (req, res) => {
    const sql = 'INSERT INTO arduino' + '(id, status, real_time, start_time, end_time)' + 'VALUES (?,?,?,?,?)';
    const values = [req.body.id, req.body.status, req.body.real_time, req.body.start_time, req.body.end_time];
    connection.query(sql, values, function (error, result) {
        if (error) {
            console.log(error);
            res.status(400).json({"status" : "400", message: error.message});
        } else {
            console.log('result', result);
            res.json({
                'status': 'success',
            });
        }
    });
});

