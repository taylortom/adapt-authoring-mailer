import { App } from 'adapt-authoring-core'
import AbstractMailTransport from '../AbstractMailTransport.js'
import fs from 'fs/promises'
/**
 * Local filesystem shim mail transport, will store mail data locally
 * @memberof mailer
 * @extends {AbstractMailTransport}
 */
class FilesystemTransport extends AbstractMailTransport {
  name = 'filesystem'
  
  /** @override */
  async send (data) {
    return fs.writeFile(path.join(App.instance.getConfig('tempDir'), 'mailer', `${Date.now()}.txt`), JSON.stringify(data, null, 2))
  }
}

export default FilesystemTransport
