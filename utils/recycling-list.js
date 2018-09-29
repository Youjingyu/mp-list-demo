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
    options.wx = options.wx || wx
    if (!options.height) {
      try {
        defaultOptions.height = options.wx.getSystemInfoSync().windowHeight
      } catch (err) {
        console.error('recycling-list get windowHeight error: ' + err.message)
      }
    }
    this.options = Object.assign(defaultOptions, options)
    this.list = []
    this.renderList = []
    // scroll-top包含第一屏高度
    // 简化item位置与scrollTop的对比
    this.scrollTop = this.options.height
    this.throttleTimer = null
  }
  append (list) {
    const len = this.list.length
    const formatList = list.map((item, i) => {
      return {
        data: item,
        id: this.options.name + '-' + (i + len)
      }
    })
    this.list = this.list.concat(formatList)
    this.renderList = this.renderList.concat(formatList)
    this.throttleTimer = setTimeout(() => {
      this.options.onUpdate(this.renderList)
    }, 100)
  }
  scroll (e) {
    const scrollTop = e.detail.scrollTop + this.options.height
    // 滚动超过两屏
    if (Math.abs(scrollTop - this.scrollTop) > this.options.height * 2) {
      this.scrollTop = scrollTop
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
    // 渲染当前页与前后6页
    const renderRange = this.options.height * 4
    const tasks = []

    this.list.forEach((item, i) => {
      const task = new Promise((resolve) => {
        if (item.height !== undefined && item.height !== null) {
          itemPosition += item.height
          // 判断该item是否超出显示范围
          const distance = Math.abs(this.scrollTop - itemPosition)
          const data = distance < renderRange ? item.data : 0
          resolve({
            data,
            height: item.height + 'px'
          })
        } else {
          let id = this.options.name + '-' + i
          this.options.wx.createSelectorQuery().select('#' + id).fields({ size: true }, (res) => {
            let height = res && res.height
            // 尽可能减少itemData的字段，从而减小setData传输数据的大小
            let itemData = {
              data: item.data,
              id: id // 只有height未知的item才需要id
            }
            if (height) {
              itemPosition += height
              // 保存height
              item.height = height
              const distance = Math.abs(this.scrollTop - itemPosition)
              itemData = {
                data: distance < renderRange ? item.data : 0,
                height: height
              }
            }
            resolve(itemData)
          }).exec()
        }
      })
      tasks.push(task)
    })
    Promise.all(tasks).then((renderList) => {
      this.renderList = renderList
      this.options.onUpdate(renderList)
    })
  }
}

export default RecyclingList
