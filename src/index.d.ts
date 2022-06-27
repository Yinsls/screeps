interface Creep {
  /** 检测creep是否能够工作 */
  canWork: () => boolean;

  /** 获取能量 */
  feed: () => boolean;

  /** 根据creep类型返回路径颜色 */
  getPathColor: () => string;

  /** 查找任务 */
  findTask: () => boolean;
}

interface CreepMemory {
  /** 角色 | 类别 */
  role: string;

  /** 记录是否能工作 */
  working: boolean;

  /** 能量矿id */
  source: string;

  /** 任务id */
  task: Id<_HasId> | string;
}
