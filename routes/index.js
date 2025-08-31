const express = require('express');                      // Express.js 웹 프레임워크
const multer = require('multer');                        // 파일 업로드 처리 미들웨어
const path = require('path');                            // 파일 경로 처리 모듈
const fs = require('fs');                                // 파일 시스템 접근 모듈

const { isLoggedIn, isNotLoggedIn, isAuctionActive } = require('../middlewares'); // 인증 및 경매 상태 확인 미들웨어
const {
  renderMain, renderJoin, renderGood, createGood, renderAuction, bid, renderList,
} = require('../controllers'); // 메인 컨트롤러 함수들

const router = express.Router();                        // Express 라우터 인스턴스 생성

/**
 * 전역 미들웨어 설정
 * 모든 라우트에서 공통으로 사용할 데이터를 설정
 */
router.use((req, res, next) => {
  res.locals.user = req.user;                           // 현재 로그인한 사용자 정보를 템플릿에 전달
  res.locals.request = req;                             // 쿼리 파라미터 접근을 위해 request 객체 추가
  next();
});

/**
 * 메인 페이지 라우트
 * GET / - 현재 진행 중인 경매 상품 목록 표시
 */
router.get('/', renderMain);

/**
 * 회원가입 페이지 라우트
 * GET /join - 회원가입 폼 표시
 * isNotLoggedIn: 이미 로그인된 사용자는 접근 불가
 */
router.get('/join', isNotLoggedIn, renderJoin);

/**
 * 상품 등록 페이지 라우트
 * GET /good - 상품 등록 폼 표시
 * isLoggedIn: 로그인된 사용자만 접근 가능
 */
router.get('/good', isLoggedIn, renderGood);

/**
 * uploads 폴더 생성 및 확인
 * 파일 업로드를 위한 디렉토리가 존재하지 않으면 생성
 */
try {
  fs.readdirSync('uploads'); // uploads 폴더 존재 여부 확인
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads'); // 폴더가 없으면 생성
}

/**
 * Multer 파일 업로드 설정
 * 이미지 파일 업로드 처리를 위한 설정
 */
const upload = multer({
  storage: multer.diskStorage({
    // 파일 저장 위치 설정
    destination(req, file, cb) {
      cb(null, 'uploads/'); // uploads 폴더에 저장
    },
    
    // 파일명 생성 규칙 설정
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);        // 원본 파일의 확장자 추출
      // 한글 파일명 문제 해결을 위해 영문/숫자로만 구성된 파일명 생성
      const timestamp = new Date().valueOf();             // 현재 시간을 밀리초로 변환
      const randomStr = Math.random().toString(36).substring(2, 8); // 6자리 랜덤 문자열
      cb(null, `img_${timestamp}_${randomStr}${ext}`);   // 최종 파일명: img_타임스탬프_랜덤문자열.확장자
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },                // 파일 크기 제한: 5MB
});

/**
 * 상품 등록 처리 라우트
 * POST /good - 상품 정보와 이미지를 받아 데이터베이스에 저장
 * isLoggedIn: 로그인된 사용자만 접근 가능
 * upload.single('img'): 'img' 필드의 단일 파일 업로드 처리
 */
router.post('/good', isLoggedIn, upload.single('img'), createGood);

/**
 * 경매 상세 페이지 라우트
 * GET /good/:id - 특정 상품의 경매 상세 정보 표시
 * isLoggedIn: 로그인된 사용자만 접근 가능
 * isAuctionActive: 경매가 진행 중인지 확인
 */
router.get('/good/:id', isLoggedIn, isAuctionActive, renderAuction);

/**
 * 입찰 처리 라우트
 * POST /good/:id/bid - 특정 상품에 대한 입찰 정보 처리
 * isLoggedIn: 로그인된 사용자만 접근 가능
 * isAuctionActive: 경매가 진행 중인지 확인
 */
router.post('/good/:id/bid', isLoggedIn, isAuctionActive, bid);

/**
 * 경매 결과 페이지 라우트
 * GET /list - 종료된 경매와 낙찰 결과 목록 표시
 * isLoggedIn: 로그인된 사용자만 접근 가능
 */
router.get('/list', isLoggedIn, renderList);

module.exports = router; // 라우터 내보내기
