// express 모듈 셋팅
const express = require('express')
const router = express.Router();

router.use(express.json()) 
//app.js에서 app을 다 가져갔으므로 app -> router로 대체!
// use: http 외 모듈 'json'. body에서 꺼내서 json처럼 쓸거야!(미들웨어 설정)

let db = new Map()
var id = 1 // 하나의 객체를 유니크하게 구별하기 위함(기본키 역할)

// 로그인
router.post('/login', (req, res) => {
    console.log(req.body); // userId, pwd

    const { userId, password } = req.body;

    // Map을 배열로 변환하고, find로 userId를 가진 사용자를 찾음
    const loginUser = Array.from(db.values()).find(user => user.userId === userId);

    if (loginUser) {  // userId가 존재하는 경우
        if (loginUser.password === password) {
            res.status(200).json({ message: `${loginUser.name}님 로그인이 되었습니다!` });
        } else {
            res.status(401).json({ message: "비밀번호가 틀렸습니다." });
        }
    } else {  // userId가 존재하지 않는 경우
        res.status(404).json({ message: "존재하지 않는 ID입니다." });
    }
});


// 회원가입
router.post('/join', (req, res) => {
    console.log(req.body)

    const isEmpty = !Object.keys(req.body).length; // 빈 객체 여부 확인

    if (!isEmpty) { // 비어 있지 않으면 회원가입
        const {userId} = req.body
        db.set(userId, req.body)

        res.status(201).json({
            message : `${db.get(userId).name}님 회원 가입을 축하드립니다!`
        })
    } else {
        res.status(400).json({
            message : `죄송하지만, 입력 값을 다시 확인해주세요!`
        })
    }
})

router.route('/users')
    .get((req, res) => {
        let {userId} = req.body //비구조화
    
        const user = db.get(userId) //db에서 객체 꺼내기
        if (user) {
            res.status(200).json({
                userId : user.userId,
                name : user.name
            })
        } else {
            res.status(404).json({
                message : "죄송합니다. 찾으시는 회원 정보가 없습니다."
    
            })
        }
    })
    .delete((req, res) => {
        let {userId} = req.body //비구조화
        console.log(`요청받은 ID: ${userId}`)
    
        const user = db.get(userId) //db에서 객체 꺼내기
        if (user) {
            console.log(`ID: ${userId} 유저 삭제 중`)
            db.delete(id)
            res.status(200).json({
                message : `${user.name}님 아쉽지만, 다음에 또 뵙겠습니다!`
            })
        } else {
            console.log(`ID: ${userId} 유저를 찾지 못함`)
            res.status(404).json({
                message : "죄송합니다. 찾으시는 회원 정보가 없습니다."
    
            })
        }
    });

module.exports = router; //모듈화