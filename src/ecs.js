const asArray = x => (x ? (x instanceof Array ? x : [x]) : []);
export const hasComponents = cnames => ent =>
  cnames.every(cname => !!ent.components[cname.name || cname]);
export const hasComponent = cname => hasComponents(asArray(cname));

export const createWorld = () => {
  const entities = [];
  const systems = [];
  let _entn = 0;

  const addComponent = (ent, comp) => {
    ent.components[comp.constructor.name] = comp;
    systems
      .filter(sys => !sys.entities.includes(ent))
      .filter(sys => hasComponents(sys.filter)(ent))
      .forEach(sys => sys.entities.push(ent));
    return ent;
  };

  const removeComponent = (ent, comp) => {
    delete ent.components[comp.name];
    systems
      .filter(sys => sys.entities.includes(ent))
      .filter(sys => !hasComponents(sys.filter)(ent))
      .forEach(sys => (sys.entities = sys.entities.filter(e => e !== ent)));
  };

  const addEntity = ent => {
    systems
      .filter(sys => hasComponents(sys.filter)(ent))
      .forEach(sys => sys.entities.push(ent));
    entities.push(ent);
  };

  const createEntity = init => {
    const newEnt = {
      id: ++_entn,
      components: {}
    };
    newEnt.addComponent = c => addComponent(newEnt, c);
    newEnt.removeComponent = c => removeComponent(newEnt, c);
    newEnt.hasComponent = c => hasComponent(c)(newEnt);
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
