const roleTest = {
  testHarvester: () => {
    const harvesters = _.filter(
      Game.creeps,
      (creep) => creep.memory.role == "harvester"
    );
    if (harvesters.length < 2) {
      var newName = "Harvester" + Game.time;
      Game.spawns["Spawn1"].spawnCreep([WORK, CARRY, MOVE], newName, {
        memory: { role: "harvester" },
      });
    }
  },

  testUpgrader: () => {
    const upgrader = _.filter(
      Game.creeps,
      (creep) => creep.memory.role == "upgrader"
    );
    if (upgrader.length < 4) {
      var newName = "Upgrader" + Game.time;
      Game.spawns["Spawn1"].spawnCreep([WORK, CARRY, CARRY, MOVE], newName, {
        memory: { role: "upgrader" },
      });
    }
  },

  testBuilder: () => {
    const builder = _.filter(
      Game.creeps,
      (creep) => creep.memory.role == "builder"
    );
    if (builder.length < 1) {
      var newName = "Builder" + Game.time;
      Game.spawns["Spawn1"].spawnCreep([WORK, CARRY, CARRY, MOVE], newName, {
        memory: { role: "builder" },
      });
    }
  },
};

module.exports = roleTest;
