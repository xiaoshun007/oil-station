## 微信小程序 - 加油站在哪

一个帮你快速找到附近加油站的小程序。

## 功能

- [x] 实时显示附近的加油站
- [x] 点击图标获取加油站信息
- [x] 显示当前所在地与天气状况

## 概览

![](https://raw.githubusercontent.com/royeo/static/master/img/weapp-store.jpeg)

## 小程序码

![](https://raw.githubusercontent.com/royeo/static/master/img/weapp-store-qrcode.jpg)

## 运行

在 [百度地图开放平台](http://lbsyun.baidu.com/index.php?title=wxjsapi) 申请密钥 （ak），将申请到的 ak 替换 `pages/index/index.js` 中的 ak，即可搜索到附近的加油站。

```js
const BMap = new bmap.BMapWX({
  ak: 'xxxxxx'  // 百度地图的 AK
});
```
