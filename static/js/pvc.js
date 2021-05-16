var is_over = false;
var is_me = true;

var chess_data = new Array();
var init = function(){
    for (var i=0; i<19; i++) {
        chess_data[i] = [];
        for(var j=0; j<19; j++){
            chess_data[i][j] = 0;
        }
    }
}

var new_game = function(){
    location.reload();
}

var chess = document.getElementById('chess');

var canvas_ctx = chess.getContext('2d');
canvas_ctx.strokeStyle = "#000000";

var bg = new Image();
bg.src = "static/bg.jpg";
bg.onload = function(){
    canvas_ctx.drawImage(bg,0,0,570,570);
    draw_chess_data();
    init();
}

var draw_chess_data = function(){
    for(var i=0; i<19; i++){
        canvas_ctx.moveTo(19 + i*30, 19);
        canvas_ctx.lineTo(19 + i*30, 559);
        canvas_ctx.stroke();
        canvas_ctx.moveTo(19, 19 + i*30);
        canvas_ctx.lineTo(559, 19 + i*30);
        canvas_ctx.stroke();  
    }    
}

var one_step = function(i, j, is_me){
    canvas_ctx.beginPath();
    canvas_ctx.arc(19 + i*30, 19 + j*30, 13, 0, 2 * Math.PI);
    canvas_ctx.closePath();

    var grd = canvas_ctx.createRadialGradient(19 + i*30 + 2, 19 + j*30 - 2, 13, 19 + i*30 + 2, 19 + j*30 - 2, 0); 
    if(is_me){ //black
        grd.addColorStop(0, "#0A0A0A");
        grd.addColorStop(1, "#636766");
    }
    else{  //white
        grd.addColorStop(0, "#D1D1D1");
        grd.addColorStop(1, "#F9F9F9");
    }   
    canvas_ctx.fillStyle = grd;
    canvas_ctx.fill();
}

chess.onclick = function(e){
    if(is_over){
        return ;
    }
    if(!is_me){
        return ;
    }
    var x = e.offsetX;
    var y = e.offsetY;
    var i = Math.floor(x / 30);
    var j = Math.floor(y / 30);
    if(chess_data[i][j] == 0){
        one_step(i, j, is_me);
        chess_data[i][j] = 1;  //black is 1
     
        for(var k=0; k < count; k++){
            if(wins[i][j][k]){
                my_win[k]++;
                computer_win[k] = 6;
                if(my_win[k] == 5){
                    window.alert("You Win !");
                    is_over = true;
                }
            }
        }
        if(!is_over){
            is_me = !is_me;
            computer_ai();
        }
    }
}

//computer_ai
var computer_ai = function(){
    var my_score = [];
    var computer_score = [];
    var max = 0;
    var u = 0, v = 0;
    for(var i=0; i<19; i++){
        my_score[i] = [];
        computer_score[i] =[];
        for(var j=0; j<19; j++){
            my_score[i][j] = 0;
            computer_score[i][j] = 0;
        }
    }
    for(var i=0; i<19; i++){
        for(var j=0; j<19; j++){
            if(chess_data[i][j] == 0){
                for(var k=0; k<count; k++){
                    if(wins[i][j][k]){
                        if(my_win[k] == 1){
                            my_score[i][j] += 200;
                        }else if(my_win[k] == 2){
                            my_score[i][j] += 400;
                        }else if(my_win[k] == 3){
                            my_score[i][j] += 2000;
                        }else if(my_win[k] == 4){
                            my_score[i][j] += 10000;
                        }

                        if(computer_win[k] == 1){
                            computer_score[i][j] += 220;
                        }
                        else if(computer_win[k] == 2){
                            computer_score[i][j] += 420;
                        }
                        else if(computer_win[k] == 3){
                            computer_score[i][j] += 2100;
                        }
                        else if(computer_win[k] == 4){
                            computer_score[i][j] += 20000;
                        }
                    }
                }
                if(my_score[i][j] > max){
                    max = my_score[i][j];
                    u = i;
                    v = j;                  
                }
                else if(my_score[i][j] == max){
                    if(computer_score[i][j] > computer_score[u][v]){
                        u = i;
                        v = j;                      
                    }
                }
                if(computer_score[i][j] > max){
                    max = computer_score[i][j];
                    u = i;
                    v = j;                  
                }
                else if(computer_score[i][j] == max){
                    if(my_score[i][j] > my_score[u][v]){
                        u = i;
                        v = j;                      
                    }
                }
            }
        }
    }
    one_step(u, v, false);
    chess_data[u][v] = 2;  
    
    for(var k = 0; k < count; k++){
        if(wins[u][v][k]){
            computer_win[k]++;
            my_win[k] = 6;
            if(computer_win[k] == 5){
                window.alert("Computer Win !")
                is_over = true;
            }
        }
    }
    if(!is_over){
        is_me = !is_me;
    }    
}

//mouse style
chess.onmousemove = function(e){
    chess.style.cursor = "default";
    var x = e.offsetX;
    var y = e.offsetY;
    for(var i=0; i<19; i++){
        for(var j=0; j<19; j++){
            var a = x - (19 + i*30);
            var b = y - (19 + j*30);
            var distance = Math.hypot(a, b);
            var chessRange = Math.sqrt(25, 2);
            if(distance < chessRange){
                chess.style.cursor = "pointer";
            }
        }
    }
}



var wins = new Array();
for(var i=0; i<19; i++){
    wins[i] = [];
    for(var j=0; j<19; j++){
        wins[i][j] = [];
    }
}

var count = 0;

//row
for(var i=0; i<19; i++){
    for(var j=0; j<11; j++){
        for(var k=0; k<5; k++){
            wins[i][j+k][count] = true;  
        }
        count++;
    }
}

//line
for(var i=0; i<19; i++){
    for(var j=0; j<11; j++){
        for(var k=0; k<5; k++){
            wins[j+k][i][count] = true;  
        }
        count++;
    }
}

for(var i=0; i<11; i++){
    for(var j=0; j<11; j++){
        for(var k=0; k<5; k++){
            wins[i+k][j+k][count] = true;  
        }
        count++;
    }
}

for(var i = 0; i < 11; i++){
    for(var j= 14; j > 3; j--){
        for(var k = 0; k < 5; k++){
            wins[i+k][j-k][count] = true;
        }
        count++;
    }
}
// console.log(count);

var my_win = [];
var computer_win = [];
for(var i= 0; i<count; i++){
    my_win[i] = 0;
    computer_win[i] = 0;
}