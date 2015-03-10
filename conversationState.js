if (!Game) {
  var Game = {};
}
if (!Game.States) {
  Game.States = {};
}

Game.States.createConversation = function(from, to, content) {
  var state = createEmptyState();
  state.name = "conversation";
  // state.em = new Utils.EventManager(false);
  state.from = from;
  state.to = to;
  state.content = content.slice();
  
  var convEl = document.getElementById("conversation");
  var fromEl = convEl.getElementsByClassName("from")[0];
  var toEl = convEl.getElementsByClassName("to")[0];
  var messEl = convEl.getElementsByClassName("messageContent")[0];
  
  state.enter = function() {
    console.log("ENTER CONVERSATION STATE");
    //show gui
    if (this.from) {
      fromEl.innerHTML = this.from.name;
    } else {
      fromEl.innerHTML = "";
    }
    if (this.to) {
      toEl.innerHTML = this.to.name;
    } else {
      toEl.innerHTML = "";
    }
    convEl.style.display = "initial";
    this.showNextmessage();
  };

  state.exit = function() {
    console.log("LEAVE CONVERSATION STATE");
    //hide gui
    var convEl = document.getElementById("conversation");
    convEl.style.display = "none";
  };

  state.showNextmessage = function() {
    var mess = this.content.shift();
    if (!mess) {
      stateManager.popState();
      return null;
    }
    var cont = mess.content;
    switch (mess.type) {
      case "say":
        messEl.innerHTML = cont;
        break;
      case "do":
        cont();
        this.showNextmessage();
        break;
      case "ask":
        break;
      default:
        break;
    }

    
  };

  state.keyDown = function(event) {
    //Send an event for those interested
    this.showNextmessage();
  };

  state.mouseClicked = function(down, event) {
    if (down) {
      this.showNextmessage();
    }
  };

  state.mouseMoved = function(event) {
  };
  

  state.update = function(delta) {
    // this.em.send("updateLogic", delta);
    // this.em.process();
    // camera.update(delta);
    // TWEEN.update();
  };

  state.draw = function(delta) {
    // sceneInfos.render(camera.threejsCam);
  };

  return state;
};

Game.createConversation = function() {


  conv.showMessage = function(from, to, message) {
    console.log(from.name+" says to "+to.name+": "+message);

  };


  return conv;
};
