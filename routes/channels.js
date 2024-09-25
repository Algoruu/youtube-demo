const express = require('express')
const router = express.Router();
const conn = require('../mariadb')
const { body, param, validationResult } = require('express-validator')


router.use(express.json())
//app.js에서 app을 다 가져갔으므로 app -> router로 대체!

// 유효성 검사 결과 확인 미들웨어
const validate = (req, res, next) => {
    const errors = validationResult(req)
    
    //밥 안 드셨나요? 아니요 => 이중 부정 = 긍정
    // 밥 드셨나요? 네 => 긍정
    if (errors.isEmpty()) {
        next() // 다음 할 일(미들웨어, 함수)
    } else {
        return res.status(400).json({ errors: errors.array() })
    }
}
    

// 유효성 검사 규칙 미들웨어
const validateChannelId = [
    param('id').notEmpty().isInt().withMessage('채널 id는 숫자여야 합니다'),
    validate
]

const validateUserId = [
    body('userId').notEmpty().isInt().withMessage('userId는 숫자여야 합니다'),
    validate
]

const validateChannelData = [
    body('userId').notEmpty().isInt().withMessage('userId는 숫자여야 합니다'),
    body('name').notEmpty().isString().withMessage('name은 문자여야 합니다'),
    validate
]

const validateChannelName = [
    body('name').notEmpty().isString().withMessage('채널명 오류'),
    validate
]

// 채널 전체 조회
router.get('/', validateUserId, (req, res) => {
    const { userId } = req.body

    const sql = 'SELECT * FROM channels WHERE user_id = ?'
    conn.query(sql, [userId], (err, results) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ message: '서버 오류가 발생했습니다.', error: err.message })
        }

        if (results.length > 0) {
            res.status(200).json(results)
        } else {
            res.status(404).json({ message: '해당 userId에 대한 채널이 없습니다.' })
        }
    })
})

// 채널 개별 등록
router.post('/', validateChannelData, (req, res) => {
    const { name, userId } = req.body
    const sql = 'INSERT INTO channels (name, user_id) VALUES (?, ?)'
    const values = [name, userId]

    conn.query(sql, values, (err, results) => {
        if (err) {
            console.error(err)
            return res.status(500).json({
                message: '서버 오류로 인해 채널 생성에 실패했습니다.',
                error: err.message
            })
        }

        res.status(201).json({
            message: `${name}님, 채널 생성을 축하드립니다!`,
            results
        })
    })
})

// 채널 개별 조회
router.get('/:id', validateChannelId, (req, res) => {
    const { id } = req.params
    const sql = 'SELECT * FROM channels WHERE id = ?'
    conn.query(sql, [id], (err, results) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ message: '서버 오류가 발생했습니다.', error: err.message })
        }

        if (results.length > 0) {
            res.status(200).json(results)
        } else {
            res.status(404).json({ message: '해당 채널을 찾을 수 없습니다.' })
        }
    })
})

// 채널 개별 수정
router.put('/:id', [...validateChannelId, ...validateChannelName], (req, res) => {
    const { id } = req.params
    const { name } = req.body

    const sql = 'UPDATE channels SET name = ? WHERE id = ?'
    const values = [name, id]

    conn.query(sql, values, (err, results) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ message: '서버 오류가 발생했습니다.', error: err.message })
        }

        if (results.affectedRows > 0) {
            res.status(200).json({
                message: `채널명이 성공적으로 수정되었습니다! 새로운 이름: ${name}`,
                results
            })
        } else {
            res.status(404).json({ message: '해당 채널을 찾을 수 없습니다.' })
        }
    })
})

// 채널 개별 삭제
router.delete('/:id', validateChannelId, (req, res) => {
    const { id } = req.params

    const sql = 'DELETE FROM channels WHERE id = ?'
    conn.query(sql, [id], (err, results) => {
        if (err) {
            console.error(err)
            return res.status(500).json({
                message: '서버 오류로 인해 채널 삭제에 실패했습니다.',
                error: err.message
            })
        }

        if (results.affectedRows > 0) {
            res.status(200).json({ message: `ID ${id}의 채널이 정상적으로 삭제되었습니다.` })
        } else {
            res.status(404).json({ message: '해당 채널을 찾을 수 없습니다.' })
        }
    })
})

module.exports = router