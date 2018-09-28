const noop = () => {}
const defaultOptions = {
  wx: null,
  height: 667,
  name: 'recycling-list',
  countPerPage: 10,
  onUpdate: noop
}

class RecyclingList {
  constructor (options) {
    this.options = Object.assign(defaultOptions, options)
    try {
      defaultOptions.height = this.options.wx.getSystemInfoSync().windowHeight
    } catch (err) {
      console.error('recycling-list get windowHeight error: ' + err.message)
    }
    this.query = this.options.wx.createSelectorQuery()
    this.page = 0
    this.list = []
    this.renderList = []
    this.startRenderIndex = 0
    this.endRenderIndex = undefined
  }
  append (list) {
    this.list = this.list.concat(list.map((item) => {
      return {
        data: item,
        height: undefined
      }
    }))
    this.update()
  }
  scroll (e) {
    const { scrollTop } = e.detail
    const currentPage = Math.floor(scrollTop / this.options.height)
    // 页码变化
    if (currentPage !== this.page) {
      this.page = currentPage
      this.update()
    }
  }
  update () {
    // 渲染前后5页
    this.startRenderIndex = (this.page - 2) * this.options.countPerPage
    this.endRenderIndex = (this.page + 2) * this.options.countPerPage
    console.log('currentPage: ' + this.page)
    const tasks = []
    this.list.forEach((item, i) => {
      const data = (i >= this.startRenderIndex && i <= this.endRenderIndex) ? item.data : 0
      const id = this.options.name + '-' + i
      const task = new Promise((resolve) => {
        if (item.height !== undefined && item.height !== null) {
          resolve({
            data,
            id,
            height: item.height + 'px'
          })
        } else {
          this.options.wx.createSelectorQuery().select('#' + id).fields({ size: true }, (res) => {
            item.height = res && res.height
            resolve({
              data,
              id,
              height: item.height ? item.height + 'px' : undefined
            })
          }).exec()
        }
      })
      tasks.push(task)
    })
    Promise.all(tasks).then((renderList) => {
      this.options.onUpdate(renderList)
    })
  }
}

export default RecyclingList
