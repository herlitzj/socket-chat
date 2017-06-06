$(function() {

    $.validator.setDefaults({
        ignore: [],
    });

    $("#edit_user").validate({
        rules: {
            avatar_img: {
                extension: "png|gif|jpg|jpeg"
            },
            avatar: {
                maxlength: 1048576
            },
            password: {
                minlength: 6
            },
            confirmpassword: {
                //required: true,
                minlength: 6,
                equalTo: "#first-password"
            },
            email: {
                email: true
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