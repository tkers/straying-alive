const asArray = x => (x ? (x instanceof Array ? x : [x]) : []);
export const hasComponents = cnames => ent =>
  cnames.every(cname => !!ent.components[cname.name || cname]);
export const hasComponent = cname => hasComponents(asArray(cname));
export const hasTag = hasComponent;

export const createWorld = () => {
  const entities = [];
  const systems = [];
  let _entn = 0;

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

  const addEntity = ent => {
    ent.added = true;
    systems
      .filter(sys => hasComponents(sys.filter)(ent))
      .forEach(sys => sys.entities.push(ent));
    entities.push(ent);
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
    if (init instanceof Function) {
      init(newEnt);
    }
    addEntity(newEnt);
    return newEnt;
  };

  const addSystem = (filter, fn) => {
    const newSys = {
      filter: asArray(filter),
      entities: entities.filter(hasComponent(filter)),
      fn
    };
    systems.push(newSys);
  };

  const update = ctx => {
    systems.forEach(sys => sys.fn(sys.entities, ctx));
  };

  return {
    createEntity,
    addSystem,
    update
  };
};
