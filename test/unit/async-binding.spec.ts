import { StageComponent } from "aurelia-testing";
import { bootstrap } from "aurelia-bootstrapper";
import { Aurelia } from "aurelia-framework";
import { of, interval } from "rxjs";
import { map, take } from "rxjs/operators";

interface SPAFramework {
  label: string;
  url: string;
}

const data: SPAFramework[] = [
  { label: "Aurelia", url: "http://aurelia.io" },
  { label: "Angular v4", url: "http://angular.io" },
  { label: "React", url: "https://facebook.github.io/react/" },
];

function bootstrapPlugin(component) {
  component.bootstrap((aurelia: Aurelia) => {
    aurelia.use.standardConfiguration()
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

  it("should pluck a single property from the streamed items", async (done) => {
    const delay = 10;
    const component = StageComponent
      .withResources("mocks/async-binding-vm")
      .inView(`<div id="test-target">
          \${frameworkOverTime & async: { property: 'label' }}
        </div>`
      )
      .boundTo({
        frameworkOverTime: interval(delay).pipe(
          map((idx) => data[idx]),
          take(data.length)
        )
      });

    bootstrapPlugin(component);

    await component.create(bootstrap);

    setTimeout(() => {
      expect(component.element.innerHTML.trim()).toBe(data[data.length - 1].label);
      component.dispose();

      done();
    }, delay * data.length + 10);
  });

  fit("should call a provided completedHandler", async () => {
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
});
