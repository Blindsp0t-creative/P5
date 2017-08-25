

var loopNB = 0;
var mode = 1;
var img;
var originalPic;
var imgFileName = "testDataMosh";
var fileType = "jpg";
var brightnessValue = 60;
var column = 0;
var capture;
var w = 640,
    h = 480;
var live = 1;
var captured = 0;
var xStartGlitch;
var xStopGlitch;
var yStartGlitch;
var entireImage = 0;
var detector;
var classifier = objectdetect.frontalface;
var faces;

///////////////////////////////////////////////////////////////////////
function setup() {

    capture = createCapture(VIDEO);
    createCanvas(w, h);
    capture.size(w, h);
    capture.hide();

    background(0);
    createCanvas(w,h);

    img = new p5.Image(w,h);
    originalPic = new p5.Image(w,h);

    if(entireImage == 1)
        xStopGlitch = img.width-1;

    //Face Detection stuffs
    var scaleFactor = 2.0;
    detector = new objectdetect.detector(w, h, scaleFactor, classifier);

    select("#saveImg").hide();
    select("#restart").hide();

}


///////////////////////////////////////////////////////////////////////
function draw() {


    if(live == 0 && captured == 1)
    {
        // loop through columns
        while(column < xStopGlitch) {
            img.loadPixels(); 
            sortColumn();
            column++;
            img.updatePixels();
        }
        image(img, 0, 0, w, h);
    }

    if(live==1)
    {
        capture.loadPixels();
        image(capture, 0, 0, w, h);
    }
}


function clickTakePhoto()
{
    live = 0;
    if(captured == 0)
    {
        img.copy(capture,0,0,w,h,0,0,w,h);
        originalPic.copy(capture,0,0,w,h,0,0,w,h);
        img.loadPixels();

        faces = detector.detect(img.canvas);    
        console.log(faces.length);

        if (faces && entireImage == 0) {
            var nbFaces = 0;
            faces.forEach(function (face) {
                var count = face[4];
                if (count > 3) { 
                    nbFaces++;
                    xStartGlitch = face[0];
                    xStopGlitch = face[0]+face[2];
                    yStartGlitch = face[1];
                }
            })
        }
        if(nbFaces > 0)
        {
            console.log("face found");
        }
        else
        {
            //alert("no face found, please try again...");
            select('#info').elt.innerText = "no face found, glitched entire image ";
            entireImage = 1;
            xStartGlitch = 0;
            xStopGlitch = w;
            yStartGlitch = 0;
        }
        captured=1;
        if(entireImage == 0)
        {
            column = xStartGlitch;
        }
    }
    select("#takePhoto").hide();
    select("#saveImg").show();
    select("#restart").show();
}

function save2() {
    canvas.toBlob(function(blob) {
        saveAs(blob, "yourGlitchySelfie.png");
    });
}


///////////////////////////////////////////////////////////////////////
function sortColumn() {

    var x = column;
    var y;
    
    if(entireImage == 0)
    { y = yStartGlitch; }
    else
    { y = 0; }

    var yend = 0;
    loopNB++;
    while(yend < img.height-1) {
        switch(mode) {
            case 0:
                y = getFirstNotBlackY(x, y);
                yend = getNextBlackY(x, y);
                break;
            case 1:
                y = getFirstBrightY(x, y);
                yend = getNextDarkY(x, y);
                break;
            case 2:
                y = getFirstNotWhiteY(x, y);
                yend = getNextWhiteY(x, y);
                break;
            default:
                break;
                   }

        if(y < 0) break;
        var sortLength = yend-y;
        if(sortLength < 0) break;
        var unsorted = new Array([sortLength]) ; 
        var sorted = new Array([sortLength]) ;

        for(var i=0; i<sortLength; i++) {

            unsorted[i] = rgbToHex(getRedAt(x,y+i), getGreenAt(x,y+i), getGreenAt(x,y+i));
        }

        sorted = sort(unsorted, sortLength);

        for(var i=0; i<sortLength; i++) {
            img.set(x, (y+i), color("#" + sorted[i]));
        }
        img.updatePixels();
        y = yend+1;
    }
}


function getRedAt(x, y)
{    
    var index;
    if(y>0)
        index = parseInt(x + ((y) * img.width)) * 4;
    else
        index = parseInt(x*4);

    return img.pixels[index];
}

function getGreenAt(x, y)
{
    var index;
    if(y>0)
        index = parseInt(x + ((y) * img.width)) * 4;
    else
        index = parseInt(x*4);

    return img.pixels[index + 1];
}

function getBlueAt(x, y)
{
    var index;
    if(y>0)
        index = parseInt(x + ((y) * img.width)) * 4;
    else
        index = parseInt(x*4);

    return img.pixels[index + 2];
}

///////////////////////////////////////////////////////////////////////
function getFirstBrightY( x,  y) 
{
    var localY = y;
    var localX = x;

    if(localY >= img.height) {return -1;}

    while( max( getRedAt(x,localY),getGreenAt(x,localY),getBlueAt(x,localY)) < brightnessValue) {
        localY++; 
        if(localY >= img.height)
        {
            return -1;
        }
    }
    return localY;
}


///////////////////////////////////////////////////////////////////////
function getNextDarkY( x,  y) 
{
    var localY = y;
    var localX = x;

    localY++;

    if(localY >= img.height) {return img.height-1;}

    while( max( getRedAt(x,localY),getGreenAt(x,localY),getBlueAt(x,localY)) > brightnessValue) {
        localY++; 
        if(localY >= img.height)
            return img.height-1;
    }
    return (localY-1);
}


///////////////////////////////////////////////////////////////////////
function rgbToHex(r, g, b) 
{
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}


///////////////////////////////////////////////////////////////////////
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}