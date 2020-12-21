import _ from 'lodash'
import {Creepmod} from './creep.mod'
import {CommTest} from './common'

class Create {
  public room: string
  constructor(room: string) {
    this.room = room
  }

  /** harvester - 获取该房间内当前能量存储量,计算部件数 */
  calcPart(type: string): object {
    const result:any = [];
    let total = 0, enough = false;
    // 获取可用能量
    const totalEnergy = Game.rooms[this.room].energyAvailable;
    const part = Creepmod[type].part;
    // 能量不足 work:1 move:1 xxx:1
    if(totalEnergy >= 600) {
      enough = true;
    }

    // 能量是否充足
    if(enough) {
      for(const key in part) {
        if(key) {
          for(let i=0; i<part[key]; i++) {
            const body = key.toLocaleLowerCase();
            total += Creepmod.partPrice[body];
            result.push(body);
          }
        }
      }
    }else {
      for(const key in part) {
        if(key) {
          const body = key.toLocaleLowerCase();
          total += Creepmod.partPrice[body];
          result.push(body);
        }
      }
    }
    return {result, plenty:total <= totalEnergy};
  }

  /** 检测creep数量 - 依靠creep名字作为标记 */
  testCreepNum() {
    // const creepArray = ['harvester', 'upgrader', 'builder', 'repair', 'expander']
    const creepArray = ['harvester', 'carriager']
    creepArray.forEach(item => {
      // 修改memory.role无效，creep名字无法修改，一旦生成，即存在，不可修改
      let factNum = 0;
      for(const name in Game.creeps) {
        if(name.split('_')[0] === item) {
          factNum ++;
        }
      }
      if(Creepmod[item] && factNum < Creepmod[item].num) {
        this.createCreep(item)
      }
    })
  }

  

  /** 生成creep */
  createCreep(type: string, task:string | null = null) {
    const newName = Creepmod[type].role + '_' + Game.time.toString()
    const res = this.calcPart(type)
    for(const name in Game.spawns) {
      // 查找可用的spawn生产creep
      if(Game.spawns[name].isActive() && res['plenty'] ) {
        // 若spawn不在孵化中，即进行creep孵化
        if(!Game.spawns[name].spawning) {
          const result = Game.spawns[name].spawnCreep(res['result'], newName, 
            {memory: { role: Creepmod[type].role, task: task, color: Creepmod[type].color, source: Creepmod[type].source} }
          )
          if(result !== OK) {
            console.log(`Spawn[${name}] create Creep - ${type} Code: ${result}`)
          }
        }
      }
    }
  }

  /** 传承任务 */
  inheritTask(creep: Creep) {
    const task = creep.memory['task']
    if(task) {
      this.createCreep(creep.memory['role'], task)
    }else {
      this.createCreep(creep.memory['role'])
    }
  }

  /** 入口 */
  run() {
    this.testCreepNum()
  }
}

function creCreateClass(room: string) {
  return new Create(room).run()
}

export default creCreateClass;
