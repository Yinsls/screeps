"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var creep_mod_1 = require("./creep.mod");
var Create = /** @class */ (function () {
    function Create(room) {
        this.room = room;
    }
    /** harvester - 获取该房间内当前能量存储量,计算部件数 */
    Create.prototype.calcPart = function (type) {
        var result = [];
        var total = 0, enough = false;
        // 获取可用能量
        var totalEnergy = Game.rooms[this.room].energyAvailable;
        var part = creep_mod_1.Creepmod[type].part;
        // 能量不足 work:1 move:1 xxx:1
        if (totalEnergy >= 600) {
            enough = true;
        }
        // 能量是否充足
        if (enough) {
            for (var key in part) {
                if (key) {
                    for (var i = 0; i < part[key]; i++) {
                        var body = key.toLocaleLowerCase();
                        total += creep_mod_1.Creepmod.partPrice[body];
                        result.push(body);
                    }
                }
            }
        }
        else {
            for (var key in part) {
                if (key) {
                    var body = key.toLocaleLowerCase();
                    total += creep_mod_1.Creepmod.partPrice[body];
                    result.push(body);
                }
            }
        }
        return { result: result, plenty: total <= totalEnergy };
    };
    /** 检测creep数量 - 依靠creep名字作为标记 */
    Create.prototype.testCreepNum = function () {
        var _this = this;
        // const creepArray = ['harvester', 'upgrader', 'builder', 'repair', 'expander']
        var creepArray = ['harvester', 'carriager'];
        creepArray.forEach(function (item) {
            // 修改memory.role无效，creep名字无法修改，一旦生成，即存在，不可修改
            var factNum = 0;
            for (var name_1 in Game.creeps) {
                if (name_1.split('_')[0] === item) {
                    factNum++;
                }
            }
            if (creep_mod_1.Creepmod[item] && factNum < creep_mod_1.Creepmod[item].num) {
                _this.createCreep(item);
            }
        });
    };
    /** 生成creep */
    Create.prototype.createCreep = function (type, task) {
        if (task === void 0) { task = null; }
        var newName = creep_mod_1.Creepmod[type].role + '_' + Game.time.toString();
        var res = this.calcPart(type);
        for (var name_2 in Game.spawns) {
            // 查找可用的spawn生产creep
            if (Game.spawns[name_2].isActive() && res['plenty']) {
                // 若spawn不在孵化中，即进行creep孵化
                if (!Game.spawns[name_2].spawning) {
                    var result = Game.spawns[name_2].spawnCreep(res['result'], newName, { memory: { role: creep_mod_1.Creepmod[type].role, task: task, color: creep_mod_1.Creepmod[type].color, source: creep_mod_1.Creepmod[type].source } });
                    if (result !== OK) {
                        console.log("Spawn[" + name_2 + "] create Creep - " + type + " Code: " + result);
                    }
                }
            }
        }
    };
    /** 传承任务 */
    Create.prototype.inheritTask = function (creep) {
        var task = creep.memory['task'];
        if (task) {
            this.createCreep(creep.memory['role'], task);
        }
        else {
            this.createCreep(creep.memory['role']);
        }
    };
    /** 入口 */
    Create.prototype.run = function () {
        this.testCreepNum();
    };
    return Create;
}());
function creCreateClass(room) {
    return new Create(room).run();
}
exports.default = creCreateClass;
