var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static('public'));



var users = {};
var userArray = [];
var bullets = {};
var xt = 1;

app.get('/game', function(req, res) {
    res.sendFile(__dirname + '/game.html');
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});



io.on('connection', function(socket) {

    users[socket.id] = {};
    users[socket.id].moves = xt;
    socket.emit('registerId', socket.id);
    if (userArray.indexOf(socket.id) < 0) {
        userArray.push(socket.id);
    }

    socket.on('disconnect', function(msg) {

        delete bullets[socket.id];


        if (userArray.indexOf(socket.id) != -1) {
            userArray.splice(userArray.indexOf(socket.id), 1);
        }

        io.emit('disconnect', socket.id);
    });

    setTimeout(function() {
        io.sockets.emit('userIn', socket.id, userArray);

    }, 5000);



    socket.on('killed', function(skid) {

        if (userArray.indexOf(skid) != -1) {

            userArray.splice(userArray.indexOf(skid), 1);
        }

    })



    socket.on('forceKill', function(skid) {

        io.sockets.emit('forceKillPlayer', skid);

    });



    socket.on('pos', function(x, id) {


        io.emit('pos', x, id, users[id].bul);

        if (users[id].bul == undefined) {

            users[id].bul = 1;
        } else {
            users[id].bul += 1;

        }



    });


    socket.on('liveFire', function(bullet) {

        socket.broadcast.emit('liveFire', bullet);

    });


    socket.on('moveLeft', function(bol) {

        io.emit('moveLeft', bol, socket.id);

    });


    socket.on('stopLeft', function(bol) {

        socket.broadcast.emit('stopLeft', bol, socket.id);

    });



    socket.on('moveRight', function(id, pos) {


        if (users[id]['moves'] == undefined || users[id]['moves'] == 1) {

            users[id]['moves'] = 1;

            io.emit('moveRight', true, id, pos, users[id].moves);

        } else if (users[id]['moves'] > 1) {

            io.emit('moveRight', true, id, pos, users[id].moves);
        }


        users[id]['moves'] += 1;


    });


    socket.on('moveLeft', function(id, pos) {


        if (users[id]['moves'] == undefined || users[id]['moves'] == 1) {

            users[id]['moves'] = 1;

            io.emit('moveLeft', true, id, pos, users[id].moves);
           

        } else if (users[id]['moves'] > 1) {

            io.emit('moveLeft', true, id, pos, users[id].moves);
        }


        users[id]['moves'] += 1;


    });



    socket.on('stop', function(id, pos) {


        if (users[id]['moves'] == undefined || users[id]['moves'] == 1) {

            users[id]['moves'] = 1;

            io.emit('stop', false, id, pos, users[id].moves);
               

        } else if (users[id]['moves'] > 1) {

            io.emit('stop', false, id, pos, users[id].moves);
             
        }


       users[id]['moves'] += 1;

  
    });


    socket.on('stopRight', function(bol) {

        socket.broadcast.emit('stopRight', bol, socket.id);

    });


});

http.listen(8081, function() {
    console.log('listening on *:8081');
});




//