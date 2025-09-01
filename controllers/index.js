const {Op} = require('sequelize');                    // Sequelize 연산자 (비교 연산 등)
const {Good, Auction, User, sequelize} = require('../models'); // 데이터베이스 모델들
const schedule = require('node-schedule');              // 작업 스케줄링 라이브러리

/**
 * 메인 페이지 렌더링 함수
 * 현재 진행 중인 경매 상품 목록을 조회하여 표시
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 * @param {Function} next - Express 다음 미들웨어 함수
 */
exports.renderMain = async (req, res, next) => {
    try {
        // 24시간 전 시간 계산 (경매 종료 기준)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1); // Yesterday

        // 진행 중인 경매 상품 조회 (24시간 이내에 등록된 상품)
        const goods = await Good.findAll({
            where: {
                SoldId: null,                    // 아직 낙찰되지 않은 상품
                createdAt: {[Op.gte]: yesterday} // 24시간 이내 등록
            },
        });

        // 메인 페이지 렌더링 (상품 목록과 함께)
        res.render('main', {
            title: 'NodeAuction',
            goods, // 조회된 상품 목록을 템플릿에 전달
        });

    } catch (error) {
        console.error(error);
        next(error); // 에러를 Express 에러 핸들러로 전달
    }
};

/**
 * 회원가입 페이지 렌더링 함수
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 */
exports.renderJoin = (req, res) => {
    res.render('join', {
        title: 'Sign Up - NodeAuction',
    });
};

/**
 * 상품 등록 페이지 렌더링 함수
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 */
exports.renderGood = (req, res) => {
    res.render('good', {title: 'Register Product - NodeAuction'});
};

/**
 * 관리자 대시보드 페이지 렌더링 함수
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 */
exports.renderDashboard = (req, res) => {
    res.render('dashboard', {title: 'Admin Dashboard- NodeAuction'});
};

/**
 * 상품 등록 처리 함수
 * 사용자가 입력한 상품 정보를 데이터베이스에 저장
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 * @param {Function} next - Express 다음 미들웨어 함수
 */
exports.createGood = async (req, res, next) => {
    try {
        // 요청 본문에서 상품 정보 추출
        const {name, price} = req.body;

        // 새로운 상품 생성 및 데이터베이스에 저장
        const good = await Good.create({
            OwnerId: req.user.id,    // 상품 등록자 ID (현재 로그인한 사용자)
            name,                     // 상품명
            img: req.file.filename,  // 업로드된 이미지 파일명
            price,                    // 경매 시작가
        });

        // 경매 종료 시간 설정 (24시간 후)
        const end = new Date();
        end.setDate(end.getDate() + 1); // 24시간 후

        // 경매 종료 시 자동 처리 작업 스케줄링
        const job = schedule.scheduleJob(end, async () => {
            try {
                // 상품이 이미 낙찰되었는지 확인
                const currentGood = await Good.findByPk(good.id);
                if (currentGood.SoldId) {
                    console.log(`Auction ${good.id} already sold, skipping`);
                    return;
                }

                // 해당 상품의 최고 입찰가 조회
                const success = await Auction.findOne({
                    where: {GoodId: good.id},
                    order: [['bid', 'DESC']], // 입찰가 내림차순 정렬
                });

                if (success) {
                    // 상품을 낙찰자에게 할당
                    await currentGood.setSold(success.UserId);

                    // 낙찰자의 보유 자산에서 입찰가 차감
                    await User.update({
                        money: sequelize.literal(`money - ${success.bid}`),
                    }, {
                        where: {id: success.UserId},
                    });

                    console.log(`Auction ${good.id} completed: User ${success.UserId} won with bid ${success.bid}`);
                } else {
                    console.log(`Auction ${good.id} ended with no bids`);
                }
            } catch (error) {
                console.error(`Error processing auction ${good.id}:`, error);
            }
        });

        // 스케줄 작업 에러 처리
        job.on('error', (err) => {
            console.error('Scheduling Error', err);
        });

        // 스케줄 작업 성공 로그
        job.on('success', () => {
            console.log('Scheduling Success');
        });

        // 상품 등록 성공 시 메인 페이지로 리다이렉트
        res.redirect('/');

    } catch (error) {
        console.error(error);
        next(error); // 에러를 Express 에러 핸들러로 전달
    }
};

/**
 * 경매 상세 페이지 렌더링 함수
 * 특정 상품의 상세 정보와 입찰 현황을 조회하여 표시
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 * @param {Function} next - Express 다음 미들웨어 함수
 */
exports.renderAuction = async (req, res, next) => {
    try {
        // 상품 정보와 입찰 현황을 병렬로 조회
        const [good, auction] = await Promise.all([
            // 상품 정보 조회 (소유자 정보 포함)
            Good.findOne({
                where: {id: req.params.id},
                include: {
                    model: User,
                    as: 'Owner', // 소유자 정보
                },
            }),

            // 입찰 현황 조회 (입찰자 정보 포함)
            Auction.findAll({
                where: {GoodId: req.params.id},
                include: {
                    model: User,
                    as: 'User' // 입찰자 정보 (models/auction.js에서 정의된 alias)
                },
                order: [['bid', 'ASC']], // 입찰가 오름차순 정렬
            }),
        ]);

        // 경매 상세 페이지 렌더링
        res.render('auction', {
            title: `${good.name} - NodeAuction`,
            good,     // 상품 정보
            auction,  // 입찰 현황
        });

    } catch (error) {
        console.error(error);
        next(error); // 에러를 Express 에러 핸들러로 전달
    }
};

/**
 * 입찰 처리 함수
 * 사용자의 입찰 정보를 검증하고 데이터베이스에 저장
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 * @param {Function} next - Express 다음 미들웨어 함수
 */
exports.bid = async (req, res, next) => {
    try {
        // 요청 본문에서 입찰 정보 추출
        const {bid, msg} = req.body;

        // 상품 정보와 입찰 현황 조회
        const good = await Good.findOne({
            where: {id: req.params.id},
            include: {model: Auction, as: 'Auctions'},
            order: [[{model: Auction, as: 'Auctions'}, 'bid', 'DESC']], // 최고 입찰가 순으로 정렬
        });

        // 상품 존재 여부 확인
        if (!good) {
            return res.status(404).send('Product does not exist.');
        }

        // 입찰가가 시작가보다 높은지 확인
        if (good.price >= bid) {
            return res.status(403).send('Bid must be higher than starting price.');
        }

        // 경매 종료 시간 계산 (24시간 후)
        const auctionEndTime = new Date(good.createdAt);
        auctionEndTime.setDate(auctionEndTime.getDate() + 1);

        // 경매가 이미 종료되었는지 확인
        if (new Date() > auctionEndTime) {
            return res.status(403).send('Auction has already ended.');
        }

        // 이전 최고 입찰가보다 높은지 확인
        if (good.Auctions[0]?.bid >= bid) {
            return res.status(403).send('Bid must be higher than previous bid.');
        }

        // 새로운 입찰 정보 생성 및 데이터베이스에 저장
        const result = await Auction.create({
            bid,                    // 입찰가
            msg,                    // 입찰 메시지
            UserId: req.user.id,    // 입찰자 ID
            GoodId: req.params.id,  // 상품 ID
        });

        // 실시간 입찰 업데이트 전송 (Socket.IO)
        req.app.get('io').to(req.params.id).emit('bid', {
            bid: result.bid,
            msg: result.msg,
            nick: req.user.nick,
        });

        // 입찰 성공 응답
        return res.send('ok');

    } catch (error) {
        console.error(error);
        return next(error); // 에러를 Express 에러 핸들러로 전달
    }
};

/**
 * 경매 결과 페이지 렌더링 함수
 * 종료된 경매와 낙찰 결과를 조회하여 표시
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 * @param {Function} next - Express 다음 미들웨어 함수
 */
exports.renderList = async (req, res, next) => {
    try {
        // 24시간 전 시간 계산 (경매 종료 기준)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        // 종료된 경매 상품 목록 조회 (24시간 이전에 등록된 상품들)
        const goods = await Good.findAll({
            where: {
                createdAt: {[Op.lt]: yesterday} // 24시간 이전에 등록된 상품 (종료된 경매)
            },
            include: [
                {
                    model: Auction,
                    as: 'Auctions',    // 입찰 정보 포함
                    include: [{model: User, as: 'User'}] // 입찰자 정보 포함
                },
                {model: User, as: 'Owner'},          // 상품 등록자 정보
                {model: User, as: 'Winner'}          // 낙찰자 정보 (있는 경우)
            ],
            order: [['createdAt', 'DESC']], // 등록일 내림차순 정렬 (최신 경매부터)
        });

        // 각 상품에 대해 경매 상태와 최고 입찰가 정보 추가
        const goodsWithStatus = goods.map(good => {
            const highestBid = good.Auctions && good.Auctions.length > 0
                ? good.Auctions.reduce((max, auction) => auction.bid > max.bid ? auction : max)
                : null;

            return {
                ...good.toJSON(),
                highestBid,
                status: good.SoldId ? 'sold' : (highestBid ? 'ended_no_winner' : 'no_bids')
            };
        });

        // 경매 결과 페이지 렌더링
        res.render('list', {
            title: '경매 결과 - NodeAuction',
            goods: goodsWithStatus // 종료된 경매 목록을 템플릿에 전달
        });

    } catch (error) {
        console.error(error);
        next(error); // 에러를 Express 에러 핸들러로 전달
    }
};