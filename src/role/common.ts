import { CREEP_ROLE_HARVESTER } from "@/modules/constParams";

/** 检测是否可以工作 */
Creep.prototype.canWork = function () {
  const working = this.memory.working;
  if (working) {
    this.memory.working = this.store[RESOURCE_ENERGY] > 0;
  } else {
    this.memory.working = this.store.getFreeCapacity() === 0;
  }
  return this.memory.working;
};

/** 补充能源 */
Creep.prototype.feed = function () {
  const sourceId = this.memory.source;
  let target;
  if (sourceId) {
    target = Game.getObjectById(sourceId);
  } else {
    var sources = this.room.find(FIND_SOURCES);
    target = sources[1];
  }
  const status = this.harvest(target);
  if (status === ERR_NOT_IN_RANGE) {
    const pathColor = this.getPathColor();
    this.moveTo(target, { visualizePathStyle: { stroke: pathColor } });
  } else {
    return this.canWork();
  }
};

/** 根据creep类型返回路径颜色 */
Creep.prototype.getPathColor = function () {
  if (this.memory.role === CREEP_ROLE_HARVESTER) {
    return "green";
  }
  return "white";
};

/** creep查找并设置任务id */
Creep.prototype.findTask = function () {
  const role = this.memory.role;
  let pass = false;
  switch (role) {
    case CREEP_ROLE_HARVESTER: {
      var targetList = this.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (
            (structure.structureType == STRUCTURE_EXTENSION ||
              structure.structureType == STRUCTURE_SPAWN) &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
          );
        },
      });

      if (targetList.length > 0) {
        this.memory.task = targetList[0].id;
        pass = true;
      }
      break;
    }
    default: {
      console.log("未知creep");
    }
  }
  return pass;
};
