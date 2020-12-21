import {CommCreep} from './common'
class Carriage extends CommCreep {
  constructor(creep: Creep) {
    super(creep)
  }

  /** 检测目标是否处理完成 - 能量补给完毕 */
  testTarget(): boolean {
      const target = this.getTask(this.creep.memory.task)
      return target?target.store.getFreeCapacity(RESOURCE_ENERGY) === 0:true
  }

  /** 入口 */
  run() {
    if(this.testStatus()) {
      if(!this.creep.memory.task) this.setTask('harvest');
      const target = this.getTask();
      const status = this.creep.transfer(target, RESOURCE_ENERGY)
      if(status === ERR_NOT_IN_RANGE) {
        this.moveTo();
      }else if(status === OK && target.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        delete this.creep.memory.path;
      }else if(target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
        rooms[this.creep.room.name].harvest.splice(this.creep.memory.task, 1);
        delete this.creep.memory.task;
      }
    } else {
      // 前往能量矿采集能量
      const source = rooms[this.creep.room.name]['source'][this.creep.memory.source];
      // 前往container获取能量
      // const container = this.creep.room.find()
      this.getEnergyFrom(source);
    }
  }
}

function creCarriageClass(creep: Creep) {
  return new Carriage(creep).run();
}

export default creCarriageClass;