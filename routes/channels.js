const express = require('express')
const router = express.Router();

router.use(express.json())
//app.js에서 app을 다 가져갔으므로 app -> router로 대체!

let db = new Map()
var id = 1

router
    .route('/') // app.js에서 app.use("/channels", channelRouter)로 빼줬기에 중복제거
    .get((req, res) => {
        var {userId} = req.body
        var channels = [] // {}형태가 아니라 [] list로 바꾸기
        if(db.size && userId) { // 예외 처리 2가지 1) userId가 body에 없을 때
                db.forEach(function(value, key) {
                    if (value.userId === userId) //value의 userId === userId
                        channels.push(value)
                })
                    // 2) userId를 가진 채널이 없을 때
                if (channels.length) {
                    res.status(200).json(channels)
                } else {
                    notFoundChannel()
                }
            } else {
                notFoundChannel()
        }
    }) // 채널 전체 조회
    .post((req, res) => {
        // const {channelTitle} = req.body
        if (req.body.channelTitle) {
            let channel = req.body
            db.set(id++, channel)
            
            res.status(201).json({
                message : `${db.get(id-1).channelTitle}님 채널 생성을 축하드립니다!`
            })
        } else {
            res.status(400).json({
                message : "죄송합니다. 요청 값을 다시 보내주세요."
            })
        }
    })// 채널 개별 생성 = db에 저장

router
    .route('/:id') // app.js에서 app.use("/channels", channelRouter)로 빼줬기에 중복제거
    .get((req, res) => {
        let {id} = req.params
        id = parseInt(id)

        var channel = db.get(id)
        
        if (channel) {
            res.status(200).json(channel)
        } else {
            notFoundChannel()
        }
    }) //채널 개별 조회
    .put((req, res) => {
        let {id} = req.params
        id = parseInt(id)
        
        var channel = db.get(id)
        var oldTitle = channel.channelTitle
        if (channel) {
            var newTitle = req.body.channelTitle

            channel.channelTitle = newTitle
            db.set(id, channel)

            res.status(200).json({
                message : `채널명이 성공적으로 수정되었습니다! 기존 : ${oldTitle} -> 수정 : ${newTitle}`
            })
        } else {
            notFoundChannel()
        }
    }) //채널 개별 수정
    .delete((req, res) => {
        let {id} = req.params
        id = parseInt(id)

        var channel = db.get(id)
        
        if (channel) {
            db.delete(id)

            res.status(200).json({
                message : `${channel.channelTitle} 채널이 정상적으로 삭제되었습니다. 아쉽지만 다음에 뵙겠습니다!`
            })
        } else {
            notFoundChannel()
        }
    }); //채널 개별 삭제

function notFoundChannel() {
    res.status(404).json({
        message : "죄송합니다. 채널 정보를 찾을 수 없습니다."
    })
} 


module.exports = router;

