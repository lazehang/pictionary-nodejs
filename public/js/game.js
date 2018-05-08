// will move to room.js when done
$(() => {

    var socket = io();

    socket.on("both player ready", () => {
        game();
    });

    function game(){
        let keywords = ["apple", "dog", "house"];
        $("#keyword").html(keywords[0]);
    }

});