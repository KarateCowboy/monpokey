let cmds = []
if (process.argv.length > 3) {
    // it's from stdin
} else if (process.argv.length === 3) {
    const fs = require('fs')
    cmds = fs.readFileSync(process.argv[2], "utf8")
    cmds = cmds.split('\n').map(s => {
        return s.replace("\r", '')
    })
}

const {GameController} = require('./src/monpoke.js')

const gameController = new GameController()
while (gameController.gameState.gameOver === false && cmds.length > 0) {
    const cmdString = cmds.shift()
    try {
        const cmd = gameController.parse(cmdString)
        const textOutput = gameController.execCmd(cmd)
        console.log(textOutput)
    } catch (err) {
        console.log(err.message)
        process.exit(1)
    }
}

