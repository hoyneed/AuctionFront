const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development'; // 환경 설정 (개발/테스트/운영)
const fs = require('fs');                          // 파일 시스템 접근
const path = require('path');                      // 파일 경로 처리
const config = require('../config/config')[env];   // 환경별 데이터베이스 설정 로드

const db = {}; // 모든 모델을 저장할 객체

// Sequelize 인스턴스 생성 (데이터베이스 연결)
const sequelize = new Sequelize(
  config.database,    // 데이터베이스명: "auction"
  config.username,    
  config.password,    
  config             // 전체 설정 객체 (host, dialect 등)
);

// sequelize 인스턴스를 db 객체에 저장
db.sequelize = sequelize;

const basename = path.basename(__filename); // 현재 파일명 (index.js)
// models 폴더 내의 모든 모델 파일을 자동으로 로드
fs
  .readdirSync(__dirname) // 현재 폴더의 모든 파일을 조회
  .filter(file => { // 파일 필터링 조건
    return (file.indexOf('.') !== 0) &&           // 숨김 파일 제외 (.으로 시작하는 파일)
           (file !== basename) &&                  // index.js 파일 제외
           (file.slice(-3) === '.js');            // .js 확장자만 포함
  })
  .forEach(file => { // 필터링된 각 모델 파일에 대해
    const model = require(path.join(__dirname, file)); // 모델 파일 로드
    console.log(file, model.name);                    // 로드된 모델명 출력 (디버깅용)
    db[model.name] = model;                           // db 객체에 모델 저장
    model.initiate(sequelize);                        // 모델 초기화 (Sequelize에 등록)
  });

// 모든 모델 간의 관계(association) 설정
Object.keys(db).forEach(modelName => { // db 객체의 모든 모델명에 대해
  if (db[modelName].associate) {       // associate 메서드가 존재하면
    db[modelName].associate(db);       // 관계 설정 메서드 호출
  }
});

module.exports = db; // 설정된 모든 모델과 sequelize 인스턴스를 포함한 db 객체 내보내기
