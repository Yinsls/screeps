import { errorMapper } from "./modules/errorMapper";
import "./role/common";
import RoleCreep from "@/role/harvester";

interface TestType {
  name: string;
  age: number;
  address?: string;
}
export const loop = errorMapper(() => {
  for (var name in Game.creeps) {
    var creep = Game.creeps[name];
    if (creep.memory.role === "harvester") {
      new RoleCreep(creep).run();
    }
  }
});
