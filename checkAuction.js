const schedule = require('node-schedule');                // 작업 스케줄링 라이브러리
const { Good, Auction, User, sequelize } = require('./models'); // 데이터베이스 모델들

/**
 * 경매 상태 확인 및 자동 낙찰 처리 스케줄러
 * 24시간이 지난 경매를 자동으로 종료하고 낙찰자를 결정
 */
const checkAuction = () => {
  console.log('Auction check scheduler started');         // 스케줄러 시작 로그
  
  // 매시간 실행되는 작업 스케줄링 (더 자주 확인)
  const job = schedule.scheduleJob('0 * * * *', async () => {
    try {
      console.log('Checking for ended auctions...');      // 경매 확인 시작 로그
      
      // 24시간 전 시간 계산 (경매 종료 기준)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);         // 어제 날짜로 설정
      
      // 24시간이 지났지만 아직 낙찰되지 않은 상품들을 조회
      const targets = await Good.findAll({
        where: {
          SoldId: null,                                   // 아직 낙찰되지 않은 상품
          createdAt: { [require('sequelize').Op.lt]: yesterday } // 24시간 이전에 등록된 상품
        },
      });
      
      console.log(`Found ${targets.length} ended auctions`); // 종료된 경매 수 로그
      
      // 각 종료된 경매에 대해 낙찰 처리
      for (const target of targets) {
        try {
          // 상품이 이미 낙찰되었는지 확인
          if (target.SoldId) {
            console.log(`Auction ${target.id} already sold, skipping`);
            continue;
          }
          
          // 해당 상품의 최고 입찰가를 가진 입찰 정보 조회
          const success = await Auction.findOne({
            where: { GoodId: target.id },
            order: [['bid', 'DESC']],                     // 입찰가 내림차순 정렬 (최고가 우선)
          });
          
          if (success) {
            // 입찰이 있는 경우 - 낙찰 처리
            console.log(`Auction ${target.id} won by user ${success.UserId} with bid ${success.bid}`);
            
            // 상품을 낙찰자에게 할당
            await target.setSold(success.UserId);
            
            // 낙찰자의 보유 자산에서 입찰가 차감
            await User.update({
              money: sequelize.literal(`money - ${success.bid}`), // SQL 리터럴을 사용하여 직접 계산
            }, {
              where: { id: success.UserId },
            });
            
            console.log(`User ${success.UserId} money updated for auction ${target.id}`);
            
          } else {
            // 입찰이 없는 경우 - 경매 무효 처리
            console.log(`Auction ${target.id} had no bids, marking as invalid`);
            
            // 상품을 삭제하거나 무효 상태로 표시
            // await target.destroy(); // 실제 운영에서는 삭제 대신 상태 변경을 권장
          }
          
        } catch (error) {
          // 개별 경매 처리 중 에러 발생 시 로그만 남기고 계속 진행
          console.error(`Error processing auction ${target.id}:`, error);
        }
      }
      
      console.log('Auction check completed');             // 경매 확인 완료 로그
      
    } catch (error) {
      // 전체 작업 중 에러 발생 시 로그
      console.error('Auction check error:', error);
    }
  });
  
  // 스케줄 작업 에러 처리
  job.on('error', (err) => {
    console.error('Auction check scheduler error:', err);
  });
  
  // 스케줄 작업 성공 로그
  job.on('success', () => {
    console.log('Auction check scheduler executed successfully');
  });
  
  // 스케줄 작업 정보 로그
  console.log('Next auction check scheduled for:', job.nextInvocation());
};

module.exports = checkAuction;                           // 함수 내보내기
