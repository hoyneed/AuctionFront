const Sequelize = require('sequelize');

/**
 * Auction 모델 - 입찰 정보를 관리하는 테이블
 * 사용자들이 상품에 입찰한 기록을 저장
 */
class Auction extends Sequelize.Model {
  
  /**
   * 모델 초기화 메서드
   * Sequelize에 Auction 모델을 등록하고 테이블 구조를 정의
   * @param {Object} sequelize - Sequelize 인스턴스
   */
  static initiate(sequelize) {
    Auction.init({
      // 입찰가 필드
      bid: {
        type: Sequelize.INTEGER,       // INT - 정수형
        allowNull: false,              // NULL 값 허용하지 않음 (필수 필드)
        defaultValue: 0,               // 기본값 0 (입찰가가 0원일 수 있음)
      },
      
      // 입찰 메시지 필드 (선택사항)
      msg: {
        type: Sequelize.STRING(100),   // VARCHAR(100) - 최대 100자 문자열
        allowNull: true,               // NULL 값 허용 (메시지가 없는 경우)
      },
    }, {
      // 모델 설정 옵션
      sequelize,                       // Sequelize 인스턴스
      timestamps: true,                // createdAt, updatedAt 자동 생성
      paranoid: true,                  // deletedAt 필드로 소프트 삭제 지원
      modelName: 'Auction',            // Sequelize 내부에서 사용할 모델명
      tableName: 'auctions',           // 실제 데이터베이스 테이블명
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
    // Auction은 하나의 User(입찰자)를 가짐 (N:1 관계)
    // 입찰을 한 사용자
    db.Auction.belongsTo(db.User, {
      foreignKey: 'UserId',            // 외래키 필드명
      as: 'User'                      // 관계 별칭 (사용 시: auction.User)
    });
    
    // Auction은 하나의 Good(입찰 상품)을 가짐 (N:1 관계)
    // 입찰 대상이 되는 상품
    db.Auction.belongsTo(db.Good, {
      foreignKey: 'GoodId',            // 외래키 필드명
      as: 'Good'                      // 관계 별칭 (사용 시: auction.Good)
    });
  }
};

module.exports = Auction; // Auction 모델 내보내기
