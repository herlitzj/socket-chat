
$(function() {
    var source = $("#chat_template").html();
    console.log($("#chat_template").val());
    var template = Handlebars.compile(source);
    var socket = io();
    $('#send_msg').click(function() {
        console.log("button clicked");
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
        console.log(data);
        $('#chat_history').append($(template(data)));
    });
});
