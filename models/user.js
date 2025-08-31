const Sequelize = require('sequelize');

/**
 * User 모델 - 사용자 정보를 관리하는 테이블
 * 경매 시스템의 사용자(회원) 정보를 저장
 */
class User extends Sequelize.Model {
  
  /**
   * 모델 초기화 메서드
   * Sequelize에 User 모델을 등록하고 테이블 구조를 정의
   * @param {Object} sequelize - Sequelize 인스턴스
   */
  static initiate(sequelize) {
    User.init({
      // 이메일 필드 (로그인 ID로 사용)
      email: {
        type: Sequelize.STRING(40),    // VARCHAR(40) - 최대 40자 문자열
        allowNull: false,              // NULL 값 허용하지 않음 (필수 필드)
        unique: true,                  // 중복 값 허용하지 않음 (고유값)
      },
      
      // 닉네임 필드 (화면에 표시되는 사용자명)
      nick: {
        type: Sequelize.STRING(15),    // VARCHAR(15) - 최대 15자 문자열
        allowNull: false,              // NULL 값 허용하지 않음 (필수 필드)
      },
      
      // 비밀번호 필드 (해시화된 비밀번호 저장)
      password: {
        type: Sequelize.STRING(100),   // VARCHAR(100) - 해시화된 비밀번호 저장
        allowNull: true,               // NULL 값 허용 (소셜 로그인 등에서 사용)
      },
      
      // 보유 자산 필드 (경매 참여를 위한 가상 화폐)
      money: {
        type: Sequelize.INTEGER,       // INT - 정수형
        allowNull: false,              // NULL 값 허용하지 않음
        defaultValue: 0,               // 기본값 0 (가입 시 초기 자산)
      },
    }, {
      // 모델 설정 옵션
      sequelize,                       // Sequelize 인스턴스
      timestamps: true,                // createdAt, updatedAt 자동 생성
      paranoid: true,                  // deletedAt 필드로 소프트 삭제 지원
      modelName: 'User',               // Sequelize 내부에서 사용할 모델명
      tableName: 'users',              // 실제 데이터베이스 테이블명
      charset: 'utf8',                 // 문자셋 (한글 지원)
      collate: 'utf8_general_ci',      // 정렬 규칙 (대소문자 구분 없음)
    });
  }

  /**
   * 모델 간 관계 설정 메서드
   * 다른 모델과의 연결 관계를 정의
   * @param {Object} db - 모든 모델을 포함한 db 객체
   */
  static associate(db) {
    // User는 여러 개의 Auction을 가질 수 있음 (1:N 관계)
    // 한 사용자가 여러 번 입찰할 수 있음
    db.User.hasMany(db.Auction, {
      foreignKey: 'UserId',            // 외래키 필드명
      as: 'Bids'                      // 관계 별칭 (사용 시: user.Bids)
    });
    
    // User는 여러 개의 Good을 소유할 수 있음 (1:N 관계)
    // 한 사용자가 여러 상품을 등록할 수 있음
    db.User.hasMany(db.Good, {
      foreignKey: 'OwnerId',           // 외래키 필드명
      as: 'OwnedGoods'                // 관계 별칭 (사용 시: user.OwnedGoods)
    });
    
    // User는 여러 개의 Good을 낙찰받을 수 있음 (1:N 관계)
    // 한 사용자가 여러 상품을 낙찰받을 수 있음
    db.User.hasMany(db.Good, {
      foreignKey: 'SoldId',            // 외래키 필드명
      as: 'WonGoods'                  // 관계 별칭 (사용 시: user.WonGoods)
    });
  }
};

module.exports = User; // User 모델 내보내기
