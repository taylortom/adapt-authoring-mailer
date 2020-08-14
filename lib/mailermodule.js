const { AbstractModule } = require('adapt-authoring-core');
const MailerUtils = require('./mailerUtils');
const nodemailer = require('nodemailer');
/**
 * Mailer Module
 * @extends {AbstractModule}
 */
class MailerModule extends AbstractModule {
    /** @override */
    constructor(app, pkg) {
            super(app, pkg);
            this.init();
        }
        /**
         * Initialises the utility
         * @return {Promise}
         */
    async init() {
        this.isConfigValid = false;
        this.isConnectionVerified = false;

        await this.readConfig();

        if (this.enable) this.createTransporter();
        this.setReady();

        this.emit('ready', this);
        this.constructor.emit('ready', this.name, this);
        this.log('debug', 'mailer', 'ready');

        if (this.enable && this.isConfigValid && this.transporter) {
            this.log('debug', this.app.lang.t("info.smtpOk"));
        } else {
            this.log('debug', this.app.lang.t("info.smtpNotEnabled"));
        }
    }

    /**
     * Read config and create corresponding members
     * @return {Promise}
     */
    async readConfig() {
        await this.app.waitForModule('config');
        this.enable = this.getConfig('enable');
        this.useConnectionUrl = this.getConfig('useConnectionUrl');
        this.host = this.getConfig('host');
        this.port = this.getConfig('port');
        this.user = this.getConfig('user');
        this.pass = this.getConfig('pass');
        this.from = this.getConfig('from');
        this.connectionUrl = this.getConfig('connectionUrl');
    }


    /**
     * Validate configuration values
     * @type {Boolean}
     */
    validateConfig() {
        if (this.useConnectionUrl && !MailerUtils.isValidSmtpConnectionUrl(this.connectionUrl)) {
            this.log('error', this.app.lang.t("error.smtpUrlValidationFailed", { url: this.connectionUrl }));
            this.isConfigValid = false;
        } else if (!MailerUtils.isValidPort(this.port) || !MailerUtils.isValidEmail(this.from) || !this.host || !this.user) {
            this.log('error', this.app.lang.t("error.smtpParamsValidationFailed", { url: this.connectionUrl }));
            this.isConfigValid = false;
        } else { this.isConfigValid = true; }

        return this.isConfigValid;
    }

    /**
     * Setup nodemailers transporter
     */
    createTransporter() {
        if (this.validateConfig()) {
            this.useConnectionUrl ?
                this.createTransporterByUrl() :
                this.createTransporterByParams();
        } else {
            this.transporter = null;
        }
    }

    /**
     * Setup nodemailers transporter by url
     */
    createTransporterByUrl() {
        this.transporter = nodemailer.createTransport(this.connectionUrl);
        this.log('info', this.app.lang.t("info.smtpUseConnectUrl", { url: this.connectionUrl }));
    }

    /**
     * Setup nodemailers transporter by params
     */

    createTransporterByParams() {
        this.transporter = nodemailer.createTransport({
            host: this.host,
            port: this.port,
            secure: false,
            auth: {
                user: this.user,
                pass: this.pass
            }
        });
    }

    /**
     * Processes a message, and returns a nicely formatted error
     * @param {String} prefixKey Lang key for the generic return error message
     * @param {Error|String} error The error
     * @return {Error}
     */
    formatError(prefixKey, error = '', statusCode = 500) {
            const e = new Error(`${this.app.lang.t(`error.${prefixKey}`)} ${error.message || error}`);
    e.statusCode = error.statusCode || statusCode;
    return e;
  }

  /**
   * Checks the provided SMTP settings using nodemailer.verify.
   * @return {Promise}
   */
  async testConnection() {
    if (!this.enable || !this.isConfigValid || !this.transporter) {
      this.log('warn', 'Mailer#testConnection()', this.app.lang.t("info.smtpNotEnabled"));
      return;
    }
    await this.transporter.verify().then(() => {
      this.log('info', this.app.lang.t("info.smtpVerified"));
      this.isConnectionVerified = true;
      return true;
    }).catch(() => {
      if (this.useConnectionUrl) {
        this.log('info', this.app.lang.t("info.smtpByUrlVerifyFailed",
          {url: this.connectionUrl}));
      } else {
        this.log('info', this.app.lang.t("info.smtpVerifyFailed",
          {
            host: this.host,
            port: this.port,
            user: this.user,
            pass: this.pass
          }));
      }
      return false
    });
  }

  /**
   * Sends an email
   * @param {object} message Object for an E-mail, which includes to, subject, text and html
   * @return {Promise}
   */
  async send(message) {
    if (!this.isConnectionVerified) {
      // connection not tested before, should we do testConnection() here before sending?
    }
    if (MailerUtils.isValidEmail(message.to)) {
      await this.transporter.sendMail(message).then(info => {
        this.log('info', `${this.app.lang.t('info.sentSuccessfully')} ${info.response}`);
      }).catch((error) => {
        this.log('error', 'error.sendFailed');
        throw new Error(this.formatError('sendFailed', error));
      });
    } else {
      this.log('warn', 'Mailer#send()',
        this.app.lang.t("error.smtpEmailValidationFailed",  {to: message.to}));
    }
  }
}

module.exports = MailerModule;