const express = require('express');
const router = express.Router();
const conn = require('../mariadb'); //mariadb.js의 connection을 불러오기
const { body, param, validationResult } = require('express-validator');

// jwt 모듈
const jwt = require('jsonwebtoken');

// dotenv 모듈
const dotenv = require('dotenv');
dotenv.config();

router.use(express.json());
//app.js에서 app을 다 가져갔으므로 app -> router로 대체!
// use: http 외 모듈 'json'. body에서 꺼내서 json처럼 쓸거야!(미들웨어 설정)

// 유효성 검사 결과 확인 미들웨어
const validate = (req, res, next) => {
    const errors = validationResult(req);
    
    //밥 안 드셨나요? 아니요 => 이중 부정 = 긍정
    // 밥 드셨나요? 네 => 긍정
    if (errors.isEmpty()) {
        next() // 다음 할 일(미들웨어, 함수)
    } else {
        return res.status(400).json({ errors: errors.array() })
    }
};
    
// 유효성 검사 규칙 미들웨어
const validateEmail = [
    body('email').notEmpty().isEmail().withMessage('유효한 이메일을 입력해주세요'),
    validate
]

const validateLogin = [
    body('email').notEmpty().isEmail().withMessage('유효한 이메일을 입력해주세요'),
    body('password').notEmpty().isString().withMessage('비밀번호를 입력해주세요'),
    validate
]

const validateRegister = [
    body('email').notEmpty().isEmail().withMessage('유효한 이메일을 입력해주세요'),
    body('name').notEmpty().isString().withMessage('이름을 입력해주세요'),
    body('password').notEmpty().isString().withMessage('비밀번호를 입력해주세요'),
    body('contact').notEmpty().isString().withMessage('연락처를 입력해주세요'),
    validate
]

// 로그인
router.post('/login', validateLogin, (req, res) => {
    const { email, password } = req.body

    let sql = 'SELECT * FROM users WHERE email = ?'
    conn.query(sql, [email], function (err, results) {
        if (err) {
            console.error(err)
            return res.status(500).json({
                message: "서버 오류가 발생했습니다.",
                error: err.message
            })
        }
        
        if (results.length > 0 && results[0].password === password) {
            const user = results[0]
            const token = jwt.sign({
                email : user.email,
                name : user.name
            }, process.env.PRIVATE_KEY, {
                expiresIn : '30m',
                issuer : "nanyoung"
            });
            
            res.cookie("token", token, {
                httpOnly : true
            })

            console.log(token);
            
            res.status(200).json({ 
                message: `${user.name}님, 로그인이 되었습니다!`
            })
        } else {
            res.status(403).json({ 
                message: "이메일 또는 비밀번호가 잘못되었습니다." 
            })
        }
    })
})

// 회원가입
router.post('/join', validateRegister, (req, res) => {
    const { email, name, password, contact } = req.body
    let sql = `INSERT INTO users (email, name, password, contact) VALUES (?, ?, ?, ?)`
    let values = [email, name, password, contact]

    conn.query(sql, values, function (err, results) {
        if (err) {
            console.error(err)
            return res.status(500).json({
                message: "서버 오류로 인해 회원가입에 실패했습니다.",
                error: err.message
            })
        }

        res.status(201).json({
            message: "회원가입이 완료되었습니다.",
            results
        })
    })
})

//회원 개별 조회
router.route('/users')
    .get(validateEmail, (req, res) => {
        const { email } = req.body
        let sql = 'SELECT * FROM users WHERE email = ?'
        conn.query(sql, [email], function (err, results) {
            if (err) {
                console.error(err)
                return res.status(500).json({
                    message: '서버 에러가 발생했습니다.',
                    error: err.message
                })
            }

            if (results.length > 0) {
                res.status(200).json(results)
            } else {
                res.status(404).json({ message: '죄송합니다. 찾으시는 회원 정보가 없습니다.' })
            }
        })
    })

    //회원 개별 삭제
    .delete(validateEmail, (req, res) => {
        const { email } = req.body
        let sql = 'DELETE FROM users WHERE email = ?'
        conn.query(sql, [email], function (err, results) {
            if (err) {
                console.error(err)
                return res.status(500).json({
                    message: "서버 오류로 인해 회원 삭제에 실패했습니다.",
                    error: err.message
                })
            }

            if (results.affectedRows > 0) {
                console.log(`이메일: ${email} 유저 삭제 완료`)
                res.status(200).json({
                    message: `${email}님, 아쉽지만 다음에 또 뵙겠습니다!`
                })
            } else {
                console.log(`이메일: ${email} 유저를 찾지 못함`)
                res.status(404).json({
                    message: "죄송합니다. 찾으시는 회원 정보가 없습니다."
                })
            }
        })
    })

module.exports = router