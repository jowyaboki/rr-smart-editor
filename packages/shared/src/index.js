"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowStepSchema = exports.ProjectUpdateSchema = exports.ProjectCreateSchema = void 0;
const zod_1 = require("zod");
exports.ProjectCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    timeline: zod_1.z.any().optional(),
});
exports.ProjectUpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    timeline: zod_1.z.any().optional(),
});
__exportStar(require("./ai"), exports);
__exportStar(require("./recovery"), exports);
__exportStar(require("./performance"), exports);
__exportStar(require("./release"), exports);
__exportStar(require("./collaboration"), exports);
__exportStar(require("./agents"), exports);
__exportStar(require("./workflows"), exports);
__exportStar(require("./render"), exports);
// Resolve duplicate export conflicts
var workflows_1 = require("./workflows");
Object.defineProperty(exports, "WorkflowStepSchema", { enumerable: true, get: function () { return workflows_1.WorkflowStepSchema; } });
//# sourceMappingURL=index.js.map