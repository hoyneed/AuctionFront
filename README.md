# 🏆 Node Auction - 실시간 경매 시스템

Node.js와 Express.js를 기반으로 한 실시간 경매 웹 애플리케이션입니다. 사용자들이 상품을 등록하고 실시간으로 입찰할 수 있는 플랫폼을 제공합니다.

## ✨ 주요 기능

### 🔐 사용자 인증
- **회원가입/로그인**: Passport.js 기반 인증 시스템
- **세션 관리**: Express Session을 통한 사용자 상태 유지
- **보안**: 쿠키 서명 및 세션 암호화

### 🛍️ 경매 시스템
- **상품 등록**: 이미지 업로드와 함께 상품 정보 등록
- **실시간 입찰**: Socket.IO를 통한 실시간 입찰 업데이트
- **자동 낙찰**: 24시간 후 자동 낙찰 처리
- **경매 상태 관리**: 진행 중/종료/낙찰 완료 상태 구분

### 📊 경매 관리
- **진행 중인 경매**: 메인 페이지에서 현재 진행 중인 경매 목록
- **경매 결과**: 종료된 경매와 낙찰 결과 확인
- **입찰 내역**: 상세한 입찰 현황 및 입찰자 정보

### 💰 자산 관리
- **보유 자산**: 사용자별 보유 자산 관리
- **자동 차감**: 낙찰 시 자동으로 입찰가 차감

## 🛠️ 기술 스택

### Backend
- **Node.js**: 서버 런타임 환경
- **Express.js**: 웹 프레임워크
- **Sequelize**: ORM (Object-Relational Mapping)
- **MySQL**: 데이터베이스
- **Passport.js**: 인증 미들웨어
- **Socket.IO**: 실시간 통신
- **Multer**: 파일 업로드 처리
- **node-schedule**: 작업 스케줄링

### Frontend
- **Nunjucks**: 템플릿 엔진
- **Tailwind CSS**: CSS 프레임워크
- **JavaScript**: 클라이언트 사이드 로직

### 개발 도구
- **Morgan**: HTTP 요청 로깅
- **dotenv**: 환경변수 관리
- **cookie-parser**: 쿠키 파싱

## 📁 프로젝트 구조

```
node-auction/
├── app.js                 # 메인 애플리케이션 파일
├── checkAuction.js        # 경매 상태 확인 스케줄러
├── socket.js              # Socket.IO 설정
├── sse.js                 # Server-Sent Events 설정
├── package.json           # 프로젝트 의존성
├── config/
│   └── config.json        # 데이터베이스 설정
├── controllers/
│   ├── index.js           # 메인 컨트롤러
│   └── auth.js            # 인증 컨트롤러
├── middlewares/
│   └── index.js           # 미들웨어 정의
├── models/
│   ├── index.js           # 모델 초기화
│   ├── user.js            # 사용자 모델
│   ├── good.js            # 상품 모델
│   └── auction.js         # 입찰 모델
├── passport/
│   ├── index.js           # Passport 설정
│   └── localStrategy.js   # 로컬 인증 전략
├── routes/
│   ├── index.js           # 메인 라우터
│   └── auth.js            # 인증 라우터
├── views/                 # 템플릿 파일들
│   ├── layout.html        # 기본 레이아웃
│   ├── main.html          # 메인 페이지
│   ├── auction.html       # 경매 상세 페이지
│   ├── list.html          # 경매 결과 페이지
│   ├── good.html          # 상품 등록 페이지
│   ├── join.html          # 회원가입 페이지
│   └── error.html         # 에러 페이지
├── public/
│   ├── main.css           # 스타일시트
│   └── default-image.svg  # 기본 이미지
└── uploads/               # 업로드된 이미지 저장소
```

## 🚀 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone https://github.com/tommykim/AuctionFront.git
cd AuctionFront
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경변수 설정
`.env` 파일을 생성하고 다음 내용을 추가하세요:
```env
COOKIE_SECRET=your_cookie_secret_here
NODE_ENV=development
PORT=8010
```

### 4. 데이터베이스 설정
`config/config.json` 파일에서 MySQL 데이터베이스 설정을 확인하세요:
```json
{
  "development": {
    "username": "root",
    "password": "0000",
    "database": "auction",
    "host": "localhost",
    "dialect": "mysql"
  }
}
```

### 5. 데이터베이스 생성
MySQL에서 `auction` 데이터베이스를 생성하세요:
```sql
CREATE DATABASE auction CHARACTER SET utf8 COLLATE utf8_general_ci;
```

### 6. 애플리케이션 실행
```bash
npm start
```

서버가 성공적으로 시작되면 `http://localhost:8010`에서 애플리케이션에 접근할 수 있습니다.

## 📋 사용 방법

### 1. 회원가입
- `/join` 페이지에서 새 계정을 생성하세요
- 사용자명, 비밀번호, 닉네임을 입력하세요

### 2. 상품 등록
- 로그인 후 `/good` 페이지에서 상품을 등록하세요
- 상품명, 시작가, 이미지를 업로드하세요
- 경매는 24시간 동안 진행됩니다

### 3. 입찰 참여
- 메인 페이지에서 진행 중인 경매를 확인하세요
- 경매 상세 페이지에서 입찰가와 메시지를 입력하세요
- 실시간으로 입찰 현황이 업데이트됩니다

### 4. 경매 결과 확인
- `/list` 페이지에서 종료된 경매와 낙찰 결과를 확인하세요
- 낙찰 완료, 낙찰 대기, 입찰 없음 상태를 구분할 수 있습니다

## 🔧 주요 API 엔드포인트

### 인증 관련
- `GET /auth/join` - 회원가입 페이지
- `POST /auth/join` - 회원가입 처리
- `GET /auth/login` - 로그인 페이지
- `POST /auth/login` - 로그인 처리
- `GET /auth/logout` - 로그아웃

### 경매 관련
- `GET /` - 메인 페이지 (진행 중인 경매 목록)
- `GET /good` - 상품 등록 페이지
- `POST /good` - 상품 등록 처리
- `GET /good/:id` - 경매 상세 페이지
- `POST /good/:id/bid` - 입찰 처리
- `GET /list` - 경매 결과 페이지

## 🗄️ 데이터베이스 스키마

### Users 테이블
- `id`: 사용자 ID (Primary Key)
- `email`: 이메일
- `nick`: 닉네임
- `password`: 암호화된 비밀번호
- `money`: 보유 자산
- `createdAt`, `updatedAt`, `deletedAt`: 타임스탬프

### Goods 테이블
- `id`: 상품 ID (Primary Key)
- `name`: 상품명
- `img`: 이미지 파일명
- `price`: 시작가
- `OwnerId`: 등록자 ID (Foreign Key)
- `SoldId`: 낙찰자 ID (Foreign Key)
- `createdAt`, `updatedAt`, `deletedAt`: 타임스탬프

### Auctions 테이블
- `id`: 입찰 ID (Primary Key)
- `bid`: 입찰가
- `msg`: 입찰 메시지
- `UserId`: 입찰자 ID (Foreign Key)
- `GoodId`: 상품 ID (Foreign Key)
- `createdAt`, `updatedAt`, `deletedAt`: 타임스탬프

## ⚙️ 스케줄러 시스템

### 개별 경매 스케줄러
- 상품 등록 시 24시간 후 자동 낙찰 처리
- 최고 입찰자에게 상품 할당
- 낙찰자 자산에서 입찰가 차감

### 전역 경매 확인 스케줄러
- 매시간 실행되어 누락된 경매 확인
- 24시간 이전 등록된 미처리 경매 자동 처리
- 중복 처리 방지 로직 포함

## 🔒 보안 기능

- **비밀번호 암호화**: bcrypt를 통한 비밀번호 해싱
- **세션 보안**: 서명된 쿠키 및 세션 암호화
- **파일 업로드 보안**: 파일 타입 및 크기 제한
- **SQL 인젝션 방지**: Sequelize ORM 사용
- **XSS 방지**: 템플릿 엔진의 자동 이스케이핑

## 🐛 문제 해결

### 경매가 낙찰 처리되지 않는 경우
1. 스케줄러가 정상 실행되는지 확인
2. 서버 재시작으로 인한 스케줄 손실 가능성
3. 수동으로 낙찰 처리 가능

### 이미지가 표시되지 않는 경우
1. `uploads` 폴더 권한 확인
2. 이미지 파일 경로 확인
3. 기본 이미지 설정 확인

### 데이터베이스 연결 오류
1. MySQL 서버 실행 상태 확인
2. 데이터베이스 설정 정보 확인
3. 방화벽 및 포트 설정 확인

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.

---

**Node Auction** - 실시간 경매의 새로운 경험을 제공합니다! 🚀
