import { Observable, Subscription } from "rxjs";
import { bindingBehavior } from "aurelia-framework";
import { Binding } from "aurelia-binding";

export interface AsyncAureliaBinding extends Binding {
  originalupdateTarget(value: any): void;
  _subscription?: Subscription;
}

export interface AsyncBindingBehaviorOptions {
  catch: any;
  completed: () => void;
  error: any;
  property: string;
}

@bindingBehavior("async")
export class asyncBindingBehavior {

  getPropByPath(obj: any, keyPath: string) {
    return keyPath
      .split(".")
      .reduce((prev, curr) => prev[curr], obj);
  }

  bind(binding: AsyncAureliaBinding, _source: string, options?: AsyncBindingBehaviorOptions) {
    binding.originalupdateTarget = binding.updateTarget || (() => {});

    binding.updateTarget = (a) => {
      if (binding._subscription &&
        typeof binding._subscription.unsubscribe === "function") {
        binding._subscription.unsubscribe();
      }
      
      if (a && typeof a.then === "function") {
        a.then((res: any) => binding.originalupdateTarget(options && options.property ? this.getPropByPath(res, options.property) : res));
        
        if (options && options.catch) {
          a.catch((res: any) => typeof options.catch === "function"
            ? options.catch(res)
            : binding.originalupdateTarget(options.catch));
        }
      } else if (a instanceof Observable) {
        const error = options
          ? typeof options.error === "function"
            ? options.error
            : () => { binding.originalupdateTarget(options && options.property ? this.getPropByPath(options.error, options.property) : options.error); }
          : undefined;

        // Immediately update the target if the Observable has a BehaviorSubject-like current value member
        if ("value" in a) {
          binding.originalupdateTarget((a as any).value)
        } else if (typeof (a as any).getValue === "function") {
          binding.originalupdateTarget((a as any).getValue())
        }

        binding._subscription = a.subscribe(
          (res) => {
            binding.originalupdateTarget(options && options.property ? this.getPropByPath(res, options.property) : res);
          },
          error,
          options ? options.completed : undefined
        );
      }
      else {
        binding.originalupdateTarget(a);
      }
    };
  }

  unbind(binding: AsyncAureliaBinding) {
    binding.updateTarget = binding.originalupdateTarget;
    (binding as any).originalupdateTarget = undefined;

    if (binding._subscription &&
      typeof binding._subscription.unsubscribe === "function") {
      binding._subscription.unsubscribe();
    }
  }
}
