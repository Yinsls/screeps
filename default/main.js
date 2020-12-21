"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = require("./common");
var role_action_tower_1 = __importDefault(require("./role.action.tower"));
var role_action_creater_1 = __importDefault(require("./role.action.creater"));
var role_action_harvestr_1 = __importDefault(require("./role.action.harvestr"));
var role_action_carriager_1 = __importDefault(require("./role.action.carriager"));
/** 主程序循环入口 - 若写在loop外部的内容，只在游戏初始化时运行一次 */
module.exports.loop = function () {
    // 检测全局对象是否存在
    common_1.CommTest.hasObj();
    // 更新房间对象
    common_1.CommUpdate.updateRoom();
    // 便利自己的房间 - 根据房间是否存在自己spawn判定
    for (var room in rooms) {
        // 更新全局建筑列表
        common_1.CommUpdate.updateStruct(room);
        common_1.CommUpdate.updateSource(room, true);
        common_1.CommUpdate.updateHarvest(room, true);
        // 检测房间内是否存在敌人
        common_1.CommTest.hasEnemy(room);
        // tower工作 - 若有敌人则进攻敌人，否则维护建筑
        role_action_tower_1.default(room);
        // 自行检测与生产creep
        role_action_creater_1.default(room);
    }
    /** 监控creep生命 */
    for (var name_1 in Game.creeps) {
        if (name_1) {
            var creep = Game.creeps[name_1];
            if (!creep) {
                delete Memory.creeps[name_1];
            }
            else {
                var creepType = name_1.split('_')[0];
                switch (creepType) {
                    case 'harvester':
                        role_action_harvestr_1.default(creep);
                        break;
                    case 'carriager':
                        role_action_carriager_1.default(creep);
                        break;
                    // case 'upgrader': creUpgradeClass(creep); break;
                    // case 'repair': creRepairClass(creep); break;
                    // case 'builder': creBuildClass(creep); break;
                    // case 'expander': creExpandClass(creep); break;
                    // case 'test': creExpandClass(creep); break;
                    default: break;
                }
            }
        }
    }
    if (Game.cpu.bucket > 9000) {
        Game.cpu.generatePixel();
    }
};
