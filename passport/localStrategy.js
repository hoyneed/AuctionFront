const passport = require('passport');                    // Passport.js 인증 미들웨어
const LocalStrategy = require('passport-local').Strategy; // 로컬 인증 전략
const bcrypt = require('bcrypt');                        // 비밀번호 해시화 라이브러리

const User = require('../models/user');                  // User 모델

/**
 * Passport.js 로컬 인증 전략 설정
 * 이메일과 비밀번호를 사용한 로컬 로그인 인증을 처리
 * @returns {Function} Passport.js 전략 설정 함수
 */
module.exports = () => {
  // 새로운 로컬 인증 전략 생성
  passport.use(new LocalStrategy({
    usernameField: 'email',      // 사용자명 필드를 'email'로 설정
    passwordField: 'password',   // 비밀번호 필드를 'password'로 설정
  }, async (email, password, done) => {
    // 인증 로직 실행 (email: 사용자 입력 이메일, password: 사용자 입력 비밀번호)
    try {
      // 데이터베이스에서 해당 이메일을 가진 사용자 조회
      const exUser = await User.findOne({ where: { email } });
      
      if (exUser) {
        // 사용자가 존재하는 경우
        
        // 사용자가 입력한 평문 비밀번호와 데이터베이스의 해시화된 비밀번호 비교
        const result = await bcrypt.compare(password, exUser.password);
        
        if (result) {
          // 비밀번호가 일치하는 경우 - 인증 성공
          done(null, exUser); // 사용자 정보를 Passport.js에 전달
        } else {
          // 비밀번호가 일치하지 않는 경우 - 인증 실패
          done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
        }
      } else {
        // 사용자가 존재하지 않는 경우 - 인증 실패
        done(null, false, { message: '가입되지 않은 회원입니다.' });
      }
      
    } catch (error) {
      // 인증 과정에서 에러가 발생한 경우
      console.error(error);
      done(error); // 에러를 Passport.js에 전달
    }
  }));
};

