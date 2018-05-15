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

    $(window).on('resize', function() {
        var halfWindow = $(window).width() / 2;
        var halfRoom = $('.room').width() / 2;

        var newOffset = (halfWindow - halfRoom);

        console.log(newOffset);
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
    document.onselectstart = function() { return false; };
    //right click mouse context menu to shut off
    document.oncontextmenu = function() { return false; };

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


    $("#chalkboard").mousemove(function(evt) {
        mouseX = evt.pageX - $("#canvas-real").offset().left;
        mouseY = evt.pageY - $("#canvas-real").offset().top;
        if (mouseD) {
            draw(mouseX, mouseY);
            socket.emit("draw", { mouseX: mouseX, mouseY: mouseY });
        }
    });

    $("#chalkboard").mousedown(function(evt) {
        mouseD = true;
        mouseX = evt.pageX - $("#canvas-real").offset().left;
        mouseY = evt.pageY - $("#canvas-real").offset().top;
        xLast = mouseX;
        yLast = mouseY;
        socket.emit("mouse down", { mouseX: mouseX, mouseY: mouseY });
    });

    $("#chalkboard").mouseup(function(evt) {
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
    $("#red").click(function() {
        rgbaColor = 'rgba(255,0,0,1)';
        socket.emit("change color", rgbaColor);
    })
    $("#orange").click(function() {
        rgbaColor = 'rgba(255,179,0,1)';
        socket.emit("change color", rgbaColor);
    })
    $("#yellow").click(function() {
        rgbaColor = 'rgba(255,251,0,1)';
        socket.emit("change color", rgbaColor);
    })
    $("#brown").click(function() {
        rgbaColor = 'rgba(122,67,0,1)';
        socket.emit("change color", rgbaColor);
    })
    $("#green").click(function() {
        rgbaColor = 'rgba(0,209,0,1)';
        socket.emit("change color", rgbaColor);
    })
    $("#light-blue").click(function() {
        rgbaColor = 'rgba(131,216,251,1)';
        socket.emit("change color", rgbaColor);
    })
    $("#blue").click(function() {
        rgbaColor = 'rgba(0,125,214,1)';
        socket.emit("change color", rgbaColor);
    })
    $("#light-red").click(function() {
        rgbaColor = 'rgba(255,126,121,1)';
        socket.emit("change color", rgbaColor);
    })
    $("#purple").click(function() {
        rgbaColor = 'rgba(148,33,147,1)';
        socket.emit("change color", rgbaColor);
    })
    $("#lighter-purple").click(function() {
        rgbaColor = 'rgba(255,101,255,1)';
        socket.emit("change color", rgbaColor);
    })
    $("#black").click(function() {
        rgbaColor = 'rgba(0,0,0,1)';
        socket.emit("change color", rgbaColor);
    })
    $("#white").click(function() {
        rgbaColor = 'rgba(255,255,255,1)';
        socket.emit("change color", rgbaColor);
    })
    $("#grey").click(function() {
        rgbaColor = 'rgba(162,165,169,1)';
        socket.emit("change color", rgbaColor);
    })

    //changeLineWidth
    $("#small").click(function() {
        brushDiameter = 10;
        socket.emit("brush size", brushDiameter);
    })
    $("#big").click(function() {
        brushDiameter = 30;
        socket.emit("brush size", brushDiameter);
    })

    //duster
    $("#duster").click(function() {
        rgbaColor = 'rgba(255,255,255,0)';
        duster(mouseX, mouseY);
        socket.emit("dust", { mouseX: mouseX, mouseY: mouseY, rgbaColor: rgbaColor });
    });

    // guessing
    $('#msgBox').submit(function() {
        socket.emit('submit guess', $('#m').val());
        $('#m').val('');
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

    socket.on('receive guess', function(data) {
        console.log(data)
        var keyword = 'apple';
        if (data == keyword) {
            alert('correct answer !!');
        } else {
            $('.chat').append($('<li>').text(data));
            $('.chat').scrollTop($('.chat').get(0).scrollHeight, -1);
        }
    });


}