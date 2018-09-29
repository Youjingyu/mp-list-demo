/* global wx */
/**
 * @author whale
 * @fileOverview 小程序长列表优化
 * @date 2018-09-28
 */
const noop = () => {}
const defaultOptions = {
  wx: null,
  id: 'recycling-list',
  onUpdate: noop
}

/** Class 长列表优化 */
class RecyclingList {
  /**
   * @param {object} options - 配置
   * @param {object} options.wx - 小程序中的wx对象
   * @param {string} options.id - 列表容器元素
   * @param {function} options.onUpdate - 列表数据更新的回调
   */
  constructor (options) {
    options.wx = options.wx || wx
    this.options = Object.assign(defaultOptions, options)
    // 获取容器高度
    this.options.wx.createSelectorQuery().select('#' + this.options.id).fields({ size: true }, (res) => {
      this.containerHeight = res.height
      // scroll-top包含第一屏的高度
      // 从而简化item位置与scrollTop的对比
      this.scrollTop = res.height
    }).exec()
    this.list = []
    this.renderList = []
    this.throttleTimer = null
  }
  /**
   * 向RecyclingList添加数据
   * @param {array} list - 列表数据
   */
  append (list) {
    const len = this.list.length
    const formatList = list.map((item, i) => {
      return {
        data: item,
        id: this.options.id + '-' + (i + len)
      }
    })
    this.list = this.list.concat(formatList)
    this.renderList = this.renderList.concat(formatList)
    this.throttleTimer = setTimeout(() => {
      this.options.onUpdate(this.renderList)
    }, 100)
  }
  /**
   * 列表滚动时需要调动的函数
   * @param {object} e - 小程序事件对象
   */
  scroll (e) {
    const scrollTop = e.detail.scrollTop + this.containerHeight
    // 滚动超过两屏
    if (Math.abs(scrollTop - this.scrollTop) > this.containerHeight * 2) {
      this.scrollTop = scrollTop
      clearTimeout(this.throttleTimer)
      this.throttleTimer = setTimeout(() => {
        this.scrollTop = scrollTop
        this._update()
      }, 200)
    }
  }
  _update () {
    let itemPosition = 0
    // 渲染当前页与前后4页
    const renderRange = this.containerHeight * 4
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
          let id = this.options.id + '-' + i
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
                height: height + 'px'
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
