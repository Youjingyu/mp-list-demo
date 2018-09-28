/* global Page, wx */
import mockData from './mock-data'
import RecyclingList from '../../utils/recycling-list'

Page({
  data: {
    list: [],
    style: ''
  },
  onReady () {
    const that = this
    this.recyclingList = new RecyclingList({
      wx: wx,
      onUpdate (list) {
        console.log(list)
        that.setData({
          list
        })
      }
    })
    this.recyclingList.append(mockData())
  },
  // onReachBottom () {
  //   this.loadMore()
  // },
  // loadMore () {
  //   this.setData({
  //     list: this.data.list.concat(mockData())
  //   })
  // },
  scrolltolower () {
    this.recyclingList.append(mockData())
  },
  scroll (e) {
    this.recyclingList.scroll(e)
  }
})
