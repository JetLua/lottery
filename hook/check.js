const {exec} = require('child_process')

exec('npx eslint src --ext .ts,.tsx --color', (err, stdout) => {
  if (!err) return console.log('\x1b[32m%s\x1b[0m', '✔ eslint')
  console.error(stdout)
  process.exit(1)
})

exec('npx stylelint "**/*.{less,tsx}"  --color', (err, stdout) => {
  if (!err) return console.log('\x1b[32m%s\x1b[0m', '✔ stylelint')
  console.error(stdout)
  process.exit(1)
})

exec('npx tsc --pretty', (err, stdout) => {
  if (!err) return console.log('\x1b[32m%s\x1b[0m', '✔ tsc')
  console.error(stdout)
  process.exit(1)
})
