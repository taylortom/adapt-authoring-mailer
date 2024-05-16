/**
 * An abstract class which encompasses functions related to a single mail transport type
 * @memberof mailer
 */
class AbstractMailTransport {
  name;
  
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
