"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommCreep = exports.CommTest = exports.CommUpdate = void 0;
/** 公共刷新 - 房间数、维护建筑、修建建筑等 */
var CommUpdate = /** @class */ (function () {
    function CommUpdate() {
    }
    /** 刷新房间对象
     * @param forceLoad 强制刷新房间，可用于手操占领房间，默认false
     */
    CommUpdate.updateRoom = function (forceLoad) {
        if (forceLoad === void 0) { forceLoad = false; }
        // 第一次或者到时间自动刷新房间对象，将未统计房间加入全局对象
        if (!global.updateTime['refreshRoom'] || Game.time - global.updateTime.refrshRoom >= 0 || forceLoad) {
            var roomName = [];
            for (var spawn in Game.spawns) {
                var name_1 = Game.spawns[spawn].room.name;
                roomName.indexOf(name_1) === -1 ? roomName.push(name_1) : '';
            }
            roomName.forEach(function (room) {
                if (!global.rooms[room]) {
                    global.rooms[room] = {
                        struct: [],
                        creeps: [],
                        source: [],
                        container: [],
                        towers: [],
                        repair: [],
                        build: [],
                        harvest: [] // 需能量供给建筑
                    };
                }
            });
            global.updateTime['refreshRoom'] = Game.time + 10000;
            console.log(new Date().toLocaleString() + ' - CommUpdate-updateRoom', JSON.stringify(roomName));
        }
    };
    /** 更新所有建筑列表 */
    CommUpdate.updateStruct = function (room, forceLoad) {
        if (forceLoad === void 0) { forceLoad = false; }
        // 首次更新或到达设定更新时间，更新建筑列表
        if (forceLoad || !global.updateTime['refreshStruct'] || Game.time - global.updateTime['refreshStruct'] >= 0) {
            var struct = Game.rooms[room].find(FIND_STRUCTURES);
            rooms[room].struct = struct;
            global.updateTime['refreshStruct'] = Game.time + 1000;
            console.log(new Date().toLocaleString() + ' - CommUpdate-updateStruct');
        }
    };
    /** 更新source和container列表 */
    CommUpdate.updateSource = function (room, forceLoad) {
        if (forceLoad === void 0) { forceLoad = false; }
        if (forceLoad || !rooms[room].source || Game.time - global.updateTime['refreshSource'] >= 0) {
            var container_1, sources_1;
            // 初始化source列表
            rooms[room].source = [];
            rooms[room].container = [];
            // 查找房间内source
            sources_1 = Game.rooms[room].find(FIND_SOURCES);
            // 遍历该房间所有source，查找source附近的container并设置idx
            sources_1.forEach(function (item, index) {
                container_1 = item.pos.findInRange(FIND_STRUCTURES, 1).filter(function (struct) {
                    return struct.structureType === STRUCTURE_CONTAINER;
                });
                // 设置container序列号idx
                if (container_1.length) {
                    container_1[0]['idx'] = index;
                    rooms[room]['container'].push(container_1[0]);
                }
                sources_1[index] = index;
                rooms[room]['source'].push(item);
            });
            global.updateTime['refreshSource'] = Game.time + 500;
        }
    };
    /** 更新harvest列表 */
    CommUpdate.updateHarvest = function (room, forceLoad) {
        if (forceLoad === void 0) { forceLoad = false; }
        if (forceLoad || !rooms[room].harvest || Game.time - global.updateTime['refresHarvest'] >= 0) {
            if (rooms[room].struct.length) {
                var harvest = rooms[room].struct.filter(function (struct) {
                    return (struct.structureType === STRUCTURE_SPAWN ||
                        struct.structureType === STRUCTURE_EXTENSION ||
                        struct.structureType === STRUCTURE_LINK ||
                        struct.structureType === STRUCTURE_TOWER) && struct['store'] &&
                        struct['store'].getFreeCapacity(RESOURCE_ENERGY) > 0;
                });
                var priority_1 = ['spawn', 'extension', 'link', 'tower'];
                // 根据优先级列表对harvest列表排序
                harvest.sort(function (a, b) {
                    return priority_1.findIndex(function (val) {
                        return a.structureType === val;
                    }) - priority_1.findIndex(function (val) {
                        return b.structureType === val;
                    });
                });
                rooms[room].harvest = harvest;
                global.updateTime['refresHarvest'] = Game.time + 50;
            }
        }
    };
    return CommUpdate;
}());
exports.CommUpdate = CommUpdate;
/** 公共检测 - creep状态、房间状态、是否敌人等 */
var CommTest = /** @class */ (function () {
    function CommTest() {
    }
    /** 检测对象是否存在,若不存在,设置默认空对象 */
    CommTest.hasObj = function () {
        if (!global['rooms'])
            global['rooms'] = {};
        if (!global['updateTime'])
            global['updateTime'] = [];
        if (!global['expand'])
            global['expand'] = {};
    };
    /** 检测房间是否存在敌人 */
    CommTest.hasEnemy = function (room) {
        var enemy = Game.rooms[room].find(FIND_HOSTILE_CREEPS);
        if (enemy.length && !rooms[room]['hasEnemy']) {
            rooms[room]['hasEnemy'] = true;
        }
        else {
            rooms[room]['hasEnemy'] = false;
        }
    };
    /** 检测cpu消耗
     * @param fnc 测试的函数
     * @param name 测试函数名
     */
    CommTest.spendCpu = function (fnc, name) {
        if (name === void 0) { name = ''; }
        var spend1 = Game.cpu.getUsed();
        fnc();
        console.log(name, Game.cpu.getUsed() - spend1);
    };
    return CommTest;
}());
exports.CommTest = CommTest;
/** 公共Creep */
var CommCreep = /** @class */ (function () {
    function CommCreep(creep) {
        this.creep = creep;
    }
    /** 获取随机数组下标 */
    CommCreep.prototype.randomTask = function (tasks) {
        var sort = Math.random();
        var target = Math.floor(sort * tasks.length);
        return target;
    };
    /** creep - 设置独立task
     * @param taskType 任务列表key
     */
    CommCreep.prototype.setTask = function (taskType) {
        var taskList = rooms[this.creep.room.name][taskType];
        var idx = this.randomTask(taskList);
        // 若任务列表不为空，给creep.memory.task设置列表下标作为标记，直接根据下标到任务列表获取目标对象
        if (taskList.length) {
            this.creep.memory['task'] = idx;
        }
    };
    /** creep - 根据id获取目标对象 */
    CommCreep.prototype.getTask = function (task) {
        if (task === void 0) { task = null; }
        var idx = this.creep.memory.task;
        var target = rooms[this.creep.room.name].harvest[idx];
        return target;
    };
    /** 获取当前tick消耗的cpu */
    CommCreep.prototype.testExpandCpu = function (tip) {
        return tip + Game.cpu.getUsed();
    };
    /** creep - 移动至目标位置 - current：目标对象 */
    CommCreep.prototype.moveTo = function (current) {
        if (current === void 0) { current = null; }
        var target = current ? current : this.getTask();
        if (this.creep.fatigue <= 0) {
            if (!this.creep.memory.path) {
                this.creep.moveTo(target, { visualizePathStyle: { stroke: this.creep.memory.color, opacity: 1 } });
                this.creep.memory['path'] = this.creep.pos.findPathTo(target);
            }
            else {
                // 若移动异常，重新寻找路线
                if (this.creep.moveByPath(this.creep.memory.path) !== OK) {
                    delete this.creep.memory.path;
                }
                // 若移动停滞，重新寻找路线
                if (this.creep.memory.pos && (this.creep.pos.x === this.creep.memory.pos.x && this.creep.pos.y === this.creep.memory.pos.y)) {
                    delete this.creep.memory.path;
                }
                // 记录此刻tick坐标
                this.creep.memory.pos = this.creep.pos;
            }
        }
    };
    /** creep - 检测creep是否具备能量 */
    CommCreep.prototype.testStatus = function () {
        if (this.creep.memory.building && this.creep.store[RESOURCE_ENERGY] === 0) {
            this.creep.memory.building = false;
        }
        if (!this.creep.memory.building && this.creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            this.creep.memory.building = true;
        }
        return Boolean(this.creep.memory.building);
    };
    /** 从目标获取能量 默认前往container和source
     * @param Structure
     * @default Null
     */
    CommCreep.prototype.getEnergyFrom = function (target) {
        if (target === void 0) { target = false; }
        var result = -1;
        // 若指定建筑获取能量
        if (target) {
            var idx = this.creep.memory.source;
            var container = rooms[this.creep.room.name]['container'][idx];
            // 若检测到container能量充足，则从container获取能量，否则自行从source采集能量
            if (container && container.store[RESOURCE_ENERGY] > 100) {
                result = this.creep.withdraw(container, RESOURCE_ENERGY);
                if (result === ERR_NOT_IN_RANGE)
                    this.moveTo(container);
            }
            else {
                result = this.creep.harvest(target);
                if (result === ERR_NOT_IN_RANGE)
                    this.moveTo(target);
            }
        }
        else {
            console.log('common.ts - getEneryFrom: target:undefinded');
        }
        return result;
    };
    return CommCreep;
}());
exports.CommCreep = CommCreep;
