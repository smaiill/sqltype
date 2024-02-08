import {
  QueryOperation,
  SelectQuerySelectorsAndTable,
  ObjectLength,
  TrimStartAndEnd,
  UnionToTuple,
  Query,
} from './lib'
import { ExpectKeysEqual, ExpectEqual } from './utils'

export type UsersTable = {
  name: string
  age: number
  data: 'smail'
}

export type DepartmentsTable = {
  department_id: '1'
  name: string
}

type QueryLocal<QueryString extends string> = Query<
  QueryString,
  { users: UsersTable; departments: DepartmentsTable }
>

const A1: ExpectEqual<TrimStartAndEnd<'  Hello World '>, 'Hello World'> = true
const A2: ExpectEqual<
  TrimStartAndEnd<' \n    \t  Hello World     \t \n '>,
  'Hello World'
> = true

const A3: ExpectEqual<
  UnionToTuple<'hello' | 'world'>,
  ['hello', 'world']
> = true
const A4: ExpectKeysEqual<
  UnionToTuple<'hello' | 'world  ' | true>,
  ['hello', 'world  ', true]
> = true
const A5: ExpectKeysEqual<UnionToTuple<3 | 2 | '1'>, ['1', 3, 2]> = true

const A6: ExpectEqual<ObjectLength<{ a: string; b: string }>, 2> = true
const A7: ExpectEqual<
  ObjectLength<{ a: string; b: string; c: string; d: { a: string } }>,
  4
> = true
const A8: ExpectEqual<ObjectLength<{}>, 0> = true

const A9: ExpectEqual<
  QueryOperation<'SELECT * FROM users'>,
  { operator: 'select'; rest: '* FROM users' }
> = true
const A10: ExpectEqual<
  QueryOperation<'UPDATE * FROM users'>,
  { operator: 'update'; rest: '* FROM users' }
> = true

const A11: ExpectEqual<
  SelectQuerySelectorsAndTable<'* FROM users'>,
  { selectors: '*'; table: 'users'; rest: '' }
> = true
const A12: ExpectEqual<
  SelectQuerySelectorsAndTable<'user.name as user_name FROM users WHERE id = 1'>,
  { selectors: 'user.name as user_name'; table: 'users'; rest: 'WHERE id = 1' }
> = true
const A13: ExpectEqual<
  SelectQuerySelectorsAndTable<'    user.name   as user_name    FROM    users WHERE id = 1   '>,
  { selectors: 'user.name as user_name'; table: 'users'; rest: 'WHERE id = 1' }
> = true

const A14: ExpectEqual<
  QueryLocal<'SELECT name, age, data as user_data FROM users'>,
  { name: string; age: number; user_data: 'smail' }
> = true

const A15: ExpectEqual<
  QueryLocal<'   SELECT name    ,       age AS userAge , data  FROM users'>,
  { name: string; userAge: number; data: 'smail' }
> = true

const A16: ExpectEqual<
  QueryLocal<'SELECT users.name  FROM users'>,
  { name: string }
> = true

const A17: ExpectEqual<
  QueryLocal<'   SELECT     * FROM    users '>,
  { name: string; age: number; data: 'smail' }
> = true

const A18: ExpectEqual<
  QueryLocal<'   SELECT     data,users.name as UserName, departments.department_id as dpId FROM     users LEFT JOIN departments ON users.id = departments.id'>,
  { UserName: string; dpId: '1'; data: 'smail' }
> = true

const A19: ExpectEqual<
  QueryLocal<'   SELECT    AVG(departments.department_id)  FROM     departments'>,
  { department_id: never }
> = true

const A20: ExpectEqual<
  QueryLocal<'   SELECT    COUNT(departments.department_id), name as dpName  FROM     departments'>,
  { department_id: number; dpName: string }
> = true
