# aurelia-async-binding

[![npm Version](https://img.shields.io/npm/v/aurelia-async-binding.svg)](https://www.npmjs.com/package/aurelia-async-binding)
[![Join the chat at https://gitter.im/aurelia/discuss](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/aurelia/discuss?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![CircleCI](https://circleci.com/gh/zewa666/aurelia-async-binding.svg?style=shield)](https://circleci.com/gh/zewa666/aurelia-async-binding)
[![Coverage Status](https://coveralls.io/repos/github/zewa666/aurelia-async-binding/badge.svg?branch=master)](https://coveralls.io/github/zewa666/aurelia-async-binding?branch=master)

An Aurelia binding behavior to consume async streams and promises directly from within your templates.

## Install
Install the npm dependency via

```bash
npm install aurelia-async-binding
```

## Aurelia CLI Support
If your Aurelia CLI build is based on RequireJS or SystemJS you can setup the plugin using the following dependency declaration:

```json
...
"dependencies": [
  {
    "name": "aurelia-async-binding",
    "path": "../node_modules/aurelia-async-binding/dist/amd",
    "main": "aurelia-async-binding"
  }
]
```

## Configuration
In your `main.ts` you'll have to register the plugin which makes it globally available:

```typescript
import {Aurelia} from 'aurelia-framework'
import environment from './environment';

export function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .feature('resources');

  ...

  aurelia.use.plugin("aurelia-async-binding");  // <----- REGISTER THE PLUGIN

  aurelia.start().then(() => aurelia.setRoot());
}
```

## Features
* Easily access streamed values
* Pluck complex object properties
* Deep-plucking to access nested complex object properties using the dot-notation
* Register `completedHandler` for once the stream completes
* Register `error` handlers to react on streamed errors


## Usage
Once the plugin is installed and configured you can use the `async` binding behavior.
An example VM and View can be seen below:

```typescript
import { Observable } from 'rxjs/Observable';
import "rxjs/add/operator/map";
import "rxjs/add/operator/take";
import "rxjs/add/observable/interval";
import "rxjs/add/observable/of";
import "rxjs/add/observable/from";

interface SPAFramework {
  label: string;
  url: string;
}
export class App {
  public frameworks: Observable<SPAFramework[]>;
  public frameworkOverTime: Observable<SPAFramework>;
  public isSequenceDone: boolean = false;

  constructor() {
    const data: SPAFramework[] = [
      { label: "Aurelia", url: "http://aurelia.io" },
      { label: "Angular v4", url: "http://angular.io" },
      { label: "React", url: "https://facebook.github.io/react/" },
    ];

    this.frameworks = Observable.of(data);

    this.frameworkOverTime = Observable.interval(2000)
      .map((idx) => data[idx])
      .take(data.length);
  }

  public completedHandler = () => {
    setTimeout(() => this.isSequenceDone = true, 2000);
  }
}
```

```html
<template>
  <h1>SPA Frameworks</h1>
  <ul>
    <li repeat.for="framework of frameworks & async">
      <a href="${framework.url}">${framework.label}</a>
    </li>
  </ul>

  <h1>Frameworks streamed (plucked property)</h1>
  <div>
      ${frameworkOverTime & async: { property: 'label' }}
  </div>

  <h1>Frameworks streamed (with binding, completed handler)</h1>
  <div with.bind="frameworkOverTime & async: { completed: completedHandler }">
    <a if.bind="!isSequenceDone" href="${url}">${label}</a>
    <span if.bind="isSequenceDone">Sequence is done!</span>
  </div>
</template>

```

## Acknowledgement
Thanks goes to Dwayne Charrington for his Aurelia-TypeScript starter package https://github.com/Vheissu/aurelia-typescript-plugin
