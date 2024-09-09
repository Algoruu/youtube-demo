// express 모듈 셋팅
const express = require('express')
const app = express()
app.listen(7777)
app.use(express.json()) 
// http 외 모듈 'json'. body에서 꺼내서 json처럼 쓸거야!(미들웨어 설정)

let db = new Map()
var id = 1 // 하나의 객체를 유니크하게 구별하기 위함(기본키 역할)

// 로그인
app.post('/login', (req, res) => {

})

// 회원가입
app.post('/join', (req, res) => {
    console.log(req.body)

    const isEmpty = !Object.keys(req.body).length; // 빈 객체 여부 확인

    if (!isEmpty) { // 비어 있지 않으면 회원가입
        db.set(id++, req.body)

        res.status(201).json({
            message : `${db.get(id-1).name}님 회원 가입을 축하드립니다!`
        })
    } else {
        res.status(400).json({
            message : `죄송하지만, 입력 값을 다시 확인해주세요!`
        })
    }
})

// app.route('/users/:id')
//     .get()
//     .delete()


// 회원 개별 조회
app.get('/users/:id', (req, res) => {
    let {id} = req.params //비구조화
    id = parseInt(id)

    const user = db.get(id) //db에서 객체 꺼내기
    if (user == undefined) {
        res.status(404).json({
            message : "죄송합니다. 찾으시는 회원 정보가 없습니다."

        })
    } else {
        res.status(200).json({
            userId : user.userId,
            name : user.name
        })
    }
})

// 회원 개별 탈퇴
app.delete('/users/:id', (req, res) => {
    let {id} = req.params //비구조화
    id = parseInt(id)

    const user = db.get(id) //db에서 객체 꺼내기
    if (user == undefined) {
        res.status(404).json({
            message : "죄송합니다. 찾으시는 회원 정보가 없습니다."

        })
    } else {
        db.delete(id)

        res.status(200).json({
            message : `${user.name}님 아쉽지만, 다음에 또 뵙겠습니다!`
        })
    }
})

