var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({
    defaultLayout: 'main'
});

var bodyParser = require('body-parser');
var request = require('request');
var fs = require('fs');
var mysql = require('mysql');
var session = require('client-sessions');

app.use(session({
    cookieName: 'session',
    secret: 'cookie id',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
}));

var mysql_connection = mysql.createConnection({
    host: 'cs361.cdm64kabqtwv.us-west-2.rds.amazonaws.com',
    user: 'wcamiller',
    password: 'cs361projectb',
    database: 'eridanus'
})

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

var path = require('path');

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3007);
app.use(express.static('public'));
app.use(express.static(__dirname));

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
    res.render('login');
});

app.get('/chat', function(req, res) {
    res.render('chat');
});

io.on('connection', function(socket) {
    console.log("A user has connected.");
})

io.on('connection', function(socket) {

    socket.on('chat message', function(msg) {
        var date = new Date();
        var time_str = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        var source = fs.readFileSync("./views/layouts/chat_template.handlebars");
        var template = require("./views/layouts/chat_template.handlebars");
        var msg_data = {
            username: 'username',
            msg: msg,
            time: time_str
        };
        var html = template(msg_data);
        io.emit('chat message', {
            html: html
        });
    });
});

http.listen(app.get('port'), function() {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});