interface States {
  role: string;
}
export default class RoleCreep {
  creep: Creep;
  role: string;
  sourceId: string;
  taskId: string;
  constructor(creep: Creep) {
    this.creep = creep;
    this.role = creep.memory.role;
    this.sourceId = creep.memory.source;
    this.taskId = creep.memory.task;
  }

  run() {
    if (this.creep.canWork()) {
      if (this.taskId) {
        const target: any = Game.getObjectById(this.taskId as Id<_HasId>);
        const status = this.creep.transfer(target, RESOURCE_ENERGY);
        if (status === ERR_NOT_IN_RANGE) {
          this.creep.moveTo(target);
        } else if (status === OK) {
          this.creep.memory.task = "";
        } else {
          if (target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            this.creep.findTask();
          }
        }
      } else {
        this.creep.findTask();
      }
    } else {
      this.creep.feed();
    }
  }
}
