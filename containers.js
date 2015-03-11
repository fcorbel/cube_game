var Tools = Tools || {};
Tools.Containers = {

  create3dContainer: function(x, y, z, initialValue) {
    var cont = {};
    var data = [];

    cont.sizeX = x;
    cont.sizeY = y;
    cont.sizeZ = z;

    /////////////////////
    // Public functions
    /////////////////////
    cont.show = function() {
      //draw from bottom to top (from y=0)
      var line = [];
      for (var i=0; i<cont.sizeY; i++) {
        console.group("Y = "+i);
        for (var j=0; j<cont.sizeZ; j++) {
          console.group("Z = "+j);
          for (var k=0; k<cont.sizeX; k++) {
            line.push(data[i*cont.sizeX*cont.sizeZ + j*cont.sizeX + k]);
          }
          console.log(line);
          line = [];
          console.groupEnd();
        }
        console.groupEnd();
      }
    };

    cont.inRange = function(x, y, z) {
      if (x<0 || y<0 || z<0 || x>=this.sizeX || y>=this.sizeY || z>=this.sizeZ) {
        return false;
      } else {
        return true;
      }
    };

    cont.get = function(x, y, z) {
      if (typeof x === "string") {
        var coord = x.split("-");
        z = parseInt(coord[2]);
        y = parseInt(coord[1]);
        x = parseInt(coord[0]);
      }
      if (x>=0 && x<cont.sizeX && y>=0 && y<cont.sizeY && z>=0 && z<cont.sizeZ) {
        return data[y*cont.sizeX*cont.sizeZ + z*cont.sizeX + x];
      } else {
        console.warn("Trying to access element out of the map: ["+x+","+y+","+z+"]");
        return undefined;
      }
    };

    cont.getA = function(coord) {
      var z = parseInt(coord[2]);
      var y = parseInt(coord[1]);
      var x = parseInt(coord[0]);
      if (x>=0 && x<cont.sizeX && y>=0 && y<cont.sizeY && z>=0 && z<cont.sizeZ) {
        return data[y*cont.sizeX*cont.sizeZ + z*cont.sizeX + x];
      } else {
        console.warn("Trying to access element out of the map: ["+x+","+y+","+z+"]");
        return undefined;
      }
    };

    cont.set = function(x, y, z,  el) {
      if (x<0 || y<0 || z<0 || x>=cont.sizeX || y>=cont.sizeY || z>=cont.sizeZ) {
        console.warn("Trying to set element out of the map: ["+x+","+y+","+z+"]");
        return null;
      }
      data[y*cont.sizeX*cont.sizeZ + z*cont.sizeX + x] = el;
      return [x, y, z];
    };

    cont.forEach = function(callback, thisArg) {
      var T, k, x, y, z;
      if (this === null) {
        throw new TypeError(" this is null or not defined");
      }
      // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
      var O = Object(data);
      // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
      // 3. Let len be ToUint32(lenValue).
      var len = O.length >>> 0;
      // 4. If IsCallable(callback) is false, throw a TypeError exception.
      // See: http://es5.github.com/#x9.11
      if (typeof callback !== "function") {
        throw new TypeError(callback + " is not a function");
      }
      // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
      if (arguments.length > 1) {
        T = thisArg;
      }
      // 6. Let k be 0
      k = 0;
      // 7. Repeat, while k < len
      while (k < len) {
        var kValue;
        // a. Let Pk be ToString(k).
        //   This is implicit for LHS operands of the in operator
        // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
        //   This step can be combined with c
        // c. If kPresent is true, then
        if (k in O) {
          // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
          kValue = O[k];

          // x = Math.floor(k/cont.sizeY);
          // y = k-x*cont.sizeY;
          
          y = Math.floor(k/(cont.sizeX*cont.sizeZ));
          z = Math.floor((k-(y*cont.sizeX*cont.sizeZ))/cont.sizeX);
          x = k-(y*cont.sizeX*cont.sizeZ)-(z*cont.sizeX);

          // ii. Call the Call internal method of callback with T as the this value and
          // argument list containing kValue, x, y, z and O.
          callback.call(T, kValue, x, y, z, O);
        }
        // d. Increase k by 1.
        k++;
      }
      // 8. return undefined
    };

    /////////////////////
    // Initialize
    /////////////////////
    // Types of arguments:
    // create(int, int, int)
    for (var i=0; i<cont.sizeY; i++) {
      for (var j=0; j<cont.sizeZ; j++) {
        for (var k=0; k<cont.sizeX; k++) {
          data.push(this.clone(initialValue));
        }
      }
    }

    return cont;
  },

  create2dContainer: function(x, y, initialValue) {
    var cont = {};
    var data = [];

    /////////////////////
    // Public functions
    /////////////////////
    cont.show = function() {
      for (var i=0; i<cont.sizeX; i++) {
        console.group(i);
        for (var j=0; j<cont.sizeY; j++) {
          console.log(data[i*cont.sizeY + j]);
        }
        console.groupEnd();
      }
    };

    cont.get = function(x, y) {
      if (x>=0 && x<cont.sizeX && y>=0 && y<cont.sizeY) {
        return data[x*cont.sizeY + y];
      } else {
        console.warn("Trying to access element out of the map");
        return undefined;
      }
    };

    cont.set = function(x, y, el) {
      if (x<0 ||  y<0 || x>=cont.sizeX || y>=cont.sizeY) {
        console.warn("Trying to set element out of the map: ["+x+","+y+"]");
        return null;
      }
      data[x*cont.sizeY + y] = el;
      return [x, y];
    };

    cont.forEach = function(callback, thisArg) {
      var T, k, x, y;
      if (this === null) {
        throw new TypeError(" this is null or not defined");
      }
      // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
      var O = Object(data);
      // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
      // 3. Let len be ToUint32(lenValue).
      var len = O.length >>> 0;
      // 4. If IsCallable(callback) is false, throw a TypeError exception.
      // See: http://es5.github.com/#x9.11
      if (typeof callback !== "function") {
        throw new TypeError(callback + " is not a function");
      }
      // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
      if (arguments.length > 1) {
        T = thisArg;
      }
      // 6. Let k be 0
      k = 0;
      // 7. Repeat, while k < len
      while (k < len) {
        var kValue;
        // a. Let Pk be ToString(k).
        //   This is implicit for LHS operands of the in operator
        // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
        //   This step can be combined with c
        // c. If kPresent is true, then
        if (k in O) {
          // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
          kValue = O[k];

          x = Math.floor(k/cont.sizeY);
          y = k-x*cont.sizeY;
          // ii. Call the Call internal method of callback with T as the this value and
          // argument list containing kValue, x, y, and O.
          callback.call(T, kValue, x, y, O);
        }
        // d. Increase k by 1.
        k++;
      }
      // 8. return undefined
    };

    cont.fillWithArray = function(myData) {
      cont.sizeX = myData[0].length;
      cont.sizeY = myData.length;

      for (var i = 0, x = 0; i<cont.sizeX; i++, x++) {
        for (var j=cont.sizeY-1, y = 0; j>=0; j--, y++) {
          var el = myData[j][i];
          cont.set(x, y, el);
        }
      }
    };


    /////////////////////
    // Initialize
    /////////////////////
    // Types of arguments:
    // create(int, int)
    // create(array)
    if (x instanceof Array) {
      cont.fillWithArray(x);
    } else {
      cont.sizeX = x;
      cont.sizeY = y;
      for (var i=0; i<x; i++) {
        for (var j=0; j<y; j++) {
          data.push(this.clone(initialValue));
        }
      }
    }

    return cont;
  },

  clone: function(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null === obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
  }

};
