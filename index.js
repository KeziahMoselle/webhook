const EventEmitter = require('events')
const https = require('https')

/**
 * Webhook class
 *
 * @class Webhook
 * @extends {EventEmitter}
 */
class Webhook extends EventEmitter {
  /**
   * Initialize the Webhook
   * Set URL
   * Set interval
   * Set firstRequest to true
   * Set oldBody
   * Begin to scrape
   *
   * @param {object} data
   * @memberof Webhook
   */
  observe (url, options) {
    if (!url) throw new Error('Missing first argument : url')
    // TODO type check
    this.url = url
    this.interval = options.interval || 5*60*1000
    this.firstRequest = true
    this.oldBody = ''
    this.scrape()
  }

  /**
   * Fetch the body of a page
   * Executed every this.interval (default: 5min)
   * Call compare() when response end
   *
   * @memberof Webhook
   */
  scrape () {
    setInterval(() => {

      https.get(this.url, (response) => {
        let body = ''

        response.on('data', (chunk) => {
          body += chunk
        })

        response.on('end', () => {
          if (this.firstRequest) {
            this.oldBody = body
            return this.firstRequest = false
          }
          this.compare(body, this.oldBody)
        })
      }).on('error', (error) => {
        throw new Error(error)
      })

    }, this.interval);
  }
  
  /**
   * Return true when the oldBody is equal to the actual body received
   * Emit 'nodiff' when body === oldBody
   * Emit 'diff' when body !== oldBody
   *
   * @param {string} body
   * @param {string} oldBody
   * @returns {boolean}
   * @memberof Webhook
   */
  compare (body, oldBody) {
    if (body === oldBody) {
      this.oldBody = body
      this.emit('nodiff')
      return true
    } else {
      this.oldBody = body
      this.emit('diff')
      return false
    }
  }


  /**
   * POST request to the provided POST url
   * POST only if compare return false
   * POST the data which changed
   * 
   * @memberof Webhook
   */
  post () {
    // TODO
  }
  
}

module.exports = new Webhook()
