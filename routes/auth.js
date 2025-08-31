const express = require('express');                      // Express.js 웹 프레임워크

const { isLoggedIn, isNotLoggedIn } = require('../middlewares'); // 인증 상태 확인 미들웨어
const { join, login, logout } = require('../controllers/auth');  // 인증 관련 컨트롤러

const router = express.Router();                        // Express 라우터 인스턴스 생성

/**
 * 인증 관련 라우트 설정
 * 회원가입, 로그인, 로그아웃 기능을 처리
 */

// POST /auth/join - 회원가입 처리
// isNotLoggedIn: 이미 로그인된 사용자는 접근 불가 (회원가입 페이지로 리다이렉트)
router.post('/join', isNotLoggedIn, join); 

// POST /auth/login - 로그인 처리
// isNotLoggedIn: 이미 로그인된 사용자는 접근 불가 (메인 페이지로 리다이렉트)
router.post('/login', isNotLoggedIn, login);

// GET /auth/logout - 로그아웃 처리
// isLoggedIn: 로그인된 사용자만 접근 가능 (로그인되지 않은 경우 403 에러)
router.get('/logout', isLoggedIn, logout);

module.exports = router; // 라우터 내보내기
