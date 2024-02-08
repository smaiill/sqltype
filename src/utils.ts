export type ExpectEqual<E, R> = E extends R
  ? R extends E
    ? true
    : false
  : false

export type ExpectKeysEqual<A1, A2> = keyof A1 extends keyof A2
  ? keyof A2 extends keyof A1
    ? true
    : false
  : false

export type Includes<A extends any[], K extends any> = A extends [
  ...infer Rest,
  infer CK,
]
  ? CK extends K
    ? true
    : Includes<Rest, K>
  : false
