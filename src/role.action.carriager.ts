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

  /** 战时补给状态  */
  urgency() {
    const room = this.creep.room.name;
    const source = rooms[room].source[this.creep.memory.idx];
    if(rooms[room]['hasEnemy']) {
      if(source['store'][RESOURCE_ENERGY] < 100) {
        const storage = Game.rooms[room].storage;
        // 若storage存在，并且存有能量，即前往storage获取能量
        if(storage && storage.store[RESOURCE_ENERGY] > 0) {
          const result = this.creep.withdraw(storage, RESOURCE_ENERGY);
          if(result === ERR_NOT_IN_RANGE) {
            this.moveTo(storage);
          }
        }
      }
      if(this.testStatus()) {
        // 检查房间内tower能量是否充足，若不足，则补给能量
        const towers = Game.rooms[room].find(FIND_STRUCTURES, {
          filter: (item:Structure) => {
            return item.structureType === STRUCTURE_TOWER && item['store'].getFreeCapacity(RESOURCE_ENERGY) > 0;
          }
        })
        if(towers.length) {
          const statusCode = this.creep.transfer(towers[0]);
          if(statusCode === ERR_NOT_IN_RANGE) {
            this.creep.moveTo(towers[0]);
          }
        }
      }
      return false;
    }else {
      return true;
    }
  }

  /** 入口 */
  run() {
    this.urgency();
    if(this.testStatus()) {
      if(!this.creep.memory.task) this.setTask('harvest');
      const target = this.getTask();
      const status = this.creep.transfer(target, RESOURCE_ENERGY);
      // 判断此次补给品是否足够
      const enought = this.creep.store[RESOURCE_ENERGY] >= target.store.getFreeCapacity(RESOURCE_ENERGY);
      if(status === ERR_NOT_IN_RANGE) {
        this.moveTo();
      }else if(status === OK) {
        delete this.creep.memory.path;
        if(enought) {
          rooms[this.creep.room.name].harvest.splice(this.creep.memory.task, 1);
          delete this.creep.memory.task;
        }
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