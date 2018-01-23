var canvas = document.getElementById('canvassample'),
    ctx = canvas.getContext('2d'),
    moveflg = 0,
    Xpoint,
    Ypoint;


 
//初期値（サイズ、色、アルファ値）の決定
var defSize = 7,
    defColor = "#555";
 
 
// ストレージの初期化
var myStorage = localStorage;
window.onload = initLocalStorage();
 
// PC対応
canvas.addEventListener('mousedown', startPoint, false);
canvas.addEventListener('mousemove', movePoint, false);
canvas.addEventListener('mouseup', endPoint, false);
// スマホ対応
canvas.addEventListener('touchstart', startPoint, false);
canvas.addEventListener('touchmove', movePoint, false);
canvas.addEventListener('touchend', endPoint, false);


function startPoint(e){
  e.preventDefault();
  ctx.beginPath();
 
  Xpoint = e.layerX;
  Ypoint = e.layerY;
   
  ctx.moveTo(Xpoint, Ypoint);
}
 
function movePoint(e){
  if(e.buttons === 1 || e.witch === 1 || e.type == 'touchmove')
  {
    Xpoint = e.layerX;
    Ypoint = e.layerY;
    moveflg = 1;
     
    ctx.lineTo(Xpoint, Ypoint);
    ctx.lineCap = "round";
    ctx.lineWidth = defSize * 2;
    ctx.strokeStyle = defColor;
    ctx.stroke();
     
  }
}
 
function endPoint(e)
{
 
    if(moveflg === 0)
    {
       ctx.lineTo(Xpoint-1, Ypoint-1);
       ctx.lineCap = "round";
       ctx.lineWidth = defSize * 2;
       ctx.strokeStyle = defColor;
       ctx.stroke();
        
    }
    moveflg = 0;
  setLocalStoreage();
}
 
function clearCanvas(){
    if(confirm('Canvasを初期化しますか？'))
    {
        initLocalStorage();
        temp = [];
        resetCanvas();
    }
}
 
function resetCanvas() {
    ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
    var ctx3 = document.getElementById("canvassample").getContext("2d");
    ctx3.drawImage(img2,0,0,600,600);
}
 
function chgImg()
{
  var jpg = canvas.toDataURL('image/jpeg');
  
  document.getElementById("newImg").src = jpg;
  return jpg.replace(/^.*,/, '')
}

function saveImg()
{
  var xmlHttpRequest = new XMLHttpRequest();
  xmlHttpRequest.onreadystatechange = function()
  {
    var READYSTATE_COMPLETED = 4;
    var HTTP_STATUS_OK = 200;

    if( this.readyState == READYSTATE_COMPLETED
      && this.status == HTTP_STATUS_OK )
    {
      // レスポンスの表示
      return true;
    }
  }
  xmlHttpRequest.open( 'POST', "http://0.0.0.0:4000/" );
  xmlHttpRequest.setRequestHeader( 'Content-Type', 'image/jpeg' );
  xmlHttpRequest.send( chgImg() );
  confirm('Thank you')
}
 
function initLocalStorage(){
    myStorage.setItem("__log", JSON.stringify([]));
}

function setLocalStoreage(){
    var png = canvas.toDataURL();
    var logs = JSON.parse(myStorage.getItem("__log"));
 
    setTimeout(function(){
        logs.unshift({png});
 
        myStorage.setItem("__log", JSON.stringify(logs));
 
        currentCanvas = 0;
        temp = [];
    }, 0);
}

 

 
function draw(src) {
    var img = new Image();
    img.src = src;
 
    img.onload = function() {
        ctx.drawImage(img, 0, 0);
    }
}
