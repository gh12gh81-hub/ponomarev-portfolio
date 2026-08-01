import readline from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { hashAdminPassword } from '../server/adminAuth.js'

const terminal = readline.createInterface({ input: stdin, output: stdout })
const password = await terminal.question('Введите пароль администратора: ')
terminal.close()

if (password.length < 12) {
  console.error('Пароль должен содержать не меньше 12 символов.')
  process.exitCode = 1
} else {
  console.log('\nADMIN_PASSWORD_HASH=')
  console.log(hashAdminPassword(password))
}
