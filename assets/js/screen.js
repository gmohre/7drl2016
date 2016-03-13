Game.Screen = {};

Game.Screen.effects = {};

Game.Screen.addEffect = function(tile, pos, color, time) {
  var key = pos.x + "," + pos.y;
  Game.Screen.effects[key] = {x: pos.x, y: pos.y, tile: tile, color: color};
  setTimeout(function() { 
    delete Game.Screen.effects[key]; 
    Game.refresh();
  }, time);
};

Game.Screen.drawTile = function(container, tileIndex, pos, color) {
      var textures = PIXI.loader.resources["assets/i/tileset.json"].textures;
      var tile = new PIXI.Sprite(textures[tileIndex]);
      tile.tint = color || 0xFFFFFF;
      tile.position.x = pos.x * Game.tileSize.x;
      tile.position.y = pos.y * Game.tileSize.y;
      container.addChild(tile);
};

Game.Screen.titleScreen = {
  enter: function() {    console.log("Entered start screen."); },
  exit: function() { console.log("Exited start screen."); },
  render: function(display) {
    // Render title screen
  },
  handleInput: function(inputType, inputData) {
    Game.switchScreen(Game.Screen.playScreen);
  }
};

Game.Screen.playScreen = {
  player: null,
  level: 1,
  gameEnded: false,
  enter: function() {
    this.player = Object.create(Game.Entity).init(Game.Entity.templates.player);
    Game.Crates.init();
    this.newLevel(this.level);
  },
  everyTurn: function() {

  },
  exit: function() { 
    console.log("Exited play screen."); 
  },
  newLevel: function(level) {
    var width = Game.mapSize.x;
    var height = Game.mapSize.y;
    this.map = Game.Map.Generators.Basic.create(width, height);
    Game.Map.Generators.Basic.populate(this.map);
    Game.Map.Generators.Basic.addPlayer(this.map, this.player);
    this.grid = this.map.grid;
    this.map.engine.start();
  },
  render: function(display) {
    this.renderTiles(display);
    this.renderItems(display);
    this.renderEntities(display);
    this.renderEffects(display);
    Game.display.render(Game.stage);
  },
  renderTiles: function(display) {
    Game.display.backgroundColor = this.map.color;
    this.map.grid.eachCell( function(cell) {
      drawCell(Game.stage, cell);
    });

    function drawCell(container, cell) {
      var x = cell.x;
      var y = cell.y;
      var pos = {x: x, y: y};
      if (cell.dug) {
        if (cell.east  && cell.east.dug && cell.linked(cell.east))  { Game.Screen.drawTile(container, "dugeast", pos); }
        if (cell.west  && cell.west.dug && cell.linked(cell.west))  { Game.Screen.drawTile(container, "dugwest", pos); }
        if (cell.north && cell.north.dug && cell.linked(cell.north)) { Game.Screen.drawTile(container, "dugnorth", pos); }
        if (cell.south && cell.south.dug && cell.linked(cell.south)) { Game.Screen.drawTile(container, "dugsouth", pos); }
      }
    }
  },
  renderEntities: function(display) {
    for (var key in this.map.entities) {
      var entity = this.map.entities[key];
      Game.Screen.drawTile(Game.stage, entity.getTile(), {x: entity.x, y: entity.y}, entity.getColor() );
    }
  },
  renderItems: function(display) {
    for (var key in this.map.items) {
      var item = this.map.items[key];
      Game.Screen.drawTile(Game.stage, item.tile, {x: item.x, y: item.y}, item.color );
    }
  },
  renderEffects: function(display) {
    for (var key in Game.Screen.effects) {
      var effect = Game.Screen.effects[key];
      Game.Screen.drawTile(Game.stage, effect.tile, {x: effect.x, y: effect.y}, effect.color );
    }
  },

  handleInput: function(inputType, inputData) {
      // If the game is over, enter will bring the user to the losing screen.
    if (inputType === 'keydown') {
      // Movement
      if (inputData.keyCode === ROT.VK_LEFT || 
        inputData.keyCode === ROT.VK_H ||
        inputData.keyCode === ROT.VK_NUMPAD4 ||
        inputData.keyCode === ROT.VK_A) {
        this.move(-1, 0);
      } else if (inputData.keyCode === ROT.VK_RIGHT || 
                 inputData.keyCode === ROT.VK_L ||
                 inputData.keyCode === ROT.VK_NUMPAD6 ||
                 inputData.keyCode === ROT.VK_D) {
        this.move(1, 0);
      } else if (inputData.keyCode === ROT.VK_UP || 
                 inputData.keyCode === ROT.VK_K ||
                 inputData.keyCode === ROT.VK_NUMPAD8 ||
                 inputData.keyCode === ROT.VK_W) {
        this.move(0, -1);
      } else if (inputData.keyCode === ROT.VK_DOWN || 
                 inputData.keyCode === ROT.VK_J ||
                 inputData.keyCode === ROT.VK_NUMPAD2 ||
                 inputData.keyCode === ROT.VK_S) {
        this.move(0, 1);
      } else if (inputData.keyCode === ROT.VK_SPACE || 
                 inputData.keyCode === ROT.VK_PERIOD) {
        this.move(0, 0);
      }
      // Unlock the engine
      this.player.map.engine.unlock();
    } 
  },
  move: function(dX, dY) {
      var newX = this.player.x + dX;
      var newY = this.player.y + dY;
      // Try to move to the new cell
      if (this.player.tryMove(newX, newY, this.player.map)) {
        //collect items
        var item = this.player.map.itemAt(newX, newY);
        if (item) {
          var itemname = item.collect();
          if (this.player.items[itemname]) {
            this.player.items[itemname] += 1;
          } else {
            this.player.items[itemname] = 1;
          }
        }
      }
  },
};

Game.Screen.winScreen = {
  enter: function() {
      console.log("Entered win screen."); 
  },
  exit: function() { 
    console.log("Exited win screen."); 
  },
  render: function(display) {
      //render win screen
  },
  handleInput: function(inputType, inputData) {

  }
};

Game.Screen.loseScreen = {
  enter: function() { 
    console.log("Entered lose screen."); 
  },
  exit: function() { console.log("Exited lose screen."); },
  render: function(display) {
    //render lose screen
  },
  handleInput: function(inputType, inputData) {

  }
};