const path = require('path');
// 引入 express 模块
const express = require('express');
// 引入 express-session
const es = require('express-session');

let app = express();

// 静态资源托管
app.use(express.static(path.join(__dirname, './public')));
// 设置 session
app.use(es({
    secret: 'mytest'
}))

// ------------------------------手机验证码路由--------------------------------
// 引入路由
let mobileRouter = require(path.join(__dirname, './mobile.js'));
// 使用中间件的方式引入路由
// 请求完整地址：/mobile/getcode
app.use('/mobile', mobileRouter);

// ---------------------------------验证码服务--------------------------------
// 引入路由
let captchaRouter = require(path.join(__dirname, './captcha'));
// 使用路由
// 请求完整地址：/getcpa
app.use(captchaRouter);

// ----------------------------------开启服务器-----------------------------------
app.listen(10001, () => {
    console.log('server start with 10001...');
})