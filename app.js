const express = require('express');                      // Express.js 웹 프레임워크
const path = require('path');                            // 파일 경로 처리 모듈
const morgan = require('morgan');                        // HTTP 요청 로깅 미들웨어
const cookieParser = require('cookie-parser');           // 쿠키 파싱 미들웨어
const session = require('express-session');              // 세션 관리 미들웨어
const passport = require('passport');                    // Passport.js 인증 미들웨어
const nunjucks = require('nunjucks');                    // Nunjucks 템플릿 엔진
const dotenv = require('dotenv');                        // 환경변수 관리

// 환경변수 설정 파일 로드
dotenv.config();

// 라우터 및 모듈들 로드
const indexRouter = require('./routes/index');           // 메인 라우터
const authRouter = require('./routes/auth');             // 인증 라우터
const { sequelize } = require('./models');               // 데이터베이스 연결
const passportConfig = require('./passport');            // Passport.js 설정
const sse = require('./sse');                            // Server-Sent Events
const webSocket = require('./socket');                   // WebSocket 설정
const checkAuction = require('./checkAuction');          // 경매 상태 확인 스케줄러

const app = express();                                   // Express 애플리케이션 인스턴스 생성

// Passport.js 및 경매 확인 스케줄러 초기화
passportConfig();
checkAuction();

// 애플리케이션 설정
app.set('port', process.env.PORT || 8010);               // 서버 포트 설정 (기본값: 8010)
app.set('view engine', 'html');                          // 뷰 엔진을 HTML로 설정

/**
 * Nunjucks 템플릿 엔진 설정
 * 뷰 폴더 위치와 Express 연동 설정
 */
nunjucks.configure('views', {
  express: app,                                          // Express 앱과 연동
  watch: false,                                          // 파일 변경 감시 비활성화 (프로덕션 환경)
});

/**
 * Nunjucks 필터 추가
 * 템플릿에서 사용할 수 있는 커스텀 필터들을 정의
 */
nunjucks.configure('views', {
  express: app,
  watch: false,
  filters: {
    /**
     * 날짜 포맷팅 필터
     * @param {Date|string} date - 포맷팅할 날짜
     * @param {string} format - 포맷 문자열 (Y:년, m:월, d:일, H:시, i:분, s:초)
     * @returns {string} 포맷팅된 날짜 문자열
     */
    date: function(date, format) {
      if (!date) return '';
      
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      
      return format
        .replace('Y', year)
        .replace('m', month)
        .replace('d', day)
        .replace('H', hours)
        .replace('i', minutes)
        .replace('s', seconds);
    }
  }
});

/**
 * 데이터베이스 연결 및 동기화
 * Sequelize를 사용하여 MySQL 데이터베이스에 연결
 */
sequelize.sync({ force: false })                         // force: false - 기존 테이블 유지
  .then(() => {
    console.log('Database connection successful');        // 데이터베이스 연결 성공 로그
  })
  .catch((err) => {
    console.error(err);                                  // 데이터베이스 연결 실패 시 에러 로그
  });

/**
 * 세션 미들웨어 설정
 * 사용자 인증 상태를 유지하기 위한 세션 관리
 */
const sessionMiddleware = session({
  resave: false,                                         // 세션이 변경되지 않았으면 저장하지 않음
  saveUninitialized: false,                              // 초기화되지 않은 세션 저장하지 않음
  secret: process.env.COOKIE_SECRET,                     // 세션 암호화 키 (환경변수에서 로드)
  cookie: {
    httpOnly: true,                                      // JavaScript에서 쿠키 접근 불가 (보안 강화)
    secure: false,                                       // HTTPS에서만 쿠키 전송 (개발환경에서는 false)
  },
});

// 미들웨어 설정 순서
app.use(morgan('dev'));                                  // HTTP 요청 로깅 (개발 모드)
app.use(express.static(path.join(__dirname, 'public'))); // 정적 파일 서빙 (CSS, JS, 이미지 등)

/**
 * 이미지 정적 파일 서빙 설정 개선
 * uploads 폴더의 이미지 파일을 /img 경로로 제공
 */
app.use('/img', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'public, max-age=31536000'); // 이미지 캐싱 설정 (1년)
  }
}));

// 요청 데이터 파싱 미들웨어
app.use(express.json());                                 // JSON 요청 본문 파싱
app.use(express.urlencoded({ extended: false }));        // URL 인코딩된 요청 본문 파싱

// 쿠키 및 세션 미들웨어
app.use(cookieParser(process.env.COOKIE_SECRET));        // 쿠키 파싱 (서명 키 설정)
app.use(sessionMiddleware);                              // 세션 미들웨어 적용
app.use(passport.initialize());                          // Passport.js 초기화
app.use(passport.session());                             // Passport.js 세션 미들웨어

// 라우터 설정
app.use('/', indexRouter);                               // 메인 라우터 (/, /good, /list 등)
app.use('/auth', authRouter);                            // 인증 라우터 (/auth/join, /auth/login, /auth/logout)

/**
 * 이미지 파일 요청 에러 처리 미들웨어
 * /img/* 경로에서 발생하는 404 에러를 처리
 */
app.use('/img/*', (req, res, next) => {
  const error = new Error('Image not found');
  error.status = 404;
  next(error);
});

/**
 * 404 에러 처리 미들웨어
 * 정의되지 않은 라우트에 대한 요청 처리
 */
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} router not found`);
  error.status = 404;
  next(error);
});

/**
 * 전역 에러 처리 미들웨어
 * 애플리케이션에서 발생하는 모든 에러를 처리
 */
app.use((err, req, res, next) => {
  res.locals.message = err.message;                     // 에러 메시지를 템플릿에 전달
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {}; // 프로덕션 환경에서는 에러 상세 정보 숨김
  res.status(err.status || 500);                        // HTTP 상태 코드 설정 (기본값: 500)
  res.render('error');                                   // 에러 페이지 렌더링
});

/**
 * HTTP 서버 생성 및 시작
 * 지정된 포트에서 서버 리스닝 시작
 */
const server = app.listen(app.get('port'), () => {
  console.log(`Server is running on port ${app.get('port')}`); // 서버 시작 로그
});

// WebSocket 및 SSE 설정
webSocket(server, app);                                  // Socket.IO WebSocket 서버 설정
sse(server);                                             // Server-Sent Events 설정
