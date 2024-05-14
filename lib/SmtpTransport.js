import nodemailer from 'nodemailer'
/**
 * SMTP mail transport
 * @memberof mailer
 * @extends {AbstractMailTransport}
 */
class SmtpTransport {
  /** @override */
  async init () {
    this.transporter = nodemailer.createTransport(this.connectionUrl)
  }

  /** @override */
  async send (data) {
    return this.transporter.sendMail(data)
  }

  /** @override */
  async test () {
    try {
      await this.transporter.verify()
      this.log('info', 'SMTP connection verified successfully')
    } catch (e) {
      this.log('warn', `SMTP connection test failed, ${e}`)
    }
  }
}

export default SmtpTransport