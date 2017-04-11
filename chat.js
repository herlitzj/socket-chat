var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({
    defaultLayout: 'main'
});

var bodyParser = require('body-parser');
var request = require('request');
//var mysql = require('mysql');
//var session = require('client-sessions');

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
    res.render('layouts/landing')
});

app.get('/chat', function(req, res) {
    res.render('layouts/chat_template');
});

app.use(redirectUnmatched);

function redirectUnmatched(req, res) {
  res.redirect("/");
}

io.on('connection', function(socket) {
    console.log("A user has connected.");
})

io.on('connection', function(socket) {

    socket.on('chat message', function(msg) {
        var date = new Date();
        var str = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        io.emit('chat message', {
            username: 'username',
            msg: msg,
            time: str
        });
    });
});

http.listen(app.get('port'), function() {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});