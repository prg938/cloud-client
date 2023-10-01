
import {
  LoginFormDTO,
  LoginResponseDTO,
  RegisterFormDTO,
  RegisterResponseDTO,
  HTTPError,
  FileEntity
} from "./dto"

import {destroyCookie, parseCookies} from "nookies"
import {TOKEN} from '@/const'
import type {UploadFile, UploadProps} from 'antd/es/upload'
import { FileType, FileMSG } from "./enums"
import { prepareFiles } from "./functions"


type HTTPRequestMethods = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH'
interface RequestData {
  endpoint: string
  dto?: any
  throwIf: number
  includeToken: boolean
  method: HTTPRequestMethods
}
type AnyObject = Record<string, any>

class BaseAPI {
  static endpointURL = 'http://localhost:7778'
  static endpointUploadsURL = 'http://localhost:7778/uploads/'

  constructor() {}
  protected endpointBaseURL = 'http://localhost:7778'

  protected fullEndpoint(endpoint: string) {
    return this.endpointBaseURL + endpoint
  }

  protected includeAuthorizationHeader(object: AnyObject | XMLHttpRequest) {
    const {token} = parseCookies()
    if (token) {
      const bearer = `Bearer ${token}`
      if (object instanceof XMLHttpRequest) {
        object.setRequestHeader('Authorization', bearer)
      }
      else object['Authorization'] = bearer
    }
    return object
  }
  
  protected async request<T extends HTTPError = HTTPError>(requestData: RequestData) {
    const {dto = {}, endpoint, throwIf, includeToken, method} = requestData
    const fullEndpoint = this.fullEndpoint(endpoint)
    let headers = {} as any
    let requestInit = {method} as any
    if (includeToken) {
      this.includeAuthorizationHeader(headers)
      //requestInit.credentials = 'include'
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
  constructor() {
    super()
  }
  logout() {
    destroyCookie(undefined, TOKEN, {path: '/'})
  }
  async login(dto: LoginFormDTO): Promise<LoginResponseDTO> {
    const {data} = await this.request({method: 'POST', endpoint: '/auth/login', dto: dto, throwIf: 401, includeToken: false})
    return data
  }
  async register(dto: RegisterFormDTO): Promise<RegisterResponseDTO> {
    const {data} = await this.request({method: 'POST', endpoint: '/auth/register', dto: dto, throwIf: 403, includeToken: false})
    return data
  }
}

class UserAPI extends BaseAPI {
  constructor() {
    super()
    this.me = this.me.bind(this)
  }
  async me(...args: any[]) {
    const [URL] = args
    const {data} = await this.request({method: 'GET', endpoint: URL, throwIf: 401, includeToken: true})
    return data
  }
}

type UploadResponse = {
  status: number
  body: string
}
type OptionsType = Parameters<Exclude<UploadProps['customRequest'], undefined>>[0]

class FileAPI extends BaseAPI {
  constructor() {
    super()
    this.get = this.get.bind(this)
    this.remove = this.remove.bind(this)
  }
  async get(args: [string, FileType]): Promise<UploadFile[]> {
    const [URL, type] = args
    let typeParameter = String()
    if (type !== FileType.ALL) typeParameter = '?type=' + type
    const {data: files}: {data: FileEntity[]} = await this.request({method: 'GET', endpoint: URL + typeParameter, throwIf: 401, includeToken: true})
    return prepareFiles(files)
  }
  async remove(ids: number[]): Promise<any> {
    const idsParameter = '?ids=' + ids.toString()
    const {data} = await this.request({method: 'DELETE', endpoint: '/files' + idsParameter, throwIf: 401, includeToken: true})
    return data
  }
  upload = (options: OptionsType) => 
    new Promise<UploadResponse>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const {onSuccess, onError, file, onProgress} = options
      const formData = new FormData()
      const ok = () => {
        const body = {status: xhr.status, body: xhr.responseText}
        const isStatusOk = body.status >= 200 && body.status <= 299
        if (isStatusOk) {
          resolve(body)
          if (onSuccess) onSuccess(body)
        }
        else {
          fail(FileMSG.FAIL + ': ' + JSON.parse(body.body).message)
        }
      }
      const fail = (msg: string) => {
        const error = {name: 'error', message: msg}
        reject(error)
        if (onError) onError(error)
      }
      formData.append('file', file)
      xhr.upload.addEventListener('progress', (event) => onProgress && onProgress({percent: (event.loaded / event.total) * 100}))
      xhr.addEventListener('load', () => ok())
      xhr.addEventListener('error', () => fail(FileMSG.FAIL))
      xhr.addEventListener('abort', () => fail(FileMSG.ABORT))
      xhr.open('POST', this.fullEndpoint('/files'), true)
      this.includeAuthorizationHeader(xhr)
      xhr.send(formData)
    })
}

export {BaseAPI}
export const Auth = new AuthAPI()
export const User = new UserAPI()
export const File = new FileAPI()