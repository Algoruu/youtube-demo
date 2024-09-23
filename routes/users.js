const express = require('express')
const router = express.Router();
const conn = require('../mariadb') //mariadb.js의 connection을 불러오기

router.use(express.json()) 
//app.js에서 app을 다 가져갔으므로 app -> router로 대체!
// use: http 외 모듈 'json'. body에서 꺼내서 json처럼 쓸거야!(미들웨어 설정)

// 로그인
router.post('/login', (req, res) => {
    const {email, password} = req.body;

    // 이메일로 사용자를 찾는 쿼리 실행
    let sql = 'SELECT * FROM users WHERE email = ?'
    conn.query(sql, [email], 
        function (err, results) {
        if (err) {
            // SQL 에러가 발생하면 에러 처리
            console.error(err);
            return res.status(500).json({
                message: "서버 오류가 발생했습니다.",
                error: err.message
            });
        }

        // 사용자가 존재하고 비밀번호가 일치하는지 확인
        if (results.length > 0 && results[0].password === password) {
            const user = results[0];
            res.status(200).json({ message: `${user.name}님, 로그인이 되었습니다!` })
        } else {
            // 이메일 또는 비밀번호가 잘못된 경우 에러 메시지 반환
            res.status(404).json({ message: "이메일 또는 비밀번호가 잘못되었습니다." })
        }
    })
})




// 회원가입
router.post('/join', (req, res) => {
    const {email, name, password, contact} = req.body
    let sql = `INSERT INTO users (email, name, password, contact) VALUES (?, ?, ?, ?)`
    let values = [email, name, password, contact]

    // 회원가입 처리 (즉시 실행)
    if (email && name && password && contact) { // 모든 필드가 입력된 경우에만 회원가입
        conn.query(sql,  values,
            function (err, results) {
                if (err) {
                    // SQL 에러가 발생하면 에러를 처리
                    console.error(err)
                    return res.status(500).json({
                        message: "서버 오류로 인해 회원가입에 실패했습니다.",
                        error: err.message
                    });
                }
                // 성공 시 결과 반환
                res.status(201).json({
                    message: "회원가입이 완료되었습니다.",
                    results: results
                })
            }
        )
    } else {
        // 입력 값이 누락되었을 때
        res.status(400).json({
            message: "죄송하지만, 입력 값을 다시 확인해주세요!"
        })
    }
})

router.route('/users')
    .get((req, res) => {
        let { email } = req.body; // 비구조화
        // SQL 쿼리에서 변수를 직접 넣지 말고 ?로 대체하여 prepared statement 사용
        let sql = 'SELECT * FROM users WHERE email = ?'
        conn.query(sql,[email],
            function (err, results) {
                if (err) {
                    // 에러가 발생하면 에러 응답을 보냄
                    res.status(500).json({ message: '서버 에러가 발생했습니다.', error: err });
                } else if (results.length) {
                    // 조회된 데이터가 있으면 그 결과를 반환
                    res.status(200).json(results);
                } else {
                    // 조회된 데이터가 없을 경우
                    res.status(404).json({ message: '죄송합니다. 찾으시는 회원 정보가 없습니다.' });
                }
            }
        )
    })

    .delete((req, res) => {
        let { email } = req.body;
        let sql = 'DELETE FROM users WHERE email = ?'
        conn.query(sql, [email], 
            function (err, results) {
            if (err) {
                // SQL 에러가 발생하면 에러를 처리
                console.error(err);
                return res.status(500).json({
                    message: "서버 오류로 인해 회원 삭제에 실패했습니다.",
                    error: err.message
                })
            }

            // 삭제된 행이 있는 경우
            if (results.affectedRows > 0) {
                console.log(`이메일: ${email} 유저 삭제 완료`);
                res.status(200).json({
                    message: `${email}님, 아쉽지만 다음에 또 뵙겠습니다!`
                });
            } else {
                // 삭제할 유저가 없는 경우
                console.log(`이메일: ${email} 유저를 찾지 못함`);
                res.status(404).json({
                    message: "죄송합니다. 찾으시는 회원 정보가 없습니다."
                })
            }
        })
    })

module.exports = router; //모듈화