import {CommCreep} from './common'
class Mining extends CommCreep {
  public type:string;
  public room:string;
  constructor(creep:Creep, type:string) {
    super(creep)
    this.type = type
    this.room = this.creep.room.name
  }

  /** 检测并设置memory.source(mine~container) */
  setSign() {
    rooms[this.creep.room.name].container.forEach((item:Structure, index:number) => {
      if(item['idx'] === 3) {
        this.creep.memory['source'] = index;
      }
    })
  }

  /** 采矿 */
  harvest() {
    const mine = rooms[this.room].mine[0];
    if(mine) {
      // 若此creep未曾接触过container，将mine附近的container列表中的container下标记录于memory.source中，之后凭此获取目标container
      // 需在mine旁建筑container才开始工作
      if(!this.creep.memory.source) {
        this.setSign();
      }else {
        const container = rooms[this.room].container[this.creep.memory.source];
        if(container) {
          // 当creep到达container位置时，开始采集矿石 【注意：可能会发生container爆仓情况，暂未处理】
          if(this.creep.pos.x === container.pos.x && this.creep.pos.y === container.pos.y) {
            this.creep.harvest(container);
          }else {
            this.moveTo(container);
          }
        }else {
          console.log('role.action.miner: not found container, please test!')
        }
      }
    }
    
  }

  /** 运矿 */
  carrying() {
    const mineralType = rooms[this.room].mine[0].mineralType;
    // 若存储空间为空，前往container获取矿石，否则运输回storage储藏
    if(!this.testStatus(mineralType)) {
      const idx = this.creep.memory.source;
      let staCode = -1;
      if(idx) {
        const target = rooms[this.room].container[idx];
        staCode = this.creep.withdraw(target, mineralType);
        if(staCode === ERR_NOT_IN_RANGE) {
          this.moveTo(target);
        }
      }else {
        this.setSign();
      }
    }else {
      const storage = Game.rooms[this.room].storage;
      if(storage) {
        this.creep.transfer(storage, mineralType);
      }
    }
  }

  /** 入口 - 采集矿石与storage关联，若无storage不启动采矿工程 */
  run() {
    // A:采集者   | B：运输者
    if(this.type === 'A') {
      this.harvest();
    }else {
      this.carrying();
    }
  }
}

function creMiningClass(creep:Creep, type:string) {
  new Mining(creep, type).run();
}

export default creMiningClass;