import { AbstractMailTransport } from '../AbstractMailTransport.js'
import { EmailClient, KnownEmailSendStatus } from '@azure/communication-email'
/**
 * Microsoft Azure Mail Transport
 * @memberof mailer
 * @extends {AbstractMailTransport}
 */
class AzureTransport extends AbstractMailTransport {
  /** @override */
  async init () {
    this.name = 'azure'
    this.client = new EmailClient(this.connectionUrl)
  }

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
    const poller = await this.client.beginSend(message)

    if (!poller.getOperationState().isStarted) {
      throw new Error('Poller was not started.')
    }
    let timeElapsed = 0
    while (!poller.isDone()) {
      poller.poll()

      await new Promise(resolve => setTimeout(resolve, 1000))
      timeElapsed += 10

      if (timeElapsed > 18) {
        throw new Error('Polling timed out.')
      }
    }
    if (poller.getResult().status !== KnownEmailSendStatus.Succeeded) {
      throw poller.getResult().error
    }
  }

  /** @override */
  async test () {
    this.log('info', 'SMTP connection verification skipped')
  }
}

export default AzureTransport
