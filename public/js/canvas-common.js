// let canvasReal = document.getElementById('canvas-real');
// let contextReal = canvasReal.getContext('2d');
// let canvasDraft = document.getElementById('canvas-draft');
// let contextDraft = canvasDraft.getContext('2d');
// let currentFunction;
// let dragging = false;

// $('#canvas-draft').mousedown(function(e){
//     let mouseX = e.pageX - this.offsetLeft;
//     let mouseY = e.pageY - this.offsetTop;
//     currentFunction.onMouseDown([mouseX,mouseY],e);
//     dragging = true;
// });

// $('#canvas-draft').mousemove(function(e){
//     let mouseX = e.pageX - this.offsetLeft;
//     let mouseY = e.pageY - this.offsetTop;
//     if(dragging){
//         currentFunction.onDragging([mouseX,mouseY],e);
//     }
//     currentFunction.onMouseMove([mouseX,mouseY],e);
// });

// $('#canvas-draft').mouseup(function(e){
//     dragging = false;
//     let mouseX = e.pageX - this.offsetLeft;
//     let mouseY = e.pageY - this.offsetTop;
//     currentFunction.onMouseUp([mouseX,mouseY],e);
// });

// $('#canvas-draft').mouseleave(function(e){
//     dragging = false;
//     let mouseX = e.pageX - this.offsetLeft;
//     let mouseY = e.pageY - this.offsetTop;
//     currentFunction.onMouseLeave([mouseX,mouseY],e);
// });

// $('#canvas-draft').mouseenter(function(e){
//     let mouseX = e.pageX - this.offsetLeft;
//     let mouseY = e.pageY - this.offsetTop;
//     currentFunction.onMouseEnter([mouseX,mouseY],e);
// });

// class PaintFunction{
//     constructor(){}
//     onMouseDown(){}
//     onDragging(){}
//     onMouseMove(){}
//     onMouseUp(){}
//     onMouseLeave(){}
//     onMouseEnter(){}
// }


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
    // let offsetX = x;

    // $('#chalkboard').css('cursor', 'none');
    document.onselectstart = function () { return false; };
    ctx.fillStyle = rgbaColor;
    ctx.strokeStyle = rgbaColor;
    ctx.lineWidth = brushDiameter;
    ctx.lineCap = 'round';

    let patImg = document.getElementById('pattern');

    // document.addEventListener('touchmove', function (evt) {
    //     let touch = evt.touches[0];
    //     mouseX = touch.pageX;
    //     mouseY = touch.pageY;
    //     if (mouseY < height && mouseX < width) {
    //         evt.preventDefault();
    //         // $('.chalk').css('left', mouseX + 'px');
    //         // $('.chalk').css('top', mouseY + 'px');
    //         //$('.chalk').css('display', 'none');
    //         if (mouseD) {
    //             draw(mouseX, mouseY);
    //         }
    //     }
    // }, false);
    // document.addEventListener('touchstart', function (evt) {
    //     evt.preventDefault();
    //     let touch = evt.touches[0];
    //     mouseD = true;
    //     mouseX = touch.pageX;
    //     mouseY = touch.pageY;
    //     // xLast = mouseX;
    //     // yLast = mouseY;
    //     draw(mouseX + 1, mouseY + 1);
    // }, false);
    // document.addEventListener('touchend', function (evt) {
    //     mouseD = false;
    // }, false);
    // $('#chalkboard').css('cursor', 'none');
    // ctx.fillStyle = rgbaColor;
    // ctx.strokeStyle = rgbaColor;
    // ctx.lineWidth = brushDiameter;
    // ctx.lineCap = 'round';

    $(document).mousemove(function (evt) {        
        // mouseX = evt.pageX;
        // mouseY = evt.pageY;
        mouseX = evt.pageX - $("#canvas-real").offset().left;
        mouseY = evt.pageY - $("#canvas-real").offset().top;
        if (mouseY < height && mouseX < width) {
            // $('.chalk').css('left', (mouseX - 0.5 * brushDiameter) + 'px');
            // $('.chalk').css('top', (mouseY - 0.5 * brushDiameter) + 'px');
            if (mouseD) {
                // if (eraser) {
                //     erase(mouseX, mouseY);
                // } else {
                    draw(mouseX, mouseY);
                // }
            }
        } else {
            // $('.chalk').css('top', height - 10);
        }
    });
    $(document).mousedown(function (evt) {
        mouseD = true;
        mouseX = evt.pageX - $("#canvas-real").offset().left;
        mouseY = evt.pageY - $("#canvas-real").offset().top;
        xLast = mouseX;
        yLast = mouseY;
        console.log(mouseX)
        console.log(mouseY)
        // mouseX = evt.pageX - evt.offsetLeft;
        // mouseY = evt.pageY - evt.offsetTop;
        // if (evt.button == 2) {
        //     erase(mouseX, mouseY);
        //     eraser = true;
        //     $('.chalk').addClass('eraser');
        // } else {
        //     if (!$('.panel').is(':hover')) {
        //         draw(mouseX + 1, mouseY + 1);
        //     }
        // }
    });

    $(document).mouseup(function (evt) {
        mouseD = false;
        // if (evt.button == 2) {
        //     eraser = false;
        //     $('.chalk').removeClass('eraser');
        // }
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
    document.oncontextmenu = function () { return false; };

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

    // function erase(x, y) {
    //     ctx.clearRect(x - 0.5 * eraserWidth, y - 0.5 * eraserHeight, eraserWidth, eraserHeight);
    // }

    // $('.link').click(function(evt){

    // 	$('.download').remove();

    // 	var imgCanvas = document.createElement('canvas');
    // 	var imgCtx = imgCanvas.getContext("2d");
    // 	var pattern = imgCtx.createPattern(patImg,'repeat');

    // 	imgCanvas.width = width;
    // 	imgCanvas.height = height;

    // 	imgCtx.fillStyle = pattern;
    // 	imgCtx.rect(0,0,width,height);
    // 	imgCtx.fill();


    // 	var layimage = new Image;
    // 	layimage.src = canvas.toDataURL("image/png");

    // 	setTimeout(function(){

    // 		imgCtx.drawImage(layimage,0,0);

    // 		var compimage = imgCanvas.toDataURL("image/png");//.replace('image/png','image/octet-stream');

    // 		$('.panel').append('<a href="'+compimage+'" download="chalkboard.png" class="download">Download</a>');
    // 		$('.download').click(function(){
    // 			IEsave(compimage);
    // 		});

    // 	}, 500);


    // });

    // function IEsave(ctximage){
    // 	setTimeout(function(){
    // 		var win = window.open();
    // 		$(win.document.body).html('<img src="'+ctximage+'" name="chalkboard.png">');
    // 	},500);
    // }

    // $(window).resize(function(){
    // 	chalkboard();
    // });

    //Color change

    $("#red").click(function () {
        rgbaColor = 'rgba(255,0,0,1)';
        draw(mouseX, mouseY);
    })
    $("#orange").click(function () {
        rgbaColor = 'rgba(255,179,0,1)';
        draw(mouseX, mouseY);
    })
    $("#yellow").click(function () {
        rgbaColor = 'rgba(255,251,0,1)';
        draw(mouseX, mouseY);
    })
    $("#brown").click(function () {
        rgbaColor = 'rgba(122,67,0,1)';
        draw(mouseX, mouseY);
    })
    $("#green").click(function () {
        rgbaColor = 'rgba(0,209,0,1)';
        draw(mouseX, mouseY);
    })
    $("#light-blue").click(function () {
        rgbaColor = 'rgba(131,216,251,1)';
        draw(mouseX, mouseY);
    })
    $("#blue").click(function () {
        rgbaColor = 'rgba(0,125,214,1)';
        draw(mouseX, mouseY);
    })
    $("#light-red").click(function () {
        rgbaColor = 'rgba(255,126,121,1)';
        draw(mouseX, mouseY);
    })
    $("#purple").click(function () {
        rgbaColor = 'rgba(148,33,147,1)';
        draw(mouseX, mouseY);
    })
    $("#lighter-purple").click(function () {
        rgbaColor = 'rgba(255,101,255,1)';
        draw(mouseX, mouseY);
    })
    $("#black").click(function () {
        rgbaColor = 'rgba(0,0,0,1)';
        draw(mouseX, mouseY);
    })
    $("#white").click(function () {
        rgbaColor = 'rgba(255,255,255,1)';
        draw(mouseX, mouseY);
    })
    $("#grey").click(function () {
        rgbaColor = 'rgba(162,165,169,1)';
        draw(mouseX, mouseY);
    })


    //changeLineWidth

    $("#small").click(function () {
        brushDiameter = 10;
    })
    $("#big").click(function () {
        brushDiameter = 30;
    })

    //duster

    $("#duster").click(function () {
        console.log("duster1");
        rgbaColor = 'rgba(255,255,255,0)';
        // duster(mouseX, mouseY);
        function duster(x, y) {
            console.log("duster2");          
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
            console.log("duster3");
        }
        duster(mouseX, mouseY);


    })



    // offset canvas

    $(".upper").offset({ top: 50, left: 50 })
    $("#color-picker").offset({ top: 540, left: 50 })
    $(".room").offset({ top: 90, left: 150 })

}

