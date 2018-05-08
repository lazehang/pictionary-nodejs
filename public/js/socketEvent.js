$(function () {

    var socket = io();

    $("#createRoom").on("click", function () {
        // boolean
        let private = $("#privateRoom").prop("checked");
        // string or null
        let password = $("#password").prop("value") || null;
        // replace above line with wtever u need
        // as long as i get the 2 value

        // ask server to create a new room
        let settings = {
            private: private,
            password: password
        };
        // console.log(settings.private);
        // console.log(settings.password);
        socket.emit("create room", settings)

    });

    $("#join").on('click', ".joinRoom", function () {
        // vvv as long as i get the unique ID of that room
        let roomID = $(this).data("roomID");
        console.log(roomID);

        socket.emit('join room', "someIDA");

    });

    $("#logout").on("click", () => {
        console.log("logout");
        socket.emit("logout");
    });

    socket.on("error", msg => {
        alert(msg);
    });

    $("#leave").on("click", () => {
        console.log("leave room");
        socket.emit("leave room", null);
    })
});