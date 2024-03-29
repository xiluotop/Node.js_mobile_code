const path = require('path');
// 引入 SDK
const QcloudSms = require("qcloudsms_js");
// 相关配置信息
// 短信应用 SDK AppID
var appid = 140000000; // SDK AppID 以1400开头
// 短信应用 SDK AppKey
var appkey = "";
// 需要发送短信的手机号码
var phoneNumbers = ['', ''];
// 短信模板 ID，需要在短信控制台中申请
var templateId = 7839; // NOTE: 这里的模板ID`7839`只是示例，真实的模板 ID 需要在短信控制台中申请
// 签名
var smsSign = ""; // NOTE: 签名参数使用的是`签名内容`，而不是`签名ID`。这里的签名"腾讯云"只是示例，真实的签名需要在短信控制台申请
// 实例化 QcloudSms
var qcloudsms = QcloudSms(appid, appkey);

var ssender = qcloudsms.SmsSingleSender();

// 佳音提示：{1}为您的操作验证码，请于{2}分钟内填写。如非本人操作，请忽略本短信。
var params = ['666999', '5'];

// 发送短信
/* ssender.sendWithParam("86", phoneNumbers[1], templateId,
    params, smsSign, "", "", (err, res, resData) => {
        if (err) {
            console.log('错误：' + err);
        } else {
            // console.log("request data: ", res.req);
            // console.log("response data: ", resData);
        }
    }); */

// 引入 express 模块
const express = require('express');
// 进入 body-parser 处理 post 请求
const bp = require('body-parser');

// 创建路由管理实例
let router = express.Router();

// 设置 post 参数处理
router.use(bp.urlencoded({
  extended: false
}));

router.get('/getcode', (req, res) => {
  if (!req.session.iscurrent) {
    res.send('非法请求！！');
    return;
  }
  let data = req.query;
  // 手机号合法
  if (/^1(3|4|5|6|7|8|9)\d{9}$/.test(data.phonenumber)) {
    // 随机生成一个验证码
    let code = getRandomCode() + '';
    // 请求平台发送短信
    ssender.sendWithParam("86", [data.phonenumber], templateId,
      [code, 3], smsSign, "", "", (err, resInfo, resData) => {
        if (err) {
          // console.log('错误：' + err);
          res.send({
            code: 404,
            msg: '服务器出错，请稍后再试！'
          });
        } else {
          // console.log("request data: ", res.req);
          // console.log("response data: ", resData);
          if (resData.result) {
            // result 有值说明失败，详细见官网文档
            res.send({
              code: 404,
              msg: resData.errmsg,
            });
          } else {
            // 成功，保存当前session请求将要进行验证的信息
            req.session.phone = {
              // 设置当前要验证的号码
              number: data.phonenumber,
              // 设置当前匹配的验证码
              code: code,
            }

            // 重置真实属性，防止多次调用，必须滑动验证一次才能发送手机号
            req.session.iscurrent = false;

            res.send({
              code: 200
            });
          }
        }
      });
  } else {
    res.send({
      code: 404,
      msg: '手机号不合法，请检查后重新输入！'
    });
  }
})

router.post('/getaccess', (req, res) => {
  // 进行短信验证码验证
  let data = req.body;

  if (data && data.phone && data.code && req.session.phone && data.phone === req.session.phone.number && data.code === req.session.phone.code) {
    res.setHeader('content-type', 'application/javascript');
    res.send('alert("短信验证成功！！！")');
  } else {
    res.setHeader('content-type', 'application/javascript');
    res.send('alert("短信验证失败，请重新再试！！！")');
  }
})

// 封装自定义随机函数
Math.randomEx = function (lowerNum, upperNum) {
  let choice = upperNum - lowerNum + 1;
  return Math.floor(Math.random() * choice + lowerNum);
}

function getRandomCode() {
  return Math.randomEx(100000, 999999);
}

module.exports = router;