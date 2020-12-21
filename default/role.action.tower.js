"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Tower = /** @class */ (function () {
    function Tower(tower) {
        this.tower = tower;
    }
    /** 攻击入侵者 - 根据距离调整优先级 */
    Tower.prototype.attackEnemy = function () {
        var roomName = this.tower.room.name;
        if (rooms[roomName]['hasEnemy']) {
            var enemy = this.tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (enemy)
                this.tower.attack(enemy);
            return true;
        }
        else {
            return false;
        }
    };
    /** 根据任务数随机获取编号 0  ~ length-1 */
    Tower.prototype.randomTask = function (tasks) {
        var sort = Math.random();
        var target = Math.floor(sort * tasks.length);
        return target;
    };
    /** 根据维护列表随机维护选中建筑，若此建筑维护完成则在列表中删除该项任务 - baseline:判断该tower是否能量充足 */
    Tower.prototype.repairStruct = function (baseline) {
        if (baseline === void 0) { baseline = 900; }
        // 能量充足进行建筑维护
        if (this.tower.store[RESOURCE_ENERGY] > baseline) {
            var repairObj = rooms[this.tower.room.name]['repair'];
            if (repairObj.length) {
                // 获取维护列表 - 随机下标
                // const random = this.randomTask(repairObj)
                var struct = Game.getObjectById(repairObj[0]);
                if (struct instanceof Structure) {
                    this.tower.repair(struct);
                    // 若维护完毕，将此建筑从维护列表删除
                    if (struct.hits === struct.hitsMax) {
                        repairObj.splice(0, 1);
                    }
                }
            }
        }
    };
    /** 入口 */
    Tower.prototype.run = function () {
        // 若存在敌人，发起进攻, 暂停修复任务
        if (!this.attackEnemy()) {
            this.repairStruct();
        }
    };
    return Tower;
}());
function creTowerClass(roomName) {
    rooms[roomName]['struct'].filter(function (item) {
        return item.structureType === STRUCTURE_TOWER;
    }).forEach(function (tower) {
        new Tower(tower).run();
    });
}
exports.default = creTowerClass;
