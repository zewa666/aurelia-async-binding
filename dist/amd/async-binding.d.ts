import { Subscription } from "rxjs";
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
export declare class asyncBindingBehavior {
    getPropByPath(obj: any, keyPath: string): any;
    bind(binding: AsyncAureliaBinding, _source: string, options?: AsyncBindingBehaviorOptions): void;
    unbind(binding: AsyncAureliaBinding): void;
}
