import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Binding } from 'aurelia-binding';

export interface AsyncAureliaBinding extends Binding {
  originalupdateTarget(value: any): void;
  _subscription?: Subscription;
}

export interface IAsyncBindingBehaviorOptions {
  property: string;
  error: (res: any) => void;
  completed: () => void;
}

export class asyncBindingBehavior {

  getPropByPath(obj: any, keyPath: string) {
    return keyPath
      .split(".")
      .reduce((prev, curr) => prev[curr], obj);
  }

  bind(binding: AsyncAureliaBinding, _source: string, options: IAsyncBindingBehaviorOptions) {
    binding.originalupdateTarget = binding.updateTarget || (() => {});

    binding.updateTarget = (a) => {
      if (typeof a.then === 'function') {
        a.then((d: any) => {
          binding.originalupdateTarget(d);
        });
      } else if (a instanceof Observable) {
        binding._subscription = a.subscribe(
          (res) => {
            binding.originalupdateTarget(options && options.property ? this.getPropByPath(res, options.property) : res);
          },
          options ? options.error : undefined,
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
      typeof binding._subscription.unsubscribe === 'function') {
      binding._subscription.unsubscribe();
    }
  }
}
