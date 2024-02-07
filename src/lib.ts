import { Functions } from './variables'

type JoinSelection = {
  table: string
  left: string
  right: string
}

type Tables = Record<string, Table>

type Table = Record<string, any>

export type TrimChar = ' ' | '\t' | '\n'

export type TrimStartAndEnd<S extends string> =
  S extends `${TrimChar}${infer R}`
    ? TrimStartAndEnd<R>
    : S extends `${infer L}${TrimChar}`
    ? TrimStartAndEnd<L>
    : S

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type UnionToTuple<T> = Into<T> extends infer U
  ? Exclude<T, U> extends never
    ? [T]
    : [...UnionToTuple<Exclude<T, U>>, U]
  : never

type Pack<T> = T extends any ? (arg: T) => void : never

type Unpack<T> = [T] extends [(arg: infer I) => void] ? I : never

type Into<T> = Unpack<Unpack<Pack<Pack<T>>>>

export type ObjectKeysToTuple<O extends object> = {
  [K in keyof O]: K
} extends {
  [_ in keyof O]: infer T
}
  ? T
  : never

export type ObjectLength<O extends object> = keyof O extends never
  ? 0
  : UnionToTuple<ObjectKeysToTuple<O>>['length']

export type QueryOperation<Q extends string> =
  Q extends `${infer Operation} ${infer _}`
    ? { operator: Lowercase<Operation>; rest: TrimStartAndEnd<_> }
    : never

export type SelectQuerySelectorsAndTable<
  Q extends string,
  S extends string = '',
> = Q extends `${infer CurrentWord} ${infer Rest}`
  ? Lowercase<CurrentWord> extends 'from'
    ? {
        selectors: S
        table: TrimStartAndEnd<Rest> extends `${infer Table} ${infer _}`
          ? Table
          : TrimStartAndEnd<Rest>
        rest: TrimStartAndEnd<Rest> extends `${infer _} ${infer Rest}`
          ? Rest
          : ''
      }
    : SelectQuerySelectorsAndTable<
        TrimStartAndEnd<Rest>,
        TrimStartAndEnd<`${S} ${CurrentWord}`>
      >
  : never

export type Query<Q extends string, T extends Tables> = QueryOperation<
  TrimStartAndEnd<Q>
> extends infer Result
  ? Result[keyof Result & 'operator'] extends 'select'
    ? SelectQuerySelectorsAndTable<
        TrimStartAndEnd<string & Result[keyof Result & 'rest']>
      > extends infer SelectQueryOptions
      ? ReturnObjectFromSelectQuerySelectors<
          string & SelectQueryOptions[keyof SelectQueryOptions & 'selectors'],
          T,
          string & SelectQueryOptions[keyof SelectQueryOptions & 'table'],
          string & SelectQueryOptions[keyof SelectQueryOptions & 'rest']
        >
      : never
    : never
  : never

type StringSplit<S extends string, D extends string> = string extends S
  ? string[]
  : S extends ''
  ? []
  : S extends `${infer T}${D}${infer U}`
  ? [T, ...StringSplit<U, D>]
  : [S]

type SelectQueryKeys<Q extends string> = StringSplit<
  Q,
  ','
> extends infer SplitedSelectors
  ? {
      [K in TrimStartAndEnd<
        string & SplitedSelectors[string & number]
      >]: unknown
    }
  : never

type AsKeys = 'as' | 'AS' | 'aS' | 'As'

type ValidKey<K extends string> =
  K extends `${infer _}(${infer Table}.${infer Column})`
    ? { table: Table; column: Column; func: _ }
    : K extends `${infer Table}.${infer Column}`
    ? { table: Table; column: Column }
    : K extends `${infer _}(${infer Column})`
    ? { column: Column; func: _ }
    : { column: K }

type ValidKeyReturn = {
  table?: string
  column: string
  func?: string
}
type CorrectValueOfKey<
  R extends ValidKeyReturn,
  TableName extends keyof TS,
  TS extends Tables,
  JS extends JoinSelection[],
> = R['func'] extends string
  ? Functions[keyof Functions & R['func']]
  : R['table'] extends string
  ? R['table'] extends TableName
    ? TS[R['table']][R['column']]
    : JoinFromArrayJoins<JS, R['table']> extends never
    ? never
    : TS[R['table']][R['column']]
  : TS[TableName][R['column']]

type KeysCorrectNameAndValue<
  O extends object,
  TableName extends keyof TS,
  TS extends Tables,
  J extends JoinSelection[],
> = {
  [K in keyof O as K extends `${infer _}${AsKeys}${infer As}`
    ? TrimStartAndEnd<As>
    : K extends '*'
    ? '*'
    : ValidKey<
        TrimStartAndEnd<string & K>
      >['column']]: K extends `${infer Initial}${AsKeys}${infer _}`
    ? ValidKey<TrimStartAndEnd<Initial>> extends infer Result
      ? CorrectValueOfKey<ValidKeyReturn & Result, TableName, TS, J>
      : never
    : K extends '*'
    ? 'all'
    : ValidKey<TrimStartAndEnd<string & K>> extends infer Result
    ? CorrectValueOfKey<ValidKeyReturn & Result, TableName, TS, J>
    : never
} extends infer Result
  ? ObjectLength<object & Result> extends 0
    ? never
    : Prettify<AddAllKeysIfSelectedAll<object & Result, TS[TableName]>>
  : never

type AddAllKeysIfSelectedAll<I extends object, T extends Table> = I[keyof I &
  '*'] extends never
  ? I
  : T & Omit<I, '*'>

type ReturnObjectFromSelectQuerySelectors<
  Q extends string,
  T extends Tables,
  TableName extends keyof T,
  R extends string,
> = KeysCorrectNameAndValue<SelectQueryKeys<Q>, TableName, T, AllJoins<R>>

type JoinFromArrayJoins<
  J extends JoinSelection[],
  TableName extends string,
> = J[number]['table'] extends TableName ? J[number] : never

type AllJoins<
  S extends string,
  Joins extends any[] = [],
> = S extends `${infer CurrentWord} ${infer Rest}`
  ? Lowercase<CurrentWord> extends 'left' | 'right' | 'inner'
    ? Lowercase<ElementAtPosition<TrimStartAndEnd<Rest>, 0>> extends 'join'
      ? CorrectInformationsForJoin<
          ArrayJoin<
            DeleteAmountOfElementsInArray<StringSplit<Rest, ' '>, 1>,
            ' '
          >,
          { table: 0; left: 2; right: 4; delete: 5 }
        > extends infer Result
        ? AllJoins<
            ArrayJoin<IfIsReturn<any[], Result[keyof Result & 'rest']>, ' '>,
            [
              ...Joins,
              {
                table: Result[keyof Result & 'table']
                left: Result[keyof Result & 'left']
                right: Result[keyof Result & 'right']
              },
            ]
          >
        : never
      : AllJoins<TrimStartAndEnd<Rest>, Joins>
    : Lowercase<CurrentWord> extends 'full'
    ? Lowercase<ElementAtPosition<TrimStartAndEnd<Rest>, 0>> extends 'outer'
      ? CorrectInformationsForJoin<
          ArrayJoin<
            DeleteAmountOfElementsInArray<StringSplit<Rest, ' '>, 1>,
            ' '
          >,
          { table: 1; left: 3; right: 5; delete: 6 }
        > extends infer Result
        ? AllJoins<
            ArrayJoin<IfIsReturn<any[], Result[keyof Result & 'rest']>, ' '>,
            [
              ...Joins,
              {
                table: Result[keyof Result & 'table']
                left: Result[keyof Result & 'left']
                right: Result[keyof Result & 'right']
              },
            ]
          >
        : never
      : AllJoins<TrimStartAndEnd<Rest>, Joins>
    : AllJoins<TrimStartAndEnd<Rest>, Joins>
  : Joins

type ElementAtPosition<S extends string, P extends number> = StringSplit<
  S,
  ' '
> extends infer StringArray
  ? StringArray[keyof StringArray & P]
  : never

type CorrectInformationsForJoin<
  S extends string,
  Options extends {
    table: number
    left: number
    right: number
    delete: number
  },
> = TrimStartAndEnd<S> extends infer StringTrimed
  ? {
      table: TrimStartAndEnd<
        ElementAtPosition<string & StringTrimed, Options['table']>
      >
      left: TrimStartAndEnd<
        ElementAtPosition<string & StringTrimed, Options['left']>
      >
      right: TrimStartAndEnd<
        ElementAtPosition<string & StringTrimed, Options['right']>
      >
      rest: DeleteAmountOfElementsInArray<
        RemoveElementFromArray<StringSplit<string & StringTrimed, ' '>, ''>,
        Options['delete']
      >
    }
  : never

type DeleteAmountOfElementsInArray<
  Arr extends any[],
  N extends number,
  Acc extends any[] = [],
> = Arr extends []
  ? []
  : Acc['length'] extends N
  ? Arr
  : Arr extends [infer F, ...infer R]
  ? DeleteAmountOfElementsInArray<R, N, [...Acc, F]>
  : never

type IfIsReturn<T, U> = U extends T ? U : never

type RemoveElementFromArray<
  T extends string[],
  U,
  R extends string[] = [],
> = T extends [infer F, ...infer Rest]
  ? F extends U
    ? RemoveElementFromArray<IfIsReturn<string[], Rest>, U, R>
    : RemoveElementFromArray<
        IfIsReturn<string[], Rest>,
        U,
        IfIsReturn<string[], [...R, F]>
      >
  : R

type ArrayJoin<
  A extends any[],
  J extends string,
  S extends string | number | bigint | boolean | null | undefined = '',
> = A extends [infer First, ...infer Rest]
  ? S extends ''
    ? ArrayJoin<Rest, J, `${string & First}`>
    : ArrayJoin<Rest, J, `${S}${J}${string & First}`>
  : S
