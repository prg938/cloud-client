
export const EmailPatternRE = /([-!#-'*+/-9=?A-Z^-~]+(\.[-!#-'*+/-9=?A-Z^-~]+)*|\"([]!#-[^-~ \t]|(\\[\t -~]))+\")@([-!#-'*+/-9=?A-Z^-~]+(\.[-!#-'*+/-9=?A-Z^-~]+)*|\[[\t -Z^-~]*])/

export const Rules = {
  trimmer: (value: any) => value.trim(),
  fullname: [{required: true, message: 'нет имени'}],
  email: [{required: true, pattern: EmailPatternRE, message: 'некорректная почта'}],
  password: [{required: true, min: 5, message: 'пароль не менее 5 символов'}]
}