$(function() {

    $('.chat').niceScroll();

    var socket = io();
    $("#rmBtn").on('click', ".joinRm", function() {
        $(".chat-body").removeClass("hide");
        socket.emit('leaveRm', "leaveRm");
        let rm = $(this).html();
        console.log(rm)
        socket.emit('subscribe', rm);
    });

    $('#leave-room').on('click', function() {
        socket.emit('leaveRm', 'leaveRm');
        $(".chat-body").addClass("hide");
    })

    socket.on('join room', function(msg) {
        $('#chat-messages').empty();
        $('#chat-messages').append(`<div class="answer left">
        <div class="avatar">
          <img src="https://pbs.twimg.com/profile_images/378800000432816237/7d7e912287eae6baec89463e4babbb84_400x400.jpeg" alt="">
          <div class="status online"></div>
        </div>
        <div class="text">
          ${msg}
        </div>
      </div>`);
    });

    $('#send-message').click(function() {
        socket.emit('chat message', $('#m').val());
        console.log($('#m').val());
        $('#m').val('');
        return false;
    });

    socket.on('chat message', function(msg) {
        console.log(`received: ${msg}`);
        $('#chat-messages').append(`<div class="answer left">
        <div class="avatar">
          <img src="https://pbs.twimg.com/profile_images/378800000432816237/7d7e912287eae6baec89463e4babbb84_400x400.jpeg" alt="">
          <div class="status online"></div>
        </div>
        <div class="name">${msg.user}</div>
        <div class="text">
          ${msg.msg}
        </div>
      </div>`);

        $('.chat').scrollTop($('.chat').get(0).scrollHeight, -1);

    });

    socket.on('old message', function(msg) {
        console.log(`received old msg: ${msg}`)
        msg.forEach(element => {
            let parsed = JSON.parse(element);
            $('#chat-messages').append(`
            <div class="answer left">
                <div class="avatar">
                <img src="https://pbs.twimg.com/profile_images/378800000432816237/7d7e912287eae6baec89463e4babbb84_400x400.jpeg" alt="">
                <div class="status offline"></div>
                </div>
                <div class="name">${parsed.user}</div>
                <div class="text">
                ${parsed.msg}
                </div>
            </div>`);
        });

        $('.chat').scrollTop($('.chat').get(0).scrollHeight, -1);
    });

});

// axios.get('/stats')
//     .then(function(res) {
//         console.log(res.data);

//     }).catch(function(err) {
//         alert(err);
//     })