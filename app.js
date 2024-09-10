const express = require('express')
const app = express()

app.listen(7777)

const userRouter = require('./routes/users'); // user-demo 소환
const channelRouter = require('./routes/channels'); // channel-demo 소환

app.use("/", userRouter)
app.use("/channels", channelRouter) // "/"로 둬도 되지만 중복된 건 적어두는 게 좋음

module.exports = app;