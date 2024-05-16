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
    await nodemailer.createTransport(this.connectionUrl).verify()
  }
}

export default SmtpTransport
