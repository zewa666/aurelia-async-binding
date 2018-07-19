var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "rxjs", "aurelia-framework"], function (require, exports, rxjs_1, aurelia_framework_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var asyncBindingBehavior = /** @class */ (function () {
        function asyncBindingBehavior() {
        }
        asyncBindingBehavior.prototype.getPropByPath = function (obj, keyPath) {
            return keyPath
                .split(".")
                .reduce(function (prev, curr) { return prev[curr]; }, obj);
        };
        asyncBindingBehavior.prototype.bind = function (binding, _source, options) {
            var _this = this;
            binding.originalupdateTarget = binding.updateTarget || (function () { });
            binding.updateTarget = function (a) {
                if (a && typeof a.then === "function") {
                    a.then(function (res) { return binding.originalupdateTarget(options && options.property ? _this.getPropByPath(res, options.property) : res); });
                    if (options && options.catch) {
                        a.catch(function (res) { return typeof options.catch === "function"
                            ? options.catch(res)
                            : binding.originalupdateTarget(options.catch); });
                    }
                }
                else if (a instanceof rxjs_1.Observable) {
                    var error = options
                        ? typeof options.error === "function"
                            ? options.error
                            : function () { binding.originalupdateTarget(options && options.property ? _this.getPropByPath(options.error, options.property) : options.error); }
                        : undefined;
                    binding._subscription = a.subscribe(function (res) {
                        binding.originalupdateTarget(options && options.property ? _this.getPropByPath(res, options.property) : res);
                    }, error, options ? options.completed : undefined);
                }
                else {
                    binding.originalupdateTarget(a);
                }
            };
        };
        asyncBindingBehavior.prototype.unbind = function (binding) {
            binding.updateTarget = binding.originalupdateTarget;
            binding.originalupdateTarget = undefined;
            if (binding._subscription &&
                typeof binding._subscription.unsubscribe === "function") {
                binding._subscription.unsubscribe();
            }
        };
        asyncBindingBehavior = __decorate([
            aurelia_framework_1.bindingBehavior("async")
        ], asyncBindingBehavior);
        return asyncBindingBehavior;
    }());
    exports.asyncBindingBehavior = asyncBindingBehavior;
});
