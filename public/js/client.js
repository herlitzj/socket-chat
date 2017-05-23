$(function() {
    var socket = io();
    var get_room = function() {
        var regex = /^\/(chats|direct_message)\/([\d\w]+)$/
        var path = window.location.pathname;
        var room = regex.exec(path)[2];
        return room;
    }

    $(window).load(function() {
        var objDiv = document.getElementById("scroll");
        objDiv.scrollTop = objDiv.scrollHeight;
    })
    
    $('#send_msg').click(function() {
        socket.emit('chat message', $('#msg_text').val());
        $('#msg_text').val('');
        return false;
    });
    
    $('#msg_text').keypress(function(e) {
        if (e.which == 13) {
            $('#send_msg').click();
        }
    });
    
    socket.on('connect', function() {
        socket.emit('room', get_room());
    });

    socket.on('chat message', function(data) {
        $('#chat_history').append(data.html);
        var objDiv = document.getElementById("scroll");
        objDiv.scrollTop = objDiv.scrollHeight;
    });

});
