const Sequelize = require('sequelize');

/**
 * Good 모델 - 경매 상품 정보를 관리하는 테이블
 * 경매에 등록되는 상품의 기본 정보를 저장
 */
class Good extends Sequelize.Model {
  
  /**
   * 모델 초기화 메서드
   * Sequelize에 Good 모델을 등록하고 테이블 구조를 정의
   * @param {Object} sequelize - Sequelize 인스턴스
   */
  static initiate(sequelize) {
    Good.init({
      // 상품명 필드
      name: {
        type: Sequelize.STRING(40),    // VARCHAR(40) - 최대 40자 문자열
        allowNull: false,              // NULL 값 허용하지 않음 (필수 필드)
      },
      
      // 상품 이미지 파일명 필드
      img: {
        type: Sequelize.STRING(200),   // VARCHAR(200) - 이미지 파일명 저장
        allowNull: true,               // NULL 값 허용 (이미지가 없는 경우)
      },
      
      // 경매 시작가 필드
      price: {
        type: Sequelize.INTEGER,       // INT - 정수형
        allowNull: false,              // NULL 값 허용하지 않음
        defaultValue: 0,               // 기본값 0 (무료 경매도 가능)
      },
    }, {
      // 모델 설정 옵션
      sequelize,                       // Sequelize 인스턴스
      timestamps: true,                // createdAt, updatedAt 자동 생성
      paranoid: true,                  // deletedAt 필드로 소프트 삭제 지원
      modelName: 'Good',               // Sequelize 내부에서 사용할 모델명
      tableName: 'goods',              // 실제 데이터베이스 테이블명
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
    // Good은 하나의 User(소유자)를 가짐 (N:1 관계)
    // 상품을 등록한 사용자
    db.Good.belongsTo(db.User, { 
      foreignKey: 'OwnerId',           // 외래키 필드명
      as: 'Owner'                     // 관계 별칭 (사용 시: good.Owner)
    });
    
    // Good은 하나의 User(낙찰자)를 가질 수 있음 (N:1 관계)
    // 경매가 종료되어 낙찰받은 사용자 (경매 진행 중에는 NULL)
    db.Good.belongsTo(db.User, { 
      foreignKey: 'SoldId',            // 외래키 필드명
      as: 'Winner'                    // 관계 별칭 (사용 시: good.Winner)
    });
    
    // Good은 여러 개의 Auction을 가질 수 있음 (1:N 관계)
    // 한 상품에 여러 번의 입찰이 발생할 수 있음
    db.Good.hasMany(db.Auction, {
      foreignKey: 'GoodId',            // 외래키 필드명
      as: 'Auctions'                  // 관계 별칭 (사용 시: good.Auctions)
    });
  }
};

module.exports = Good; // Good 모델 내보내기
