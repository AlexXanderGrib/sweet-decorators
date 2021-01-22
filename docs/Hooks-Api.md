# Hooks API

Hooks are essential thing for creating methods decorators because they makes them much more easier

## API Table

| Hook                     | Callback params                                                                              | What is it good for      |
| ------------------------ | -------------------------------------------------------------------------------------------- | ------------------------ |
| `Before` & `BeforeAsync` | (...params: **`Original Method's Params`**)                                                  | Validation               |
| `After` & `AfterAsync`   | (result: **`Original Method's Result`**, ...params: **`Original Method's Params`**)          | Logging & Cleanup        |
| `Around` & `AroundAsync` | (method: **`Original Method bound to his this`**, ...params: **`Original Method's Params`**) | Error Handling & Metrics |

#### Example of this

##### Width hooks

```typescript
export function MapErrors(
  ...interceptors: ((error: Error) => Error | undefined)[]
): MethodDecorator {
  return Around((method, ...parameters) => {
    try {
      return method(...parameters);
    } catch (error) {
      for (const interceptor of interceptors) {
        const result = interceptor(error);

        if (result) throw result;
      }

      throw error;
    }
  });
}
```

##### Without hooks

```typescript
export function MapErrors( // Fn #1
  ...interceptors: ((error: Error) => Error | undefined)[]
): MethodDecorator {
  return function (_target, _property, desc) {
    // Fn #2
    const function_ = (desc.value as any) as Function;

    (desc as any).value = function (...arguments_: any[]) {
      // Fn #3
      // Actual code goes there
      try {
        return function_.apply(this, arguments_);
      } catch (error) {
        for (const interceptor of interceptors) {
          const result = interceptor(error);

          if (result) throw result;
        }

        throw error;
      }
    };

    return desc;
  };
}
```
