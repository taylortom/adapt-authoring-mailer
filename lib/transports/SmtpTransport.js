import AbstractMailTransport from '../AbstractMailTransport.js'
import nodemailer from 'nodemailer'
/**
 * SMTP mail transport
 * @memberof mailer
 * @extends {AbstractMailTransport}
 */
class SmtpTransport extends AbstractMailTransport {
  name = 'smtp'

  /** @override */
  async send (data) {
    return nodemailer.createTransport(this.connectionUrl).sendMail(data)
  }

  /** @override */
  async test () {
    try {
      await nodemailer.createTransport(this.connectionUrl).verify()
      this.log('info', 'SMTP connection verified successfully')
    } catch (e) {
      this.log('warn', `SMTP connection test failed, ${e}`)
    }
  }
}

export default SmtpTransport
