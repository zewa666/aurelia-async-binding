"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var aurelia_pal_1 = require("aurelia-pal");
function configure(aurelia) {
    aurelia.globalResources([
        aurelia_pal_1.PLATFORM.moduleName("./async-binding")
    ]);
}
exports.configure = configure;
__export(require("./async-binding"));
