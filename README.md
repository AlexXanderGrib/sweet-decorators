# Sweet Decorators Lib

It's a collection of most common used typescript decorators.

### Table of contents

- [Sweet Decorators Lib](#sweet-decorators-lib)
    - [Table of contents](#table-of-contents)
  - [`@Mixin`](#mixin)
  - [`@MapErrors` and `@MapErrorsAsync`](#maperrors-and-maperrorsasync)
  - [Class `DIContainer`](#class-dicontainer)
      - [Example of injection of simple value](#example-of-injection-of-simple-value)
      - [Example of providing a class](#example-of-providing-a-class)
  - [Method hooks: `@Before`, `@After`, `@Around`, `@BeforeAsync`, `@AfterAsync`, `@AroundAsync`](#method-hooks-before-after-around-beforeasync-afterasync-aroundasync)
      - [Simple Hooks Example](#simple-hooks-example)
      - [User Service Example](#user-service-example)

## `@Mixin`

Mixin is a pattern of `assigning new methods` and static properties to an existing class. It's called `composition`.
This decorator just makes it easy, by using by abstracting `applyMixin` function described in [typescript docs](https://www.typescriptlang.org/docs/handbook/mixins.html)

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

#### Example of injection of simple value

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

#### Example of providing a class

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

## Method hooks: `@Before`, `@After`, `@Around`, `@BeforeAsync`, `@AfterAsync`, `@AroundAsync`

This decorators used to call methods around other methods. Its can help make
code more concise by moving similar aspects out of the method.

#### Simple Hooks Example

```typescript
import { Before, After, Around } from "sweet-decorators";

function before(...args: any[]) {
  console.log("Before", { args });
}

function after(result: any[], ...args: any[]) {
  console.log("After", { result, args });
}

function around(fn: Function, ...args: any[]) {
  console.log("Before (Around)");

  fn(...args);

  console.log("After (Around)");

  return 43;
}

class Test {
  // Order of decorators matters
  @Before(before)
  @After(after)
  @Around(around)
  example(..._args: any[]) {
    console.log("Call Example");

    return 42;
  }
}

const result = new Test().example(1488);

console.log(result === 42);

/*
Before { args: [ 1488 ] }
Before (Around)
Call Example
After (Around)
After { result: 43, args: [ 1488 ] } // If you swap `@After` and `@Around` in function declaration, result will be 42
false 
// False, because function `around` changed it
*/
```

#### User Service Example

```typescript
import { AroundAsync, AfterAsync, BeforeAsync } from "sweet-decorators";

function checkAuthorization(this: UserService) {
  if (!this.currentSession) {
    throw new UserError("Unauthorized");
  }
}

async function updateLastLogin(this: UserService, result: any, ...args: any[]) {
  if (result.success) {
    await this.db.query(/* ... */);
  }
}

async function handleErrors(this: UserService, fn: Function, ...args: any[]) {
  try {
    return await fn(...args);
  } catch (error) {
    if (error instanceof DBError) {
      throw new UserError("Database got wrong");
    }

    throw error;
  }
}

class UserService {
  @AroundAsync(handleErrors) // First decorator wraps all next
  // If you put it ^ last. It will wrap only the function content.
  // That's how decorators work
  // https://www.typescriptlang.org/docs/handbook/decorators.html#decorator-composition
  @AfterAsync(updateLastLogin)
  @BeforeAsync(checkAuthorization)
  async getPersonalData() {
    /* ... */
  }

  /* ... */
}
```
