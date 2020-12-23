import {CommCreep} from './common'
/** 采集者采集能源存储至container中 【采集者无carry部件，无法存储能量】 */
class Harvest extends CommCreep{
  constructor(creep: Creep) {
    super(creep)
  }

  /** 入口 */
  run() {
    const idx = this.creep.memory.source;
    const container = rooms[this.creep.room.name]['container'][idx];
    if(container) {
      if(this.creep.pos.x === container.pos.x && this.creep.pos.y === container.pos.y) {
        if(container.store[RESOURCE_ENERGY] <= 1990) {
          const source = rooms[this.creep.room.name]['source'][idx];
          this.creep.harvest(source)
        }
      }else {
        this.moveTo(container)
      }
    }
  }
}

function creHarvestClass(creep:Creep) {
  return new Harvest(creep).run()
}

export default creHarvestClass;