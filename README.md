# Sweet Decorators Lib

It's a collection of most common used typescript decorators.

## `@Mixin`

Mixin is a pattern of `assigning new methods` and static properties to an existing class. It's called `composition`.
This decorator just makes it easy, by using by abstracting applyMixin described in [typescript docs](https://www.typescriptlang.org/docs/handbook/mixins.html)

**Example**

```typescript
import { Mixin } from "sweet-decorators";

class Swimmable {
  swim() {
    console.log("🏊‍♂️");
  }
}

class Walkable {
  walk() {
    console.log("🚶‍♂️");
  }
}

class Flyable {
  fly() {
    console.log("🐦");
  }
}

@Mixin(Swimmable, Walkable)
class Human {}
interface Human extends Swimmable, Walkable {}

@Mixin(Walkable, Flyable)
class Bird {}
interface Bird extends Walkable, Flyable {}

const human = new Human();
human.swim();
// => 🏊‍♂️

const bird = new Bird();
bird.fly();
// => 🐦
```

## `@MapErrors` and `@MapErrorsAsync`

This mixin in used to `intercept errors` to catch and display more effectively one layer up

```typescript
import { MapErrorsAsync } from "sweet-decorators";
import { FetchError } from "node-fetch";
import { PaymentError } from "../errors";

const mapper = (error: Error): Error => {
  if (error instanceof FetchError) {
    return new PaymentError(
      "Cannot connect to remote endpoint",
      PaymentError.Code.NetworkError
    );
  }

  return error;
};

class PaymentSystem {
  @MapErrorsAsync(mapper)
  async finishPayment(id: string) {
    /* ... */
  }
}

// In some other file
const ps = new PaymentSystem();

app.post("/finish-3ds", async (req, res) => {
  try {
    const response = await ps.finishPayment(req.query.id);

    /* ... */
  } catch (error) {
    console.log(error);
    // => PaymentError(NETWORK_ERROR): Cannot connect to remote endpoint
  }
});
```

## Class `DIContainer`

This is simple implementation of `dependency injection` pattern in typescript without assigning any metadata.

**Example of injection of simple value**

```typescript
import { DIContainer } from "sweet-decorators";

const container = new DIContainer();
const SECRET_TOKEN = Symbol("SECRET_TOKEN");

container.provide(SECRET_TOKEN, process.env.SECRET_TOKEN);

class ExternalAPIClient {
  @container.Inject(SECRET_TOKEN)
  private readonly token!: string;

  public call(method: string, params: object) {
    params = { token: this.token, ...params };

    /* foreign api call logic */
  }

  public get secretToken() {
    return this.token;
  }
}

const client = new ExternalAPIClient();

console.log(client.secretToken === process.env.SECRET_TOKEN);
// => true
```

**Example of providing a class**

```typescript
import { DIContainer } from "sweet-decorators";

const container = new DIContainer();

// You must give a name(token) to provided class
@container.Provide('CONFIG_SERVICE');
class ConfigService {
  // BAD BAD BAD. Constructor of a provider can't have params. Because his initialization is controlled by container
  constructor(public path: sting) {}

  get(propertyPath: string): any { /* ... */ }
}


class Database {
  @container.Inject('CONFIG_SERVICE')
  private readonly config: ConfigService;

  public connection = this.config.get('db.connectionString')

  /* ... logic ... */
}
```
