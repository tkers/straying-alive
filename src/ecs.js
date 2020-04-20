const asArray = x => (x ? (x instanceof Array ? x : [x]) : []);
export const hasComponents = cnames => ent =>
  cnames.every(cname => !!ent.components[cname.name || cname]);
export const hasComponent = cname => hasComponents(asArray(cname));
export const hasTag = hasComponent;

export const createWorld = () => {
  const entities = [];
  const systems = [];
  const listeners = {};
  let _entn = 0;
  let _sysn = 0;

  const addEntityToSystems = ent => {
    systems
      .filter(sys => !sys.entities.includes(ent))
      .filter(sys => hasComponents(sys.filter)(ent))
      .forEach(sys => sys.entities.push(ent));
  };

  const removeEntityFromSystems = ent => {
    systems
      .filter(sys => sys.entities.includes(ent))
      .filter(sys => !hasComponents(sys.filter)(ent))
      .forEach(sys => (sys.entities = sys.entities.filter(e => e !== ent)));
  };

  const addComponent = (ent, comp) => {
    ent.components[comp.constructor.name] = comp;
    ent.added && addEntityToSystems(ent);
    return ent;
  };

  const addTag = (ent, tag) => {
    ent.components[tag] = true;
    ent.added && addEntityToSystems(ent);
    return ent;
  };

  const removeComponent = (ent, comp) => {
    delete ent.components[comp.name];
    ent.added && removeEntityFromSystems(ent);
    return ent;
  };

  const removeTag = (ent, tag) => {
    delete ent.components[tag];
    ent.added && removeEntityFromSystems(ent);
    return ent;
  };

  const getEntities = q => (q ? entities.filter(hasComponent(q)) : entities);

  const addEntity = ent => {
    ent.added = true;
    systems
      .filter(sys => hasComponents(sys.filter)(ent))
      .forEach(sys => sys.entities.push(ent));
    entities.push(ent);
  };

  const removeEntity = ent => {
    const ix = entities.indexOf(ent);
    if (ix > -1) {
      entities.splice(ix, 1);
    }
    systems.forEach(
      sys => (sys.entities = sys.entities.filter(e => e !== ent))
    );
  };

  const createEntity = init => {
    const newEnt = {
      id: ++_entn,
      components: {},
      added: false
    };
    newEnt.addComponent = c => addComponent(newEnt, c);
    newEnt.removeComponent = c => removeComponent(newEnt, c);
    newEnt.hasComponent = c => hasComponent(c)(newEnt);
    newEnt.addTag = t => addTag(newEnt, t);
    newEnt.removeTag = t => removeTag(newEnt, t);
    newEnt.hasTag = t => hasTag(t)(newEnt);
    newEnt.destroy = () => removeEntity(newEnt);
    newEnt.on = (name, fn) => {
      addListener(name, (...data) => fn(newEnt, ...data));
      return newEnt;
    };
    newEnt.emit = emit;
    if (init instanceof Function) {
      init(newEnt);
    }
    addEntity(newEnt);
    return newEnt;
  };

  const getSystems = q => (q ? systems.filter(s => s.tags[q]) : systems);

  const addSystem = (filter, fn) => {
    const newSys = {
      id: ++_sysn,
      filter: asArray(filter),
      entities: entities.filter(hasComponent(filter)),
      tags: [],
      isActive: true,
      fn
    };

    newSys.addTag = t => {
      newSys.tags[t] = true;
    };

    newSys.pause = () => {
      newSys.isActive = false;
    };

    newSys.resume = () => {
      newSys.isActive = true;
    };

    systems.push(newSys);
    return newSys;
  };

  const removeSystem = sys => {
    const ix = systems.indexOf(sys);
    if (ix > -1) {
      systems.splice(ix, 1);
    }
  };

  const addListener = (name, fn) => {
    if (!listeners[name]) {
      listeners[name] = [];
    }
    listeners[name].push(fn);
  };

  const emit = (name, ...data) => {
    if (listeners[name]) {
      listeners[name].forEach(fn => fn(...data));
      return listeners[name].length;
    } else {
      return 0;
    }
  };

  const update = ctx => {
    systems.filter(s => s.isActive).forEach(sys => sys.fn(sys.entities, ctx));
  };

  return {
    getEntities,
    getSystems,
    createEntity,
    addSystem,
    on: addListener,
    emit,
    update
  };
};
