/* global wx */

const defaultOptions = {
  wx: wx,
  height: 667,
  name: 'recycling-list'
}
try {
  defaultOptions.height = this.wx.getSystemInfoSync().windowHeight
} catch (err) {
  console.error('recycling-list get windowHeight error: ' + err.message)
}

class RecyclingList {
  constructor (options) {
    this.options = Object.assign(defaultOptions, options)
    this.list = []
  }
  update (list) {
    this.list = this.list.concat()
  }
}

export default RecyclingList
