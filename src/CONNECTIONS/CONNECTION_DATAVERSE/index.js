/* eslint-disable quotes */
// const { assert, getNow } = require('openbox-node-utils')
const Connection = require('../Connection')
const makeRequest = require('./makeRequest')

const NAME = 'Dataverse'
const COLOR = '#0078d4'

const CONFIG_PER_APPLICATION_BLOCK = [
  {
    key: 'CONNECTION_DATAVERSE--key',
    type: 'string',
    name: `${NAME} field name`,
    defaultValue: '',
    color: COLOR,
    inABox: true
  }
]

module.exports = new Connection({
  id: 'CONNECTION_DATAVERSE',
  name: NAME,
  shortName: NAME.substring(0, 1),
  color: COLOR,
  logo: cdn => `${cdn}/connections/CONNECTION_DATAVERSE.svg`,
  configNames: [
    'Instance URL',
    'Token URL',
    'Client ID',
    'Client secret',
    'Version (x.x)'
  ],
  configDefaults: [
    'https://---.api.crm11.dynamics.com',
    'https://login.microsoftonline.com/---/oauth2/token',
    '',
    '',
    '9.2'
  ],
  instructionsDone: 'Form submissions will now go into Microsoft Dataverse. Update each "Form → Text box" flow step with a map to the right Microsoft Dataverse field name.',
  configPerApplicationBlock: {
    '0e1f0565-5e05-471c-b855-bbe44c20527d': CONFIG_PER_APPLICATION_BLOCK,
    'c3b92e16-a631-48da-901b-e578cccfda7e': CONFIG_PER_APPLICATION_BLOCK,
    'd6765aa6-973a-4ed8-b307-d0bf0de989c0': CONFIG_PER_APPLICATION_BLOCK
  },
  eventHooks: {
    'LD_V2': async (config, user, application, customData) => {
      const body = {}
      application.events.on_load.map(ab => {
        const key = ab.config['CONNECTION_DATAVERSE--key']
        if (key) {
          body[key] = customData[ab.config.label]
        }
      })
      return makeRequest(config, 'post', 'leads', body)
    }
  }
})
