var express = require('express');
var routes = require('./routes/routes');

var app = express();
var handlebars = require('express-handlebars').create({
    defaultLayout: 'main'
});

var bodyParser = require('body-parser');
var request = require('request');
var fs = require('fs');

var session = require('express-session')({
    secret: 'cookie id',
    cookie: {
        maxAge: Date.now() + (30 * 86400 * 1000),
    },
    saveUninitialized: true,
    resave: false
});

var sharedsession = require("express-socket.io-session");

app.use(session);


app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

var path = require('path');

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', (process.env.PORT || 3007));
app.use(express.static('public'));
app.use(express.static(__dirname));

var http = require('http').Server(app);
var io = require('socket.io')(http);

io.use(sharedsession(session, {
    autoSave: true
}));

// Load routes
app.use('/', routes)
app.use(redirectUnmatched); // handle all unhandled routes
function redirectUnmatched(req, res) {
  res.redirect("/");
}



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
            username: socket.handshake.session.username,
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