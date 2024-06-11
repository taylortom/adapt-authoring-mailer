import AbstractMailTransport from '../AbstractMailTransport.js'
import { EmailClient, KnownEmailSendStatus } from '@azure/communication-email'
/**
 * Microsoft Azure Mail Transport
 * @memberof mailer
 * @extends {AbstractMailTransport}
 */
class AzureTransport extends AbstractMailTransport {
  name = 'azure'
  
  /** @override */
  async send (data) {
    const message = {
      senderAddress: data.from,
      content: {
        subject: data.subject,
        plainText: data.text,
        html: data.html
      },
      recipients: {
        to: [{ address: data.to }]
      }
    }
    const client = new EmailClient(this.getConfig('connectionUrl'))
    const poller = await client.beginSend(message)

    if (!poller.getOperationState().isStarted) {
      throw new Error('Poller was not started.')
    }
    let elapsedSecs = 0
    const timeoutSecs = 10
    while (!poller.isDone()) {
      poller.poll()

      await new Promise(resolve => setTimeout(resolve, 1000))
      elapsedSecs++

      if (elapsedSecs >= timeoutSecs) {
        throw new Error('Polling timed out.')
      }
    }
    if (poller.getResult().status !== KnownEmailSendStatus.Succeeded) {
      throw poller.getResult().error
    }
  }
}

export default AzureTransport
