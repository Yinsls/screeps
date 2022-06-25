Creep.prototype.canWork = function () {
  const working = this.memory.working;
  if (working) {
    this.memory.working = this.store[RESOURCE_ENERGY] > 0;
  } else {
    this.memory.working = this.store.getFreeCapacity() === 0;
  }
  return this.memory.working;
};
