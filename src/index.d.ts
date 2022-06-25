interface Creep {
  /** 检测creep是否能够工作 */
  canWork: () => boolean;
  working: boolean;
}

interface CreepMemory {
  /** 角色 | 类别 */
  role: string;
}
