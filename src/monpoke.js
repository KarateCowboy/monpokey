const R = require('ramda')

class Monpoke {
  constructor (name, hp, attack, teamName = '') {
    [this.name, this.hp, this.attack, this.teamName] = arguments
    if (this.hp < 1) throw new Error('MonPoke must be initialized with 1 or greater HP')
    if (this.attack < 1) throw new Error('MonPoke must be initialized with 1 or greater AP')
  }
}

class Team {
  constructor (name, id) {
    this.name = name
    this.monpokes = []
    this.inRing = undefined
    this.id = id
  }

  get isDefeated () {
    return !this.monpokes.some(m => m.hp > 0)
  }

  addMon (name, hp, attack) {
    this.monpokes.push(new Monpoke(name, hp, attack, this.name))
  }

  get currentMon () {
    return this.monpokes.find(m => m.name === this.inRing)
  }
}

class GameState {
  constructor () {
    this.teams = {}
    this.teamCount = 0
    this.currentTeamId = 1
    this.gameOver = false
  }

  get combatStarted () {
    const inRing = Object.values(this.teams).map(t => t.inRing)
    return inRing.length === 2 && inRing.some(i => i !== undefined)
  }

  get currentTeam () {
    return Object.values(this.teams).find(t => t.id === this.currentTeamId)
  }

  get otherTeam () {
    return Object.values(this.teams).find(t => t.id !== this.currentTeamId)
  }

  addTeam (name) {
    if (!(name in this.teams)) {
      this.teamCount += 1
      this.teams[name] = new Team(name, this.teamCount)
      return this.teams[name]
    }
  }

  switchCurrentTeam () {
    this.currentTeamId = this.currentTeamId === 1 ? 2 : 1
  }

  allMon () {
    return R.flatten(Object.values(this.teams).map(t => t.monpokes))
  }

}

class GameController {
  constructor () {
    this.gameState = new GameState()
  }

  execCmd (cmdRecord) {
    const self = this
    const dispatch = {
      'CREATE': function (data) { return self.createCmd(data)},
      'CHOOSE': function (data) { return self.chooseCmd(data) },
      'ATTACK': function (data) {return self.attackCmd(data)}
    }
    let output =  dispatch[cmdRecord.type](cmdRecord.data)
    if (this.gameState.currentTeam.isDefeated) output += `\n${this.gameState.otherTeam.name} is the winner!`
    return output
  }

  createCmd (data) {
    const [teamName, monName, hp, attack] = data
    this.gameState.addTeam(teamName)
    this.gameState.teams[teamName].addMon(monName, hp, attack)
    return `${monName} has been assigned to team ${teamName}!`
  }

  chooseCmd (data) {
    const monName = data[0]
    if (this.gameState.teamCount < 2) throw new Error('You may not choose a Mon until another team arrives')
    const neededMon = this.gameState.allMon().find(m => m.name === monName)
    if (neededMon.teamName !== this.gameState.currentTeam.name) throw new Error('You may not choose the other team\'s Monpoke')
    if (neededMon.hp <= 0) throw new Error('You may not choose a defeated Mon')
    this.gameState.teams[neededMon.teamName].inRing = monName
    this.gameState.switchCurrentTeam()
    return `${monName} has entered the battle!`
  }

  attackCmd () {
    const attackingMon = this.gameState.currentTeam.currentMon
    if (attackingMon === undefined) throw new Error('You must choose a Mon before trying to attack')
    if (attackingMon.hp <= 0) throw new Error('You may not attack with a defeated Mon')
    const defendingMon = this.gameState.otherTeam.currentMon
    defendingMon.hp -= attackingMon.attack
    this.gameState.switchCurrentTeam()
    if (this.gameState.currentTeam.isDefeated) {
      this.gameState.gameOver = true
    }

    let output = `${attackingMon.name} attacked ${defendingMon.name} for ${attackingMon.attack} damage!`
    if(defendingMon.hp < 1) output += `\n${defendingMon.name} has been defeated!`
    return output
  }

  parse (cmdString) {
    const split = cmdString.split(' ')
    if (split[0] === 'CREATE') {
      return {
        type: 'CREATE',
        data: [split[1], split[2], parseInt(split[3]), parseInt(split[4])]
      }
    } else if (split[0] === 'ICHOOSEYOU') {
      return {
        type: 'CHOOSE',
        data: [split[1]]
      }
    } else if (split[0] === 'ATTACK') {
      return {
        type: 'ATTACK'
      }
    }
  }
}

module.exports.MonPoke = Monpoke
module.exports.Team = Team
module.exports.GameState = GameState
module.exports.GameController = GameController