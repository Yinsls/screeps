import {CommCreep} from './common'
class Build extends CommCreep {
  constructor(creep:Creep) {
    super(creep)
  }

  /** 入口 */
  run() {
    if(this.testStatus()) {
      if(!this.creep.memory.task) this.setTask('build');
      const target = this.getTask('build');
      if(target) {
        const staCode = this.creep.build(target);
        // 目标不在build范围内
        if(staCode === ERR_NOT_IN_RANGE) {
          this.moveTo(target);
        }else if(staCode === OK) {    // build成功
          delete this.creep.memory.path;
        }else if(staCode === ERR_INVALID_TARGET) {    // 建造完毕 || 恰好有creep站在其上导致无法建设完成
          delete this.creep.memory.task;
        }else {
          console.log('role.action.builder: creep.build - Unknow Error 》 ', staCode)
        }
      }
    }else {
      this.getEnergyFrom();
    }
  }
}

function creBuildClass(creep:Creep) {
  new Build(creep).run();
}

export default creBuildClass;