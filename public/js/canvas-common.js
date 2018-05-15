$(document).ready(chalkboard);

function chalkboard() {

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

    document.onselectstart = function () { return false; };
    ctx.fillStyle = rgbaColor;
    ctx.strokeStyle = rgbaColor;
    ctx.lineWidth = brushDiameter;
    ctx.lineCap = 'round';

    let patImg = document.getElementById('pattern');

    $(document).mousemove(function (evt) {
        mouseX = evt.pageX - $("#canvas-real").offset().left;
        mouseY = evt.pageY - $("#canvas-real").offset().top;
        if (mouseY < height && mouseX < width) {
            if (mouseD) {
                draw(mouseX, mouseY);
            }
        } else { }
    });
    $(document).mousedown(function (evt) {
        mouseD = true;
        mouseX = evt.pageX - $("#canvas-real").offset().left;
        mouseY = evt.pageY - $("#canvas-real").offset().top;
        xLast = mouseX;
        yLast = mouseY;
    });

    $(document).mouseup(function (evt) {
        mouseD = false;
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

    //right click mouse context menu to shut off
    // document.oncontextmenu = function () { return false; };

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

    //change chalk size and cursor

    $("#small").click(function () {
        brushDiameter = 10;
        $('.canvas').css('cursor', 'url(images/smallSize.png) 9 9, auto');
    })
    $("#big").click(function () {
        brushDiameter = 30;
        $('.canvas').css('cursor', 'url(images/bigSize.png) 26 26, auto');
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
    })



    // offset canvas

    $(".upper").offset({ top: 50, left: 50 })
    $("#color-picker").offset({ top: 540, left: 50 })
    $(".room").offset({ top: 90, left: 150 })



}

