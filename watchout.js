var score = 0;

var gameStart = function(){

  var parameters = {
    boardWidth: 800,
    boardHeight: 500,
    enemiesCount: 0
  };

  var board = d3.select('.board')
      .attr('width', parameters.boardWidth)
      .attr('height', parameters.boardHeight);

  //PLAYER
  var Player = function(parameters){
    this.path = 'M-10 -10 C -5 -5, 5 -5, 10 -10 C 5 -5, 5 5, 10 10 C 5 5 -5 5 -10 10 C -5 5 -5 -5 -10 -10';
    this.x = 250;
    this.y = 250;
    this.angle = 0;
    
    this.render = function(board){
      this.el = board.append('svg:path')
          .attr('class', 'player')
          .attr('d', this.path)
          .attr('fill', this.fill);
      this.transform(0);
      this.dragging();
    };

    this.transform = function(){
      this.el.attr('transform', 'translate(' + this.x + ',' + this.y + ') ' + 'rotate(' + this.angle + ')');
    };

    this.setX = function(x){
      if(x > parameters.boardWidth - 20){
        this.x = parameters.boardWidth - 20;
      }else if(x < 20){
        this.x = 20;
      }else{
        this.x = x;
      }
    };

    this.setY = function(y){
      if(y > parameters.boardHeight - 20){
        this.y = parameters.boardHeight - 20;
      }else if(y < 20){
        this.y = 20;
      }else{
        this.y = y;
      }
    };

    this.moveTo = function(x,y){
      this.setX(x);
      this.setY(y);
      this.transform();
    };

    this.moveFor = function(x,y){
      this.setX(this.x + x);
      this.setY(this.y + y);
      this.angle = 360 * (Math.atan2(y,x)/(Math.PI*2));
      this.transform();
    };

    this.dragging = function(){
      var that = this;
      var drag = d3.behavior.drag().on('drag', function(){
        that.moveFor(d3.event.dx, d3.event.dy);
      });
      this.el.call(drag);
    };
  };
  var player = new Player(parameters);
  player.render(board);

  //ENEMIES
  var Enemy = function(parameters){
    this.x = Math.random() * parameters.boardWidth;
    while(Math.abs(this.x - player.x) < 80 || this.x < 10 || this.x > parameters.boardWidth - 10){
      this.x = Math.random() * parameters.boardWidth;
    }
    this.y = Math.random() * parameters.boardHeight;
    while(Math.abs(this.y - player.y) < 80 || this.y < 10 || this.y > parameters.boardHeight - 10){
      this.y = Math.random() * parameters.boardHeight;
    }
    this.v = 0.3;
  };
  var enemies = d3.range(2).map(function(){ 
    return new Enemy(parameters);
  });
  var enemiesNodes = board.selectAll('.enemy').data(enemies)
      .enter()
      .append('svg:circle')
      .attr('class','enemy')
      .attr('cx', function(d){return d.x;})
      .attr('cy', function(d){return d.y;})
      .attr('r', 10);
  var updateEnemies = function(player, enemies){
    for(var i = 0; i < enemies.length; i++){
      if(enemies[i].v < 5){
        enemies[i].v += 0.005;
      }
      var dx = player.x - enemies[i].x;
      var dy = player.y - enemies[i].y;
      if(dx > 0){
        var dxMultiplier = 1; 
      }else{
        var dxMultiplier = -1;
      }
      if(dy > 0){
        var dyMultiplier = 1;
      }else{
        var dyMultiplier = -1;
      }
      var dir = Math.atan(dy/dx);
      enemies[i].x += Math.abs(enemies[i].v * Math.cos(dir)) * dxMultiplier;
      enemies[i].y += Math.abs(enemies[i].v * Math.sin(dir)) * dyMultiplier;
    }

    var nodes = board.selectAll('.enemy').data(enemies)
        .attr('cx', function(d){return d.x;})
        .attr('cy', function(d){return d.y;})
        .attr('r', 10);

    nodes.enter().append('svg:circle')
    .attr('class', 'enemy')
    .attr('cx', function(d){return d.x;})
    .attr('cy', function(d){return d.y;})
    .attr('r', 10);

    nodes.exit().remove();
  };

  //WEAPONS
  var Weapon = function(player){
    this.x = Math.random() * parameters.boardWidth;
    while(Math.abs(this.x - player.x) < 100 || this.x < 30 || this.x > parameters.boardWidth - 30){
      this.x = Math.random() * parameters.boardWidth;
    }
    this.y = Math.random() * parameters.boardHeight;
    while(Math.abs(this.y - player.y) < 100 || this.y < 30 || this.y > parameters.boardHeight - 30){
      this.y = Math.random() * parameters.boardHeight;
    }
    this.vx = 0;
    this.vy = 0;
    this.dvx = 0;
    this.dvy = 0;
  };

  var weapons = d3.range(1).map(function(){ 
    return new Weapon(player);
  });

  var weaponsNodes = board.selectAll('.weapon').data(weapons)
      .enter()
      .append('svg:circle')
      .attr('class','weapon')
      .attr('cx', function(d){return d.x;})
      .attr('cy', function(d){return d.y;})
      .attr('r', 30);

  var updateWeapons = function(weapons){
    for(var i = 0; i < weapons.length; i++){
      weapons[i].dvx += -0.01 + Math.random() * 0.02;
      weapons[i].dvy += -0.01 + Math.random() * 0.02;
      weapons[i].vx += weapons[i].dvx;
      weapons[i].vx /= 2;
      weapons[i].vy += weapons[i].dvy;
      weapons[i].vy /= 2;
      if(weapons[i].x + weapons[i].vx < 30 || weapons[i].x + weapons[i].vx > parameters.boardWidth - 30){
        weapons[i].vx = -weapons[i].vx;
      }
      if(weapons[i].y + weapons[i].vy < 30 || weapons[i].y + weapons[i].vy > parameters.boardHeight - 30){
        weapons[i].vy = -weapons[i].vy;
      }
      weapons[i].x += weapons[i].vx;
      weapons[i].y += weapons[i].vy;
    }

    var nodes = board.selectAll('.weapon').data(weapons)
        .attr('cx', function(d){return d.x;})
        .attr('cy', function(d){return d.y;})
        .attr('r', 30);

    nodes.enter().append('svg:circle')
    .attr('class', 'weapon')
    .attr('cx', function(d){return d.x;})
    .attr('cy', function(d){return d.y;})
    .attr('r', 30);

    nodes.exit().remove();
  };

  //FIREBALLS
  var Fireball = function(x, y){
    this.x = x;
    this.y = y;
    this.r = 30;
  };

  var fireballs = d3.range(0).map(function(){ 
    return new Fireball(400, 400);
  });

  var fireballNodes = board.selectAll('.fireball').data(fireballs)
      .enter()
      .append('svg:circle')
      .attr('class','fireball')
      .attr('cx', function(d){return d.x;})
      .attr('cy', function(d){return d.y;})
      .attr('r', function(d){return d.r;});

  var updateFireballs = function(fireballs, enemies){
    
    var i = 0;
    while(i < fireballs.length){
      fireballs[i].r += 3;
      //killing enemies
      var j = 0;
      while(j < enemies.length){
        var dx = fireballs[i].x - enemies[j].x;
        var dy = fireballs[i].y - enemies[j].y;
        var d = Math.pow(Math.pow(dx, 2) + Math.pow(dy, 2), 0.5);
        if(d < fireballs[i].r + 10){
          enemies.splice(j, 1);
          score++;
          postScore();
        }else{
          j++;
        }
      }
      if(fireballs[i].r > 150){
        fireballs.splice(i, 1);
      }else{
        i++;
      }
    }

    var nodes = board.selectAll('.fireball').data(fireballs)
        .attr('cx', function(d){return d.x;})
        .attr('cy', function(d){return d.y;})
        .attr('r', function(d){return d.r;});

    nodes.enter().append('svg:circle')
    .attr('class', 'fireball')
    .attr('cx', function(d){return d.x;})
    .attr('cy', function(d){return d.y;})
    .attr('r', function(d){return d.r;});

    nodes.exit().remove();
  };

  //CHECKS & FUNCTIONS
  var enemyColCheck = function(player, enemies){
    for(var i = 0; i < enemies.length; i++){
      var dx = player.x - enemies[i].x;
      var dy = player.y - enemies[i].y;
      var d = Math.pow(Math.pow(dx, 2) + Math.pow(dy, 2), 0.5);
      if(d < 20){
        gameOver();
      }
    }
  };
  var weaponColCheck = function(player, weapons, enemies){
    for(var i = 0; i < weapons.length; i++){
      var dx = player.x - weapons[i].x;
      var dy = player.y - weapons[i].y;
      var d = Math.pow(Math.pow(dx, 2) + Math.pow(dy, 2), 0.5);
      if(d < 60){
        setOffWeapon(weapons[i], enemies);
        weapons.splice(i, 1);
      }
    }
  };
  var setOffWeapon = function(weapon, enemies){
    fireballs.push(new Fireball(weapon.x, weapon.y));
  };

  var stop = false;
  var gameOver = function(){
    stop = true;
    clearInterval(spawnEnemy);
    clearInterval(spawnWeapon);
  };
  var postScore = function(){
    d3.select('.current').select('span').text(score);
  };

  //TIMERS
  var gameTimer = d3.timer(function(){
    updateEnemies(player, enemies);
    updateWeapons(weapons);
    updateFireballs(fireballs, enemies);
    return stop;
  }, 200);

  var collisionTimer = d3.timer(function(){
    enemyColCheck(player, enemies);
    weaponColCheck(player, weapons, enemies);
    return stop;
  });

  var timePerEnemy = 1000;
  var enemyPerSpawn = 2;
  var timePerWeapon = 5000;

  var spawnEnemy = setInterval(function(){
    for(var i = 0; i < Math.random() * enemyPerSpawn; i++){
      enemies.push(new Enemy(parameters));
    }
    timePerEnemy *= 0.95;
    enemyPerSpawn += 0.2;
  }, timePerEnemy);

  var spawnWeapon = setInterval(function(){
    weapons.push(new Weapon(player));
  }, timePerWeapon);
};

gameStart();