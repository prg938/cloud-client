
import {
  LoginFormDTO,
  LoginResponseDTO,
  RegisterFormDTO,
  RegisterResponseDTO,
  HTTPError,
  MeDTO
} from "./dto"

import {destroyCookie, parseCookies} from "nookies"
import {TOKEN} from '@/const'

interface RequestData {
  endpoint: string
  dto: any
  throwIf: number
  includeToken: boolean
  method: 'GET' | 'POST'
}

class BaseAPI {
  constructor() {}
  protected endpointBaseURL = 'http://localhost:7778'

  protected fullEndpoint(endpoint: string) {
    return this.endpointBaseURL + endpoint
  }

  protected includeAuthorizationHeader(headers: {[key: string]: any}) {
    const {token} = parseCookies()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }
  
  protected async request<T extends HTTPError = HTTPError>(requestData: RequestData) {
    const {dto = {}, endpoint, throwIf, includeToken, method} = requestData
    const fullEndpoint = this.fullEndpoint(endpoint)
    let headers = {} as any
    let requestInit = {method} as any
    if (includeToken) {
      this.includeAuthorizationHeader(headers)
      requestInit.credentials = 'include'
    }
    if (method === 'POST') {
      requestInit.body = JSON.stringify(dto)
      headers['Content-Type'] = 'application/json'
    }
    requestInit.headers = headers
    const response = await fetch(fullEndpoint, requestInit)
    const data = await response.json()
    if (!response.ok) {
      if (response.status === throwIf) {
        const {statusCode, message}: T = data
        throw {statusCode, message}
      }
    }
    return {response, data}
  }
}

class AuthAPI extends BaseAPI {
  constructor() { super() }
  logout() {
    destroyCookie(undefined, TOKEN, {path: '/'})
  }
  async login(dto: LoginFormDTO): Promise<LoginResponseDTO> {
    const {data} = await this.request({endpoint: '/auth/login', dto: dto, throwIf: 401, includeToken: false, method: 'POST'})
    return data
  }
  async register(dto: RegisterFormDTO): Promise<RegisterResponseDTO> {
    const {data} = await this.request({endpoint: '/auth/register', dto: dto, throwIf: 403, includeToken: false, method: 'POST'})
    return data
  }
}

class UserAPI extends BaseAPI {
  constructor() { super() }
  async me(): Promise<MeDTO> {
    const {data} = await this.request({endpoint: '/users/me', dto: undefined, throwIf: 401, includeToken: true, method: 'GET'})
    return data
  }
}

export const Auth = new AuthAPI()
export const User = new UserAPI()