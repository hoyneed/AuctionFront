const SocketIO = require('socket.io');                   // Socket.IO 라이브러리

/**
 * WebSocket 서버 설정 및 실시간 통신 관리
 * 경매 입찰 시 실시간으로 모든 참여자에게 업데이트를 전송
 * @param {Object} server - HTTP 서버 인스턴스
 * @param {Object} app - Express 애플리케이션 인스턴스
 */
module.exports = (server, app) => {
  // Socket.IO 서버 인스턴스 생성
  const io = SocketIO(server, { 
    path: '/socket.io'                                   // WebSocket 연결 경로 설정
  });
  
  // Express 앱에 Socket.IO 인스턴스를 저장하여 컨트롤러에서 접근 가능하도록 함
  app.set('io', io);
  
  /**
   * WebSocket 연결 이벤트 처리
   * 클라이언트가 WebSocket에 연결할 때마다 호출
   */
  io.on('connection', (socket) => {
    // 웹 소켓 연결 시
    
    // 클라이언트의 HTTP 요청 정보 가져오기
    const req = socket.request;
    
    // HTTP 요청의 referer 헤더에서 현재 페이지 URL 추출
    const { headers: { referer } } = req;
    
    // URL에서 경매 상품 ID 추출 (예: /good/123 → 123)
    const roomId = new URL(referer).pathname.split('/').at(-1);
    
    // 해당 경매 상품의 방(room)에 참가
    // 같은 경매에 참여하는 모든 사용자들이 같은 방에 속하게 됨
    socket.join(roomId);
    
    /**
     * WebSocket 연결 해제 이벤트 처리
     * 클라이언트가 연결을 끊을 때 호출
     */
    socket.on('disconnect', () => {
      // 연결이 해제되면 해당 방에서 나가기
      socket.leave(roomId);
    });
  });
};
