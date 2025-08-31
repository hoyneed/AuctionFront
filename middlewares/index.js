/**
 * 로그인 상태 확인 미들웨어
 * 사용자가 로그인되어 있는지 확인하고, 로그인되지 않은 경우 접근을 차단
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 * @param {Function} next - Express 다음 미들웨어 함수
 */
exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    // 사용자가 로그인되어 있는 경우
    next(); // 다음 미들웨어/라우터로 진행
  } else {
    // 사용자가 로그인되어 있지 않은 경우
    res.status(403).send('Login required'); // 403 Forbidden 응답
  }
};

/**
 * 비로그인 상태 확인 미들웨어
 * 사용자가 로그인되어 있지 않은지 확인하고, 이미 로그인된 경우 접근을 차단
 * 주로 회원가입, 로그인 페이지에서 사용
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 * @param {Function} next - Express 다음 미들웨어 함수
 */
exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // 사용자가 로그인되어 있지 않은 경우
    next(); // 다음 미들웨어/라우터로 진행
  } else {
    // 사용자가 이미 로그인되어 있는 경우
    const message = encodeURIComponent('Already logged in.'); // 메시지를 URL 인코딩
    res.redirect(`/?error=${message}`); // 메인 페이지로 리다이렉트 (에러 메시지와 함께)
  }
};

/**
 * 경매 진행 상태 확인 미들웨어
 * 특정 경매가 아직 진행 중인지 확인하고, 종료된 경매에 대한 접근을 차단
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 * @param {Function} next - Express 다음 미들웨어 함수
 */
exports.isAuctionActive = async (req, res, next) => {
  try {
    // Good 모델을 동적으로 로드 (순환 참조 방지)
    const { Good } = require('../models');
    
    // 요청된 상품 ID로 상품 정보 조회
    const good = await Good.findByPk(req.params.id);
    
    // 상품이 존재하지 않는 경우
    if (!good) {
      return res.status(404).send('Product not found.');
    }
    
    // 경매 종료 시간 계산 (24시간 후)
    const auctionEndTime = new Date(good.createdAt);
    auctionEndTime.setDate(auctionEndTime.getDate() + 1);
    
    // 현재 시간이 경매 종료 시간을 지났는지 확인
    if (new Date() > auctionEndTime) {
      return res.status(403).send('Auction has already ended.');
    }
    
    // 경매가 진행 중인 경우 다음 단계로 진행
    next();
    
  } catch (error) {
    console.error('isAuctionActive middleware error:', error);
    next(error); // 에러를 Express 에러 핸들러로 전달
  }
};
