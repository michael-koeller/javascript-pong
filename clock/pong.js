//=============================================================================
// PONG
//=============================================================================

Pong = {

  Defaults: {
    width:          640,   // logical canvas width (browser will scale to physical canvas size - which is controlled by @media css queries)
    height:         480,   // logical canvas height (ditto)
    wallWidth:      10,
    digitWidth:     36,	
    digitHeight:    48,
    paddleWidth:    14,
    paddleHeight:   90,
    paddleSpeed:    2,     // should be able to cross court vertically   in 2 seconds
    ballSpeed:      3,     // should be able to cross court horizontally in 4 seconds, at starting speed ...
    ballAccel:      2,     // ... but accelerate as time passes
    ballRadius:     10,
    ballSpinAdjust: 50,
    aiReaction:     0.4,
    aiErrorLevel:   60,
  },

  Colors: {
    walls:           'white',
    ball:            'white',
    score:           'white',
    footprint:       '#666',
    predictionGuess: 'yellow',
    predictionExact: 'red'
  },

  //-----------------------------------------------------------------------------

  initialize: function(runner, cfg) {
    (function() {
      this.cfg         = cfg;
      this.runner      = runner;
      this.width       = runner.width;
      this.height      = runner.height;
      this.playing     = false;
      this.scores      = [0, 0];
      this.menu        = Object.construct(Pong.Menu,   this);
      this.court       = Object.construct(Pong.Court,  this);
      this.leftPaddle  = Object.construct(Pong.Paddle, this);
      this.rightPaddle = Object.construct(Pong.Paddle, this, true);
      this.ball        = Object.construct(Pong.Ball,   this);
      this.runner.start();
    }).call(this);
  },

  start: function(numPlayers) {
    if (!this.playing) {
      this.playing = true;
      if (numPlayers < 1) {
		this.leftPaddle.setAuto(true);
		// clock mode
		this.clockMode = true;
		this.leftPaddle.setDropRate({m:true, h: false, d: false});
		this.rightPaddle.setDropRate({m:false, h: true, d: false});
	  }
      if (numPlayers < 2) {
		this.rightPaddle.setAuto(true);
	  }
		if (this.clockMode) {
	      var now = new Date();
	      this.scores = [now.getHours(), now.getMinutes()];
		} else {
			this.scores = [0, 0];
		}
	
      this.ball.reset();
      this.runner.hideCursor();
      document.getElementById('sidebar').style.display = 'none';
    }
  },

  stop: function(ask) {
    if (this.playing) {
      if (!ask || this.runner.confirm('Abandon game in progress ?')) {
        this.playing = false;
        this.leftPaddle.setAuto(false);
        this.rightPaddle.setAuto(false);
        this.runner.showCursor();
        document.getElementById('sidebar').style.display = 'block';
      }
    }
  },

  goal: function(playerNo) {
	if (this.clockMode) {
		// set current time as score
		var now = new Date();
		this.scores = [now.getHours(), now.getMinutes()];
		this.leftPaddle.forceDrop = false;
		this.rightPaddle.forceDrop = false;
	} else {
		this.scores[playerNo] += 1;
	}

    this.ball.reset(playerNo);
  },

  update: function(dt) {
    this.leftPaddle.update(dt, this.ball);
    this.rightPaddle.update(dt, this.ball);
    if (this.playing) {
      var dx = this.ball.dx;
      var dy = this.ball.dy;
      this.ball.update(dt, this.leftPaddle, this.rightPaddle);

      if (this.ball.left > this.width)
        this.goal(0);
      else if (this.ball.right < 0)
        this.goal(1);
    }
  },

  draw: function(ctx) {
    this.court.draw(ctx, this.scores);
    this.leftPaddle.draw(ctx);
    this.rightPaddle.draw(ctx);
    if (this.playing)
      this.ball.draw(ctx);
    else
      this.menu.draw(ctx);
  },

  onclick: function(el, ev) {
	var id = el.id;
	switch (id) {
		case 'btnGo': {
			ev.preventDefault();
			ev.stopPropagation();
			// GO-button always triggers clock mode 
			this.start(0);
			break;
		}
		case 'game': {
			ev.preventDefault();
			ev.stopPropagation();
			this.stop();
		}
	}
  },

  onkeydown: function(keyCode, ev) {
    switch(keyCode) {
      case Game.KEY.ZERO: this.start(0); break;
      case Game.KEY.ONE:  this.start(1); break;
      case Game.KEY.TWO:  this.start(2); break;
      case Game.KEY.ESC:  this.stop(true); break;
      case Game.KEY.Q:    if (!this.leftPaddle.auto)  this.leftPaddle.moveUp();    break;
      case Game.KEY.A:    if (!this.leftPaddle.auto)  this.leftPaddle.moveDown();  break;
      case Game.KEY.P:    if (!this.rightPaddle.auto) this.rightPaddle.moveUp();   break;
      case Game.KEY.L:    if (!this.rightPaddle.auto) this.rightPaddle.moveDown(); break;
    }
  },

  onkeyup: function(keyCode, ev) {
    switch(keyCode) {
      case Game.KEY.Q: if (!this.leftPaddle.auto)  this.leftPaddle.stopMovingUp();    break;
      case Game.KEY.A: if (!this.leftPaddle.auto)  this.leftPaddle.stopMovingDown();  break;
      case Game.KEY.P: if (!this.rightPaddle.auto) this.rightPaddle.stopMovingUp();   break;
      case Game.KEY.L: if (!this.rightPaddle.auto) this.rightPaddle.stopMovingDown(); break;
    }
  },

  ontouchstart: function(ev) {
/*
	if (this.playing) {
		ev.preventDefault();
		ev.stopPropagation();
		this.stop(true);
	}
*/
  },

  ontouchend: function(ev) {
  },

  showStats:       function(on) { this.cfg.stats = on; },
  showFootprints:  function(on) { this.cfg.footprints = on; this.ball.footprints = []; },
  showPredictions: function(on) { this.cfg.predictions = on; },

  //=============================================================================
  // MENU
  //=============================================================================

  Menu: {

    initialize: function(pong) {
    },

    declareWinner: function(playerNo) {
    },

    draw: function(ctx) {
    }

  },

  //=============================================================================
  // COURT
  //=============================================================================

  Court: {

    initialize: function(pong) {
      var w  = pong.width;
      var h  = pong.height;
      var ww = pong.cfg.wallWidth;

      this.pong  = pong;
      this.ww    = ww;
      this.walls = [];
      this.walls.push({x: 0, y: 0,      width: w, height: ww});
      this.walls.push({x: 0, y: h - ww, width: w, height: ww});
      var nMax = (h / (ww*2));
      for(var n = 0 ; n < nMax ; n++) { // draw dashed halfway line
        this.walls.push({x: (w / 2) - (ww / 2), 
                         y: (ww / 2) + (ww * 2 * n), 
                         width: ww, height: ww});
      }

      var dw = pong.cfg.digitWidth;
      var dh = pong.cfg.digitHeight;
      var cx = w/2
      this.score1b = {x: cx - 2*ww - dw,   y: 2*ww, w: dw, h: dh};
      this.score1a = {x: cx - 3*ww - 2*dw, y: 2*ww, w: dw, h: dh};
      this.score2a = {x: cx + 2*ww,        y: 2*ww, w: dw, h: dh};
      this.score2b = {x: cx + 3*ww + dw,   y: 2*ww, w: dw, h: dh};
    },

    draw: function(ctx, scores) {
      ctx.fillStyle = Pong.Colors.walls;
      for(var n = 0 ; n < this.walls.length ; n++)
        ctx.fillRect(this.walls[n].x, this.walls[n].y, this.walls[n].width, this.walls[n].height);
      this.drawDigit(ctx, Math.floor(scores[0] / 10), this.score1a);
      this.drawDigit(ctx, scores[0] % 10            , this.score1b);
      this.drawDigit(ctx, Math.floor(scores[1] / 10), this.score2a);
      this.drawDigit(ctx, scores[1] % 10            , this.score2b);
    },

    drawDigit: function(ctx, n, box) {
      ctx.fillStyle = Pong.Colors.score;
      var dw = this.pong.cfg.digitWidth / 3;
      var dh = this.pong.cfg.digitHeight / 5;
      var blocks = Pong.Court.DIGITS[n];
      if (blocks[0])
        ctx.fillRect(box.x, 				box.y, 					box.w, 	dh);
      if (blocks[1])
        ctx.fillRect(box.x, 				box.y, 					dw, 	box.h/2);
      if (blocks[2])
        ctx.fillRect(box.x + box.w - dw, 	box.y, 					dw, 	box.h/2);
      if (blocks[3])
        ctx.fillRect(box.x, 				box.y + box.h/2 - dh/2, box.w, 	dh);
      if (blocks[4])
        ctx.fillRect(box.x, 				box.y + box.h/2, 		dw, 	box.h/2);
      if (blocks[5])
        ctx.fillRect(box.x + box.w - dw, 	box.y + box.h/2, 		dw, 	box.h/2);
      if (blocks[6])
        ctx.fillRect(box.x, 				box.y + box.h - dh, 	box.w, 	dh);
    },

    DIGITS: [
      [1, 1, 1, 0, 1, 1, 1], // 0
      [0, 0, 1, 0, 0, 1, 0], // 1
      [1, 0, 1, 1, 1, 0, 1], // 2
      [1, 0, 1, 1, 0, 1, 1], // 3
      [0, 1, 1, 1, 0, 1, 0], // 4
      [1, 1, 0, 1, 0, 1, 1], // 5
      [1, 1, 0, 1, 1, 1, 1], // 6
      [1, 0, 1, 0, 0, 1, 0], // 7
      [1, 1, 1, 1, 1, 1, 1], // 8
      [1, 1, 1, 1, 0, 1, 0]  // 9
    ]

  },

  //=============================================================================
  // PADDLE
  //=============================================================================

  Paddle: {

    initialize: function(pong, rhs) {
      this.pong   = pong;
      this.width  = pong.cfg.paddleWidth;
      this.height = pong.cfg.paddleHeight;
      this.minY   = pong.cfg.wallWidth;
      this.maxY   = pong.height - pong.cfg.wallWidth - this.height;
      this.speed  = (this.maxY - this.minY) / pong.cfg.paddleSpeed;
      this.setpos(rhs ? pong.width - this.width : 0, this.minY + (this.maxY - this.minY)/2);
      this.setdir(0);
      this.forceDrop = false;
      this.dropped = false;
    },

	setDropRate: function(rate) {
		this.dropRate = rate;	// drop rate in s
	},

    setpos: function(x, y) {
      this.x      = x;
      this.y      = y;
      this.left   = this.x;
      this.right  = this.left + this.width;
      this.top    = this.y;
      this.bottom = this.y + this.height;
    },

    setdir: function(dy) {
      this.up   = (dy < 0 ? -dy : 0);
      this.down = (dy > 0 ?  dy : 0);
    },

    setAuto: function(on) {
      if (on && !this.auto) {
        this.auto = true;
      }
      else if (!on && this.auto) {
        this.auto = false;
        this.setdir(0);
      }
    },

    update: function(dt, ball) {
      if (this.auto)
        this.ai(dt, ball);

      var amount = this.down - this.up;
      if (amount != 0) {
        var y = this.y + (amount * dt * this.speed);
        if (y < this.minY)
          y = this.minY;
        else if (y > this.maxY)
          y = this.maxY;
        this.setpos(this.x, y);
      }
    },

    ai: function(dt, ball) {
      if (((ball.x < this.left) && (ball.dx < 0)) ||
          ((ball.x > this.right) && (ball.dx > 0))) {
        this.stopMovingUp();
        this.stopMovingDown();
        return;
      }

      this.predict(ball, dt);

      if (this.prediction) {
        if (this.prediction.y < (this.top + this.height/2 - 5)) {
          this.stopMovingDown();
          this.moveUp();
        }
        else if (this.prediction.y > (this.bottom - this.height/2 + 5)) {
          this.stopMovingUp();
          this.moveDown();
        }
        else {
          this.stopMovingUp();
          this.stopMovingDown();
        }
      }
    },

    predict: function(ball, dt) {

	if (this.pong.clockMode) {
		var now = new Date();
		if (!this.dropped) {
			if (this.dropRate.m && now.getMinutes() > 0 && now.getSeconds() < 20) {
				this.forceDrop = true;
				this.dropped = true;
				this.prediction = null;
			}
			if (this.dropRate.h && now.getMinutes() == 0) {
				this.forceDrop = true;
				this.dropped = true;
				this.prediction = null;
			}
		}
		if (now.getSeconds() > 20) {
			this.dropped = false;
		}
	}

    // only re-predict if the ball changed direction, or its been some amount of time since last prediction
    if (this.prediction &&
        ((this.prediction.dx * ball.dx) > 0) &&
        ((this.prediction.dy * ball.dy) > 0) &&
        (this.prediction.since < this.pong.cfg.aiReaction)) {
      this.prediction.since += dt;
      return;
    }

      var pt  = Pong.Helper.ballIntercept(ball, {left: this.left, right: this.right, top: -10000, bottom: 10000}, ball.dx * 10, ball.dy * 10);
      if (pt) {
        var t = this.minY + ball.radius;
        var b = this.maxY + this.height - ball.radius;

		if (this.forceDrop) {
			pt.y += 2 * this.height;
		}

        while ((pt.y < t) || (pt.y > b)) {
          if (pt.y < t) {
            pt.y = t + (t - pt.y);
          }
          else if (pt.y > b) {
            pt.y = t + (b - t) - (pt.y - b);
          }
        }
        this.prediction = pt;
      }
      else {
        this.prediction = null;
      }

      if (this.prediction) {
        this.prediction.since = 0;
        this.prediction.dx = ball.dx;
        this.prediction.dy = ball.dy;
        this.prediction.radius = ball.radius;
        this.prediction.exactX = this.prediction.x;
        this.prediction.exactY = this.prediction.y;
		if (!this.forceDrop) {
			var closeness = (ball.dx < 0 ? ball.x - this.right : this.left - ball.x) / this.pong.width;
			var error = this.pong.cfg.aiErrorLevel * closeness;
			this.prediction.y = this.prediction.y + Game.random(-error, error);
		}
      }
    },

    draw: function(ctx) {
      ctx.fillStyle = Pong.Colors.walls;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      if (this.prediction && this.pong.cfg.predictions) {
        ctx.strokeStyle = Pong.Colors.predictionExact;
        ctx.strokeRect(this.prediction.x - this.prediction.radius, this.prediction.exactY - this.prediction.radius, this.prediction.radius*2, this.prediction.radius*2);
        ctx.strokeStyle = Pong.Colors.predictionGuess;
        ctx.strokeRect(this.prediction.x - this.prediction.radius, this.prediction.y - this.prediction.radius, this.prediction.radius*2, this.prediction.radius*2);
      }
    },

    moveUp:         function() { this.up   = 1; },
    moveDown:       function() { this.down = 1; },
    stopMovingUp:   function() { this.up   = 0; },
    stopMovingDown: function() { this.down = 0; }

  },

  //=============================================================================
  // BALL
  //=============================================================================

  Ball: {

    initialize: function(pong) {
      this.pong    = pong;
      this.radius  = pong.cfg.ballRadius;
      this.minX    = this.radius;
      this.maxX    = pong.width - this.radius;
      this.minY    = pong.cfg.wallWidth + this.radius;
      this.maxY    = pong.height - pong.cfg.wallWidth - this.radius;
      this.speed   = (this.maxX - this.minX) / pong.cfg.ballSpeed;
      this.accel   = pong.cfg.ballAccel;
    },

    reset: function(playerNo) {
      this.footprints = [];
      this.setpos(playerNo == 1 ?   this.maxX : this.minX,  Game.random(this.minY, this.maxY));
      this.setdir(playerNo == 1 ? -this.speed : this.speed, this.speed);
    },

    setpos: function(x, y) {
      this.x      = x;
      this.y      = y;
      this.left   = this.x - this.radius;
      this.top    = this.y - this.radius;
      this.right  = this.x + this.radius;
      this.bottom = this.y + this.radius;
    },

    setdir: function(dx, dy) {
      this.dxChanged = ((this.dx < 0) != (dx < 0)); // did horizontal direction change
      this.dyChanged = ((this.dy < 0) != (dy < 0)); // did vertical direction change
      this.dx = dx;
      this.dy = dy;
    },

    footprint: function() {
      if (this.pong.cfg.footprints) {
        if (!this.footprintCount || this.dxChanged || this.dyChanged) {
          this.footprints.push({x: this.x, y: this.y});
          if (this.footprints.length > 50)
            this.footprints.shift();
          this.footprintCount = 5;
        }
        else {
          this.footprintCount--;
        }
      }
    },

    update: function(dt, leftPaddle, rightPaddle) {

      pos = Pong.Helper.accelerate(this.x, this.y, this.dx, this.dy, this.accel, dt);

      if ((pos.dy > 0) && (pos.y > this.maxY)) {
        pos.y = this.maxY;
        pos.dy = -pos.dy;
      }
      else if ((pos.dy < 0) && (pos.y < this.minY)) {
        pos.y = this.minY;
        pos.dy = -pos.dy;
      }

      var paddle = (pos.dx < 0) ? leftPaddle : rightPaddle;
      var pt     = Pong.Helper.ballIntercept(this, paddle, pos.nx, pos.ny);

      if (pt) {
        switch(pt.d) {
          case 'left':
          case 'right':
            pos.x = pt.x;
            pos.dx = -pos.dx;
            break;
          case 'top':
          case 'bottom':
            pos.y = pt.y;
            pos.dy = -pos.dy;
            break;
        }

        // add/remove spin based on paddle direction
        if (paddle.up)
          pos.dy -= this.pong.cfg.ballSpinAdjust;
        else if (paddle.down)
          pos.dy += this.pong.cfg.ballSpinAdjust;
      }

      this.setpos(pos.x,  pos.y);
      this.setdir(pos.dx, pos.dy);
      this.footprint();
    },

    draw: function(ctx) {
      var w = h = 2* this.radius;
      ctx.fillStyle = Pong.Colors.ball;
      ctx.fillRect(this.x - this.radius, this.y - this.radius, w, h);
      if (this.pong.cfg.footprints) {
        var max = this.footprints.length;
        ctx.strokeStyle = Pong.Colors.footprint;
        for(var n = 0 ; n < max ; n++)
          ctx.strokeRect(this.footprints[n].x - this.radius, this.footprints[n].y - this.radius, w, h);
      }
    }

  },

  //=============================================================================
  // HELPER
  //=============================================================================

  Helper: {

    accelerate: function(x, y, dx, dy, accel, dt) {
      var x2  = x + (dt * dx) + (accel * dt * dt * 0.5);
      var y2  = y + (dt * dy) + (accel * dt * dt * 0.5);
      var dx2 = dx + (accel * dt) * (dx > 0 ? 1 : -1);
      var dy2 = dy + (accel * dt) * (dy > 0 ? 1 : -1);
      return { nx: (x2-x), ny: (y2-y), x: x2, y: y2, dx: dx2, dy: dy2 };
    },

    intercept: function(x1, y1, x2, y2, x3, y3, x4, y4, d) {
      var denom = ((y4-y3) * (x2-x1)) - ((x4-x3) * (y2-y1));
      if (denom != 0) {
        var ua = (((x4-x3) * (y1-y3)) - ((y4-y3) * (x1-x3))) / denom;
        if ((ua >= 0) && (ua <= 1)) {
          var ub = (((x2-x1) * (y1-y3)) - ((y2-y1) * (x1-x3))) / denom;
          if ((ub >= 0) && (ub <= 1)) {
            var x = x1 + (ua * (x2-x1));
            var y = y1 + (ua * (y2-y1));
            return { x: x, y: y, d: d};
          }
        }
      }
      return null;
    },

    ballIntercept: function(ball, rect, nx, ny) {
      var pt;
      if (nx < 0) {
        pt = Pong.Helper.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny, 
                                   rect.right  + ball.radius, 
                                   rect.top    - ball.radius, 
                                   rect.right  + ball.radius, 
                                   rect.bottom + ball.radius, 
                                   "right");
      }
      else if (nx > 0) {
        pt = Pong.Helper.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny, 
                                   rect.left   - ball.radius, 
                                   rect.top    - ball.radius, 
                                   rect.left   - ball.radius, 
                                   rect.bottom + ball.radius,
                                   "left");
      }
      if (!pt) {
        if (ny < 0) {
          pt = Pong.Helper.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny, 
                                     rect.left   - ball.radius, 
                                     rect.bottom + ball.radius, 
                                     rect.right  + ball.radius, 
                                     rect.bottom + ball.radius,
                                     "bottom");
        }
        else if (ny > 0) {
          pt = Pong.Helper.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny, 
                                     rect.left   - ball.radius, 
                                     rect.top    - ball.radius, 
                                     rect.right  + ball.radius, 
                                     rect.top    - ball.radius,
                                     "top");
        }
      }
      return pt;
    }

  }

  //=============================================================================

}; // Pong
