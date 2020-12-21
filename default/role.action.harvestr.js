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
var Harvest = /** @class */ (function (_super) {
    __extends(Harvest, _super);
    function Harvest(creep) {
        return _super.call(this, creep) || this;
    }
    /**  */
    /** 入口 */
    Harvest.prototype.run = function () {
        var idx = this.creep.memory.source;
        var container = rooms[this.creep.room.name]['container'][idx];
        if (container) {
            if (this.creep.pos.x === container.pos.x && this.creep.pos.y === container.pos.y) {
                if (container.store[RESOURCE_ENERGY] <= 1990) {
                    var source = rooms[this.creep.room.name]['source'][idx];
                    this.creep.harvest(source);
                }
            }
            else {
                this.moveTo(container);
            }
        }
    };
    return Harvest;
}(common_1.CommCreep));
function creHarvestClass(creep) {
    return new Harvest(creep).run();
}
exports.default = creHarvestClass;
