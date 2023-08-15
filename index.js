const express = require('express')

const app = express()
const cors = require('cors')
// 引入加密密码的依赖
const md5 = require('md5')
// 引入生成token串的依赖
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://amy:348357jt@sneat.x1njkcn.mongodb.net/?retryWrites=true&w=majority')

mongoose.connection.on('open', () => {
    console.log('mongod started');
})

const registerSchema = new mongoose.Schema({
    fullname: String,
    password: String
})

const registerModel = mongoose.model('register', registerSchema)

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// 自定义的私钥
const secret ='gdfhfgjhgjghv'
// 加密中间件
const encryption = (req, res, next) => {
    const password = req.body.password
    req.body.password = md5(password + md5(password).slice(4, 14))
    next()
}
// 注册api
app.post('/api/v1/register', encryption, (req, res) => {
    console.log(req.body);
    registerModel.create(req.body).then((data) => {
        res.send({
            code: 1,
            message: '注册成功',
            data: data
        })
    }).catch((err) => {
        res.send({
            code: 0,
            message: '注册失败',
            data: err
        })
    })
})

// // 登录api
app.post('/api/v1/login', encryption, (req, res) => {
    console.log(req.body);
    registerModel.findOne(req.body).then((data) => {
        if (data) {
            res.send({
                code: 1,
                message: '登录成功',
                // 生成token返回   jsonwebtoken.sign(参数，加密串)
                token:jwt.sign({uid:data._id,exp:Math.ceil(Date.now()/1000 +7200)},secret)
            })
        }else{
             res.send({
                code: 0,
                message: '登录失败'
            })
        }

    }).catch((err) => {
        res.send({
            code: 0,
            message: '注册失败',
            data: err
        })
    })
})
app.listen(8080, () => {
    console.log('serve running');
})