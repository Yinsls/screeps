import _ from 'lodash'
import {Creepmod} from './creep.mod'
import {CommUpdate} from './common'
import { assert } from 'console'

class Create {
  public room: string
  constructor(room: string) {
    this.room = room
  }

  /** harvester - 获取该房间内当前能量存储量,计算部件数 */
  calcPart(type: string): object {
    const result:any = [];
    // total检测当前房间能量是否足够生产此creep
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

  /** 检测是否可以采矿 */
  testMineral() {
    let setTime = true;
    // 500tick检测一次房间内是否可采矿
    if(!rooms[this.room].updateTime['refreshMineral'] || Game.time > rooms[this.room].updateTime['refreshMineral']) {
      const mineral = Game.rooms[this.room].find(FIND_MINERALS);
      // 若存在矿床
      if(mineral.length) {
        rooms[this.room].record['mineral'] = true;
        rooms[this.room].mine = mineral;
        mineral.forEach(item => {
          const container = item.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: struct => {
              return struct.structureType === STRUCTURE_CONTAINER;
            }
          })
          // 若mine附近找到container，将此container存入列表，否则等待container修建完善后再制造miner
          if(container.length) {
            container[0]['idx'] = 3;
            rooms[this.room].container.push(container[0]);
          }else{
            rooms[this.room].record['mineral'] = false;
            rooms[this.room].updateTime['refreshMineral'] = Game.time + 100;
            console.log('mine not findInRang container,please build it!');
            setTime = false;
            return false;
          }
        })
      }else {
        rooms[this.room].record['mineral'] = false;
      }
      // 减少因缺少container循环检测等待时间
      if(setTime) rooms[this.room].updateTime['refreshMineral'] = Game.time + 500;
    }
  }

  /** 检测creep数量 - 依靠creep名字作为标记 */
  testCreepNum() {
    let miner:any[] = [];
    // const creepArray = ['harvester', 'upgrader', 'builder', 'repair', 'expander']
    // 若record.mineral不存在，则前往检测，若mineral===true,创建miner,否则忽视miner
    if(!rooms[this.room].record.mineral) {
      this.testMineral()
    }else {
      miner = ['minerA', 'minerB'];
    }
    
    // 检测类别 【只检测creepArray中存在类别的creep】
    let creepArray = ['harvester', 'carriager', 'builder'];
    creepArray = creepArray.concat(miner);
    creepArray.forEach(item => {
      // 注意：修改memory.role无效，creep名字无法修改，一旦生成，即存在，不可修改！
      let factNum = 0;
      for(const name in Game.creeps) {
        if(name.split('_')[0] === item) {
          factNum ++;
        }
      }
      // 检测当前房间creep数量是否正常
      if(Creepmod[item] && factNum < Creepmod[item].num) {
        this.createCreep(item);
      }
    })
  }

  

  /** 生成creep */
  createCreep(type: string, task:string | null = null) {
    // creep姓名
    const newName = Creepmod[type].role + '_' + Game.time.toString();
    // 检测并制造creep.Body
    const res = this.calcPart(type);
    if(res['plenty']) {
      for(const name in Game.spawns) {
        // 查找可用的spawn生产creep
        if(Game.spawns[name].isActive()) {
          // 若spawn不在孵化中，即进行creep孵化
          if(!Game.spawns[name].spawning) {
            const result = Game.spawns[name].spawnCreep(res['result'], newName, 
              {memory: { task: task, color: Creepmod[type].color, source: Creepmod[type].source} }
            )
            // 若creep生成成功，将此creep纳入room.creeps，否则打印错误原因
            if(result === OK) {
              rooms[this.room].creeps.push(newName);
              // 更新需能量补给建筑列表
              CommUpdate.updateHarvest(this.room, true);
            }else {
              console.log(`Spawn[${name}] create Creep - ${type} Code: ${result}`);
            }
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
