// 人机验证码模块
// 引入 express
const express = require('express');
// 引入 post 请求参数处理模块
const bp = require('body-parser');
// 实例化 express 路由对象
let router = express.Router();

// ----------------------------------------------------------------------
// 接入腾讯云 SDK
const tencentcloud = require('tencentcloud-sdk-nodejs');

// 导入对应产品模块的client models。
const CaptchaClient = tencentcloud.captcha.v20190722.Client;
const models = tencentcloud.captcha.v20190722.Models;

const Credential = tencentcloud.common.Credential;
const ClientProfile = tencentcloud.common.ClientProfile;
const HttpProfile = tencentcloud.common.HttpProfile;

// 填写你的秘钥 id 和 秘钥键码
let SecretId = '';
let SecretKey = '';
let cred = new Credential(SecretId, SecretKey);

// 创建请求的实例对象
let httpProfile = new HttpProfile();
// 设置请求接口类型
httpProfile.endpoint = "captcha.tencentcloudapi.com";
// 创建客户端配置实例
let clientProfile = new ClientProfile();
clientProfile.httpProfile = httpProfile;
// 第二个参数为地域参数，不需要的话就不用填写
let client = new CaptchaClient(cred, "", clientProfile);
let cpareq = new models.DescribeCaptchaResultRequest();

// ------------------------接口请求-------------------------------
// 处理 post 请求参数
router.use(bp({
  extended: false
}));

// 设置验证码请求
router.post('/getcap', (req, res) => {
  // 获取 Ip
  // console.log(req.ip);
  let reqParams = req.body;
  /*
  CaptchaType   Integer 验证码类型，9：滑块验证码
  Ticket        String  验证码返回给用户的票据，前端网页用户使用验证码校验后返回的一个值
  UserIp        String  用户操作来源的外网 IP
  Randstr       String  验证票据需要的随机字符串，前端网页用户使用验证码校验后返回的一个值
  CaptchaAppId  Integer 验证码应用ID
  AppSecretKey  String  用于服务器端校验验证码票据的验证密钥，请妥善保密，请勿泄露给第三方
  */
  // 当前 ip 为测试的 ip，本机测试是回传地址，公网测试时会获取真正的外网地址
  let params = `{"CaptchaType":9,"Ticket":"${reqParams.ticket}","UserIp":"${req.ip}","Randstr":"${reqParams.randstr}","CaptchaAppId":2058122041,"AppSecretKey":"0SeBjTJznywRvr_b_ebJNRg**"}`;
  cpareq.from_json_string(params);

  client.DescribeCaptchaResult(cpareq, function (errMsg, response) {

    if (errMsg) {
      // console.log('错误。。。')
      // console.log(errMsg);
      req.session.iscurrent = false;
      res.setHeader('content-type', 'application/javascript');
      res.send('alert("获取验证失败，请重试！")');
      return;
    }

    if (response.CaptchaCode === 1) {
      req.session.iscurrent = true;
      res.send({
        // 验证成功状态码
        state: 200
      });
    } else {
      res.send({
        // 验证失败状态码
        state: 404
      });
    }
    // console.log(response.to_json_string());
  });
})

module.exports = router;