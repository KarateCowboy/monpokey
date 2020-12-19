let cmds = []
let fromFile = false
if (process.argv.length === 3) {
  fromFile = true
  const fs = require('fs')
  cmds = fs.readFileSync(process.argv[2], 'utf8')
  cmds = cmds.split('\n').map(s => {
    return s.replace('\r', '')
  })
} else {
  process.stdin.on('readable', () => {
    let chunk
    while ((chunk = process.stdin.read()) !== null) {
      const asStr = chunk.toString()
      cmds = asStr.toString().split('\n').map(s => {
        return s.replace('\r', '')
      })
    }
  })
}

const { GameController } = require('./src/monpoke.js')

const gameController = new GameController()
while (gameController.gameState.gameOver === false && cmds.length > 0) {
  const cmdString = cmds.shift()
  try {
    const cmd = gameController.parse(cmdString)
    const textOutput = gameController.execCmd(cmd)
    if (fromFile) {
      console.log(textOutput)
    } else {
      process.stdout.write(textOutput)
    }
    // console.log(textOutput)
  } catch (err) {
    console.log(err.message)
    process.exit(1)
  }
}

