const bcrypt = require('bcrypt');        // 비밀번호 해시화 라이브러리
const passport = require('passport');     // Passport.js 인증 미들웨어
const User = require('../models/user');   // User 모델

/**
 * 회원가입 처리 함수
 * 사용자로부터 받은 정보를 검증하고 데이터베이스에 저장
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 * @param {Function} next - Express 다음 미들웨어 함수
 */
exports.join = async (req, res, next) => {
  // 요청 본문에서 사용자 입력 데이터 추출
  const { email, nick, password, money } = req.body;
  
  try {
    // 이메일 중복 확인
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      // 이미 존재하는 이메일인 경우 회원가입 페이지로 리다이렉트
      return res.redirect('/join?error=Email already exists.');
    }
    
    // 비밀번호 해시화 (salt rounds: 12 - 보안 강도)
    const hash = await bcrypt.hash(password, 12);
    
    // 새로운 사용자 생성 및 데이터베이스에 저장
    await User.create({
      email,           // 이메일
      nick,            // 닉네임
      password: hash,  // 해시화된 비밀번호
      money,           // 초기 보유 자산
    });
    
    // 회원가입 성공 시 메인 페이지로 리다이렉트
    return res.redirect('/');
    
  } catch (error) {
    console.error(error);
    return next(error); // 에러를 Express 에러 핸들러로 전달
  }
}

/**
 * 로그인 처리 함수
 * Passport.js를 사용하여 사용자 인증 수행
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 * @param {Function} next - Express 다음 미들웨어 함수
 */
exports.login = (req, res, next) => {
  // Passport.js local 전략을 사용한 인증
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      // 인증 과정에서 에러 발생 시
      console.error(authError);
      return next(authError);
    }
    
    if (!user) {
      // 인증 실패 시 (잘못된 이메일/비밀번호)
      return res.redirect(`/?error=${info.message}`);
    }
    
    // 인증 성공 시 사용자 로그인 처리
    return req.login(user, (loginError) => {
      if (loginError) {
        // 로그인 과정에서 에러 발생 시
        console.error(loginError);
        return next(loginError);
      }
      
      // 로그인 성공 시 메인 페이지로 리다이렉트
      return res.redirect('/');
    });
  })(req, res, next); // 미들웨어 호출 시 (req, res, next)를 붙여서 실행
};

/**
 * 로그아웃 처리 함수
 * 사용자 세션을 종료하고 쿠키를 정리
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 * @param {Function} next - Express 다음 미들웨어 함수
 */
exports.logout = (req, res, next) => {
  console.log('Logout process started for user:', req.user?.id);
  
  // Passport.js 0.6.0+ 버전에서는 콜백이 필수
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return next(err);
    }
    
    console.log('Passport logout successful');
    
    // 세션 파괴 (사용자 인증 정보 제거)
    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        console.error('Session destroy error:', sessionErr);
        return next(sessionErr);
      }
      
      console.log('Session destroyed successfully');
      
      // connect.sid 쿠키도 정리 (세션 ID 쿠키)
      res.clearCookie('connect.sid');
      
      console.log('Cookie cleared, redirecting to home');
      
      // 로그아웃 성공 후 리다이렉트 (성공 메시지와 함께)
      res.redirect('/?message=로그아웃되었습니다.');
    });
  });
};