$(function() {
    var socket = io();
    $(window).load(function() {
        console.log("SCROLL READY!!!")
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
    socket.on('chat message', function(data) {
        $('#chat_history').append(data.html);
        var objDiv = document.getElementById("scroll");
        objDiv.scrollTop = objDiv.scrollHeight;
    });
});
