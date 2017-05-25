function deleteChannel(id) {
    $.ajax({
      url: `/direct_message/${id}/deactivate`,
      method: "DELETE"
    })
    .fail(function() {
        console.log("Failed to delete user from direct message");
    })
    .done(function() {
        $("#channel-" + id).html("")
    });
}