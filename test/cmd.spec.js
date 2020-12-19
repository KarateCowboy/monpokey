const expect = require('chai').expect

const {GameState, GameController, MonPoke, Team} = require('../src/monpoke.js')


describe('MonPoke', () => {
    describe('attributes', () => {
        const name = 'Jonny'
        const hp = 12
        const attack = 9001
        specify('name', () => {
            const newMon = new MonPoke(name, 1, 1)
            expect(newMon).to.have.property('name', name)
        })
        specify('hp', () => {
            const newMon = new MonPoke(name, hp, 1)
            expect(newMon).to.have.property('hp', hp)
        })
        specify('attack', () => {
            const newMon = new MonPoke(name, hp, attack)
            expect(newMon).to.have.property('attack', attack)
        })
        specify('teamName', () => {
            const newMon = new MonPoke(name, hp, attack, 'Sprocket')
            expect(newMon).to.have.property('teamName', 'Sprocket')
        })
        specify('validation', () => {
            expect(() => {
                new MonPoke(name, 0, attack)
            }).to.throw('MonPoke must be initialized with 1 or greater HP')
            expect(() => {
                new MonPoke(name, hp, 0)
            }).to.throw('MonPoke must be initialized with 1 or greater AP')
        })
    })
})

describe('Team', () => {
    specify('name', () => {
        const name = 'Rocket'
        const rocket = new Team(name)
        expect(rocket).to.have.property('name', name)
    })
    specify('monpokes hash', () => {
        const newTeam = new Team()
        expect(newTeam).to.have.property('monpokes')
        expect(newTeam.monpokes).to.be.a('array')
    })
    specify('inRing monPoke', () => {
        const newTeam = new Team()
        expect(newTeam).to.have.property('inRing')
    })
    specify('currentMon', () => {
        const newTeam = new Team()
        newTeam.addMon('Meekachu', 1, 1)
        newTeam.inRing = 'Meekachu'
        expect(newTeam.currentMon).to.have.property('name', 'Meekachu')

    })
    describe('isDefeated', () => {
        specify('is true only when all Mon have <= 0 hp', () => {
            const team = new Team('Rocket')
            team.addMon('Meekachu', 2, 2)
            team.addMon('Snorflax', 2, 2)
            expect(team.isDefeated).to.equal(false)
            team.monpokes[0].hp = 0
            expect(team.isDefeated).to.equal(false)
            team.monpokes[1].hp = 0
            expect(team.isDefeated).to.equal(true)
        })
    })
    specify('id', () => {
        const newTeam = new Team()
        expect(newTeam).to.have.property('id')
    })
    describe('addMon', () => {
        it('adds a mon', () => {
            const team = new Team('Rocket')
            team.addMon('Spreekachu', 1, 1)
            expect(team.monpokes[0]).to.have.property('name', 'Spreekachu')
            expect(team.monpokes[0]).to.have.property('teamName', 'Rocket')
        })
    })
})

describe('GameState', () => {
    context('properties', () => {
        specify('teams roster', () => {
            const newState = new GameState()
            expect(newState).to.have.property('teams')
            expect(newState.teams).to.be.a('object')
        })
        specify('monpokes list', () => {
            const newState = new GameState()
            expect(newState).to.not.have.property('monpokes')
        })
        specify('inRing list', () => {
            const newState = new GameState()
            expect(newState).to.not.have.property('inRing')
        })
        specify('teamCount', () => {
            const gameState = new GameState()
            expect(gameState).to.have.property('teamCount', 0)
        })
        describe('combatStarted', () => {
            specify('combatStarted boolean', () => {
                const newState = new GameState()
                expect(newState).to.have.property('combatStarted', false)
            })
            specify('it returns true when both teams have chosen', () => {
                const newState = new GameState()
                const teamRocket = newState.addTeam('Rocket')
                teamRocket.inRing = 'Peowth'
                expect(newState).to.have.property('combatStarted', false)
                const teamMissile = newState.addTeam('Missile')
                teamMissile.inRing = 'Missile'

                expect(newState).to.have.property('combatStarted', true)
            })
        })
        specify('currentTeamId', () => {
            const gameState = new GameState()
            expect(gameState).to.have.property('currentTeamId', 1)
        })
        specify('currentTeam', () => {
            const gameState = new GameState()
            gameState.addTeam('Rocket')
            expect(gameState.currentTeam).to.have.property('name', 'Rocket')
        })
        specify('otherTeam', () => {
            const gameState = new GameState()
            gameState.addTeam('Rocket')
            gameState.addTeam('Missile')
            expect(gameState.otherTeam).to.have.property('name', 'Missile')
        })
        specify('gameOver', () => {
            const gameState = new GameState()
            expect(gameState).to.have.property('gameOver', false)
        })
    })
    context('instance methods', () => {
        describe('addTeam', () => {
            const gameState = new GameState()
            it('creates a new team', () => {
                gameState.addTeam('Rocket')
                expect(gameState.teams).to.have.property('Rocket')
                expect(gameState.teams['Rocket']).to.have.property('name', 'Rocket')
            })
            it('gives the team an id', () => {
                gameState.addTeam('Rocket')
                expect(gameState.teams['Rocket']).to.have.property('id', 1)
                expect(gameState.teamCount).to.equal(1)
            })
        })
        describe('switchCurrentTeam', () => {
            it('sets the currentTeam to 1 if it is 2, and 2 if it is 1', () => {
                const gameState = new GameState()
                gameState.switchCurrentTeam()
                expect(gameState).to.have.property('currentTeamId', 2)
                gameState.switchCurrentTeam()
                expect(gameState).to.have.property('currentTeamId', 1)
            })
        })
        describe('allMon', () => {
            it('returns all mon from all teams', () => {
                const gameState = new GameState()
                gameState.addTeam('Rocket')
                gameState.addTeam('Missile')
                gameState.teams['Rocket'].addMon('Rocketchu', 1, 1)
                gameState.teams['Missile'].addMon('Missilchu', 1, 1)
                expect(gameState.allMon().map(m => m.name)).to.have.members(['Rocketchu', 'Missilchu'])
            })

        })
    })
})

describe('Game Controller', () => {
    const createRocketMeekachu = {
        type: 'CREATE',
        data: ['Rocket', 'Meekachu', 2, 1]
    }
    const createRocketClefengly = {
        type: 'CREATE',
        data: ['Rocket', 'Clefengly', 2, 1]
    }

    const createSocketFlonyx = {
        type: 'CREATE', data: ['Socket', 'Flonyx', 5, 1]
    }
    it('has a game state', () => {
        const gc = new GameController()
        expect(gc).to.have.property('gameState')
        expect(gc.gameState).to.have.property('teams')
    })
    describe('CREATE command', () => {
        it('returns the updated state with a new team if the team does not exist', () => {
            const gameController = new GameController()
            gameController.execCmd(createRocketMeekachu)
            expect(gameController.gameState.teams['Rocket']).to.have.property('name', createRocketMeekachu.data[0])
        })
        it('adds a new monpoke for a team', () => {
            const gameController = new GameController()
            gameController.execCmd(createRocketMeekachu)
            const teamRocket = gameController.gameState.teams['Rocket']
            expect(teamRocket.monpokes).to.have.property('length', 1)
        })
    })
    describe('CHOOSE command', () => {
        context('try to pick a valid monpoke', () => {
            const chooseRecord = {
                type: 'CHOOSE',
                data: ['Meekachu']
            }
            const gameController = new GameController()
            gameController.execCmd(createRocketMeekachu)
            const createSprocketRecord = {
                type: 'CREATE',
                data: ['Spocket', 'Beekachu', 3, 1]
            }
            gameController.execCmd(createSprocketRecord)
            expect(gameController.gameState.combatStarted).to.equal(false)
            gameController.execCmd(chooseRecord)
            expect(gameController.gameState.teams['Rocket'].inRing).to.equal('Meekachu')

            expect(gameController.gameState.combatStarted).to.equal(true)

            const chooseBeekachuRecord = {
                type: 'CHOOSE',
                data: ['Beekachu']
            }
            gameController.execCmd(chooseBeekachuRecord)
            expect(gameController.gameState.combatStarted).to.equal(true)
        })
        context('invalid choose', () => {
            specify('when mon belongs to other team', () => {
                const gameController = new GameController()
                gameController.execCmd(createRocketMeekachu)
                gameController.execCmd(createSocketFlonyx)
                const invalidChoose = {
                    type: 'CHOOSE', data: ['Flonyx']
                }
                expect(() => {
                    gameController.execCmd(invalidChoose)
                }).to.throw('You may not choose the other team\'s Monpoke')
            })
            specify('when mon is defeated', () => {
                const gameController = new GameController()
                gameController.execCmd(createRocketMeekachu)
                gameController.execCmd(createSocketFlonyx)
                const mon = gameController.gameState.currentTeam.monpokes[0]
                mon.hp = -1
                expect(() => {
                    gameController.execCmd({type: 'CHOOSE', data: ['Meekachu']})
                }).to.throw('You may not choose a defeated Mon')

            })
            specify('when there is only one team', () => {
                const gameController = new GameController()
                gameController.execCmd(createRocketMeekachu)
                expect(() => {
                    gameController.execCmd({type: 'CHOOSE', data: ['Meekachu']})
                }).to.throw('You may not choose a Mon until another team arrives')
            })
        })
    })
    describe('ATTACK command', () => {
        it('issues an attack for the current team of the turn', () => {
            const gameController = new GameController()
            gameController.execCmd(createRocketMeekachu)
            gameController.execCmd(createRocketClefengly)
            gameController.execCmd(createSocketFlonyx)
            gameController.execCmd({
                type: 'CHOOSE',
                data: [createRocketMeekachu.data[1]]
            })
            gameController.execCmd({
                type: 'CHOOSE',
                data: [createSocketFlonyx.data[1]]
            })
            gameController.execCmd({type: 'ATTACK'})
            const state = gameController.gameState
            expect(state.currentTeamId).to.equal(2)
            gameController.execCmd({type: 'ATTACK'})
            expect(state.currentTeamId).to.equal(1)
            const allMon = state.allMon()
            const meekachu = allMon.find(m => m.name === 'Meekachu')
            const socketMon = allMon.find(m => m.name === 'Flonyx')
            expect(meekachu.hp).to.equal(1)
            expect(socketMon.hp).to.equal(createSocketFlonyx.data[2] - meekachu.attack)
        })
        context('invalid attack cmd', () => {
            specify('when current mon is defeated', () => {
                const gameController = new GameController()
                gameController.execCmd(createRocketMeekachu)
                gameController.gameState.currentTeam.inRing = 'Meekachu'
                gameController.gameState.currentTeam.currentMon.hp = -3
                expect(() => {
                    gameController.execCmd({type: 'ATTACK'})

                }).to.throw('You may not attack with a defeated Mon')
            })
            specify('when no mon is chosen', () => {
                const gameController = new GameController()
                gameController.execCmd(createRocketMeekachu)
                expect(() => {
                    gameController.execCmd({type: 'ATTACK'})
                }).to.throw('You must choose a Mon before trying to attack')
            })
        })
    })
    describe('game ends', () => {
        specify('when one team is defeated', () => {
            const gameController = new GameController()
            gameController.execCmd(createRocketMeekachu)
            gameController.execCmd(createSocketFlonyx)
            gameController.execCmd({type: 'CHOOSE', data: ['Meekachu']})
            gameController.execCmd({type: 'CHOOSE', data: ['Flonyx']})
            gameController.execCmd({type: 'ATTACK'})
            gameController.execCmd({type: 'ATTACK'})
            gameController.execCmd({type: 'ATTACK'})
            gameController.execCmd({type: 'ATTACK'})
            expect(gameController.gameState).to.have.property('gameOver', true)
        })
    })
    describe('parse', () => {
        specify('handles create', () => {
            const gameController = new GameController()
            const create = "CREATE Rocket Meekachu 3 1"
            const cmd = gameController.parse(create)
            expect(cmd).to.have.property('type', 'CREATE')
            expect(cmd.data).to.have.members(['Rocket', 'Meekachu', 3, 1])
        })
        specify('handles choose', () => {
            const gameController = new GameController()
            const choose = "ICHOOSEYOU Meekachu"
            const cmd = gameController.parse(choose)
            expect(cmd).to.have.property('type', 'CHOOSE')
            expect(cmd.data).to.have.members(['Meekachu'])
        })
        specify('handles attack', () => {
            const gameController = new GameController()
            const attack = "ATTACK"
            const cmd = gameController.parse(attack)
            expect(cmd).to.have.property('type', 'ATTACK')
        })

    })
})

