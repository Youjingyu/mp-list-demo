/* global wx */

const noop = () => {}
const defaultOptions = {
  wx: null,
  height: 667,
  name: 'recycling-list',
  onUpdate: noop
}

class RecyclingList {
  constructor (options) {
    try {
      defaultOptions.height = options.wx.getSystemInfoSync().windowHeight
    } catch (err) {
      console.error('recycling-list get windowHeight error: ' + err.message)
    }
    defaultOptions.wx = wx
    this.options = Object.assign(defaultOptions, options)
    this.list = []
    this.renderList = []
    this.scrollTop = this.options.height
    this.throttleTimer = null
    this.appendFlag = false
  }
  append (list) {
    const len = this.list.length
    const formatList = list.map((item, i) => {
      return {
        data: item,
        id: this.options.name + '-' + (i + len)
        // height: undefined
      }
    })
    this.list = this.list.concat(formatList)
    this.renderList = this.renderList.concat(formatList)
    this.appendFlag = true
    this.throttleTimer = setTimeout(() => {
      this.options.onUpdate(this.renderList)
    }, 100)
  }
  scroll (e) {
    const scrollTop = e.detail.scrollTop + this.options.height
    // 滚动超过一屏
    if (Math.abs(scrollTop - this.scrollTop) > this.options.height) {
      clearTimeout(this.throttleTimer)
      this.throttleTimer = setTimeout(() => {
        console.log('distance: ' + (scrollTop - this.scrollTop))
        this.scrollTop = scrollTop
        this.update()
      }, 100)
    }
  }
  update () {
    let itemPosition = 0
    // 渲染当前页与前后2页
    const renderRange = this.options.height * 4
    const tasks = []

    this.list.forEach((item, i) => {
      const task = new Promise((resolve) => {
        if (item.height !== undefined && item.height !== null) {
          itemPosition += item.height
          const distance = Math.abs(this.scrollTop - itemPosition)
          const data = distance < renderRange ? item.data : 0
          resolve({
            data,
            // id,
            height: item.height + 'px'
          })
        } else {
          const id = this.options.name + '-' + i
          this.options.wx.createSelectorQuery().select('#' + id).fields({ size: true }, (res) => {
            let height = res && res.height
            if (height) {
              itemPosition += height
              item.height = height
            }
            // const distance = Math.abs(this.scrollTop - itemPosition)
            // const data = distance < renderRange ? item.data : 0
            resolve({
              data: item.data,
              id,
              height: height ? height + 'px' : undefined
            })
          }).exec()
        }
      })
      tasks.push(task)
    })
    Promise.all(tasks).then((renderList) => {
      this.renderList = renderList
      renderList[0].id = this.options.name + '-' + 0
      this.options.onUpdate(renderList)
    })
  }
}

export default RecyclingList
