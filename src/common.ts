/** 公共刷新 - 房间数、维护建筑、修建建筑等 */
export class CommUpdate {
  /** 刷新房间对象 - 10000tick
   * @param forceLoad 强制刷新房间，可用于手操占领房间，默认false
   */
  static updateRoom(forceLoad=false) {
    // 第一次或者到时间自动刷新房间对象，将未统计房间加入全局对象
    if(forceLoad || !global.updateTime['refreshRoom'] || Game.time > global.updateTime.refrshRoom) {
      const roomName:string[] = [];
      for(const spawn in Game.spawns) {
        const name = Game.spawns[spawn].room.name;
        roomName.indexOf(name) === -1?roomName.push(name):'';
      }
      roomName.forEach(room => {
        if(!global.rooms[room]) {
          global.rooms[room] = {
            mine: [],
            record: {},             // 记录房间内的判断(特定时间内)
            struct: [],             // 全部建筑列表，其他建筑列表根据此列表筛选数据(towers)
            source: [],             // source列表
            container: [],          // container列表
            creeps: [],             // 房间内creep列表,存储creep.name,死亡时自动删除
            towers: [],             // tower列表
            repair: [],             // 需维护建筑
            build: [],              // 需建设建筑
            harvest: []             // 需能量供给建筑
          }
        }
      })
      global.updateTime['refreshRoom'] = Game.time + 10000;
      console.log('CommUpdate-updateRoom', JSON.stringify(roomName));
    }
  }

  /** 根据数组中的字段顺序排列目标数组,无返回值
   * @param target 混乱的列表
   * @param priority 优先级列表，据此排序
   */
  static sortByArr(target:Structure[], priority:string[]) {
    target.sort((a:Structure, b:Structure) => {
      return priority.findIndex((val) => {
        return a.structureType === val
      }) - priority.findIndex((val) => {
        return b.structureType === val
      })
    })
  }

  /** 更新所有建筑列表(欲删除，无实用价值) - 1000tick */
  static updateStruct(room:string, forceLoad=false) {
    // 首次更新或到达设定更新时间，更新建筑列表
    if(forceLoad || !global.updateTime['refreshStruct'] || Game.time > global.updateTime['refreshStruct']) {
      // 查找所有建筑
      const struct = Game.rooms[room].find(FIND_STRUCTURES);
      // 设置tower列表
      rooms[room].towers = struct.filter(item => {
        return item.structureType === STRUCTURE_TOWER;
      })
      rooms[room].struct = struct;
      global.updateTime['refreshStruct'] = Game.time + 1000;
      console.log('CommUpdate-updateStruct');
    }
  }

  /** 更新repair列表 - 500tick */
  static updateRepair(room:string, forceLoad=false) {
    // 每过500tick更新一次维护列表，除非强制更新
    if(forceLoad || !global.updateTime['refreshRepair'] || Game.time > global.updateTime['refreshRepair']) {
      const repairs = Game.rooms[room].find(FIND_STRUCTURES, {
        filter: (item:Structure) => {
          return item.hits < item.hitsMax;
        }
      })
      const priority = ['road', 'link', 'rampart', 'wall'];
      CommUpdate.sortByArr(repairs, priority);
      rooms[room].repair = repairs;
      global.updateTime['refreshRepair'] = Game.time + 500;
      console.log('CommUpdate - updateRepair');
    }
  }

  /** 更新source和container列表 - null | 500tick */
  static updateSource(room:string, forceLoad=false) {
    if(forceLoad || !rooms[room].source.length || !global.updateTime['refreshSource'] || Game.time > global.updateTime['refreshSource']) {
      let container, sources:any[];
      // 初始化source列表
      rooms[room].source = [];
      rooms[room].container = [];
      // 查找房间内source
      sources = Game.rooms[room].find(FIND_SOURCES);
      // 遍历该房间所有source，查找source附近的container并设置idx
      sources.forEach((item,index) => {
        container = item.pos.findInRange(FIND_STRUCTURES, 1).filter((struct:Structure) => {
          return struct.structureType === STRUCTURE_CONTAINER
        })
        // 设置container序列号idx
        if(container.length) {
          container[0]['idx'] = index;
          rooms[room].container.push(container[0]);
        }
        sources[index] = index;
        rooms[room].source.push(item);
      })
      
      global.updateTime['refreshSource'] = Game.time + 500;
      console.log('CommUpdate-updateSource');
    }
  }

  /** 更新harvest列表 - null | 50tick */
  static updateHarvest(room:string, forceLoad=false) {
    if(forceLoad || !rooms[room].harvest.length || !global.updateTime['refresHarvest'] || Game.time > global.updateTime['refresHarvest']) {
      if(rooms[room].struct.length) {
        const harvest = Game.rooms[room].find(FIND_STRUCTURES, {
          filter: (struct:Structure) => {
            return (struct.structureType === STRUCTURE_SPAWN ||
                   struct.structureType === STRUCTURE_EXTENSION ||
                   struct.structureType === STRUCTURE_LINK ||
                   struct.structureType === STRUCTURE_TOWER ||
                   struct.structureType === STRUCTURE_STORAGE) &&
                   struct['store'].getFreeCapacity(RESOURCE_ENERGY) > 0
          }
        })
        const priority = ['spawn', 'extension', 'link', 'tower', 'storage'];
        // 根据优先级列表对harvest列表排序
        CommUpdate.sortByArr(harvest, priority);
        rooms[room].harvest = harvest;
        global.updateTime['refresHarvest'] = Game.time + 50;
      }
      console.log('CommUpdate-updateHarvest');
    }
  }

  /** 更新建造列表 - 200tick */
  static updateBuild(room:string, forceLoad=false) {
    // 200tick更新一次build列表，除非强制更新
    if(forceLoad || !global.updateTime['refreshBuild'] || Game.time > global.updateTime['refreshBuild']) {
      const struct = Game.rooms[room].find(FIND_CONSTRUCTION_SITES);
      if(struct.length) {
        rooms[room].build = struct
      }
      global.updateTime['refreshBuild'] = Game.time + 200;
      console.log('CommUpdate-updateBuild');
    }
  }
}

/** 公共检测 - creep状态、房间状态、是否敌人等 */
export class CommTest {
  /** 检测对象是否存在,若不存在,设置默认空对象 */
  static hasObj() {
    if(!global['rooms']) global['rooms'] = {};
    if(!global['updateTime']) global['updateTime'] = [];
    if(!global['expand']) global['expand'] = {};
  }

  /** 检测房间是否存在敌人 */
  static hasEnemy(room:string) {
    const enemy = Game.rooms[room].find(FIND_HOSTILE_CREEPS);
    if(enemy.length && !rooms[room]['hasEnemy']) {
      rooms[room]['hasEnemy'] = true;
    }else {
      rooms[room]['hasEnemy'] = false;
    }
  }

  /** 检测cpu消耗
   * @param fnc 测试的函数
   * @param name 测试函数名
   */
  static spendCpu(fnc:Function, name:string='') {
    let spend1 = Game.cpu.getUsed();
    fnc();
    console.log(name, Game.cpu.getUsed() - spend1);
  }
}

/** 公共Creep */
export class CommCreep {
  public creep: any;
  constructor(creep: Creep) {
    this.creep = creep
  }

  /** 获取随机数组下标 */
  randomTask(tasks: any[]): number {
    const sort = Math.random();
    const target = Math.floor(sort * tasks.length);
    return target;
  }

  /** 根据task更新对应任务列表
   * @param room 房间名
   * @param task 更新目标【harvest、build】
   */
  updateList(room:string, task:string) {
    switch(task) {
      case 'harvest': CommUpdate.updateHarvest(room); break;
      case 'build': CommUpdate.updateBuild(room); break;
      default: 
        console.log('not found update list!');
    }
  }

  /** 设置独立task(待修改，将idx改为id)
   * @param taskType 任务列表key
   */
  setTask(taskType: string): void {
    let idx = 0;
    const room = this.creep.room.name;
    const taskList = rooms[room][taskType];
    if(taskList.length) {
      // 若task为harvest，按顺序从0往后执行任务，否则随机获取对应任务
      if(taskType !== 'harvest') {
        idx = this.randomTask(taskList);
      }
    }else {
      this.updateList(room, taskType);
    }
    // 若任务列表不为空，给creep.memory.task设置列表下标作为标记，直接根据下标到任务列表获取目标对象
    if(taskList.length) {
      this.creep.memory['task'] = idx;
    }
  }

  /** 根据任务字段与memory.task序列号获取该房间目标对象
   * @param taskType 任务类型，默认harvest【rooms[room].harvest】
   */
  getTask(taskType:string = 'harvest'): any {
    // 默认获取补给任务，否则
    const idx = this.creep.memory.task;
    const target = rooms[this.creep.room.name][taskType][idx];
    return target;
  }

  /** creep - 移动至目标位置 - current：目标对象 */
  moveTo(current: Structure | Source | null = null) {
    const target = current?current:this.getTask();
    if(this.creep.fatigue <= 0) {
      if(!this.creep.memory.path) {
        this.creep.moveTo(target, { visualizePathStyle: { stroke: this.creep.memory.color, opacity: 1 } })
        this.creep.memory['path'] = this.creep.pos.findPathTo(target);
      }else {
        // 若移动异常，重新寻找路线
        if(this.creep.moveByPath(this.creep.memory.path) !== OK) {
          delete this.creep.memory.path;
        }
        // 若移动停滞，重新寻找路线
        if(this.creep.memory.pos && (this.creep.pos.x === this.creep.memory.pos.x && this.creep.pos.y === this.creep.memory.pos.y)) {
          delete this.creep.memory.path
        }
        // 记录此刻tick坐标
        this.creep.memory.pos = this.creep.pos
      }
    }
  }

  /** creep - 检测creep是否具备能量 */
  testStatus(type:string=RESOURCE_ENERGY): boolean {
    if(this.creep.memory.building && this.creep.store[type] === 0) {
      this.creep.memory.building = false;
    }
    
    if(!this.creep.memory.building && this.creep.store.getFreeCapacity(type) === 0) {
      this.creep.memory.building = true;
    }

    return Boolean(this.creep.memory.building);
  }

  /** 从目标获取能量 默认前往container和source
   * @param Structure
   * @default source || container
   */
  getEnergyFrom(target: any = null) {
    let result = -1;
    // 若未指定建筑，默认从本身匹配的能量矿id获取能量(优先container，不存在则source)
    if(!target) {
      // 获取creep中存储的能量矿id
      const idx = this.creep.memory.source;
      const room = this.creep.room.name;
      const container = rooms[room]['container'][idx]
      // 若检测到container能量充足，则从container获取能量，否则自行从source采集能量
      if(container && container.store[RESOURCE_ENERGY] > 100) {
        result = this.creep.withdraw(container, RESOURCE_ENERGY);
        if(result === ERR_NOT_IN_RANGE) this.moveTo(container);
      }else {
        const source = rooms[room].source[idx] || rooms[room].source[0];
        result = this.creep.harvest(source);
        if(result === ERR_NOT_IN_RANGE) this.moveTo(source);
      }
    }else {
      // 若对象属于Structure使用withdraw，否则使用harvest获取能量
      if(target instanceof Structure) {
        result = this.creep.withdraw(target, RESOURCE_ENERGY);
        if(result === ERR_NOT_IN_RANGE) this.moveTo(target);
      }else {
        result = this.creep.harvest(target);
        if(result === ERR_NOT_IN_RANGE) this.moveTo(target);
      }
    }
    // result默认-1，用于记录采集能量状态码
    return result;
  }
}