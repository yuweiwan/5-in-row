var is_over = false;
var color = 0;//black 1, white -1
var is_me = false;
var chess_data = new Array();

var init = function(){
    for (var i=0; i<19; i++) {
        chess_data[i] = [];
        for(var j=0; j<19; j++){
            chess_data[i][j] = 0;
        }
    }
}

$(document).ready(function(){

    //heart beat && check if another player is ready
    setInterval(function() {
        var user_name = document.getElementById("user_name").innerHTML;
        var room_id = document.getElementById("room_id").innerHTML;
        // alert("user_name:" + user_name + ";room_id:" + room_id)
        $.ajax({
            type:"POST",
            url:"heart_beat",
            data:{
                "user_name": user_name,
                "room_id":room_id
            },
            async:true,
            success: function(data){
                console.log("players: " + data)
                if(data.players_ready == "YES") {//ready
                    document.getElementById("players_ready").innerHTML = "YES";
                    if(data.now_step == 0) {
                        if(data.color == '1') {
                            document.getElementById("players_turn").innerHTML = "My turn...";
                            color = 1;
                        } else {
                            document.getElementById("players_turn").innerHTML = "Opponent's turn...";
                            color = -1;
                        }
                    } else {
                        if(data.room_color == color) {
                            document.getElementById("players_turn").innerHTML = "My turn...";
                        } else {
                            document.getElementById("players_turn").innerHTML = "Opponent's turn...";
                        }
                    }
                } else {//not ready
                    document.getElementById("players_ready").innerHTML = "NO";
                    document.getElementById("players_turn").innerHTML = "Waiting...";
                }
            },
            error: function(){
                console.log("heart beat failed...");
            }
        });
    }, 1000);

    //draw all step piece
    setInterval(function() {
        var user_name = document.getElementById("user_name").innerHTML;
        var room_id = document.getElementById("room_id").innerHTML;
        if (is_over) {
            //game_over(user_name, room_id);
            return;
        }
        $.ajax({
            type:"POST",
            url:"step",
            data:{
                "user_name": user_name,
                "room_id":room_id
            },
            async:true,
            success: function(data){
                //data = eval('(' + data + ')')
                //console.log(data);
                var steps = data.steps;
                console.log("steps: " + steps);
                console.log("winner: " + data.winner);
                if(steps == null) {
                    return;
                }

                for(var i=0;i<steps.length;i++) {
                    //console.log("steps: " + i);
                    var line = steps[i][0];
                    var row = steps[i][1];
                    var color = steps[i][2];
                    oneStep(line, row, color);
                    //console.log(line + ";" + row + ";" + color)
                }
                if(data.winner==1){
                    alert("Black Win!");
                    is_over = true;
                    game_over(user_name, room_id);
                    //clearInterval(oTimer);
                    return
                }
                else if(data.winner==-1){
                    alert("White Win!");
                    is_over = true;
                    game_over(user_name, room_id);
                    //clearInterval(oTimer);
                    return;
                }
            },
            error: function(){
                console.log("step failed...");
            }
        });
    }, 1500);

});


function game_over(user_name, room_id) {
    $.ajax({
            type:"POST",
            url:"game_over",
            data:{
                "room_id":room_id
            },
            async:true,
            success: function(){
                window.location.href = "/pvp_room_list?user_name=" + user_name;
            },
            error: function(){
                console.log("game_over failed...");
            }
        });
}

var chess = document.getElementById('chess');
var ctx = chess.getContext('2d');
ctx.strokeStyle = "#000000";


var logo = new Image();
logo.src = "static/bg.jpg";
logo.onload = function(){
    ctx.drawImage(logo,0,0,570,570);
    draw_chess_data();
    init();
}


var draw_chess_data = function(){
    for(var i=0; i<19; i++){
        ctx.moveTo(19+i*30, 19);
        ctx.lineTo(19+i*30, 559);
        ctx.stroke();
        ctx.moveTo(19, 19+i*30);
        ctx.lineTo(559, 19+i*30);
        ctx.stroke();  
    }    
}


var oneStep = function(i, j, color){
    ctx.beginPath();
    ctx.arc(19 + i*30, 19 + j*30, 13, 0, 2 * Math.PI);
    ctx.closePath();

    var grd = ctx.createRadialGradient(19 + i*30 + 2, 19 + j*30 - 2, 13, 19 + i*30 + 2, 19 + j*30 - 2, 0);
    if(color == 1){
        grd.addColorStop(0, "#0A0A0A");
        grd.addColorStop(1, "#636766");
    }
    else{
        grd.addColorStop(0, "#D1D1D1");
        grd.addColorStop(1, "#F9F9F9");
    }
    ctx.fillStyle = grd;
    ctx.fill();
}


chess.onclick = function(e){
    if(is_over){
        return;
    }
    var user_name = document.getElementById("user_name").innerHTML;
    var room_id = document.getElementById("room_id").innerHTML;
    $.ajax({
        type:"POST",
        url:"get_color",
        data:{
            "user_name": user_name,
            "room_id":room_id
        },
        async:false, // wait the result
        success: function(iColor){
            //alert("get_color: " + iColor)
            console.log("get_color: " + iColor)
            console.log("color.toString(): " + color.toString())
            if(iColor == color.toString()) {
                //alert('true')
                is_me = true;
            }
        },
        error: function(){
            console.log("update_chess failed...");
        }
    });

    if(!is_me){
        return ;
    }
    console.log("continue...")
    var x = e.offsetX;
    var y = e.offsetY;
    var i = Math.floor(x / 30);
    var j = Math.floor(y / 30);
    //alert("i: " + i + ";j: " + j)
    //check chess
    $.ajax({
        type:"POST",
        url:"get_chess",
        data:{
            "user_name": user_name,
            "room_id":room_id
        },
        async:false, // wait the result
        success: function(data){
            for (var i=0; i<19; i++) {
                for(var j=0; j<19; j++){
                    //console.log("data["+i+"]["+j+"]=" + data[i][j])
                    chess_data[i][j] = data[i][j];
                }
            }
        },
        error: function(){
            console.log("update_chess failed...");
        }
    });
    if(chess_data[i][j] == 0){
        //available
        oneStep(i, j, color);
        chess_data[i][j] = color;
        $.ajax({
            type:"POST",
            url:"update_chess",
            data:{
                "i": i,
                "j": j,
                "color": color,
                "user_name": user_name,
                "room_id":room_id
            },
            async: false, // wait the result
            success: function(data){
                //alert(data.winner)
                console.log(data.winner)
                if(data.winner==1){
                    alert("Black Win!");
                    is_over = true;
                    game_over(user_name, room_id);
                    return;
                } else if(data.winner==-1){
                    is_over = true;
                    alert("White Win!");
                    game_over(user_name, room_id);
                    return;
                }
            },
            error: function(){
                console.log("update_chess failed...");
            }
        });

        if(!is_over){
            is_me = !is_me;
            //computerAI();
        }
    }
}

//mouse style
chess.onmousemove = function(e){
    chess.style.cursor = "default";
    var x = e.offsetX;
    var y = e.offsetY;
    for(var i=0; i<19; i++){
        for(var j=0; j<19; j++){
            var a = x - (19+i*30);
            var b = y - (19+j*30);
            var distance = Math.hypot(a, b);
            var chess_range = Math.sqrt(25, 2);
            if(distance < chess_range){
                chess.style.cursor = "pointer";
            }
        }
    }
}