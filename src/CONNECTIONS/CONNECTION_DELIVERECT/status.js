const { assert, getNow, isUuid } = require('openbox-node-utils')
const { Payment } = require('openbox-entities')

module.exports = {
  name: 'Status',
  logic: async ({ connectionContainer, config, body }) => {
    const {
      rdic,
      user,
      createEvent
    } = connectionContainer

    const { channelLink, status, reason, channelOrderId } = body
    let [, configuredChannelLinkId] = config
    const realReason = reason || 'Deliverect didn\'t provide a reason'
    const borkedStatusRs = p => {
      p.sessionPaidAt = undefined
      p.sessionFailedAt = getNow()
      p.paymentGatewayExtra = realReason
      p.onUpdatedAt()

      createEvent({
        type: 'TO_DO',
        userId: user.id,
        paymentId: p.id,
        applicationId: p.applicationId,
        thingId: p.thingId,
        customData: {
          what: `Deliverect said the order failed (${realReason}).`,
          colour: '#ff3838',
          foregroundColor: '#ffffff',
          specialEffect: 'Bounce'
        }
      })
    }
    const statusMap = new Map([
      [110, borkedStatusRs],
      [120, borkedStatusRs]
    ])

    if (!statusMap.has(status)) {
      return {
        'warning': `I don't recognise status ${status}!`
      }
    }

    try {
      assert(channelLink === configuredChannelLinkId, `[status] Channel link IDs do not match (${channelLink} vs configured ${configuredChannelLinkId})`)
      assert(statusMap.has(status), '[status] "status" body key is not valid; are you really Deliverect?')

      const [_coThingId, coPaymentId] = channelOrderId.split('---')
      assert(isUuid(coPaymentId), '[status] coPaymentId is not a uuid!')

      const rawPayment = await rdic.get('datalayerRelational').readOne('payments', { user_id: user.id, id: coPaymentId })
      assert(rawPayment, `[status] payment with coPaymentId "${coPaymentId}" not found!`)
      const payment = new Payment().fromDatalayerRelational(rawPayment)
      statusMap.get(status)(payment)

      await rdic.get('datalayerRelational').updateOne('payments', payment.id, payment.toDatalayerRelational())
    } catch (e) {
      createEvent({
        type: 'CONNECTION_BAD',
        userId: user.id,
        customData: { id: 'CONNECTION_DELIVERECT', message: e.message }
      })
      throw e
    }
    return {}
  }
}
