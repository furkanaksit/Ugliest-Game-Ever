
"use strict";

var gl;
var mouseX = 0.0, mouseY = 0.0, xpos=-0.9;
var program;
var program2;
var angle = 0.0;
var speed = 0.0;
var centers=[], star_vertices=[], star_colors=[];
var num_stars=10;
var lvlcount = 1;
var stars = 0;
var frameCount = 0;


function getMousePos(canvas, evt) {
		var rect = canvas.getBoundingClientRect();

        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
}

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );


    document.getElementById("start").addEventListener("click", start, false);  

   
    window.addEventListener("keydown", onKeyDown, false);
   
    function onKeyDown(event) {
        var keyCode = event.keyCode;
        switch (keyCode) {
            case 65: //a
                xpos -= 0.03;
                break;
            case 68: //d
                xpos += 0.03;
                break;
            case 83: //s
                if (mouseY - 0.03 >= -1) {
                    mouseY -= 0.03;
                }
                break;
            case 87: //w
                if (mouseY + 0.03 <= 1) {
                    mouseY += 0.03;
                }
                break;

        }
    }
    
    makestars(num_stars, lvlcount);
   
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    
    program2 = initShaders( gl, "star-shader", "fragment-shader" );
    


    render();
};

function start(){

    if (xpos > -0.9) {
        xpos = -0.9
   return;
}
else

speed=speed+lvlcount*0.001;
};

function makestars(num_stars, lvlcount){

    centers=[];
    star_colors=[];
    star_vertices=[];

   for (var i = 0; i < num_stars * lvlcount * 0.5; i++){

       var centerx = Math.random() * (0.9+0.7)-0.7;      
       var centery = Math.random() * (1.0 + 1.0) - 1;

       centers.push(new vec2(centerx, centery));

       star_vertices.push(new vec2(centerx-0.01, centery+0.01));
       star_vertices.push(new vec2(centerx+0.01, centery+0.01));
       star_vertices.push(new vec2(centerx, centery - 0.01));

       star_colors.push(new vec4(0.5, 0.5, 0.5, 1));
       star_colors.push(new vec4( 1, 1, 0, 1));
       star_colors.push(new vec4(1, 0, 0, 1));
       }



};

//collision detection
function collision(){
   for(var k=0; k<centers.length; k++){
       var center = centers[k];
      

      var d = Math.pow((center[0]-xpos+stars),2)+ Math.pow((center[1]-mouseY),2);
      if(d<Math.pow(0.11,2)){
         speed = 0;
         xpos = -0.9;
         stars = 0;
          lvlcount = 1;
          frameCount = 0;
         makestars(num_stars, lvlcount);
         alert("Uzay gemin kontrolden cikti. Daha dikkatli kullan.");
      }
   
   }

};

function update_geometry() {

    //  Load shaders and initialize attribute buffers

    gl.useProgram( program ); 
    stars -= speed * 5; 
    frameCount++;
    //xpos += speed * 5; 
    
    
    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    
    

    var vertices = [
        new vec3(-0.04, 0.05,0),
        new vec3(0.1, 0.05,0),
        new vec3(0, 0,0),

        new vec3(-0.04, -0.05,0),
        new vec3( 0.1, -0.05,0),
        new vec3(0, 0,0),

        new vec3(0, 0.05,0),
        new vec3(0.05, 0,0),
        new vec3(0, -0.05,0),

        new vec3(0, 0.05,0),
        new vec3(-0.1, 0,0),
        new vec3(0, -0.05,0),

        new vec3(0, 0,0)];



    var colors = [
        new vec4(0.4, 1, 0, 1),
        new vec4(0.4, 1, 0, 1),
        new vec4(0.4, 1, 0, 1),

        new vec4(0.4, 1, 0, 1),
        new vec4(0.4, 1, 0, 1),
        new vec4(0.4, 1, 0, 1),

        new vec4(0.4, 1, 0, 1),
        new vec4(0.4, 1, 0, 1),
        new vec4(0.4, 1, 0, 1),

        new vec4(0.4, 1, 0, 1),
        new vec4(0.4, 1, 0, 1),
        new vec4(0.4, 1, 0, 1),

        new vec4(0.4, 1, 0, 1)];
         
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );


    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors),
                                gl.STATIC_DRAW );
                                
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 13, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );


    var mousePosLoc = gl.getUniformLocation( program, "mousePos" );   
    gl.uniform2f( mousePosLoc, mouseX, mouseY); 

    var angleLoc = gl.getUniformLocation( program, "angle" );   
    gl.uniform1f( angleLoc, angle);

    var xposLoc = gl.getUniformLocation( program, "xpos" );   
    gl.uniform1f( xposLoc, xpos);
   
    gl.drawArrays( gl.TRIANGLES, 0, 13);
   
    collision(centers, xpos, mouseY, stars);   
   

    //  Load shaders and initialize attribute buffers

    gl.useProgram( program2 );     
    
    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    
     
    gl.bufferData( gl.ARRAY_BUFFER, flatten(star_vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );


   var cBuffer = gl.createBuffer();
   gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
   gl.bufferData( gl.ARRAY_BUFFER, flatten(star_colors),
       gl.STATIC_DRAW);
    var angleLoc = gl.getUniformLocation(program, "angle");
    gl.uniform1f(angleLoc, angle);

    var starPosLoc = gl.getUniformLocation(program2, "starPos");
    gl.uniform1f(starPosLoc, stars); 
                                
   var vColor = gl.getAttribLocation( program, "vColor" );
   gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
   gl.enableVertexAttribArray( vColor );

    frameCount += stars * 1.2;

    if (frameCount < -1) {
        xpos += 0.1;
    }
   
   gl.drawArrays( gl.TRIANGLES, 0, star_vertices.length);
    if (xpos>=1){
      lvlcount++;
      alert("Tebrikler level atladiniz!!");
      speed=0.0;
      makestars(num_stars, lvlcount);
      xpos = -0.9;
        stars = 0;
        frameCount = 0;
   }
}




function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    update_geometry();
    requestAnimFrame( render );
}
