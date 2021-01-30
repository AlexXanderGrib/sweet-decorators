export type DependencyDescriptor<Key = any, Value = any> = {
  key: Key;
  value: (scope: any) => Value;
  scope: any;
};
