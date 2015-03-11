if (!Game) {
  var Game = {};
}
if (!Game.Graphics) {
  Game.Graphics = {};
}

Game.Graphics.voxelSize = {x:100, y:50, z:100};
Game.Graphics.selectableMeshs = [];

Game.Graphics.createScene = function() {
  var sc = {};

  // init Three.js
  sc.renderer = new THREE.WebGLRenderer();
  sc.renderer.setSize(window.innerWidth, window.innerHeight);
  sc.renderer.setClearColor(new THREE.Color(0xcccccc, 1)); //background color
  sc.scene = new THREE.Scene();

  sc.render = function(cam){
    this.renderer.render(this.scene, cam);
  };

  return sc;
};

Game.Graphics.createCamera = function(em) {
  var cam = {};
  
  cam.distance = 500;
  cam.minDistance = 200;
  cam.maxDistance = 2000;
  cam.angleZ = 45*(Math.PI/180);  //0=look horizontally
  cam.angleY = 0*(Math.PI/180); //0=parallel to z axis
  cam.focusPoint = [0, 0, 0];
  // cam.movement = {x:0, y:0, z:0};
  cam.rotation = {y:0, z:0};
  cam.moveSpeed = 150;
  cam.rotatingSpeed = 0.002;
  cam.zoomSpeed = 50;
  cam.startRotatingPoint = null;
  cam.threejsCam = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 1, 10000 );

  cam.setPosition = function() {
    cam.threejsCam.position.x = cam.focusPoint[0] + cam.distance * Math.cos(cam.angleZ) * Math.sin(cam.angleY);
    cam.threejsCam.position.y = cam.focusPoint[1] + Math.sin(cam.angleZ) * cam.distance;
    cam.threejsCam.position.z = cam.focusPoint[2] + cam.distance * Math.cos(cam.angleZ) * Math.cos(cam.angleY);

    // cam.threejsCam.rotation.x = -cam.angleZ; //Using lookAt seems enough
    cam.threejsCam.lookAt(new THREE.Vector3(cam.focusPoint[0], cam.focusPoint[1], cam.focusPoint[2]));
  };

  cam.rotate = function(x, y) {
    if (!cam.startRotatingPoint) {
      return;
    }
    var rotY = x - cam.startRotatingPoint[0];
    var rotZ = y - cam.startRotatingPoint[1];
    cam.angleY += -rotY*cam.rotatingSpeed;
    cam.angleZ += rotZ*cam.rotatingSpeed;
  };

  cam.update = function(delta) {
    // this.focusPoint[0] += delta * this.movement.x;
    // this.focusPoint[1] += delta * this.movement.y;
    // this.focusPoint[2] += delta * this.movement.z;
    cam.setPosition(); //TODO check if position changed
  };

  //set events
  em.register("mouseMoved", function(event) {
    //get mouse position relative to game window
    var domEl = document.getElementById("screen");
    var x = event.pageX - domEl.offsetLeft;
    var y = event.pageY - domEl.offsetTop;
    if (event.shiftKey) {
      cam.rotate(x, y);
    }
    cam.startRotatingPoint = [x, y];
  });

  em.register("mouseWheel", function(event) {
    if (event.target.classList.contains("background")) {
      var newDist = cam.distance + cam.zoomSpeed * event.deltaY;
      cam.distance = Math.min(Math.max(newDist, cam.minDistance), cam.maxDistance);
    }
  });

  cam.setPosition();
  return cam;
};

Game.Graphics.getAbsPosFromVoxPos = function(size, x, y, z) {
  //The absolute pos is the center of the entity
  var voxSize = this.voxelSize;
  var xAbs = x*voxSize.x + (voxSize.x*(size[0]-1)/2);
  var yAbs = y*voxSize.y + (voxSize.y*(size[1]-1)/2);
  var zAbs = z*voxSize.z + (voxSize.z*(size[2]-1)/2);
  return [xAbs, yAbs, zAbs];
};

Game.Graphics.getVoxPosFromAbsPos = function(size, x, y, z) {
    var voxSize = this.voxelSize;
    // console.group("Abs to Vox");
    var ajustedX = x - ((size[0]-1)/2*voxSize.x) + (voxSize.x/2);
    var ajustedY = y - ((size[1]-1)/2*voxSize.y) + (voxSize.y/2);
    var ajustedZ = z - ((size[2]-1)/2*voxSize.z) + (voxSize.z/2);
    var xVox = Math.floor(ajustedX / voxSize.x);
    var yVox = Math.floor(ajustedY / voxSize.y);
    var zVox = Math.floor(ajustedZ / voxSize.z);
    // console.debug("Pointed at vox: "+xVox+", "+yVox+", "+zVox); 
    // console.groupEnd();
    return [xVox, yVox, zVox];
};

Game.Graphics.createChunkMesh = function(startP, endP, data, entList) {
  console.info("Create chunk mesh from "+startP+" to "+endP);
  // return Game.Graphics.createChunkMeshNaive(startP, endP, data);
  // return Game.Graphics.createChunkMeshSurface(startP, endP, data);
  var mesh = Game.Graphics.createChunkOneMeshSurface(startP, endP, data, entList);
  mesh.name = "chunk";
  return mesh;
};

// Game.Graphics.createChunkMeshNaive = function(startP, endP, data) {
//   //works only with materials = colors
//   var mesh = new THREE.Object3D();
//   for (var x=startP[0]; x<=endP[0]; x++) {
//     for (var y=startP[1]; y<=endP[1]; y++) {
//       for (var z=startP[2]; z<=endP[2]; z++) {
//         var uids = data.get(x, y, z);
//         for (var i=0; i<uids.length; i++) {
//           var el = Game.e.entities[uids[i]];
//           if (el) {
//             var meshName = el.get("appearance", "meshName");
//             var meshSize = el.get("size", "value");
//             var elMesh = null;
//             if (meshName) {
//               elMesh = Game.Graphics.meshFactory.get(meshName);
//             }
//             if (elMesh) {
//               elMesh.position.x = x*Game.Graphics.voxelSize.x + (Game.Graphics.voxelSize.x*(meshSize[0]-1)/2);
//               elMesh.position.y = y*Game.Graphics.voxelSize.y + (Game.Graphics.voxelSize.y*(meshSize[1]-1)/2);
//               elMesh.position.z = z*Game.Graphics.voxelSize.z + (Game.Graphics.voxelSize.z*(meshSize[2]-1)/2);
//               mesh.add(elMesh);
//             }
//           }
//         }
//       }
//     }
//   }
// 
//   return mesh;
// };

// Game.Graphics.createChunkMeshSurface = function(startP, endP, data) {
//   //Don't draw hidden faces
//   var mesh = new THREE.Object3D();
//   for (var x=startP[0]; x<=endP[0]; x++) {
//     for (var y=startP[1]; y<=endP[1]; y++) {
//       for (var z=startP[2]; z<=endP[2]; z++) {
//         var uids = data.get(x, y, z);
//         for (var i=0; i<uids.length; i++) {
//           var el = Game.e.entities[uids[i]];
//           if (el) {
//             var meshName = el.get("appearance", "meshName");
//             var meshSize = el.get("size", "value");
//             var elMesh = new THREE.Object3D();
//             if (meshName) {
//               elMesh.position.x = x*Game.Graphics.voxelSize.x + (Game.Graphics.voxelSize.x*(meshSize[0]-1)/2);
//               elMesh.position.y = y*Game.Graphics.voxelSize.y + (Game.Graphics.voxelSize.y*(meshSize[1]-1)/2);
//               elMesh.position.z = z*Game.Graphics.voxelSize.z + (Game.Graphics.voxelSize.z*(meshSize[2]-1)/2);
//               var fNames = Game.Graphics.getFacesToDraw(x,y,z,data);
//               for (var j=0; j<fNames.length; j++) {
//                 elMesh.add(Game.Graphics.meshFactory[fNames[j]](meshName));
//               }
//             }
//             mesh.add(elMesh);
//           } else {
//             console.warn("There is nothing in: "+x+","+y+","+z);
//           }
//         }
//       }
//     }
//   }
//   return mesh;
// };

Game.Graphics.createChunkOneMeshSurface = function(startP, endP, data, entList) {
  //Don't draw hidden faces
  var mesh = new THREE.Object3D();
  var dummy = new THREE.Mesh();
  var chunkGeo = new THREE.Geometry();
  for (var x=startP[0]; x<=endP[0]; x++) {
    for (var y=startP[1]; y<=endP[1]; y++) {
      for (var z=startP[2]; z<=endP[2]; z++) {
        var uids = data.get(x, y, z);
        for (var i=0; i<uids.length; i++) {
          var el = entList[uids[i]];
          if (el && el.type === "terrain") {
            var meshName = el.c.appearance.meshName;
            var meshSize = el.c.size;
            if (meshName) {
              dummy.position.x = x*Game.Graphics.voxelSize.x + (Game.Graphics.voxelSize.x*(meshSize[0]-1)/2);
              dummy.position.y = y*Game.Graphics.voxelSize.y + (Game.Graphics.voxelSize.y*(meshSize[1]-1)/2);
              dummy.position.z = z*Game.Graphics.voxelSize.z + (Game.Graphics.voxelSize.z*(meshSize[2]-1)/2);
              var fNames = Game.Graphics.getFacesToDraw(x,y,z,data, entList);
              for (var j=0; j<fNames.length; j++) {
                if (fNames[j] === "getPY") { //don't draw faces at the bottom
                  continue;
                }
                dummy.geometry = Game.Graphics.geoFactory[fNames[j]](meshName);
                THREE.GeometryUtils.merge(chunkGeo, dummy);
              }
            }
          }
        }
      }
    }
  }
  var material = Game.Graphics.matFactory.zoneMaterial;
  mesh = new THREE.Mesh(chunkGeo, material);  
  return mesh;
};

Game.Graphics.getFacesToDraw = function(x, y, z, data, entList) {
  var fNames = ["getNX", "getPX", "getNY", "getPY", "getNZ", "getPZ"];
  var facesList = [];
  var ngb;
  var i;
  var uids;
  //top
  var draw = true;
  if (y+1 < data.sizeY) {
    uids = data.get(x, y+1, z);
    if (uids) {
      for (i=0; i<uids.length; i++) {
        ngb =  entList[uids[i]];
        if (ngb.c.appearance.oppacity === 1 && ngb.type === "terrain") {
          draw = false;
          break;
        }
      }
    }
  }
  if (draw) {
    facesList.push(fNames[2]);
  }
  //bottom
  draw = true;
  if (y-1 >= 0) {
    uids = data.get(x, y-1, z);
    if (uids) {
      for (i=0; i<uids.length; i++) {
        ngb =  entList[uids[i]];
        if (ngb.c.appearance.oppacity === 1 && ngb.type === "terrain") {
          draw = false;
          break;
        }
      }
    }
  }
  if (draw) {
    facesList.push(fNames[3]);
  }
  //left
  draw = true;
  if (x-1 >= 0) {
    uids = data.get(x-1, y, z);
    if (uids) {
      for (i=0; i<uids.length; i++) {
        ngb =  entList[uids[i]];
        if (ngb.c.appearance.oppacity === 1 && ngb.type === "terrain") {
          draw = false;
          break;
        }
      }
    }
  }
  if (draw) {
    facesList.push(fNames[1]);
  }
  //right
  draw = true;
  if (x+1 < data.sizeX) {
    uids = data.get(x+1, y, z);
    if (uids) {
      for (i=0; i<uids.length; i++) {
        ngb =  entList[uids[i]];
        if (ngb.c.appearance.oppacity === 1 && ngb.type === "terrain") {
          draw = false;
          break;
        }
      }
    }
  }
  if (draw) {
    facesList.push(fNames[0]);
  }
  //front
  draw = true;
  if (z+1 < data.sizeZ) {
    uids = data.get(x, y, z+1);
    if (uids) {
      for (i=0; i<uids.length; i++) {
        ngb =  entList[uids[i]];
        if (ngb.c.appearance.oppacity === 1 && ngb.type === "terrain") {
          draw = false;
          break;
        }
      }
    }
  }
  if (draw) {
    facesList.push(fNames[4]);
  }
  //back
  draw = true;
  if (z-1 >= 0) {
    uids = data.get(x, y, z-1);
    if (uids) {
      for (i=0; i<uids.length; i++) {
        ngb =  entList[uids[i]];
        if (ngb.c.appearance.oppacity === 1 && ngb.type === "terrain") {
          draw = false;
          break;
        }
      }
    }
  }
  if (draw) {
    facesList.push(fNames[5]);
  }

  return facesList;
};

Game.Graphics.getHighlightTilesMesh = function(tiles, highlightStyle) {
  var mesh = new THREE.Object3D();
  var dummy = new THREE.Mesh();
  var geo = new THREE.Geometry();
  var coord;
  function addToGeo(x,y,z) {
    dummy.position.x = x * Game.Graphics.voxelSize.x;
    dummy.position.y = y * Game.Graphics.voxelSize.y;
    dummy.position.z = z * Game.Graphics.voxelSize.z;
    dummy.geometry = Game.Graphics.geoFactory.get(highlightStyle);
    THREE.GeometryUtils.merge(geo, dummy);
  }
  
  for (var i=0, l=tiles.length; i<l; i++) {
    coord = tiles[i];
    addToGeo(coord[0], coord[1], coord[2]);
  }
  var material = Game.Graphics.matFactory.get(highlightStyle);
  mesh = new THREE.Mesh(geo, material);
  return mesh;
};

Game.Graphics.createMeshFactory = function(matStyle) {
  var fac = {};

  fac.get = function(meshName) {
    var material = Game.Graphics.matFactory.get(meshName);
    var geometry = Game.Graphics.geoFactory.get(meshName);
    mesh = new THREE.Mesh(geometry, material);
    return mesh;
  };

  fac.getNY = function(meshName) {
    var material = Game.Graphics.matFactory.getNY(meshName);
    var geometry = Game.Graphics.geoFactory.getNY(meshName);
    mesh = new THREE.Mesh(geometry, material);
    return mesh;
  };

  fac.getPY = function(meshName) {
    var material = Game.Graphics.matFactory.getPY(meshName);
    var geometry = Game.Graphics.geoFactory.getPY(meshName);
    mesh = new THREE.Mesh(geometry, material);
    return mesh;
  };

  fac.getNZ = function(meshName) {
    var material = Game.Graphics.matFactory.getNZ(meshName);
    var geometry = Game.Graphics.geoFactory.getNZ(meshName);
    mesh = new THREE.Mesh(geometry, material);
    return mesh;
  };

  fac.getPZ = function(meshName) {
    var material = Game.Graphics.matFactory.getPZ(meshName);
    var geometry = Game.Graphics.geoFactory.getPZ(meshName);
    mesh = new THREE.Mesh(geometry, material);
    return mesh;
  };

  fac.getPX = function(meshName) {
    var material = Game.Graphics.matFactory.getPX(meshName);
    var geometry = Game.Graphics.geoFactory.getPX(meshName);
    mesh = new THREE.Mesh(geometry, material);
    return mesh;
  };

  fac.getNX = function(meshName) {
    var material = Game.Graphics.matFactory.getNX(meshName);
    var geometry = Game.Graphics.geoFactory.getNX(meshName);
    mesh = new THREE.Mesh(geometry, material);
    return mesh;
  };

  return fac;
};

Game.Graphics.createMaterialFactory = function(matStyle) {
  var fac = {};
  var style = matStyle || "color";

  fac.texture = null;
  if (style === "texture") {
    fac.texture = THREE.ImageUtils.loadTexture("atlas.png");
    fac.texture.magFilter = THREE.NearestFilter;
    fac.texture.minFilter = THREE.NearestMipMapLinearFilter;
    fac.zoneMaterial = new THREE.MeshLambertMaterial({map: fac.texture});
  }
  
  var cacheGet = {};

  fac.get = function(meshName) {
    var material;
    if (cacheGet[meshName]) {
      return cacheGet[meshName];
    }
    if (style === "color") {
      switch (meshName) {
        case "stone":
          material = new THREE.MeshLambertMaterial({color: 0x87806F});
          break;
        case "earth":
          material = new THREE.MeshLambertMaterial({color: 0x6A4A3C});
          break;
        case "water":
          material = new THREE.MeshLambertMaterial({color: 0x00A0B0});
          break;
        case "grass":
          material = new THREE.MeshLambertMaterial({color: 0x92C651});
          break;
        case "averageGuy":
          material = new THREE.MeshBasicMaterial({color: 0xABADB2});
          break;
        case "specialGuy":
          material = new THREE.MeshBasicMaterial({color: 0xAE2F27});
          break;
        default:
          material = new THREE.MeshBasicMaterial({color: 0xff00ff});
          console.warn("No material for mesh named: "+meshName);
      }
    } else if (style === "texture") {
      switch (meshName) {
        case "averageGuy":
          material = new THREE.MeshBasicMaterial({color: 0xABADB2});
          break;
        case "specialGuy":
          material = new THREE.MeshBasicMaterial({color: 0xAE2F27});
          break;
        case "pointerIndicator":
          material = new THREE.MeshBasicMaterial({color: 0xFFFFFF, opacity: 0.4, transparent: true});
          break;
        case "mouse":
          material = new THREE.MeshBasicMaterial({color: 0xAAAAAA});
          break;
        case "moveHighlight":
          material = new THREE.MeshBasicMaterial({color: 0xffff00, opacity: 0.3, transparent: true});
          break;
        case "defaultHighlight":
          material = new THREE.MeshBasicMaterial({color: 0xff00ff, opacity: 0.4, transparent: true});
          break;
        case "action":
          material = new THREE.MeshBasicMaterial({color: 0xff9099, opacity: 0.3, transparent: true});
          break;
        case "whiteSquare":
          material = new THREE.MeshBasicMaterial({color: 0xffffff, opacity: 0.5, transparent: true});
          break;
        default:
          material = new THREE.MeshLambertMaterial({ map: fac.texture });
      }
    }
    cacheGet[meshName] = material;
    return material;
  };

  fac.getNY = function(meshName) {
    var material;
    if (style === "color") {
      switch (meshName) {
        case "stone":
          material = new THREE.MeshLambertMaterial({color: 0x87806F});
          break;
        case "earth":
          material = new THREE.MeshLambertMaterial({color: 0x6A4A3C});
          break;
        case "water":
          material = new THREE.MeshLambertMaterial({color: 0x00A0B0});
          break;
        case "grass":
          material = new THREE.MeshLambertMaterial({color: 0x92C651});
          break;
        default:
          material = new THREE.MeshBasicMaterial({color: 0xff00ff});
          console.warn("No material for mesh named: "+meshName);
      }
    } else if (style === "texture") {
      material = new THREE.MeshLambertMaterial({ map: fac.texture });
    }
    return material;
  };
  fac.getPY = function(meshName) {
    var material;
    if (style === "color") {
      switch (meshName) {
        case "stone":
          material = new THREE.MeshLambertMaterial({color: 0x87806F});
          break;
        case "earth":
          material = new THREE.MeshLambertMaterial({color: 0x6A4A3C});
          break;
        case "water":
          material = new THREE.MeshLambertMaterial({color: 0x00A0B0});
          break;
        case "grass":
          material = new THREE.MeshLambertMaterial({color: 0x92C651});
          break;
        default:
          material = new THREE.MeshBasicMaterial({color: 0xff00ff});
          console.warn("No material for mesh named: "+meshName);
      }
    } else if (style === "texture") {
      material = new THREE.MeshLambertMaterial({ map: fac.texture });
    }
    return material;
  };
  fac.getNX = function(meshName) {
    var material;
    if (style === "color") {
      switch (meshName) {
        case "stone":
          material = new THREE.MeshLambertMaterial({color: 0x87806F});
          break;
        case "earth":
          material = new THREE.MeshLambertMaterial({color: 0x6A4A3C});
          break;
        case "water":
          material = new THREE.MeshLambertMaterial({color: 0x00A0B0});
          break;
        case "grass":
          material = new THREE.MeshLambertMaterial({color: 0x92C651});
          break;
        default:
          material = new THREE.MeshBasicMaterial({color: 0xff00ff});
          console.warn("No material for mesh named: "+meshName);
      }
    } else if (style === "texture") {
      material = new THREE.MeshLambertMaterial({ map: fac.texture });
    }
    return material;
  };
  fac.getPX = function(meshName) {
    var material;
    if (style === "color") {
      switch (meshName) {
        case "stone":
          material = new THREE.MeshLambertMaterial({color: 0x87806F});
          break;
        case "earth":
          material = new THREE.MeshLambertMaterial({color: 0x6A4A3C});
          break;
        case "water":
          material = new THREE.MeshLambertMaterial({color: 0x00A0B0});
          break;
        case "grass":
          material = new THREE.MeshLambertMaterial({color: 0x92C651});
          break;
        default:
          material = new THREE.MeshBasicMaterial({color: 0xff00ff});
          console.warn("No material for mesh named: "+meshName);
      }
    } else if (style === "texture") {
      material = new THREE.MeshLambertMaterial({ map: fac.texture });
    }
    return material;
  };
  fac.getNZ = function(meshName) {
    var material;
    if (style === "color") {
      switch (meshName) {
        case "stone":
          material = new THREE.MeshLambertMaterial({color: 0x87806F});
          break;
        case "earth":
          material = new THREE.MeshLambertMaterial({color: 0x6A4A3C});
          break;
        case "water":
          material = new THREE.MeshLambertMaterial({color: 0x00A0B0});
          break;
        case "grass":
          material = new THREE.MeshLambertMaterial({color: 0x92C651});
          break;
        default:
          material = new THREE.MeshBasicMaterial({color: 0xff00ff});
          console.warn("No material for mesh named: "+meshName);
      }
    } else if (style === "texture") {
      material = new THREE.MeshLambertMaterial({ map: fac.texture });
    }
    return material;
  };
  fac.getPZ = function(meshName) {
    var material;
    if (style === "color") {
      switch (meshName) {
        case "stone":
          material = new THREE.MeshLambertMaterial({color: 0x87806F});
          break;
        case "earth":
          material = new THREE.MeshLambertMaterial({color: 0x6A4A3C});
          break;
        case "water":
          material = new THREE.MeshLambertMaterial({color: 0x00A0B0});
          break;
        case "grass":
          material = new THREE.MeshLambertMaterial({color: 0x92C651});
          break;
        default:
          material = new THREE.MeshBasicMaterial({color: 0xff00ff});
          console.warn("No material for mesh named: "+meshName);
      }
    } else if (style === "texture") {
      material = new THREE.MeshLambertMaterial({ map: fac.texture });
    }
    return material;
  };

  return fac;
};

Game.Graphics.createGeometryFactory = function() {
  var fac = {};
  function setVertexUVs(geom, x, y) {
    //nb of textures in atlas
    var sizeX = 8;
    var sizeY = 8;
    if (x>=sizeX || x<0 || y>=sizeY || y<0) {
      console.warn("Trying to set UVs to an uncorrect texture coord");
      return null;
    } else {
      var top = 1 - (1/sizeY * y);
      var bottom = 1 - (1/sizeY * (y+1));
      var left = 1/sizeX * x;
      var right = 1/sizeX * (x+1);
      geom.faceVertexUvs[0][0][0].y = top;
      geom.faceVertexUvs[0][0][2].y = top;
      geom.faceVertexUvs[0][1][2].y = top;
      geom.faceVertexUvs[0][0][1].y = bottom;
      geom.faceVertexUvs[0][1][0].y = bottom;
      geom.faceVertexUvs[0][1][1].y = bottom;
      geom.faceVertexUvs[0][0][0].x = left;
      geom.faceVertexUvs[0][0][1].x = left;
      geom.faceVertexUvs[0][1][0].x = left;
      geom.faceVertexUvs[0][0][2].x = right;
      geom.faceVertexUvs[0][1][2].x = right;
      geom.faceVertexUvs[0][1][1].x = right;
      // console.debug("setted vertices to:"+top+" - "+bottom+" - "+left+" - "+right);
      return true;
    }
  }

  var matrix = new THREE.Matrix4();
  var cubeGeo = new THREE.CubeGeometry(this.voxelSize.x, this.voxelSize.y, this.voxelSize.z);
  var NYGeo = new THREE.PlaneGeometry(this.voxelSize.x, this.voxelSize.z);
  NYGeo.applyMatrix(matrix.makeRotationX(-Math.PI / 2));
  NYGeo.applyMatrix(matrix.makeTranslation(0, this.voxelSize.y/2, 0));
  var PYGeo = new THREE.PlaneGeometry(this.voxelSize.x, this.voxelSize.z);
  PYGeo.applyMatrix(matrix.makeRotationX(Math.PI / 2));
  PYGeo.applyMatrix(matrix.makeTranslation(0, -this.voxelSize.y/2, 0));
  var NZGeo = new THREE.PlaneGeometry(this.voxelSize.x, this.voxelSize.y);
  NZGeo.applyMatrix(matrix.makeTranslation(0, 0, this.voxelSize.x/2));
  var PZGeo = new THREE.PlaneGeometry(this.voxelSize.x, this.voxelSize.y);
  PZGeo.applyMatrix(matrix.makeTranslation(0, 0, this.voxelSize.x/2));
  PZGeo.applyMatrix(matrix.makeRotationX(-Math.PI));
  var PXGeo = new THREE.PlaneGeometry(this.voxelSize.z, this.voxelSize.y);
  PXGeo.applyMatrix(matrix.makeRotationY(-Math.PI / 2));
  PXGeo.applyMatrix(matrix.makeTranslation(-this.voxelSize.x/2, 0, 0));
  var NXGeo = new THREE.PlaneGeometry(this.voxelSize.z, this.voxelSize.y);
  NXGeo.applyMatrix(matrix.makeRotationY(Math.PI / 2));
  NXGeo.applyMatrix(matrix.makeTranslation(this.voxelSize.x/2, 0, 0));

  var cacheGet = {};

  fac.get = function(meshName) {
    var geometry;
    if (cacheGet[meshName]) {
      return cacheGet[meshName];
    }
    switch (meshName) {
      case "averageGuy":
        geometry = new THREE.CubeGeometry(Game.Graphics.voxelSize.x/2, Game.Graphics.voxelSize.y*4, Game.Graphics.voxelSize.z/2);
        break;
      case "specialGuy":
        geometry = new THREE.CubeGeometry(Game.Graphics.voxelSize.x/2, Game.Graphics.voxelSize.y*4, Game.Graphics.voxelSize.z/2);
        break;
      case "pointerIndicator":
        geometry = new THREE.PlaneGeometry(Game.Graphics.voxelSize.x, Game.Graphics.voxelSize.z);
        geometry.applyMatrix(matrix.makeRotationX(-Math.PI / 2));
        geometry.applyMatrix(matrix.makeTranslation(0, -Game.Graphics.voxelSize.y/2, 0));
        break;
      case "mouse":
        geometry = new THREE.CubeGeometry(Game.Graphics.voxelSize.x/2, Game.Graphics.voxelSize.y, Game.Graphics.voxelSize.z/2);
        break;
      case "moveHighlight":
        geometry = new THREE.PlaneGeometry(Game.Graphics.voxelSize.x, Game.Graphics.voxelSize.z);
        geometry.applyMatrix(matrix.makeRotationX(-Math.PI / 2));
        geometry.applyMatrix(matrix.makeTranslation(0, -Game.Graphics.voxelSize.y/2, 0));
        break;
      case "defaultHighlight":
        geometry = cubeGeo;
        break;
      case "action":
        geometry = new THREE.PlaneGeometry(Game.Graphics.voxelSize.x, Game.Graphics.voxelSize.z);
        geometry.applyMatrix(matrix.makeRotationX(-Math.PI / 2));
        geometry.applyMatrix(matrix.makeTranslation(0, -Game.Graphics.voxelSize.y/2, 0));
        break;
      case "whiteSquare":
        geometry = NYGeo.clone();
        break;
      default:
        geometry = cubeGeo;
    }
    cacheGet[meshName] = geometry;
    return geometry;
  };

  fac.getNY = function(meshName) {
    var geometry;
    geometry = NYGeo;
    switch (meshName) {
      case "stoneTerrain":
        setVertexUVs(geometry, 0, 0);
        break;
      case "earthTerrain":
        setVertexUVs(geometry, 0, 1);
        break;
      case "waterTerrain":
        setVertexUVs(geometry, 0, 2);
        break;
      case "grassTerrain":
        setVertexUVs(geometry, 0, 3);
        break;
      default:
        console.warn("No NY geometry for mesh named: "+meshName);
    }
    return geometry;
  };

  fac.getPY = function(meshName) {
    var geometry;
    geometry = PYGeo;
    switch (meshName) {
      case "stoneTerrain":
        setVertexUVs(geometry, 1, 0);
        break;
      case "earthTerrain":
        setVertexUVs(geometry, 1, 1);
        break;
      case "waterTerrain":
        setVertexUVs(gometry, 1, 2);
        break;
      case "grassTerrain":
        setVertexUVs(geometry, 1, 3);
        break;
      default:
        console.warn("No PY geometry for mesh named: "+meshName);
    }
    return geometry;
  };

  fac.getNZ = function(meshName) {
    var geometry;
    geometry = NZGeo;
    switch (meshName) {
      case "stoneTerrain":
        setVertexUVs(geometry, 2, 0);
        break;
      case "earthTerrain":
        setVertexUVs(geometry, 2, 1);
        break;
      case "waterTerrain":
        setVertexUVs(geometry, 2, 2);
        break;
      case "grassTerrain":
        setVertexUVs(geometry, 2, 3);
        break;
      default:
        console.warn("No NZ geometry for mesh named: "+meshName);
    }
    return geometry;
  };

  fac.getPZ = function(meshName) {
    var geometry;
    geometry = PZGeo;
    switch (meshName) {
      case "stoneTerrain":
        setVertexUVs(geometry, 2, 0);
        break;
      case "earthTerrain":
        setVertexUVs(geometry, 2, 1);
        break;
      case "waterTerrain":
        setVertexUVs(geometry, 2, 2);
        break;
      case "grassTerrain":
        setVertexUVs(geometry, 2, 3);
        break;
      default:
        console.warn("No PZ geometry for mesh named: "+meshName);
    }
    return geometry;
  };

  fac.getPX = function(meshName) {
    var geometry;
    geometry = PXGeo;
    switch (meshName) {
      case "stoneTerrain":
        setVertexUVs(geometry, 3, 0);
        break;
      case "earthTerrain":
        setVertexUVs(geometry, 3, 1);
        break;
      case "waterTerrain":
        setVertexUVs(geometry, 3, 2);
        break;
      case "grassTerrain":
        setVertexUVs(geometry, 3, 3);
        break;
      default:
        console.warn("No PX geometry for mesh named: "+meshName);
    }
    return geometry;
  };

  fac.getNX = function(meshName) {
    var geometry;
    geometry = NXGeo;
    switch (meshName) {
      case "stoneTerrain":
        setVertexUVs(geometry, 2, 0);
        break;
      case "earthTerrain":
        setVertexUVs(geometry, 2, 1);
        break;
      case "waterTerrain":
        setVertexUVs(geometry, 2, 2);
        break;
      case "grassTerrain":
        setVertexUVs(geometry, 2, 3);
        break;
      default:
        console.warn("No NX geometry for mesh named: "+meshName);
    }
    return geometry;
  };

  return fac;
};

Game.Graphics.geoFactory = Game.Graphics.createGeometryFactory();
Game.Graphics.matFactory = Game.Graphics.createMaterialFactory("texture");
Game.Graphics.meshFactory = Game.Graphics.createMeshFactory();
