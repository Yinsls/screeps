import {CommCreep} from './common'
class Repair extends CommCreep {
  constructor(creep:Creep) {
    super(creep)
  }

  /** 入口 */
  run() {
    if(this.testStatus()) {
      if(!this.creep.memory.task) this.setTask('repair');
      
    }else {
      this.getEnergyFrom();
    }
  }
}