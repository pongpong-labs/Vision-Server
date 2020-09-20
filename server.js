const express = require("express");
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const async = require("async");


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
                    'status' : '200',
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
                    'status' : '200',
                    'result' : result
                }
            );
        }
    });
});


app.get("/api/subtitles", (req, res) => {
    connection.query("SELECT * FROM subtitles;",function (error, result) {
        if (error) {
            console.log(error);
            res.statis(400).json({message: error.message});
        } else {
            console.log('result', result);
            res.json({
                'status' : '200',
                'result' : result
            })
        }
    })
});


app.post("/api/beacon", (req, res) => {
    const sql = 'INSERT INTO beacon' + '(id, name, connect_time, disconnect_time, start_time, end_time, status)' + 'VALUES (?,?,?,?,?,?,?)';
    const values = [req.body.id, req.body.name, req.body.connect_time, req.body.disconnect_time, req.body.start_time, req.body.end_time, req.body.status];
    connection.query(sql, values, function (error, result) {
            if (error) {
                console.log(error);
                res.status(400).json({message: error.message});
            } else {
                console.log('result', result);
                res.json({
                        'status_code' : '200',
                        'status' : req.body.status,
                        'id' : req.body.id,
                        'connect_time' : req.body.connect_time,
                        'disconnect_time' : req.body.disconnect_time,
                        'start_time' : req.body.start_time,
                        'end_time' : req.body.end_time
                    }
                );
            }
        }
    );
});

app.post("/api/arduino", (req, res) => {
    const sql = 'INSERT INTO arduino' + '(id, real_time)' + 'VALUES (?,?)';
    const values = [req.body.id, req.body.real_time];
    connection.query(sql, values, function (error, result) {
        if (error) {
            console.log(error);
            res.status(400).json({"status" : "400", message: error.message});
        } else {
            console.log('result', result);
            res.json({
                'status_code' : '200',
                'real_time' : req.body.real_time,
            });
        }
    });
});

app.put("/api/beacon/:id", function(req, res) {
    let result = {};
    let id = null;
    async.waterfall([
            function(callback) {
                id = mysql.escape(parseInt(req.params.id));
                callback();
            },
            function(callback) {
                if (id === undefined) {
                    callback(new Error("Id is empty."));
                } else {
                    connection.getConnection(function(err, conn) {
                        const sql = "UPDATE beacon SET name = ?, connect_time = ?, disconnect_time = ?, start_time = ?, end_time = ?, status = ? WHERE id= " + id + ";";
                        let param = [req.body.name, req.body.connect_time, req.body.disconnect_time, req.body.start_time, req.body.end_time, req.body.status];
                        console.log("SQL: " + sql);

                        conn.query(sql, param, function(err) {
                            if (err) {
                                conn.release();
                                callback(err);
                            } else {
                                conn.release();
                                callback();
                            }
                        });
                    });
                }
            }],
        function(err) {
            result = returnResult(err, res)
            result.status = res.statusCode;
            res.send(result);
        });
    });

app.put("/api/arduino/:id", function(req, res) {
    let result = {};
    let id = null;
    async.waterfall([
            function(callback) {
                id = mysql.escape(parseInt(req.params.id));
                callback();
            },
            function(callback) {
                if (id === undefined) {
                    callback(new Error("Id is empty."));
                } else {
                    connection.getConnection(function(err, conn) {
                        const sql = "UPDATE arduino SET real_time = ? WHERE id= " + id + ";";
                        const param = [req.body.real_time];
                        console.log("SQL: " + sql);

                        conn.query(sql, param, function(err) {
                            if (err) {
                                conn.release();
                                callback(err);
                            } else {
                                conn.release();
                                callback();
                            }
                        });
                    });
                }
            }],
        function(err) {
            result = returnResult(err, res)
            result.status = res.statusCode;
            res.send(result);
        });
});

let returnResult = function(err, res) {
    let result = {};
    if (err) {
        res.status(400);
        result.message = err.stack;
    } else {
        res.status(200);
        result.message = "Success";
    }
    return result;
}
