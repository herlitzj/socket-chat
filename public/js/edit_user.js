$(function() {

    $.validator.setDefaults({
        ignore: [],
    });

    $("#edit_user").validate({
        rules: {
            avatar_img: {
                extension: "png|gif|jpg|jpeg"
            },
            b64_data: {
                maxlength: 1048576
            }
        }
    });

    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $('#avatar_preview').attr('src', e.target.result);
                console.log(e.target.result.length);
                $("#b64_data").val(e.target.result);

            }
            reader.readAsDataURL(input.files[0]);
        }
    }

    $("#avatar").change(function() {
        readURL(this);
    });

});