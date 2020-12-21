"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = require("./common");
var Carriage = /** @class */ (function (_super) {
    __extends(Carriage, _super);
    function Carriage(creep) {
        return _super.call(this, creep) || this;
    }
    /** 检测目标是否处理完成 - 能量补给完毕 */
    Carriage.prototype.testTarget = function () {
        var target = this.getTask(this.creep.memory.task);
        return target ? target.store.getFreeCapacity(RESOURCE_ENERGY) === 0 : true;
    };
    /** 入口 */
    Carriage.prototype.run = function () {
        if (this.testStatus()) {
            if (!this.creep.memory.task)
                this.setTask('harvest');
            var target = this.getTask();
            var status_1 = this.creep.transfer(target, RESOURCE_ENERGY);
            if (status_1 === ERR_NOT_IN_RANGE) {
                this.moveTo();
            }
            else if (status_1 === OK && target.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                delete this.creep.memory.path;
            }
            else if (target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
                rooms[this.creep.room.name].harvest.splice(this.creep.task, 1);
                delete this.creep.task;
            }
        }
        else {
            // 前往能量矿采集能量
            var source = rooms[this.creep.room.name]['source'][this.creep.memory.source];
            // 前往container获取能量
            // const container = this.creep.room.find()
            this.getEnergyFrom(source);
        }
    };
    return Carriage;
}(common_1.CommCreep));
function creCarriageClass(creep) {
    return new Carriage(creep).run();
}
exports.default = creCarriageClass;
