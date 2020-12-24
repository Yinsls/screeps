import {CommUpdate, CommTest} from './common'
import creTowerClass from './role.action.tower'
import creBuildClass from './role.action.builder'
import creMiningClass from './role.caction.miner'
import creCreateClass from './role.action.creater'
import creHarvestClass from './role.action.harvestr'
import creCarriageClass from './role.action.carriager'

/** 主程序循环入口 - 若写在loop外部的内容，只在游戏初始化时运行一次 */
module.exports.loop = function() {
  // 检测全局对象是否存在
  CommTest.hasObj();
  // 更新房间对象
  CommUpdate.updateRoom();
  // 便利自己的房间 - 根据房间是否存在自己spawn判定
  for(const room in rooms) {
    // 更新全局建筑列表
    CommUpdate.updateStruct(room);
    CommUpdate.updateSource(room);
    CommUpdate.updateHarvest(room);
    // 检测房间内是否存在敌人
    CommTest.hasEnemy(room);
    // tower工作 - 若有敌人则进攻敌人，否则维护建筑
    creTowerClass(room);
    // 自行检测与生产creep
    creCreateClass(room);
  }

  /** 监控creep存活情况与任务分配 */
  for(const name in Game.creeps) {
    if(name) {
      const creep = Game.creeps[name];
      if (!creep) {
        // 删除memory与room.creeps中的creep对象
        delete Memory.creeps[name];
        // 删除rooms[room].creep
        const room = creep['room']['name'];
        const list = rooms[room].creeps;
        const isDel = list.indexOf(name);
        isDel !== -1?list.splice(isDel, 1):console.log('删除失败，room.creeps中找不到此creep', name);
        
      }else {
        const creepType = name.split('_')[0];
        switch(creepType) {
          case 'harvester': creHarvestClass(creep); break;
          case 'carriager': creCarriageClass(creep); break;
          case 'builder': creBuildClass(creep); break;
          case 'minerA': creMiningClass(creep, 'A'); break;
          case 'minerB': creMiningClass(creep, 'B'); break;
          // case 'upgrader': creUpgradeClass(creep); break;
          // case 'repair': creRepairClass(creep); break;
          // case 'expander': creExpandClass(creep); break;
          // case 'test': creExpandClass(creep); break;
          default: break;
        }
      }
    }
  }
  

  // 自动将多余cpu转化为pixel
  if(Game.cpu.bucket > 9000) {
    Game.cpu.generatePixel();
  }
}
