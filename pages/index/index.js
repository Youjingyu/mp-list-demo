/* global Page */
import mockData from './mock-data'

Page({
  data: {
    list: []
  },
  onReady () {
    this.loadMore()
  },
  onReachBottom () {
    this.loadMore()
  },
  loadMore () {
    this.setData({
      list: this.data.list.concat(mockData)
    })
  }
})
