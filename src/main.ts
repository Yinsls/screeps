import { errorMapper } from "./modules/errorMapper";
import "./role/harvester";

interface TestType {
  name: string;
  age: number;
  address?: string;
}
export const loop = errorMapper(() => {
  for (var name in Game.creeps) {
    var creep = Game.creeps[name];
    const status = creep.canWork();
    if (status) {
      console.log("可以工作了");
    } else {
      console.log("还得补给一下");

      var sources = creep.room.find(FIND_SOURCES);
      if (creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[1], { visualizePathStyle: { stroke: "pink" } });
      }
    }
  }
});
