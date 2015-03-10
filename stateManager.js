"use strict";

var stateManager = {
  statePile: [],
  changeState: function(state) {
    if (stateManager.statePile[0]) {
      stateManager.statePile[0].exit();
    }
    stateManager.statePile.shift();
    stateManager.statePile.unshift(state);
    console.info("New state: " + stateManager.statePile[0].name);
    stateManager.statePile[0].enter();
  },
  pushState: function(state) {
    if (stateManager.statePile[0]) {
      stateManager.statePile[0].exit();
    }
    stateManager.statePile.unshift(state);
    console.info("New state: " + stateManager.statePile[0].name);
    stateManager.statePile[0].enter();
  },
  popState: function() {
    if (stateManager.statePile[0]) {
      stateManager.statePile[0].exit();
    }
    stateManager.statePile.shift();
    console.info("New state: " + stateManager.statePile[0].name);
    stateManager.statePile[0].enter();
  },

  ///////////////////
  // Events
  ///////////////////
  handleMouseMoved: function(event) {
    if (stateManager.statePile[0]) {
      stateManager.statePile[0].mouseMoved(event);
    }
  },
  handleMouseClicked: function(down, event) {
    if (stateManager.statePile[0]) {
      stateManager.statePile[0].mouseClicked(down, event);
    }
  },
  handleMouseWheel: function(event) {
    if (stateManager.statePile[0]) {
      stateManager.statePile[0].mouseWheel(event);
    }
  },
  handleKeyboardDown: function(event) {
    if (stateManager.statePile[0]) {
      stateManager.statePile[0].keyDown(event);
    }
  },
  handleKeyboardUp: function(event) {
    if (stateManager.statePile[0]) {
      stateManager.statePile[0].keyUp(event);
    }
  },
  update: function(delta) {
    if (stateManager.statePile[0]) {
      stateManager.statePile[0].update(delta);
    }
  },
  draw: function(delta) {
    if (stateManager.statePile[0]) {
      stateManager.statePile[0].draw(delta);
    }
  }
};


function createEmptyState() {
  var state = {};
  state.name = "Unknown";
  ///////////////
  // Private
  ///////////////

  ///////////////
  // Public
  ///////////////
  state.enter = function() {
    console.debug("Enter state");
  };
  state.exit = function() {
    console.debug("Exit state");
  };
  // Events
  state.mouseMoved = function(event) {
    console.debug("Mouse moved");
  };
  state.mouseClicked = function(down, event) {
    console.debug("Mouse clicked to: "+event.target.id);
  };
  state.mouseWheel = function(event) {
    console.debug("Mouse wheel: " + event.deltaY);
  };
  state.keyDown = function(event) {
    console.debug("Key down");
  };
  state.keyUp = function(event) {
    console.debug("Key up");
  };
  state.update = function(delta) {
    // console.debug("Update");
  };
  state.draw = function(delta) {
    // console.debug("Draw");
  };

  return state;
}
