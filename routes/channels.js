const express = require('express')
const router = express.Router();
const conn = require('../mariadb')

router.use(express.json())
//app.js에서 app을 다 가져갔으므로 app -> router로 대체!

let db = new Map()
var id = 1

router
    .route('/') // app.js에서 app.use("/channels", channelRouter)로 빼줬기에 중복제거
    .get((req, res) => {
        const { userId } = req.body;

        if (!userId) {
            // userId가 없는 경우 처리
            return res.status(400).json({ message: "userId를 입력해주세요." });
        }

        // MySQL 쿼리 실행: 특정 userId에 해당하는 채널들을 조회
        let sql = 'SELECT * FROM channels WHERE user_id = ?';
        conn.query(sql, [userId], (err, results) => {
            if (err) {
                // SQL 에러 처리
                console.error(err);
                return res.status(500).json({ message: "서버 오류가 발생했습니다.", error: err.message });
            }

            if (results.length > 0) {
                // 채널이 존재할 경우
                res.status(200).json(results);
            } else {
                // userId에 해당하는 채널이 없는 경우
                notFoundChannel(res);
            }
        })
    })// 채널 전체 조회

    .post((req, res) => {
        const { name, userId } = req.body;  // req.body에서 name과 userId를 받아옴
    
        if (name && userId) {
            // SQL 쿼리 실행: user_id는 MySQL 테이블에 맞게 사용
            let sql = `INSERT INTO channels (name, user_id) VALUES (?, ?)` // DB 컬럼 이름: user_id
            let values = [name, userId];  // req.body의 userId 사용
    
            conn.query(sql, values, (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        message: "서버 오류로 인해 채널 생성에 실패했습니다.",
                        error: err.message
                    })
                }
    
                // 채널 생성 성공 시 메시지 반환
                res.status(201).json({
                    message: `${name}님, 채널 생성을 축하드립니다!`,
                    results: results
                })
            })
        } else {
            // 요청 값이 누락된 경우 처리
            res.status(400).json({
                message: "죄송합니다. 요청 값을 다시 보내주세요."
            })
        }
    }) // 채널 개별 등록
    

    router
    .route('/:id') // app.js에서 app.use("/channels", channelRouter)로 빼줬기에 중복제거
    .get((req, res) => {
        let { id } = req.params;
        id = parseInt(id);

        let sql = 'SELECT * FROM channels WHERE id = ?';
        conn.query(sql, [id], (err, results) => {
            if (err) {
                // SQL 에러 발생 시 처리
                console.error(err);
                return res.status(500).json({ message: "서버 오류가 발생했습니다.", error: err.message });
            }

            // 결과가 존재하는지 확인
            if (results.length > 0) {
                res.status(200).json(results);
            } else {
                // 채널을 찾지 못한 경우
                notFoundChannel(res);
            }
        })
    })// 채널 개별 조회

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
    }) //채널 개별 삭제

function notFoundChannel(res) {
    res.status(404).json({
        message: "죄송합니다. 채널 정보를 찾을 수 없습니다."
    })
}
    

module.exports = router;
