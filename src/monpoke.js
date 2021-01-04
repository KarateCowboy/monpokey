const R = require('ramda')

const Update = Object.assign

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

  static currentMon (teamIn) {
    return teamIn.monpokes.find(m => m.name === teamIn.inRing)
  }

  static addMon(name, hp, attack, teamIn) {
    const newMon = new Monpoke(name, hp, attack, teamIn.name) 
    return  Update(teamIn, { monpokes: [...teamIn.monpokes, newMon] })
  }

  static isDefeated(team) {
    return !team.monpokes.some(m => m.hp > 0)
  }
}

class GameState {
  constructor () {
    this.teams = {}
    this.teamCount = 0
    this.currentTeamId = 1
    this.gameOver = false
  }

  static combatStarted (gameStateIn) {
    const inRing = Object.values(gameStateIn.teams).map(t => t.inRing)
    return inRing.length === 2 && inRing.some(i => i !== undefined)
  }

  static currentTeam(gameStateIn) {
    return Object.values(gameStateIn.teams).find(t => t.id === gameStateIn.currentTeamId)
  }

  static otherTeam(gameStateIn) {
    return Object.values(gameStateIn.teams).find(t => t.id !== gameStateIn.currentTeamId)
  }
  static addTeam(name, gameStateIn) {
    if (!(name in gameStateIn.teams)) {
      const newTeam = new Team(name, gameStateIn.teamCount + 1)
      const moreTeam = {}
      moreTeam[name] = newTeam
      return Update(gameStateIn, {
        teams: Update(gameStateIn.teams, moreTeam),
        teamCount: gameStateIn.teamCount + 1
      })
    } else {
      return gameStateIn
    }
  }
  static switchCurrentTeam(stateIn) {
    const newCurrentTeamId = stateIn.currentTeamId === 1 ? 2 : 1
    return Update(stateIn, { currentTeamId: newCurrentTeamId })
  }

  static allMon (gameStateIn) {
    return R.flatten(Object.values(gameStateIn.teams).map(t => t.monpokes))
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
    if (GameState.currentTeam(this.gameState).isDefeated) output += `\n${GameState.otherTeam(this.gameState).name} is the winner!`
    return output
  }

  createCmd (data) {
    const [teamName, monName, hp, attack] = data
    this.gameState = GameState.addTeam(teamName, this.gameState)
    const selectedTeam = this.gameState.teams[teamName]
    const teamWithNewMon = Team.addMon(monName, hp, attack, selectedTeam)
    const newTeamObj = {...this.gameState.teams, [teamName]: teamWithNewMon }
    this.gameState = Update(this.gameState, {teams: newTeamObj})

    return `${monName} has been assigned to team ${teamName}!`
  }

  chooseCmd (data) {
    const monName = data[0]
    if (this.gameState.teamCount < 2) throw new Error('You may not choose a Mon until another team arrives')
    const neededMon = GameState.allMon(this.gameState).find(m => m.name === monName)
    if (neededMon.teamName !== GameState.currentTeam(this.gameState).name) throw new Error('You may not choose the other team\'s Monpoke')
    if (neededMon.hp <= 0) throw new Error('You may not choose a defeated Mon')
    this.gameState.teams[neededMon.teamName].inRing = monName
    this.gameState = GameState.switchCurrentTeam(this.gameState)
    return `${monName} has entered the battle!`
  }

  attackCmd () {
    const attackingMon = Team.currentMon(GameState.currentTeam(this.gameState))
    if (attackingMon === undefined) throw new Error('You must choose a Mon before trying to attack')
    if (attackingMon.hp <= 0) throw new Error('You may not attack with a defeated Mon')
    const defendingMon = Team.currentMon(GameState.otherTeam(this.gameState))
    defendingMon.hp -= attackingMon.attack
    this.gameState = GameState.switchCurrentTeam(this.gameState)
    if (Team.isDefeated(GameState.currentTeam(this.gameState))) {
      this.gameState = {...this.gameState, gameOver: true }
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
