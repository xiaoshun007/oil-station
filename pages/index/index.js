const bmap = require('../../libs/bmap/bmap-wx.min.js');

const BMap = new bmap.BMapWX({
  ak: 'Dr2W5oGrRmi9b3aGwhcRVCusYMhMUVNi'  // 百度地图的 AK
});

const CONTROLS = {
  LOCATION: 1,
  MARKER: 2
};

const MAP_SCALE = {
  MAX: 18,
  DEFAULT: 16
};

Page({
  data: {
    scale: MAP_SCALE.DEFAULT,
    latitude: 39.908860,
    longitude: 116.397390,
    markers: [],
    weather: {},
    appAuth: false,   // 小程序定位权限
    wxAuth: false,     // 微信定位权限
    isPioAdrPopping: false,     //pio地址是否弹出
    pioAdrAnimPlus: {},         //pio地址动画
    pioIsShow: false,
    addressTitle: '',//poi地址标题
    addressDes: '', //poi地址详细 
    distance: '',  //poi距离: 起点到终点的距离，单位：米，
    duration: '' //poi时间: 表示从起点到终点的结合路况的时间，秒为单位 注：步行方式不计算耗时，该值始终为0 
  },

  /**
   * 页面加载
   */
  onLoad() {
    this.setControls();
  },

  /**
   * 页面显示
   */
  onShow() {
    this.setData({ scale: MAP_SCALE.DEFAULT });
    this.mapCtx = wx.createMapContext('storeMap');
    this.getCurrentLocation();
  },

  /**
   * 设置控件
   */
  setControls() {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          controls: [{
            id: CONTROLS.LOCATION,
            iconPath: '/images/location.png',
            position: {
              left: 30,
              top: res.windowHeight - 120,
              width: 65,
              height: 65
            },
            clickable: true
          }, {
            id: CONTROLS.MARKER,
            iconPath: '/images/marker.png',
            position: {
              left: res.windowWidth / 2 - 11,
              top: res.windowHeight / 2 - 35,
              width: 22,
              height: 34
            },
            clickable: false
          }]
        })
      }
    })
  },

  /**
   * 获取当前位置
   */
  getCurrentLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          appAuth: true,
          wxAuth: true
        });
        this.showWeather();
      },
      fail: (err) => {
        // 小程序获取定位权限失败
        if (this.noAppLocationAuth(err.errMsg)) {
          this.showAppLocationFail();
        }

        // 微信获取定位权限失败
        if (this.noWxLocationAuth(err.errMsg)) {
          this.setData({ appAuth: true });  // 此时小程序定位权限应该已获取
          this.showWxLocationFail();
        }
      }
    });
  },

  /**
   * 小程序没有定位权限
   *
   * @param {string} msg
   * @return {boolean}
   */
  noAppLocationAuth(msg) {
    return msg.includes('fail auth deny');
  },

  /**
   * 微信没有定位权限
   *
   * @param {string} msg
   * @return {boolean}
   */
  noWxLocationAuth(msg) {
    return msg.includes('fail 1');
  },

  /**
   * 获取小程序定位权限失败的弹窗
   */
  showAppLocationFail() {
    wx.showModal({
      title: '定位失败',
      content: '请允许小程序使用定位服务',
      confirmText: '获取',
      success: (res) => {
        if (res.confirm) {
          this.getAppLocationAuth();
        }
      }
    })
  },

  /**
   * 获取小程序定位权限
   */
  getAppLocationAuth() {
    wx.openSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) {
          this.setData({ appAuth: true });
        }
      }
    });
  },

  /**
   * 获取微信定位权限失败的弹窗
   */
  showWxLocationFail() {
    wx.showModal({
      title: '定位失败',
      content: '请到手机系统中打开微信的定位服务',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  /**
   * 显示附近的加油站
   *
   * @param {object} location
   */
  showStores(location) {
    const _this = this;
    // 拼接请求url
    const url = 'https://wedrive.mapbar.com/opentsp/cms/api/gas/searchGasStation';
    // 请求数据
    wx.request({
      url: url,
      data: {
        "lon": `${location.longitude}`,
        "lat": `${location.latitude}`,
        "cata": "json" 
      },
      header: {
        'content-type': 'json' // 默认值
      },
      success: function(res) {
        console.log(res.data);
        // 赋值
        if (res.data.content.length) {
          _this.setMarkers(res.data.content);
        } else {
          _this.showToast('没有搜索到您附近的加油站');
        }
      },
      fail: () => {
        _this.showToast('网络出了点问题，请稍后再试');
      }
    });

    // BMap.search({
    //   query: '加油站',
    //   location: `${location.latitude},${location.longitude}`,
    //   success: (res) => {
    //     if (res.originalData.results.length) {
    //       this.setMarkers(res.originalData.results);
    //     } else {
    //       this.showToast('没有搜索到您附近的加油站');
    //     }
    //   },
    //   fail: () => {
    //     this.showToast('网络出了点问题，请稍后再试');
    //   }
    // });
  },

  /**
   * 显示天气
   */
  showWeather() {
    BMap.weather({
      success: (data) => {
        const weatherData = data.currentWeather[0];
        this.setData({
          weather: {
            currentCity: weatherData.currentCity,
            temperature: weatherData.temperature.replace(/\s/g, ''),
            weatherDesc: weatherData.weatherDesc
          }
        });
      }
    });
  },

  /**
  * 显示没有搜索到加油站的提示
  *
  * @param {string} msg
  */
  showToast(msg) {
    wx.showToast({
      title: msg,
      icon: 'none'
    })
  },

  //显示对话框
  showModal: function(event) {
    console.log(event);
    var i = event.markerId;
    var url = 'https://wedrive.mapbar.com/opentsp/cms/api/gas/searchGasStationById';
    var that = this;
    console.log('====get_detail====')
    wx.request({ 
      url: url,
      data: {
        ids: i,
        cata: "json"
      },
      success: function(res) {
        console.log(res);
        that.setData({
          myall: res.data.data
        });
      }
    });
 
    // 显示遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true
    })
    setTimeout(function() {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200)
  },

  //隐藏对话框
  hideModal: function() {
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function() {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
  },

  /**
   * 设置附近加油站的标记
   *
   * @param {array} stores
   */
  setMarkers(stores) {
    const markers = [];

    for (let i = 0; i < stores.length; i++) {
      stores[i].name = stores[i].name;
      markers.push({
        id: i,
        markerId: stores[i].id,
        latitude: stores[i].lat,
        longitude: stores[i].lon,
        title: stores[i].name,
        iconPath: '/images/oil-station.png',
        width: 50,
        height: 50,
        // 气泡callout
        callout: {
          content: stores[i].name,
          color: '#ffffff',
          fontSize: 14,
          borderRadius: 16,
          bgColor: '#262930',
          padding: 8
        }
      })
    }

    this.setData({
       markers: markers,
       pioIsShow: true
      });
  },

  /**
   * 获取商家的短名称（去掉括号）
   *
   * @param {string} name
   * @return {string}
   */
  getShortStoreName(name) {
    return name.replace(/(\([^)]+\))/, '');
  },

  /**
   * 定位控件点击事件
   *
   * @param {any} e
   */
  controltap(e) {
    if (e.controlId === CONTROLS.LOCATION) {
      if (!this.data.appAuth) {
        return this.showAppLocationFail();
      }

      if (!this.data.wxAuth) {
        return this.showWxLocationFail();
      }

      this.mapCtx.moveToLocation();
    }
  },

  /**
   * 地图视野变化事件
   *
   * @param {any} e
   */
  regionchange(e) {
    if (e.type === 'end' && this.hasLocationAuth()) {
      this.mapCtx.getCenterLocation({
        success: (res) => {
          this.showStores(res);
        }
      })
    }
  },

  /**
   * 是否拥有微信以及小程序的定位权限
   *
   * @return {boolean}
   */
  hasLocationAuth() {
    return this.data.appAuth && this.data.wxAuth;
  }
})
