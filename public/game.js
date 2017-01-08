var game = new Phaser.Game(800, 600, Phaser.AUTO, 'container', {
    preload: preload,
    create: create,
    update: update
}, null, false);

game.clearBeforeRender = false;

var mc = 1;
var lxt = 1;
var xt = 1;
var bulletCounter = [];
var moveCounter = [];
var bulletTimer = 0;
var xbulletTimer = 0;
var stops = [];
var posUp = {};
var moving = false;

var players={};

socket.on('registerId', function(id) {
    sid = id;
});


function preload() {

    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('player', 'assets/ship.png');
    game.load.image('enemy', 'assets/ship.png');

}




function create() {

    game.stage.disableVisibilityChange = true;

    player = game.add.sprite(800, 600, 'player');
    player.scale.setTo(0.25, 0.25);
    game.physics.arcade.enable(player);
    player.anchor.x = 0.5;
    player.body.collideWorldBounds = true;
    player.body.gravity.y = 500;

    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(10, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    xbullets = game.add.group();
    xbullets.enableBody = true;
    xbullets.physicsBodyType = Phaser.Physics.ARCADE;
    xbullets.createMultiple(10, 'bullet');
    xbullets.setAll('anchor.x', 0.5);
    xbullets.setAll('anchor.y', 1);
    xbullets.setAll('outOfBoundsKill', true);
    xbullets.setAll('checkWorldBounds', true);

    bulletss = game.add.group();
    bulletss.enableBody = true;
    bulletss.physicsBodyType = Phaser.Physics.ARCADE;
    bulletss.createMultiple(10, 'bullet');
    bulletss.setAll('anchor.x', 0.5);
    bulletss.setAll('anchor.y', 1);
    bulletss.setAll('outOfBoundsKill', true);
    bulletss.setAll('checkWorldBounds', true);

    enemies = game.add.group();
    enemies.enableBody = true;
    enemies.physicsBodyType = Phaser.Physics.ARCADE;
    enemies.createMultiple(1, 'enemy');
    enemies.setAll('anchor.x', 0.5);
    enemies.setAll('anchor.y', 0.5);
    enemies.setAll('checkWorldBounds', true);

    cursors = game.input.keyboard.createCursorKeys();
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);




    socket.on('pos', function(msg, id, sxt) {

        fireBullet(msg, id, sxt);

    });



    socket.on('userIn', function(uid, ua) {

        ar = ua
        opponents = ua;
        if (opponents.indexOf(sid) > -1) {
            opponents.splice(opponents.indexOf(sid), 1);
        }
        if (opponents.length > 0) {
            loadOpponent(opponents[0]);
        }

    });



    socket.on('forceKillPlayer', function(skid) {
        forceKillPlayer(skid);
    });



    socket.on('disconnect', function(msg) {
        if (players[msg] != undefined) {
            players[msg].kill();
            delete players[msg];
            opponents.splice(opponents.indexOf(msg));
        }
    });


    socket.on('moveRight', function(bol, uid, pos, smc) {
        if (uid == sid && moveCounter.indexOf(smc) != -1) {
            if (stops.indexOf(smc) != -1) {
                posUp[uid]['right'] = false;
                posUp[uid]['left'] = false;
                posUp[uid]['pos'] = pos;
                moveCounter.splice(moveCounter.indexOf(smc), 1);
            } else {
                posUp[uid] = {};
                posUp[uid]['left'] = false;
                posUp[uid]['right'] = true;
                posUp[uid]['pos'] = pos;
                moveCounter.splice(moveCounter.indexOf(smc), 1);
            }
        }

        else if (uid != sid) {
       

                posUp[uid] = {};
                posUp[uid]['right'] = true;
                posUp[uid]['left'] = false;
                posUp[uid]['pos'] = pos;
                
            
        }
    });



    socket.on('moveLeft', function(bol, uid, pos, smc) {
        if (uid == sid && moveCounter.indexOf(smc) != -1) {
             if (stops.indexOf(smc) != -1) {
                posUp[uid]['right'] = false;
                posUp[uid]['left'] = false;
                posUp[uid]['pos'] = pos;
                moveCounter.splice(moveCounter.indexOf(smc), 1);
            } else {
                posUp[uid] = {};
                posUp[uid]['right'] = false;
                posUp[uid]['left'] = true;
                posUp[uid]['pos'] = pos;
                moveCounter.splice(moveCounter.indexOf(smc), 1);
            }
        }else if (uid != sid) {
 


                posUp[uid] = {};
                posUp[uid]['right'] = false;
                posUp[uid]['left'] = true;
                posUp[uid]['pos'] = pos;
                
            
        }




    });




    socket.on('stop', function(bol, uid, pos, smc) {


         posUp[uid] = {};
            posUp[uid]['right'] = false;
            posUp[uid]['left'] = false;
            posUp[uid]['pos'] = pos;
        if (uid == sid && moveCounter.indexOf(smc) != -1) {
          
            moveCounter.splice(moveCounter.indexOf(smc), 1);
        }


     
    });
}




function update() {

    game.physics.arcade.overlap(xbullets, enemies, killOpp, null, this);
    game.physics.arcade.overlap(bullets, enemies, killOpp, null, this);
    game.physics.arcade.overlap(bulletss, player, killPlayer, null, this);


    player.body.velocity.x = 0;


    if (player.alive) {



        cursors.left.onUp.add(function() {

            if (moving) {

                moving = false;
               player.body.velocity.x = 0;
                posUp[sid]['right'] = false;
                posUp[sid]['left'] = false;
                stops.push(mc);
                moveCounter.push(mc);
                mc += 1;
                socket.emit('stop', sid, player.x);
            }
        });


        cursors.right.onUp.add(function() {
            if (moving) {
                moving = false;
                player.body.velocity.x = 0;
                posUp[sid]['right'] = false;
                posUp[sid]['left'] = false;
                stops.push(mc);
                moveCounter.push(mc);
                mc += 1;
                socket.emit('stop', sid, player.x);

            }
        });




        if (cursors.left.isDown && !cursors.right.isDown) {

            moving = true;
            player.body.velocity.x = -350;


            moveCounter.push(mc);
            mc += 1;
            socket.emit('moveLeft', sid, player.x);

        }
        if (cursors.right.isDown && !cursors.left.isDown) {
            moving = true;
            player.body.velocity.x = 350;

            moveCounter.push(mc);
            mc += 1;
            socket.emit('moveRight', sid, player.x);

        }
        if (jumpButton.isDown) {
            // fireBullet();

            var bullet = bullets.getFirstExists(false);
            if (game.time.now > bulletTimer) {
                if (bullet) {

                    bulletTimer = game.time.now + 600;
                    bullet.scale.setTo(0.05, 0.05);

                    bullet.reset(player.x, 545);

                    bullet.body.velocity.y = -150;

                    bullet.pid = lxt;
                    lxt += 1;

                    bulletCounter.push(lxt);
                    socket.emit('pos', player.x, sid);


                }

            }

        }

    } else {
        bulletss.callAll('kill');
    }



    for(var x in posUp){

        if(x==sid){

            if (posUp[sid] != undefined && posUp[sid]['right'] == false && posUp[sid]['left'] == false) {
                player.body.velocity.x=0;
            
            }

            if (posUp[sid] != undefined && posUp[sid]['left'] == true) {
                player.body.velocity.x = -350;
            }

            if (posUp[sid] != undefined && posUp[sid]['right'] == true) {
                player.body.velocity.x = 350;
            }

        }else {



    if (posUp[x]['right'] == false && posUp[x]['left'] == false&&players[x]!=undefined) {
                players[x].x = posUp[x].pos;
            }




  if (posUp[x] != undefined && posUp[x]['right'] == true&& posUp[x]['left'] == false&&players[x]!=undefined) {
                players[x].body.velocity.x = 350;
            }


          if (posUp[x] != undefined && posUp[x]['left'] == true&&posUp[x]['right'] == false&&players[x]!=undefined) {
                        players[x].body.velocity.x = -350;
                    }
          
          


            
        
        }
    }





   
}




function fireBullet(msg, id, lxt) {




    if (id == sid) {
        var bullet = xbullets.getFirstExists(false);
        if (bullet) {

            xbulletTimer = game.time.now + 600;
            bullet.scale.setTo(0.05, 0.05);
            if (bulletCounter.indexOf(lxt) >= 0) {
                for (var x in bulletCounter) {
                    bullets.forEach(function(lbs) {
                        if (lbs.alive && lbs.pid == x) {
                            bullet.reset(msg, lbs.y);
                            lbs.destroy();
                            bullet.body.velocity.y = -150;
                        }
                    });
                }
                bulletCounter.splice(bulletCounter.indexOf(lxt));


            }
        }
    } else if (id != sid) {
        var bullete = bulletss.getFirstExists(false);
        if (bullete) {
            bullete.reset(msg, 55);
            game.physics.arcade.enable(bullete);
            bullete.body.setSize(bullete.body.width * 0.05, bullete.body.height * 0.05);
            bullete.angle = 180;
            xbulletTimer = game.time.now + 600;
            bullete.scale.setTo(0.05, 0.05);
            bullete.body.velocity.y = 150;
        };
    }

}


function loadOpponent(oid) {


    if (sid != oid && players[oid] == undefined) {
        players[oid] = enemies.getFirstExists(false);
        if (players[oid]) {
            game.physics.arcade.enable(players[oid]);
            if (players[oid].body.width > 100) {
                players[oid].body.setSize(players[oid].body.width * 0.20, players[oid].body.height * 0.20);
            }
            players[oid].scale.setTo(0.25, 0.25);
            players[oid].angle = 180;
            players[oid].reset(800, 0);
            players[oid].body.collideWorldBounds = true;
            players[oid].body.gravity.y = -500;
            players[oid].angle = 180;
            players[oid].skid = oid;
        }
    }

}


function killOpp(bullet, enemy) {

    bullet.kill();
    enemy.kill();
    socket.emit('forceKill', enemy.skid);
    socket.emit('killed', enemy.skid);

}


function killPlayer(bullet, pl) {

    bullet.kill();
    pl.kill();
    socket.emit('killed');

}


function forceKillPlayer(id) {

    if (id == sid) {
        player.kill();
    }

}