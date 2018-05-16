// canvas-common + game logic


$(document).ready(chalkboard);

$(".chat").niceScroll();
$("#ranking").niceScroll();


function chalkboard() {

    var socket = io();

    let canvasReal = document.getElementById('canvas-real');
    let contextReal = canvasReal.getContext('2d');

    let canvas = document.getElementById("chalkboard");
    let ctx = canvas.getContext("2d");

    let width = 706;
    let height = 488;
    let mouseX = 0;
    let mouseY = 0;
    let mouseD = false;
    let eraser = false;
    let xLast = 0;
    let yLast = 0;
    let brushDiameter = 10;
    let rgbaColor = 'rgba(255,255,255,1)';

    // offset canvas
    $(".upper").offset({ top: 50, left: 50 })

    $(window).on('resize', function () {
        var halfWindow = $(window).width() / 2;
        var halfRoom = $('.room').width() / 2;

        var newOffset = (halfWindow - halfRoom);

        // console.log(newOffset);
        $(".room").offset({ top: 90, left: newOffset })
        $("#color-picker").offset({ top: 630, left: newOffset + 20 })

    })

    var halfWindow = $(window).width() / 2;
    var halfRoom = $('.room').width() / 2;

    var newOffset = (halfWindow - halfRoom);

    console.log(newOffset);
    $(".room").offset({ top: 90, left: newOffset })

    $("#color-picker").offset({ top: 630, left: newOffset + 20 })

    // $('#chalkboard').css('cursor', 'none');
    // document.onselectstart = function () { return false; };
    //right click mouse context menu to shut off
    // document.oncontextmenu = function () { return false; };

    ctx.fillStyle = rgbaColor;
    ctx.strokeStyle = rgbaColor;
    ctx.lineWidth = brushDiameter;
    ctx.lineCap = 'round';

    // page ready
    socket.emit("room page ready", null);

    // === for guesser ===
    socket.on("player guess", () => {
        $("#canvas-cover").css("z-index", 10);
        $("#color-picker").addClass("hide");
        $("#msgBox").removeClass("hide");
        $("#keyword").addClass("hide");
    });

    // === for drawer ===
    socket.on("player draw", () => {
        $("#canvas-cover").css("z-index", -1);
        $("#color-picker").removeClass("hide");
        $("#msgBox").addClass("hide");
        $("#keyword").removeClass("hide");
    });

    // use "C" to restart
    $(document).keyup(function (evt) {
        if (evt.keyCode == 67) {
            ctx.clearRect(0, 0, width, height);
            layPattern();
        }
    });

    $(document).keyup(function (evt) {
        if (evt.keyCode == 83) {
            changeLink();
        }
    });

    $("#chalkboard").mousemove(function (evt) {
        mouseX = evt.pageX - $("#canvas-real").offset().left;
        mouseY = evt.pageY - $("#canvas-real").offset().top;
        if (mouseD) {
            draw(mouseX, mouseY);
            socket.emit("draw", { mouseX: mouseX, mouseY: mouseY });
        }
    });

    $("#chalkboard").mousedown(function (evt) {
        mouseD = true;
        mouseX = evt.pageX - $("#canvas-real").offset().left;
        mouseY = evt.pageY - $("#canvas-real").offset().top;
        xLast = mouseX;
        yLast = mouseY;
        socket.emit("mouse down", { mouseX: mouseX, mouseY: mouseY });
    });

    $("#chalkboard").mouseup(function (evt) {
        mouseD = false;
        socket.emit("mouse up");
    });

    function draw(x, y) {
        ctx.strokeStyle = rgbaColor;
        ctx.lineWidth = brushDiameter;
        ctx.beginPath();
        ctx.moveTo(xLast, yLast);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Chalk Effect
        let length = Math.round(Math.sqrt(Math.pow(x - xLast, 2) + Math.pow(y - yLast, 2)) / (5 / brushDiameter));
        let xUnit = (x - xLast) / length;
        let yUnit = (y - yLast) / length;
        for (let i = 0; i < length; i++) {
            let xCurrent = xLast + (i * xUnit);
            let yCurrent = yLast + (i * yUnit);
            let xRandom = xCurrent + (Math.random() - 0.5) * brushDiameter;
            let yRandom = yCurrent + (Math.random() - 0.5) * brushDiameter;
            ctx.clearRect(xRandom, yRandom, Math.random() * 3 + 2, Math.random() + 1);
        }
        xLast = x;
        yLast = y;
    }

    function duster(x, y) {
        ctx.strokeStyle = rgbaColor;
        ctx.lineWidth = brushDiameter;
        ctx.beginPath();
        ctx.moveTo(xLast, yLast);
        ctx.lineTo(x, y);
        ctx.stroke();
        // Chalk Effect
        let length1 = Math.round(Math.sqrt(Math.pow(x - xLast, 2) + Math.pow(y - yLast, 2)) / (5 / brushDiameter));
        let xUnit1 = (x - xLast) / length1;
        let yUnit1 = (y - yLast) / length1;
        for (let i = 0; i < length1; i++) {
            let xCurrent1 = xLast + (i * xUnit1);
            let yCurrent1 = yLast + (i * yUnit1);
            let xRandom1 = xCurrent1 + (Math.random() - 0.5) * brushDiameter;
            let yRandom1 = yCurrent1 + (Math.random() - 0.5) * brushDiameter;
            ctx.clearRect(xRandom1, yRandom1, Math.random() * 3 + 2, Math.random() + 1);
        }
        xLast = x;
        yLast = y;
    }

    //Color change
    $("#red").click(function () {
        rgbaColor = 'rgba(255,0,0,1)';
        socket.emit("change color", rgbaColor);
    })
    $("#orange").click(function () {
        rgbaColor = 'rgba(255,179,0,1)';
        socket.emit("change color", rgbaColor);
    })
    $("#yellow").click(function () {
        rgbaColor = 'rgba(255,251,0,1)';
        socket.emit("change color", rgbaColor);
    })
    $("#brown").click(function () {
        rgbaColor = 'rgba(122,67,0,1)';
        socket.emit("change color", rgbaColor);
    })
    $("#green").click(function () {
        rgbaColor = 'rgba(0,209,0,1)';
        socket.emit("change color", rgbaColor);
    })
    $("#light-blue").click(function () {
        rgbaColor = 'rgba(131,216,251,1)';
        socket.emit("change color", rgbaColor);
    })
    $("#blue").click(function () {
        rgbaColor = 'rgba(0,125,214,1)';
        socket.emit("change color", rgbaColor);
    })
    $("#light-red").click(function () {
        rgbaColor = 'rgba(255,126,121,1)';
        socket.emit("change color", rgbaColor);
    })
    $("#purple").click(function () {
        rgbaColor = 'rgba(148,33,147,1)';
        socket.emit("change color", rgbaColor);
    })
    $("#lighter-purple").click(function () {
        rgbaColor = 'rgba(255,101,255,1)';
        socket.emit("change color", rgbaColor);
    })
    $("#black").click(function () {
        rgbaColor = 'rgba(0,0,0,1)';
        socket.emit("change color", rgbaColor);
    })
    $("#white").click(function () {
        rgbaColor = 'rgba(255,255,255,1)';
        socket.emit("change color", rgbaColor);
    })
    $("#grey").click(function () {
        rgbaColor = 'rgba(162,165,169,1)';
        socket.emit("change color", rgbaColor);
    })

    $("#red").click(function () {
        rgbaColor = 'rgba(255,0,0,1)';
        $("#red").css({ 'opacity': 0 });
        $("#orange").css({ 'opacity': 1 });
        $("#yellow").css({ 'opacity': 1 });
        $("#brown").css({ 'opacity': 1 });
        $("#green").css({ 'opacity': 1 });
        $("#light-blue").css({ 'opacity': 1 });
        $("#blue").css({ 'opacity': 1 });
        $("#light-red").css({ 'opacity': 1 });
        $("#purple").css({ 'opacity': 1 });
        $("#lighter-purple").css({ 'opacity': 1 });
        $("#black").css({ 'opacity': 1 });
        $("#white").css({ 'opacity': 1 });
        $("#grey").css({ 'opacity': 1 });
        $("#duster").css({ 'opacity': 1 });
    })
    $("#orange").click(function () {
        rgbaColor = 'rgba(255,179,0,1)';
        $("#red").css({ 'opacity': 1 });
        $("#orange").css({ 'opacity': 0 });
        $("#yellow").css({ 'opacity': 1 });
        $("#brown").css({ 'opacity': 1 });
        $("#green").css({ 'opacity': 1 });
        $("#light-blue").css({ 'opacity': 1 });
        $("#blue").css({ 'opacity': 1 });
        $("#light-red").css({ 'opacity': 1 });
        $("#purple").css({ 'opacity': 1 });
        $("#lighter-purple").css({ 'opacity': 1 });
        $("#black").css({ 'opacity': 1 });
        $("#white").css({ 'opacity': 1 });
        $("#grey").css({ 'opacity': 1 });
        $("#duster").css({ 'opacity': 1 });
    })
    $("#yellow").click(function () {
        rgbaColor = 'rgba(255,251,0,1)';
        $("#red").css({ 'opacity': 1 });
        $("#orange").css({ 'opacity': 1 });
        $("#yellow").css({ 'opacity': 0 });
        $("#brown").css({ 'opacity': 1 });
        $("#green").css({ 'opacity': 1 });
        $("#light-blue").css({ 'opacity': 1 });
        $("#blue").css({ 'opacity': 1 });
        $("#light-red").css({ 'opacity': 1 });
        $("#purple").css({ 'opacity': 1 });
        $("#lighter-purple").css({ 'opacity': 1 });
        $("#black").css({ 'opacity': 1 });
        $("#white").css({ 'opacity': 1 });
        $("#grey").css({ 'opacity': 1 });
        $("#duster").css({ 'opacity': 1 });
    })
    $("#brown").click(function () {
        rgbaColor = 'rgba(122,67,0,1)';
        $("#red").css({ 'opacity': 1 });
        $("#orange").css({ 'opacity': 1 });
        $("#yellow").css({ 'opacity': 1 });
        $("#brown").css({ 'opacity': 0 });
        $("#green").css({ 'opacity': 1 });
        $("#light-blue").css({ 'opacity': 1 });
        $("#blue").css({ 'opacity': 1 });
        $("#light-red").css({ 'opacity': 1 });
        $("#purple").css({ 'opacity': 1 });
        $("#lighter-purple").css({ 'opacity': 1 });
        $("#black").css({ 'opacity': 1 });
        $("#white").css({ 'opacity': 1 });
        $("#grey").css({ 'opacity': 1 });
        $("#duster").css({ 'opacity': 1 });
    })
    $("#green").click(function () {
        rgbaColor = 'rgba(0,209,0,1)';
        $("#red").css({ 'opacity': 1 });
        $("#orange").css({ 'opacity': 1 });
        $("#yellow").css({ 'opacity': 1 });
        $("#brown").css({ 'opacity': 1 });
        $("#green").css({ 'opacity': 0 });
        $("#light-blue").css({ 'opacity': 1 });
        $("#blue").css({ 'opacity': 1 });
        $("#light-red").css({ 'opacity': 1 });
        $("#purple").css({ 'opacity': 1 });
        $("#lighter-purple").css({ 'opacity': 1 });
        $("#black").css({ 'opacity': 1 });
        $("#white").css({ 'opacity': 1 });
        $("#grey").css({ 'opacity': 1 });
        $("#duster").css({ 'opacity': 1 });
    })
    $("#light-blue").click(function () {
        rgbaColor = 'rgba(131,216,251,1)';
        $("#red").css({ 'opacity': 1 });
        $("#orange").css({ 'opacity': 1 });
        $("#yellow").css({ 'opacity': 1 });
        $("#brown").css({ 'opacity': 1 });
        $("#green").css({ 'opacity': 1 });
        $("#light-blue").css({ 'opacity': 0 });
        $("#blue").css({ 'opacity': 1 });
        $("#light-red").css({ 'opacity': 1 });
        $("#purple").css({ 'opacity': 1 });
        $("#lighter-purple").css({ 'opacity': 1 });
        $("#black").css({ 'opacity': 1 });
        $("#white").css({ 'opacity': 1 });
        $("#grey").css({ 'opacity': 1 });
        $("#duster").css({ 'opacity': 1 });
    })
    $("#blue").click(function () {
        rgbaColor = 'rgba(0,125,214,1)';
        $("#red").css({ 'opacity': 1 });
        $("#orange").css({ 'opacity': 1 });
        $("#yellow").css({ 'opacity': 1 });
        $("#brown").css({ 'opacity': 1 });
        $("#green").css({ 'opacity': 1 });
        $("#light-blue").css({ 'opacity': 1 });
        $("#blue").css({ 'opacity': 0 });
        $("#light-red").css({ 'opacity': 1 });
        $("#purple").css({ 'opacity': 1 });
        $("#lighter-purple").css({ 'opacity': 1 });
        $("#black").css({ 'opacity': 1 });
        $("#white").css({ 'opacity': 1 });
        $("#grey").css({ 'opacity': 1 });
        $("#duster").css({ 'opacity': 1 });
    })
    $("#light-red").click(function () {
        rgbaColor = 'rgba(255,126,121,1)';
        $("#red").css({ 'opacity': 1 });
        $("#orange").css({ 'opacity': 1 });
        $("#yellow").css({ 'opacity': 1 });
        $("#brown").css({ 'opacity': 1 });
        $("#green").css({ 'opacity': 1 });
        $("#light-blue").css({ 'opacity': 1 });
        $("#blue").css({ 'opacity': 1 });
        $("#light-red").css({ 'opacity': 0 });
        $("#purple").css({ 'opacity': 1 });
        $("#lighter-purple").css({ 'opacity': 1 });
        $("#black").css({ 'opacity': 1 });
        $("#white").css({ 'opacity': 1 });
        $("#grey").css({ 'opacity': 1 });
        $("#duster").css({ 'opacity': 1 });
    })
    $("#purple").click(function () {
        rgbaColor = 'rgba(148,33,147,1)';
        $("#red").css({ 'opacity': 1 });
        $("#orange").css({ 'opacity': 1 });
        $("#yellow").css({ 'opacity': 1 });
        $("#brown").css({ 'opacity': 1 });
        $("#green").css({ 'opacity': 1 });
        $("#light-blue").css({ 'opacity': 1 });
        $("#blue").css({ 'opacity': 1 });
        $("#light-red").css({ 'opacity': 1 });
        $("#purple").css({ 'opacity': 0 });
        $("#lighter-purple").css({ 'opacity': 1 });
        $("#black").css({ 'opacity': 1 });
        $("#white").css({ 'opacity': 1 });
        $("#grey").css({ 'opacity': 1 });
        $("#duster").css({ 'opacity': 1 });
    })
    $("#lighter-purple").click(function () {
        rgbaColor = 'rgba(255,101,255,1)';
        $("#red").css({ 'opacity': 1 });
        $("#orange").css({ 'opacity': 1 });
        $("#yellow").css({ 'opacity': 1 });
        $("#brown").css({ 'opacity': 1 });
        $("#green").css({ 'opacity': 1 });
        $("#light-blue").css({ 'opacity': 1 });
        $("#blue").css({ 'opacity': 1 });
        $("#light-red").css({ 'opacity': 1 });
        $("#purple").css({ 'opacity': 1 });
        $("#lighter-purple").css({ 'opacity': 0 });
        $("#black").css({ 'opacity': 1 });
        $("#white").css({ 'opacity': 1 });
        $("#grey").css({ 'opacity': 1 });
        $("#duster").css({ 'opacity': 1 });
    })
    $("#black").click(function () {
        rgbaColor = 'rgba(0,0,0,1)';
        $("#red").css({ 'opacity': 1 });
        $("#orange").css({ 'opacity': 1 });
        $("#yellow").css({ 'opacity': 1 });
        $("#brown").css({ 'opacity': 1 });
        $("#green").css({ 'opacity': 1 });
        $("#light-blue").css({ 'opacity': 1 });
        $("#blue").css({ 'opacity': 1 });
        $("#light-red").css({ 'opacity': 1 });
        $("#purple").css({ 'opacity': 1 });
        $("#lighter-purple").css({ 'opacity': 1 });
        $("#black").css({ 'opacity': 0 });
        $("#white").css({ 'opacity': 1 });
        $("#grey").css({ 'opacity': 1 });
        $("#duster").css({ 'opacity': 1 });
    })
    $("#white").click(function () {
        rgbaColor = 'rgba(255,255,255,1)';
        $("#red").css({ 'opacity': 1 });
        $("#orange").css({ 'opacity': 1 });
        $("#yellow").css({ 'opacity': 1 });
        $("#brown").css({ 'opacity': 1 });
        $("#green").css({ 'opacity': 1 });
        $("#light-blue").css({ 'opacity': 1 });
        $("#blue").css({ 'opacity': 1 });
        $("#light-red").css({ 'opacity': 1 });
        $("#purple").css({ 'opacity': 1 });
        $("#lighter-purple").css({ 'opacity': 1 });
        $("#black").css({ 'opacity': 1 });
        $("#white").css({ 'opacity': 0 });
        $("#grey").css({ 'opacity': 1 });
        $("#duster").css({ 'opacity': 1 });
    })
    $("#grey").click(function () {
        rgbaColor = 'rgba(162,165,169,1)';
        $("#red").css({ 'opacity': 1 });
        $("#orange").css({ 'opacity': 1 });
        $("#yellow").css({ 'opacity': 1 });
        $("#brown").css({ 'opacity': 1 });
        $("#green").css({ 'opacity': 1 });
        $("#light-blue").css({ 'opacity': 1 });
        $("#blue").css({ 'opacity': 1 });
        $("#light-red").css({ 'opacity': 1 });
        $("#purple").css({ 'opacity': 1 });
        $("#lighter-purple").css({ 'opacity': 1 });
        $("#black").css({ 'opacity': 1 });
        $("#white").css({ 'opacity': 1 });
        $("#grey").css({ 'opacity': 0 });
        $("#duster").css({ 'opacity': 1 });
    })

    //changeLineWidth
    $("#small").click(function () {
        brushDiameter = 10;
        $('.canvas').css('cursor', 'url(images/smallSize.png) 9 9, auto');
        socket.emit("brush size", brushDiameter);
    })
    $("#big").click(function () {
        brushDiameter = 30;
        $('.canvas').css('cursor', 'url(images/bigSize.png) 26 26, auto');
        socket.emit("brush size", brushDiameter);
    })

    //duster
    $("#duster").click(function () {
        rgbaColor = 'rgba(255,255,255,0)';
        $("#red").css({ 'opacity': 1 });
        $("#orange").css({ 'opacity': 1 });
        $("#yellow").css({ 'opacity': 1 });
        $("#brown").css({ 'opacity': 1 });
        $("#green").css({ 'opacity': 1 });
        $("#light-blue").css({ 'opacity': 1 });
        $("#blue").css({ 'opacity': 1 });
        $("#light-red").css({ 'opacity': 1 });
        $("#purple").css({ 'opacity': 1 });
        $("#lighter-purple").css({ 'opacity': 1 });
        $("#black").css({ 'opacity': 1 });
        $("#white").css({ 'opacity': 1 });
        $("#grey").css({ 'opacity': 1 });
        $("#duster").css({ 'opacity': 0 });
        duster(mouseX, mouseY);
        socket.emit("dust", { mouseX: mouseX, mouseY: mouseY, rgbaColor: rgbaColor });
    });

    // guessing
    $('#msgBox').submit(function () {
        socket.emit('submit guess', $('#m').val());
        return false;
    });

    // ===========================================================
    // === receiving end ===
    socket.on("change color", color => {
        rgbaColor = color;
    });

    socket.on("brush size", size => {
        brushDiameter = size;
    });

    socket.on("mouse up", () => {
        mouseD = false;
    });

    socket.on("mouse down", data => {
        mouseD = true;
        mouseX = data.mouseX;
        mouseY = data.mouseY;
        xLast = mouseX;
        yLast = mouseY;
    });

    socket.on("draw", data => {
        draw(data.mouseX, data.mouseY);
    });

    socket.on("dust", data => {
        rgbaColor = data.rgbaColor;
        duster(data.mouseX, data.mouseY);
    });

    socket.on('receive guess', function (data) {
        // console.log(data)
        $('.chat').append($('<li style="color: #ffffff;">').text(data));
    });

    // === game logic ===
    socket.on("both player ready", () => {
        game();
    });

    let keywords = ["apple", "dog", "house"];
    let i = 0;
    let round = 1;
    let win = 0;
    let point = 0;
    let stopTimer;

    function game() {
        setTimerDisplay();
        $("#start").removeClass("hide");
    }

    function startRound() {
        // guesser wont see this coz .hide
        $("#keyword").text(keywords[i]);
        ctx.clearRect(0, 0, 706, 488);
        stopTimer = false;
        console.log("start round");
        startTimer();
    }

    function win_round() {
        stopTimer = true;
        socket.emit("win round");
    }

    function lose_round() {
        // socket.emit("lose round");
        finishRound("lose");
    }

    socket.on("start round", () => {
        startRound();
    });

    socket.on("win round", () => {
        finishRound("win");
    });

    // socket.on("lose round", () => {
    //     finishRound("lose");
    // });

    function finishRound(stat) {
        if (stat == "win") {
            round++;
            i++;
            point++;
            win++;
        }
        else if (stat == "lose") {
            round++;
            i++;
        }
        console.log(round)
        if (round <= 3) {
            endRoundDisplay();
        }
        else {
            endGameDisplay();
        }
    }

    function endRoundDisplay(result) {
        $("#next").removeClass("hide");
        // move ^this to middle and add a like "you lose"
        // move ^this to middle and add a like "you win"
    }

    function endGameDisplay(result) {
        $("#toLobbyForm").removeClass("hide");
        $("#toLobby").removeClass("hide");
        // some code to make a pop up
        // + ok btn to return to lobby , will trigger socket
    }

    function startTimer() {
        if (!stopTimer) {
            var presentTime = $('#timer').html();
            var timeArray = presentTime.split(/[:]+/);
            var m = timeArray[0];
            var s = checkSecond((timeArray[1] - 1));
            if (s == 59) { m = m - 1 }
            if (m < 0) {
                stopTimer = true;
                lose_round();
            }
            else {
                $('#timer').html(m + ":" + s);
                setTimeout(startTimer, 1000);
            }
        }
    }

    function checkSecond(sec) {
        if (sec < 10 && sec >= 0) { sec = "0" + sec }; // add zero in front of numbers < 10
        if (sec < 0) { sec = "59" };
        return sec;
    }

    function setTimerDisplay() {
        $('#timer').html(`00 : 30`);
    }


    // tells players game start
    $("#button-form").on("click", "#start", () => {
        $("#start").addClass("hide");
        socket.emit("round ready");
    });

    $("#button-form").on("click", "#next", () => {
        socket.emit("round ready");
        $("#next").addClass("hide");
        $("#keyword").empty();
        ctx.clearRect(0, 0, 706, 488);
        setTimerDisplay();
    });

    // monitor chat box for correct answer
    $('#msgBox').submit(() => {
        let ans = $('#m').val().toLowerCase();
        if (ans == keywords[i]) {
            win_round();
        }
        $('#m').val('');
    });

    $("#timerAndStart").on("click", "#toLobby", () => {
        // appear on end game
        socket.emit("leave room");
    });
}