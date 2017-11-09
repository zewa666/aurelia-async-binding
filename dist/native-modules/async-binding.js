import { Observable } from "rxjs/Observable";
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
            if (typeof a.then === "function") {
                a.then(function (res) { return binding.originalupdateTarget(options && options.property ? _this.getPropByPath(res, options.property) : res); });
                if (options && options.catch) {
                    a.catch(function (res) { return typeof options.catch === "function"
                        ? options.catch(res)
                        : binding.originalupdateTarget(options.catch); });
                }
            }
            else if (a instanceof Observable) {
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
    return asyncBindingBehavior;
}());
export { asyncBindingBehavior };
