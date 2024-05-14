/**
 * An abstract class which encompasses functions related to a single mail transport type
 * @memberof mailer
 */
class AbstractMailTransport {
  /**
   * Performs any necessary initialisation steps for this transport
   */
  async init () {}

  /**
   * Sends an email
   * @param {MailData} data
   */
  async send (data) {}

  /**
   * Performs any useful tests to check transport is working correctly
   */
  async test () {}
}

export default AbstractMailTransport
