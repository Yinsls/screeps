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
        console.log('build before:', JSON.stringify(target))
        const staCode = this.creep.build(target);
        if(staCode === ERR_NOT_IN_RANGE) {
          this.moveTo(target);
        }else if(staCode === OK) {
          delete this.creep.memory.path;
          // 测试build之后的Structure状况
          console.log('build after:', JSON.stringify(target));
        }else if(staCode === ERR_INVALID_TARGET) {
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