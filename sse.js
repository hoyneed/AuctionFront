const SSE = require('sse');                               // Server-Sent Events 라이브러리

/**
 * Server-Sent Events (SSE) 설정
 * 클라이언트에게 서버에서 실시간으로 데이터를 푸시하는 기능
 * 경매 시간 업데이트 등에 사용
 * @param {Object} server - HTTP 서버 인스턴스
 */
module.exports = (server) => {
  // SSE 서버 인스턴스 생성
  const sse = new SSE(server);
  
  /**
   * SSE 연결 이벤트 처리
   * 클라이언트가 SSE 연결을 요청할 때마다 호출
   * @param {Object} client - SSE 클라이언트 연결 객체
   */
  sse.on('connection', (client) => {
    // 서버센트이벤트 연결
    /**
     * 1초마다 클라이언트에게 현재 시간을 전송
     * 이는 클라이언트에서 경매 남은 시간을 실시간으로 업데이트하는 데 사용됨
     */
    setInterval(() => {
      // 현재 시간을 밀리초 단위로 전송
      client.send(Date.now().toString());
    }, 1000); // 1000ms = 1초 간격
  });
};
