var playState = {
    
    weaponBulletLifespan: 1000,
    weaponBulletSpeed: 500,
    weaponFireRate: 100,
    
    playerSpriteInitialEnergy: 100,
    numberOfEnemies: 600,
    numberOfFirstAids: 15,
    
    gameDurationSeconds: 59,
  
    create: function () {
        
        game.world.resize(2000, 2000);
        
        this.centerX = game.world.width / 2;
        this.centerY = game.world.height / 2;
        
        this.wideshotEnabled = false;
        
        game.stage.backgroundColor = "#000000";
        game.add.image(0, 0, 'background');
        
        this.createPlayer();
        
        this.createEnemies();
        this.createPowerUps();
        
        this.setupKeyboard();
        
        this.createDashboard();
        
        this.createBrokenGlass();
    },
    
    update: function () {
        
        game.physics.arcade.collide([this.enemies, this.powerups]);
        game.physics.arcade.collide(this.enemies, this.powerups);
        game.physics.arcade.collide(this.playerSprite, this.enemies, this.collidePlayerEnemy, false, this);
        game.physics.arcade.collide(this.playerSprite, this.powerups, this.collidePlayerPowerUp, false, this);
        game.physics.arcade.collide(this.weapon.bullets, this.enemies, this.collideBulletTarget, false, this); 
        game.physics.arcade.collide(this.weapon.bullets, this.powerups, this.collideBulletTool, false, this); 
        
        if (this.shield.alpha < 1) {
          this.shield.alpha += 0.1;
        } else {
          this.shield.alpha = 1;
        }
        
        if (this.cursors.up.isDown)
        {
            game.physics.arcade.accelerationFromRotation(this.playerSprite.rotation, 300, this.playerSprite.body.acceleration);
            this.updateEnergyLevel(-0.005);
        }
        else
        {
            this.playerSprite.body.acceleration.set(0);
        }

        if (this.cursors.left.isDown)
        {
            this.playerSprite.body.angularVelocity = -300;
            this.updateEnergyLevel(-0.005);
        }
        else if (this.cursors.right.isDown)
        {
            this.playerSprite.body.angularVelocity = 300;
            this.updateEnergyLevel(-0.005);
        }
        else
        {
            this.playerSprite.body.angularVelocity = 0;
        }
        
        
        if (this.fireButton.isDown) {
            this.fireWeapon();
        }
        
        this.updateEndGameTimer();
    },
    
    createWeapon: function () {
        
        this.weapon = game.add.weapon(30, 'bullet');
        this.weapon.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;
        this.weapon.bulletLifespan = this.weaponBulletLifespan;
        this.weapon.bulletSpeed = this.weaponBulletSpeed;
        this.weapon.fireRate = this.weaponFireRate;
        this.weapon.bulletAngleVariance = 0;
        
    },
    
    createPlayer: function () {
        
        this.createWeapon();
        
        this.playerSprite = this.add.sprite(this.centerX, this.centerY, 'ship');

        this.playerSprite.anchor.set(0.5);

        game.physics.arcade.enable(this.playerSprite);

        this.playerSprite.body.drag.set(70);
        this.playerSprite.body.maxVelocity.set(200);
        this.playerSprite.body.collideWorldBounds = true;
        game.camera.follow(this.playerSprite);
        
        this.createPlayerShield();

        this.weapon.trackSprite(this.playerSprite, 0, 0, true);
        
    },
    
    createPlayerShield: function () {
        
        this.shield = this.playerSprite.addChild(game.make.sprite(-38, -39, 'shield'));
        this.shield.alpha = 0;
        
    },
    
    createEnemies: function () {
        
        this.enemies = game.add.group();
        game.physics.arcade.enable(this.enemies);
        this.enemies.enableBody = true;

        var thirdX = game.world.width / 3;
        var thirdY = game.world.height / 3;

        for (i =0; i < this.numberOfEnemies; i++) {
            var positionX = Math.random() * game.world.width;
            var positionY = Math.random() * game.world.height;

            if (Math.abs(positionX - this.centerX) < 60) {
                positionX = positionX + 60;
            }

            if (Math.abs(positionY - this.centerY) < 60) {
                positionY = positionY + 60;
            }

            var enemy = this.enemies.create(positionX, positionY, 'enemySprite', Math.floor(Math.random() * 7));
            enemy.body.acceleration.x = (Math.random() * 50) - 25;
            enemy.body.acceleration.y = (Math.random() * 50) - 25;
            enemy.body.collideWorldBounds = true;
            enemy.body.bounce.setTo(1,1);
        }
        
    },
    
    createPowerUps: function () {
      
        this.powerups = game.add.group();
        game.physics.arcade.enable(this.powerups);
        this.powerups.enableBody = true;
        for (i = 0; i < this.numberOfFirstAids; i++) {
            var positionX = Math.random() * game.world.width;
            var positionY = Math.random() * game.world.height;

            if (Math.abs(positionX - this.centerX) < 60) {
                positionX = positionX + 60;
            }

            if (Math.abs(positionY - this.centerY) < 60) {
                positionY = positionY + 60;
            }
            var powerup = this.powerups.create(positionX, positionY, 'powerups', Math.floor(Math.random() * 2));
            powerup.body.acceleration.x = (Math.random() * 20) - 10;
            powerup.body.acceleration.y = (Math.random() * 20) - 10;
            powerup.body.collideWorldBounds = true;
            powerup.body.bounce.setTo(1,1);
        }
        
    },
    
    createDashboard: function () {

        var bottomDashboard = game.add.image(0, 600 - 56, 'bottomDashboard');
        bottomDashboard.fixedToCamera = true;
        bottomDashboard.cameraOffset.setTo(0, 600 - 56);
        
        this.createScoreText(bottomDashboard);
        this.createEnergyLevelText(bottomDashboard);
        this.createTimerText(bottomDashboard);

        this.iconBulletsState = game.add.image(120, 15, 'iconBullets', 1);
        bottomDashboard.addChild(this.iconBulletsState);

    },
    
    createScoreText: function(dashboard) {
        
        //  The score
        this.scoreText = game.add.text(600, 12, 'Score: 0', { fontSize: '32px', fill: '#ffffff' });
        this.score = 0;
        dashboard.addChild(this.scoreText);
        
    },
    
    createEnergyLevelText: function(dashboard) {
        
        this.energyLevelIcon = game.add.image(15, 15, 'iconPowerLevels', 10);
        dashboard.addChild(this.energyLevelIcon);
        this.energyLevel= this.playerSpriteInitialEnergy;
        this.updateEnergyLevel(0);
        
    },
    
    createTimerText: function(dashboard) {
        // Create a custom timer
        this.endGameTimer = game.time.create();
        this.endGameTimerEvent = this.endGameTimer.add(Phaser.Timer.SECOND * this.gameDurationSeconds, this.endGameTimerDone, this);
        this.endGameTimer.start();
        
        //  The game timer
        this.endGameTimerText = game.add.text(0, 0, '##:##', { fontSize: '32px', fill: '#ffffff', boundsAlignH: "center", boundsAlignV: "middle"});
        dashboard.addChild(this.scoreText);
       this.endGameTimerText.setTextBounds(370,16,60,32);
       dashboard.addChild(this.endGameTimerText);        
    },
    
    createBrokenGlass: function () {
        this.brokenGlass = game.add.image(0, 0, 'brokenWindow');
        this.brokenGlass.fixedToCamera = true;
        this.brokenGlass.cameraOffset.setTo(0, 0);
        this.brokenGlass.visible = false;
    },
    
    setupKeyboard: function () {
        
        this.fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
        this.cursors = this.input.keyboard.createCursorKeys();
        
        var weaponButton = game.input.keyboard.addKey(Phaser.Keyboard.W);
        weaponButton.onDown.add(this.toggleWeaponStyle, this);

        var quitButton = game.input.keyboard.addKey(Phaser.Keyboard.P);
        quitButton.onDown.add(this.quitGame, this);
        
    },
    
    fireWeapon: function () {
        
        this.weapon.fire();
        this.updateEnergyLevel(-0.05);
        
    },
    
    collidePlayerEnemy: function(player, enemy) {
        this.shield.alpha = 0;
        this.updateEnergyLevel(-1);
    },
    
    collideBulletTarget: function (bullet, target) {
        bullet.kill();
        target.kill();
        this.score += 5;
        this.scoreText.text = 'Score: ' + this.score;  
    },

    collideBulletTool: function (bullet, target) {
        bullet.kill();
        target.kill();
    },
    
    collidePlayerPowerUp: function(player, kit) {
      kit.kill();
      switch(kit.frame) {
      case 0:
          this.updateEnergyLevel(100);
          break;
      case 1:
          this.wideshotEnabled = true;
          this.toggleWeaponStyle();
          break;
      } 

    },
    
    toggleWeaponStyle: function () {
        
        switch(this.iconBulletsState.frame) {
        case 0:
            this.iconBulletsState.frame = 1;
            this.weapon.bulletAngleVariance = 0;
            break;
        case 1:
            if (this.wideshotEnabled == true) {
                this.iconBulletsState.frame = 0;
                this.weapon.bulletAngleVariance = 30;
                break;
            }
        }
            
    },
    
    endGameTimerDone: function () {
        this.endGameTimer.stop();
        this.gameOver("Time's up!");
    },
    
    quitGame: function () {
        this.updateEnergyLevel(-10);
    },
    
    updateEndGameTimer: function() {
        if (this.endGameTimer.running) {
            this.endGameTimerText.text = this.formatTime(Math.round((this.endGameTimerEvent.delay - this.endGameTimer.ms) / 1000));
        } else {
            this.endGameTimerText.text = "00:00";
        }
    },
    
    updateEnergyLevel: function(points) {
        this.energyLevel += points;
        if (this.energyLevel <= 0) {
            this.energyLevel = 0;
            this.killPlayer();
        } else if (this.energyLevel > 100.0) {
            this.energyLevel = 100.0;
        }
        this.energyLevelIcon.frame = Math.floor(this.energyLevel / 10);
    },
    
    formatTime: function(s) {
        // Convert seconds (s) to a nicely formatted and padded time string
        var minutes = "0" + Math.floor(s / 60);
        var seconds = "0" + (s - minutes * 60);
        return minutes.substr(-2) + ":" + seconds.substr(-2);   
    },
    
    
    killPlayer: function () {
        var tween = game.add.tween(this.playerSprite).to( { alpha: 0 }, 500, Phaser.Easing.Exponential.Out, true, 0, 0, false);
        tween.onComplete.add(function () {
            this.playerSprite.kill();
            this.gameOver();
        }, this);
    },
    
    
    gameOver: function(message = "GAME OVER!") {
        game.pause = true;     
        this.brokenGlass.visible = true;   
        game.time.events.add(Phaser.Timer.SECOND * 1.25, function () {
            game.state.start('gameover', false, false, {message: message, score: this.score});
        }, this);
    },
    
};