const logIn = require('../logIn/logIn')
const getBooking = require('./getBooking')
const getConfiguration = require('../getConfiguration')

it('logs in with valid configuration', async () => {
  const sessionId = await logIn(getConfiguration())
  const r = await getBooking(sessionId, 'BK005801')
  expect(r).toMatchObject([
    {
      id: 'BK005801',
      roomId: 'TEST_101',
      payment: {
        total: 66600
      },
      dates: {
        start: 1691794800,
        end: 1691967600
      },
      userPrimary: {
        id: 'PF007421',
        name: 'Mr Jack Smith',
        isAdult: true,
        genderString: 'male'
      },
      users: [
        {
          id: 'PF007421',
          idInThisBooking: '1',
          name: 'Mr Jack Smith',
          isAdult: true,
          genderString: 'male'
        },
        {
          idInThisBooking: '2',
          name: 'Mrs Jackie Smith',
          isAdult: true,
          genderString: 'unknown'
        }
      ]
    }
  ])
})
