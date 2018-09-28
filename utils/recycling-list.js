const noop = () => {}
const defaultOptions = {
  wx: null,
  height: 667,
  name: 'recycling-list',
  // countPerPage: 10,
  onUpdate: noop
}

class RecyclingList {
  constructor (options) {
    try {
      defaultOptions.height = options.wx.getSystemInfoSync().windowHeight
    } catch (err) {
      console.error('recycling-list get windowHeight error: ' + err.message)
    }
    this.options = Object.assign(defaultOptions, options)
    this.query = this.options.wx.createSelectorQuery()
    // this.page = 0
    this.list = []
    // this.renderList = []
    this.scrollTop = 0
    // this.startRenderIndex = 0
    // this.endRenderIndex = undefined
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
    // const currentPage = Math.ceil(scrollTop / this.options.height)
    // console.log(currentPage)
    // 页码变化
    console.log('滑动距离：' + (scrollTop - this.scrollTop))
    if (Math.abs(scrollTop - this.scrollTop) > this.options.height) {
      // this.page = currentPage
      setTimeout(() => {
        this.scrollTop = scrollTop
        this.update(scrollTop)
      }, 300)
    }
  }
  update () {
    // 渲染前后5页
    // this.startRenderIndex = (this.page - 2) * this.options.countPerPage
    // this.endRenderIndex = (this.page + 2) * this.options.countPerPage
    // console.log('currentPage: ' + this.page)
    let listHeight = 0
    const renderRange = this.options.height * 2
    const tasks = []
    this.list.forEach((item, i) => {
      const distance = Math.abs(this.scrollTop - listHeight)
      console.log('distance: ' + distance)
      const data = distance < renderRange ? item.data : 0
      const id = this.options.name + '-' + i

      const task = new Promise((resolve) => {
        if (item.height !== undefined && item.height !== null) {
          listHeight += item.height
          resolve({
            data,
            id,
            height: item.height + 'px'
          })
        } else {
          console.log('data: ' + data)
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
