export class Creepmod {
  // 部件单价
  static partPrice = {
    'work': 100,
    'carry': 50,
    'move': 50,
    'attack': 80,
    'ranged_attack': 150,
    'heal': 250,
    'claim': 600,
    'tough': 10
  }
  // 部件中数量表示最大值，0表示不限制,保底1个部件
  // 制造优先级根据实际使用时数组顺序决定
  // harvesterA：采集者   harvesterB：运输者
  // 参数说明: color:移动路线颜色   source: 能量点id(source||container  需要手动设置能量矿和储藏室id(两者相邻，id相同))
  /** [harvester: 采集者, carriager: 运输者, upgrader: 升级者, repair: 维护者, builder: 建造者] */
  static upgrader = {role: 'upgrader', part: {WORK:2, CARRY:4, MOVE:3}, num: 0, color: 'green', source: 1}
  // static carriager = {role: 'carriager', part: {CARRY:4, MOVE:2}, num: 1, color: 'pink', source: 0}
  static carriager = {role: 'carriager', part: {WORK:1, CARRY:1, MOVE:1}, num: 1, color: 'pink', source: 0}
  static harvester = {role: 'harvester', part: {WORK:3, MOVE:1}, num: 0, color: 'pink', source: 0}
  static repair = {role: 'repair', part: {WORK:2, CARRY:4, MOVE:2}, num: 0, color: 'orange', source: 1}
  static builder = {role: 'builder', part: {WORK:3, CARRY:5, MOVE:2}, num: 0, color: 'red', source: 1}

  // 矿工 - minerA：采矿者， minerB：运矿者 【若无storage不创建此类工种】
  static minerA = {role: 'minerA', part: {WORK:5, MOVE: 1}, num: 1, color: 'orange'}
  static minerB = {role: 'minerB', part: {CARRY:6, MOVE: 3}, num: 1, color: 'orange'}
  // static expander = {role: 'expander', part: {WORK:1, CARRY:2, MOVE:3, CLAIM:1}, num: 0, color: 'purple'}
}


 