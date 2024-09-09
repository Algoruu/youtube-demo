const express = require('express')
const app = express()
app.listen(7777)
app.use(express.json()) 

let db = new Map()
var id = 1

app
    .route('/channels')
    .get((req, res) => {
        if(db.size) {
        var channels = [] // {}형태가 아니라 [] list로 바꾸기

        db.forEach(function(value, key) {
            channels.push(value)
        })

        res.status(200).json(channels)
    } else {
        res.status(404).json({
            message : "죄송합니다. 채널 정보를 찾을 수 없습니다."
        })
    }
    }) // 채널 전체 조회
    .post((req, res) => {
        // const {channelTitle} = req.body
        if (req.body.channelTitle) {
        db.set(id++, req.body)

        res.status(201).json({
            message : `${db.get(id-1).channelTitle}님 채널 생성을 축하드립니다!`

        })
    } else {
        res.status(400).json({
            message : "죄송합니다. 요청 값을 다시 보내주세요."

        })
    }
    })// 채널 개별 생성 = db에 저장

app
    .route('/channels/:id')
    .get((req, res) => {
        let {id} = req.params
        id = parseInt(id)

        var channel = db.get(id)
        
        if (channel) {
            res.status(200).json(channel)
        } else {
            res.status(404).json({
                message : "죄송합니다. 채널 정보를 찾을 수 없습니다."
            })
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
            res.status(404).json({
                message : "죄송합니다. 채널 정보를 찾을 수 없습니다."
            })
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
            res.status(404).json({
                message : "죄송합니다. 채널 정보를 찾을 수 없습니다."
            })
        }
    }); //채널 개별 삭제
    

