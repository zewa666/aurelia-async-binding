import { ComponentTester, StageComponent } from "aurelia-testing";
import { bootstrap } from "aurelia-bootstrapper";
import { Aurelia } from "aurelia-framework";
import { of, interval, throwError } from "rxjs";
import { map, take } from "rxjs/operators";

import { asyncBindingBehavior, AsyncAureliaBinding } from "../../src/async-binding";

interface SPAFramework {
  label: string;
  url: string;
}

const data: SPAFramework[] = [
  { label: "Aurelia", url: "http://aurelia.io" },
  { label: "Angular v4", url: "http://angular.io" },
  { label: "React", url: "https://facebook.github.io/react/" },
];

function bootstrapPlugin(component: ComponentTester<any>) {
  component.bootstrap((aurelia: Aurelia) => {
    return aurelia.use.standardConfiguration()
      .feature("src");
  });
}

describe("the Async Binding Behavior", () => {
  it("should render all streamed items out of the box", async () => {
    const component = StageComponent
      .withResources("mocks/async-binding-vm")
      .inView(`<div id="test-target">
          <ul>
            <li repeat.for="framework of frameworks & async">
              <a href="\${framework.url}">\${framework.label}</a>
            </li>
          </ul>
        </div>`
      )
      .boundTo({ frameworks: of(data) });

    bootstrapPlugin(component);

    await component.create(bootstrap);

    expect(component.element.querySelectorAll("li").length).toBe(data.length);
    component.dispose();
  });

  it("should pluck a single property from the streamed items", async () => {
    const delay = 10;
    const obs$ = interval(delay).pipe(
      map((idx) => data[idx]),
      take(data.length)
    );
    const component = StageComponent
      .withResources("mocks/async-binding-vm")
      .inView(`<div id="test-target">
          \${frameworkOverTime & async: { property: 'label' }}
        </div>`
      )
      .boundTo({
        frameworkOverTime: obs$
      });

    bootstrapPlugin(component);

    await component.create(bootstrap);

    await obs$.toPromise();
    expect(component.element.innerHTML.trim()).toBe(data[data.length - 1].label);
    component.dispose();
  });

  it("should allow plucking deep object properties", async () => {
    const expectedValue = "bar";
    const component = StageComponent
      .withResources("mocks/async-binding-vm")
      .inView(`<div id="test-target">
          \${data & async: { property: 'level1.level2.foo' }}
        </div>`
      )
      .boundTo({
        data: of({
          level1: {
            level2: {
              foo: expectedValue
            }
          }
        })
      });

    bootstrapPlugin(component);

    await component.create(bootstrap);

    expect(component.element.innerHTML.trim()).toBe(expectedValue);
    component.dispose();
  });

  it("should call a provided completedHandler", async () => {
    const completed = jest.fn();
    const component = StageComponent
      .withResources("mocks/async-binding-vm")
      .inView(`<div id="test-target">
          \${frameworks & async: { completed: completed }}
        </div>`
      )
      .boundTo({
        frameworks: of(data),
        completed
      });

    bootstrapPlugin(component);

    await component.create(bootstrap);

    expect(completed).toHaveBeenCalled();
    component.dispose();
  });

  it("should call a provided error handler and pass the error", async () => {
    const expectedErrorMessage = "Failed on purpose";
    const errorHandler = jest.fn();
    const component = StageComponent
      .withResources("mocks/async-binding-vm")
      .inView(`<div id="test-target">
          \${frameworks & async: { error: errorHandler }}
        </div>`
      )
      .boundTo({
        frameworks: throwError(expectedErrorMessage),
        errorHandler
      });

    bootstrapPlugin(component);

    await component.create(bootstrap);

    expect(errorHandler).toHaveBeenCalledWith(expectedErrorMessage);
    component.dispose();
  });

  it("should cleanup previously defined subscriptions", () => {
    const sut = new asyncBindingBehavior();
    const binding = {} as AsyncAureliaBinding;
    const stream$ = of("test");
    
    sut.bind(binding, "", undefined);
    binding.updateTarget?.(stream$);
    expect(binding._subscription).toBeDefined();

    const bindingSpy = jest.spyOn(binding._subscription!, "unsubscribe");
    binding.updateTarget?.(stream$);

    expect(bindingSpy).toHaveBeenCalled();
  });
});
