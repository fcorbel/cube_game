var Factories = Factories || {};


Factories.entitiesFactory = function(debug) {
  this.debug = debug;
};
Factories.entitiesFactory.prototype.create = function(name, em) {
  var tpl;
  if (typeof name === "string") {
    tpl = ECS.Entities.Tpl[name];
    if (!tpl) {
      console.warn("No template named: "+name);
      return;
    }
  } else {
    // Assume name is an object with the template infos
    tpl = name;
  }
  var ent = Object.create(ECS.Entities.Entity.prototype);
  ECS.Entities.Entity.call(ent, tpl.type, tpl.name, em);
  for (var compName in tpl.comp) {
    if (typeof tpl.comp[compName] === "boolean" && typeof ECS.Components[compName] !== "boolean") {
      ECS.Entities.addComponent(ent, compName);
    } else {
      ECS.Entities.addComponent(ent, compName, tpl.comp[compName]);
    }
  }
  for (var i=0, l=tpl.sys.length; i<l; i++) {
    ECS.Entities.addSystem(ent, tpl.sys[i]);
  }

  return ent;
};

Factories.fac = new Factories.entitiesFactory(true);

