// express 모듈 셋팅
const express = require('express')
const app = express()
app.listen(7777)
app.use(express.json()) 
// http 외 모듈 'json'. body에서 꺼내서 json처럼 쓸거야!(미들웨어 설정)

let db = new Map()
var id = 1 // 하나의 객체를 유니크하게 구별하기 위함(기본키 역할)

// 로그인 부분 백업
app.post('/login', (req, res) => {
    console.log(req.body) //userId, pwd
    
    // userId가 db에 저장된 회원인지 확인해야 함!
    const {userId, password} = req.body
    var hasUserId = false
    var loginUser = {}

    db.forEach( (user, id) => {
        // a : value, b : key, c : Map
        if (user.userId === userId) {
            loginUser = user
        }
    })

    // userId 값을 못찾았을 때
    if (isExist(loginUser)) {
        console.log("같은 id 값을 찾음!")

        // pwd도 맞는지 비교
        if (loginUser.password === password) {
            console.log("비밀번호도 같은 값을 찾음!")
        } else {
            console.log("비밀번호 값이 틀렸음!")
        }
    } else {
        console.log("죄송합니다. 입력하신 id는 없는 id입니다.")
    }
})

function isExist(obj) {
    if (Object.keys(obj).length) {
        return true
    } else {
        return false
    }
}

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

app.route('/users/:id')
    .get((req, res) => {
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
    .delete((req, res) => {
        let {id} = req.params //비구조화
        id = parseInt(id)

        console.log(`요청받은 ID: ${id}`)
    
        const user = db.get(id) //db에서 객체 꺼내기
        if (user == undefined) {
            console.log(`ID: ${id} 유저를 찾지 못함`)
            res.status(404).json({
                message : "죄송합니다. 찾으시는 회원 정보가 없습니다."
    
            })
        } else {
            console.log(`ID: ${id} 유저 삭제 중`)
            db.delete(id)
            res.status(200).json({
                message : `${user.name}님 아쉽지만, 다음에 또 뵙겠습니다!`
            })
        }
    });
