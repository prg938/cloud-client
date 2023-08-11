
export interface HTTPError {
  statusCode: number
  message: string
}

export interface LoginFormDTO {
  email: string
  password: string
}

export interface LoginResponseDTO {
  token: string
}

export interface RegisterFormDTO extends LoginFormDTO {
  fullname: string
}

export interface MeDTO {
  id: number
  fullname: string
  email: string
  password: string
}

export interface RegisterResponseDTO extends LoginResponseDTO {}