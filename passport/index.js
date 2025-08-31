const passport = require('passport');                    // Passport.js 인증 미들웨어

const local = require('./localStrategy');               // 로컬 인증 전략
const User = require('../models/user');                 // User 모델

/**
 * Passport.js 설정 및 초기화 함수
 * 사용자 세션 관리와 인증 전략을 설정
 * @returns {Function} Passport.js 설정 함수
 */
module.exports = () => {
  
  /**
   * 사용자 직렬화 (Serialization)
   * 로그인 성공 시 사용자 정보를 세션에 저장할 때 호출
   * 사용자 객체에서 세션에 저장할 식별자(보통 ID)를 추출
   * @param {Object} user - 인증된 사용자 객체
   * @param {Function} done - 완료 콜백 함수
   */
  passport.serializeUser((user, done) => {
    done(null, user.id); // 사용자 ID만 세션에 저장 (메모리 절약)
  });

  /**
   * 사용자 역직렬화 (Deserialization)
   * 요청이 들어올 때마다 세션에서 사용자 정보를 복원할 때 호출
   * 세션에 저장된 ID를 사용하여 전체 사용자 정보를 데이터베이스에서 조회
   * @param {number} id - 세션에 저장된 사용자 ID
   * @param {Function} done - 완료 콜백 함수
   */
  passport.deserializeUser((id, done) => {
    // 세션 ID로 사용자 정보 조회
    User.findOne({ where: { id } })
      .then(user => done(null, user))  // 사용자 정보를 req.user에 설정
      .catch(err => done(err));        // 에러 발생 시 에러 전달
  });

  // 로컬 인증 전략 등록
  local();
};
