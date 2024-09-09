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
    console.log(req.body); // userId, pwd

    const { userId, password } = req.body;

    // Map을 배열로 변환하고, find로 userId를 가진 사용자를 찾음
    const loginUser = Array.from(db.values()).find(user => user.userId === userId);

    if (loginUser) {  // userId가 존재하는 경우
        console.log("같은 id 값을 찾음!");

        if (loginUser.password === password) {
            console.log("비밀번호도 같은 값을 찾음!");
            res.status(200).json({ message: "로그인 성공" });
        } else {
            console.log("비밀번호 값이 틀렸음!");
            res.status(401).json({ message: "비밀번호가 틀렸습니다." });
        }
    } else {  // userId가 존재하지 않는 경우
        console.log("죄송합니다. 입력하신 id는 없는 id입니다.");
        res.status(404).json({ message: "존재하지 않는 ID입니다." });
    }
});


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
