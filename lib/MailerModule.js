import { AbstractModule } from 'adapt-authoring-core';
import nodemailer from 'nodemailer';
/**
 * Mailer Module
 * @extends {AbstractModule}
 */
class MailerModule extends AbstractModule {
  /** @override */
  async init() {
    /**
     * The Nodemailer SMTP transport instance
     * @type {Nodemailer~Transport}
     */
    this.transporter = null;
    await this.readConfig();
    if (this.isEnabled && this.validateConfig()) {
      this.transporter = this.createTransporter();
      await this.testConnection();
    }
    const [auth, server] = await this.app.waitForModule('auth', 'server');
    const router = server.api.createChildRouter('mailer');
    router.addRoute({ route: '/test', internal: true, handlers: { post: this.testEmailHandler.bind(this) } });
    auth.unsecureRoute(`${router.path}/test`, 'post');
  }
  /**
   * Read config and create corresponding members
   * @return {Promise}
   */
  async readConfig() {
    /**
     * Reference to the isEnabled config value
     * @type {Boolean}
     */
    this.isEnabled = this.getConfig('isEnabled');
    /**
     * Reference to the connectionUrl config value
     * @type {String}
     */
    this.connectionUrl = this.getConfig('connectionUrl');
  }
  /**
   * Validate configuration values
   * @return {Boolean}
   */
  validateConfig() {
    const isValid = this.isValidSmtpConnectionUrl(this.connectionUrl);
    if (!isValid) this.log('warn', `validation of SMTP connection URL '${this.connectionUrl}' is invalid`);
    return isValid;
  }
  /**
   * Setup nodemailers transporter
   */
  createTransporter() {
    let transporter = null;
    try {
      transporter = nodemailer.createTransport(this.connectionUrl);
    } catch (e) {
    } finally {
      return transporter;
    }
  }
  /**
   * Checks the provided SMTP settings using nodemailer.verify.
   * @return {Promise}
   */
  async testConnection() {
    try {
      await this.transporter.verify();
      this.log('info', 'SMTP connection verified successfully');
      return true;
    } catch(e) {
      this.log('warn', `SMTP connection test failed, ${e}`);
      return false;
    }
  }
  /**
   * Checks if a target is a valid email address.
   * @param {*} value Value to check
   * @return {Boolean}
   */
  isValidEmail(value) {
    const regEx = /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    return value && value.length>0 && regEx.test(value.toLowerCase());
  }
  /**
   * Checks if a target is a valid smtp connection url.
   * @param {*} value Value to check
   * @return {Boolean}
   */
  isValidSmtpConnectionUrl(value) {
    const regEx = /^smtps?:\/\//;
    return value && value.length>0 && regEx.test(value);
  }
  /**
   * Sends an email
   * @param {object} message The message data
   * @param {object} message.to Comma separated list or an array of recipients email addresses that will appear on the To: field
   * @param {object} message.subject The subject of the email
   * @param {object} message.text The plain text version of the message as an unicode string
   * @param {object} message.html The HTML version of the message as a unicode string
   * @return {Promise}
   */
  async send(message, options = {}) {
    if (!this.isValidEmail(message.to)) {
      throw this.app.errors.INVALID_PARAMS.setData({ params: ['message.to'] });
    }
    if (!this.isEnabled || !this.transporter) {
      if(options.strict) throw this.app.errors.MAIL_NOT_ENABLED;
      else this.log('warn', 'could not send email, SMTP is not enabled');
      return;
    }
    try {
      if(!message.from) message.from = this.getConfig('defaultSenderAddress');
      await this.transporter.sendMail(message);
      this.log('info', `email sent successfully`);
    } catch(e) {
      this.log('error', `failed to send email, ${e.message}`);
      throw this.app.errors.MAIL_SEND_FAILED.setData({ email: message.to });
    }
  }
  /**
   * Sends a test email. Can only be called from localhost
   * @param {external:express~Request} req The client request object
   * @param {external:express~Response} res The server response object
   * @param {Function} next The callback function
   */
  async testEmailHandler(req, res, next) {
    const appUrl = (await this.app.waitForModule('server')).getConfig('url');
    try {
      await this.send({
        to: req.body.email,
        subject: 'Adapt authoring tool: email test',
        text: `Hello world!\n\nThis is a test email from ${appUrl}.\n\nRegards,\nTeam Adapt.`
      }, { strict: true });
      res.status(200).end();
    } catch(e) {
      return next(e);
    }
  }
}

export default MailerModule;