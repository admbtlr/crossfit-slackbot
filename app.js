// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt")
// Require the Node Slack SDK package (github.com/slackapi/node-slack-sdk)
const { WebClient, LogLevel } = require("@slack/web-api")

// WebClient insantiates a client that can call API methods
// When using Bolt, you can use either `app.client` or the `client` passed to listeners.
const client = new WebClient(process.env.OAUTH_TOKEN, {
  // LogLevel can be imported and used to make debugging simpler
  logLevel: LogLevel.DEBUG
})

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
})

const exercises = [
  {
    name: 'pushups',
    min: 5,
    max: 20,
    unit: ''
  },
  {
    name: 'situps',
    min: 10,
    max: 30,
    unit: ''
  },
  {
    name: 'squats',
    min: 10,
    max: 30,
    unit: ''
  },
  {
    name: 'wall sit',
    min: 10,
    max: 30,
    unit: 'seconds'
  },  
  {
    name: 'plank',
    min: 20,
    max: 60,
    unit: 'seconds'
  },  
  {
    name: 'glute bridges',
    min: 10,
    max: 30,
    unit: ''
  },  
  {
    name: 'walkouts',
    min: 5,
    max: 10,
    unit: ''
  },  
]

const channel = 'C02L7KPT7T6'
const botId = 'U01JMTJ7THU'

const runBot = async () => {
  // Start your app
  await app.start(process.env.PORT || 3000)

  console.log('crossfit bot is running!')
  
  const ch = await client.conversations.members({ channel })
  let present = []
  let user
  for (user of ch.members) {
    const details = await client.users.info({ user })
    const presence = await client.users.getPresence({ user })
    if (presence.presence === 'active' && details.user.id !== botId) {
      present.push({
        id: details.user.id,
        name: details.user.profile.display_name,
        isActive: presence.presence == 'active' 
      })      
    }
  }
  
  console.log(JSON.stringify(present))

  const getVictims = (users) => {
    const num = user.length > 3 ?
      Math.round(users.length / 3) :
      1
    let indexes = []
    for (let i = 0; i < num; i++) {
      let gotOne = false
      while (!gotOne) {
        const index = Math.floor(Math.random() * users.length)
        if (!indexes.find(ind => ind === index)) {
          indexes.push(index)
          gotOne = true
        }
      }
    }
    return indexes.map(i => users[i])
  }
  
  if (present.length > 0) {
    let victims = getVictims(present)
    
    const exercise = exercises[Math.floor(Math.random() * exercises.length)]
    const reps = Math.floor(Math.random() * (exercise.max - exercise.min)) + exercise.min
    const victimList = victims.map(v => `<@${v.id}>`).join(', ')
    const text = `${reps}${(exercise.unit && ' ' + exercise.unit)} ${exercise.name} _now_ ${victimList}!`
    await client.chat.postMessage({ channel, text })
    console.log(text)    
  }

  console.log('Done')
  return
}

runBot()
  .then(_ => process.exit(0))
  .catch(_ => process.exit(1))
