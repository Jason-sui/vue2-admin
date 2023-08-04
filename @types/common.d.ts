interface BaseObject {
  [key: string]: any
}

interface URLSearchParamsObject extends URLSearchParams {
  entries(): any[]
}

interface LCRequest {
  expressReq: any,
  params: any,
  object: any,
  meta: any,
  user: any,
  currentUser: any,
  sessionToken,
}

interface LCResponse {
  code: number,
  msg: string,
  data: any,
  error?: any,
}

interface LCObject {
  id: string,
  get(id: string): any,
  set(key: string, any): any,
  save(): Promise<any>,
  destroy(): Promise<any>,
  toJSON(): Object,
}

interface LCAuthData {
  uid?: string
  openid: string
}

interface LCUser extends LCObject {
  isAnonymous(): boolean
  associateWithAuthData(authData: LCAuthData, platform: string): promise<LCUser | Error>
  getSessionToken(): string
}

interface LCError extends Error {
  rawMessage: string,
}

interface LCQuery {
  notEqualTo(field: string, value: any): void
  limit(num: number): void,
  skip(num: number): void,
  equalTo(field: string, value: any): void,
  greaterThan(field: string, value: any): void
  lessThan(field: string, value: any): void
  descending(field: string): void,
  ascending(field: string): void,
  include(field: string): void
  notContainedIn(field: string, value: any): void
}

interface LCRuleResponse {
  code: number,
  msg: string,
  error?: Error | string,
  data?: Object | string
}