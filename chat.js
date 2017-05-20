var express = require('express');
var routes = require('./routes/routes');

var ChatLine = require('./models/chat_line');
var chatLine = new ChatLine;

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
    limit: '5mb',
    extended: false
}));


app.use(bodyParser.json());

var path = require('path');

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', (process.env.PORT || 3007));
app.use('/public', express.static(path.join(__dirname, '/public')));

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
    var room = 'main';

    socket.on('room', function(rm) {
        socket.join(rm);
        room = rm;
    });

    socket.on('chat message', function(msg) {

        
        var date = new Date();
        var time_str = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        var template = require("./views/layouts/chat_template.handlebars");
        var msg_data = {
            username: socket.handshake.session.username,
            msg: msg,
            time: time_str,
            avatar: socket.handshake.session.avatar
        };
        var html = template(msg_data);
        var emit = function(err, result) {
            if (err) {
                console.log(err)
            } else {
                io.sockets.in(room).emit('chat message', {
                    html: html
                });
            }
        }
        var chat_line = {
            user_id: socket.handshake.session.user,
            chat_id: socket.handshake.session.chat_id,
            line_text: msg
        }
        chatLine.create(chat_line, emit)
    });
});

http.listen(app.get('port'), function() {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});