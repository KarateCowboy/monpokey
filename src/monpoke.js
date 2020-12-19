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
    const d = cmdRecord.data
    let output
    switch (cmdRecord.type) {
      case 'CREATE':
        this.createCmd(d[0], d[1], d[2], d[3])
        output = `${d[1]} has been assigned to team ${d[0]}!`
        break
      case 'CHOOSE':
        this.chooseCmd(d[0])
        output = `${d[0]} has entered the battle!`
        break
      case 'ATTACK':
        const result = this.attackCmd()
        output = `${result.attacker} attacked ${result.defender} for ${result.attack} damage!`
        if (result.defeated) output += `\n${result.defender} has been defeated!`
        if (this.gameState.currentTeam.isDefeated) output += `\n${this.gameState.otherTeam.name} is the winner!`
        break
    }
    return output
  }

  createCmd (teamName, monName, hp, attack) {
    this.gameState.addTeam(teamName)
    this.gameState.teams[teamName].addMon(monName, hp, attack)
  }

  chooseCmd (monName) {
    if (this.gameState.teamCount < 2) throw new Error('You may not choose a Mon until another team arrives')
    const neededMon = this.gameState.allMon().find(m => m.name === monName)
    if (neededMon.teamName !== this.gameState.currentTeam.name) throw new Error('You may not choose the other team\'s Monpoke')
    if (neededMon.hp <= 0) throw new Error('You may not choose a defeated Mon')
    this.gameState.teams[neededMon.teamName].inRing = monName
    this.gameState.switchCurrentTeam()
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

    const defeated = defendingMon.hp < 1
    return {
      attacker: attackingMon.name, defender: defendingMon.name, attack: attackingMon.attack, defeated: defeated
    }

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