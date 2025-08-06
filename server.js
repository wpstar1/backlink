const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const TelegramBot = require('node-telegram-bot-api');

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());

// sitemap.xml을 올바른 Content-Type으로 제공
app.get('/sitemap.xml', (req, res) => {
    res.set('Content-Type', 'application/xml');
    res.sendFile(path.join(__dirname, 'sitemap.xml'));
});

// robots.txt를 올바른 Content-Type으로 제공
app.get('/robots.txt', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.sendFile(path.join(__dirname, 'robots.txt'));
});

app.use(express.static('.'));

// 데이터 저장 경로
const DATA_DIR = './data';
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// 데이터 디렉토리 생성
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// 주문 데이터 파일 초기화
if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([]));
}

// 설정 파일 불러오기
let CONFIG;
try {
    CONFIG = require('./config.js');
} catch (error) {
    console.error('config.js 파일을 찾을 수 없습니다. config.example.js를 참고하여 config.js를 생성해주세요.');
    process.exit(1);
}

// 텔레그램 봇 초기화
let telegramBot = null;
if (CONFIG.telegram.token && CONFIG.telegram.token !== 'YOUR_TELEGRAM_BOT_TOKEN') {
    try {
        telegramBot = new TelegramBot(CONFIG.telegram.token, { polling: false });
        console.log('텔레그램 봇이 성공적으로 초기화되었습니다.');
    } catch (error) {
        console.error('텔레그램 봇 초기화 실패:', error);
    }
}

// 이메일 전송 설정
const emailTransporter = nodemailer.createTransport(CONFIG.email);

// 상품 정보
const products = {
    'profile-60': {
        name: '프로필 백링크 60개',
        price: '5만원',
        originalPrice: '10만원',
        description: 'DA 80+ 권위 사이트 60개, 100% 수작업, 상세 보고서 제공'
    },
    'profile-125': {
        name: '프로필 백링크 125개',
        price: '8만원',
        originalPrice: '20만원',
        description: 'DA 80+ 권위 사이트 125개, 더 빠른 순위 상승, 상세 보고서 제공'
    },
    'profile-240': {
        name: '프로필 백링크 240개',
        price: '15만원',
        originalPrice: '40만원',
        description: 'DA 80+ 권위 사이트 240개, 최고의 순위 상승 효과, 상세 보고서 제공'
    },
    'web20-1000': {
        name: '웹2.0 백링크 스타터 패키지',
        price: '5만원',
        description: '백링크 1,000개, DA 30~70 사이트, 100% 수동 작업'
    },
    'web20-2500': {
        name: '웹2.0 백링크 프로페셔널 패키지',
        price: '10만원',
        description: '백링크 2,500개, 개당 40원의 파격 가격, 분산 IP 호스팅'
    },
    'web20-5000': {
        name: '웹2.0 백링크 엔터프라이즈 패키지',
        price: '18만원',
        description: '백링크 5,000개, 개당 36원 최고 가성비, 완벽한 안전성'
    },
    'domain-30': {
        name: '도메인 권한 상승 베이직 패키지',
        price: '5만원',
        description: '도메인 권한 +30점, 랭킹 변화 즉시 체감, 영구적 효과'
    },
    'domain-40': {
        name: '도메인 권한 상승 프리미엄 패키지',
        price: '15만원',
        description: '도메인 권한 +40점, 경쟁사 압도 시작, 구글 최적화'
    },
    'domain-50': {
        name: '도메인 권한 상승 엔터프라이즈 패키지',
        price: '20만원',
        description: '도메인 권한 +50점, 업계 상위권 진입, 만족도 100%'
    },
    'program-10000': {
        name: '프로그램 백링크 스타터 패키지',
        price: '7만원',
        description: '백링크 10,000개, 작업기간: 약 4일, 서브 홈페이지 무료 제작'
    },
    'program-30000': {
        name: '프로그램 백링크 프로페셔널 패키지',
        price: '10만원',
        description: '백링크 30,000개, 작업기간: 약 7일, 빠른 순위 상승'
    },
    'program-70000': {
        name: '프로그램 백링크 프리미엄 패키지',
        price: '20만원',
        description: '백링크 70,000개, 작업기간: 약 10일, 도메인 권한 +30 보너스'
    }
};

// 주문 데이터 읽기
function readOrders() {
    try {
        const data = fs.readFileSync(ORDERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('주문 데이터 읽기 오류:', error);
        return [];
    }
}

// 주문 데이터 저장
function saveOrders(orders) {
    try {
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
        return true;
    } catch (error) {
        console.error('주문 데이터 저장 오류:', error);
        return false;
    }
}

// 주문 번호 생성
function generateOrderNumber() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `BL${year}${month}${day}${random}`;
}

// 텔레그램 메시지 전송
async function sendTelegramMessage(message) {
    if (!telegramBot) {
        console.log('텔레그램 봇이 설정되지 않았습니다.');
        return false;
    }
    
    try {
        await telegramBot.sendMessage(CONFIG.telegram.chatId, message, {
            parse_mode: 'HTML'
        });
        return true;
    } catch (error) {
        console.error('텔레그램 메시지 전송 오류:', error);
        return false;
    }
}

// 이메일 전송
async function sendEmail(to, subject, html) {
    try {
        await emailTransporter.sendMail({
            from: CONFIG.email.auth.user,
            to: to,
            subject: subject,
            html: html
        });
        return true;
    } catch (error) {
        console.error('이메일 전송 오류:', error);
        return false;
    }
}

// 주문 텔레그램 알림 메시지 생성
function createOrderTelegramMessage(order) {
    const product = products[order.product];
    
    let message = `
🚀 <b>새로운 백링크 주문 접수</b>

📋 <b>주문 정보:</b>
• 주문번호: ${order.orderNumber}
• 상품명: ${product.name}
• 가격: ${product.price}

🌐 <b>고객 정보:</b>
• 웹사이트: ${order.website}`;

    // 키워드가 있는 경우에만 표시
    if (order.keywords) {
        message += `\n• 키워드: ${order.keywords}`;
    }
    
    message += `\n• 이메일: ${order.email}

💰 <b>입금 계좌:</b>
${CONFIG.bankAccount.bank} ${CONFIG.bankAccount.account} (${CONFIG.bankAccount.holder})

⏰ 주문 시간: ${new Date(order.timestamp).toLocaleString('ko-KR')}`;

    return message.trim();
}

// 보고서 이메일 HTML 생성
function createReportEmailHTML(order, reportData) {
    const product = products[order.product];
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>백링크 작업 완료 보고서</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; }
        .highlight { background: #e3f2fd; padding: 10px; border-radius: 5px; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 백링크 작업 완료 보고서</h1>
            <p>주문번호: ${order.orderNumber}</p>
        </div>
        
        <div class="content">
            <h2>📋 주문 정보</h2>
            <div class="highlight">
                <p><strong>상품명:</strong> ${product.name}</p>
                <p><strong>웹사이트:</strong> ${order.website}</p>
                <p><strong>타겟 키워드:</strong> ${order.keywords}</p>
                <p><strong>작업 완료일:</strong> ${new Date().toLocaleDateString('ko-KR')}</p>
            </div>
            
            <h2>📊 작업 결과</h2>
            <p>요청하신 백링크 작업이 성공적으로 완료되었습니다.</p>
            
            <h2>📝 상세 보고서</h2>
            <p>작업된 모든 백링크 URL과 상세 정보는 첨부된 보고서를 확인해주세요.</p>
            
            <h2>📞 문의사항</h2>
            <p>작업 결과에 대한 문의사항이 있으시면 언제든지 연락주세요.</p>
        </div>
        
        <div class="footer">
            <p>© 2024 워프스타 백링크 서비스</p>
        </div>
    </div>
</body>
</html>
    `;
}

// API 라우트

// 주문 생성
app.post('/api/orders', async (req, res) => {
    try {
        const { product, website, keywords, email, timestamp } = req.body;
        
        // 유효성 검사
        if (!product || !website || !email) {
            return res.status(400).json({ error: '필수 항목이 누락되었습니다.' });
        }
        
        // 도메인 권한 상승이 아닌 경우 키워드 필수
        if (!product.startsWith('domain-') && !keywords) {
            return res.status(400).json({ error: '키워드가 필요합니다.' });
        }
        
        if (!products[product]) {
            return res.status(400).json({ error: '유효하지 않은 상품입니다.' });
        }
        
        // 주문 데이터 생성
        const orderNumber = generateOrderNumber();
        const order = {
            id: uuidv4(),
            orderNumber,
            product,
            website,
            keywords: keywords || '', // 키워드가 없을 수도 있음
            email,
            timestamp,
            status: 'pending', // pending, paid, processing, completed
            createdAt: new Date().toISOString()
        };
        
        // 주문 저장
        const orders = readOrders();
        orders.push(order);
        
        if (saveOrders(orders)) {
            // 텔레그램 알림 전송
            const telegramMessage = createOrderTelegramMessage(order);
            await sendTelegramMessage(telegramMessage);
            
            res.json({ 
                success: true, 
                orderNumber: orderNumber,
                message: '주문이 성공적으로 접수되었습니다.' 
            });
        } else {
            res.status(500).json({ error: '주문 저장 중 오류가 발생했습니다.' });
        }
        
    } catch (error) {
        console.error('주문 생성 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 주문 목록 조회 (관리자용)
app.get('/api/orders', (req, res) => {
    try {
        const orders = readOrders();
        res.json(orders);
    } catch (error) {
        console.error('주문 목록 조회 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 주문 상태 업데이트 (관리자용)
app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const orders = readOrders();
        const orderIndex = orders.findIndex(order => order.id === id);
        
        if (orderIndex === -1) {
            return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
        }
        
        orders[orderIndex].status = status;
        orders[orderIndex].updatedAt = new Date().toISOString();
        
        if (saveOrders(orders)) {
            // 상태가 완료로 변경되면 이메일 보고서 전송
            if (status === 'completed') {
                const order = orders[orderIndex];
                const reportHTML = createReportEmailHTML(order, {});
                await sendEmail(
                    order.email,
                    `[워프스타] 백링크 작업 완료 보고서 - ${order.orderNumber}`,
                    reportHTML
                );
            }
            
            res.json({ success: true, message: '주문 상태가 업데이트되었습니다.' });
        } else {
            res.status(500).json({ error: '주문 상태 업데이트 중 오류가 발생했습니다.' });
        }
        
    } catch (error) {
        console.error('주문 상태 업데이트 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 관리자 페이지 (간단한 주문 관리)
app.get('/admin', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>백링크 주문 관리</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .status-pending { color: orange; }
        .status-paid { color: blue; }
        .status-processing { color: purple; }
        .status-completed { color: green; }
    </style>
</head>
<body>
    <h1>백링크 주문 관리</h1>
    <div id="orders"></div>
    
    <script>
        async function loadOrders() {
            const response = await fetch('/api/orders');
            const orders = await response.json();
            
            const html = \`
                <table>
                    <tr>
                        <th>주문번호</th>
                        <th>상품</th>
                        <th>웹사이트</th>
                        <th>이메일</th>
                        <th>상태</th>
                        <th>주문일</th>
                        <th>액션</th>
                    </tr>
                    \${orders.map(order => \`
                        <tr>
                            <td>\${order.orderNumber}</td>
                            <td>\${order.product}</td>
                            <td>\${order.website}</td>
                            <td>\${order.email}</td>
                            <td class="status-\${order.status}">\${order.status}</td>
                            <td>\${new Date(order.timestamp).toLocaleDateString('ko-KR')}</td>
                            <td>
                                <select onchange="updateStatus('\${order.id}', this.value)">
                                    <option value="pending" \${order.status === 'pending' ? 'selected' : ''}>대기</option>
                                    <option value="paid" \${order.status === 'paid' ? 'selected' : ''}>입금확인</option>
                                    <option value="processing" \${order.status === 'processing' ? 'selected' : ''}>작업중</option>
                                    <option value="completed" \${order.status === 'completed' ? 'selected' : ''}>완료</option>
                                </select>
                            </td>
                        </tr>
                    \`).join('')}
                </table>
            \`;
            
            document.getElementById('orders').innerHTML = html;
        }
        
        async function updateStatus(id, status) {
            const response = await fetch(\`/api/orders/\${id}/status\`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            
            if (response.ok) {
                alert('상태가 업데이트되었습니다.');
                loadOrders();
            } else {
                alert('상태 업데이트에 실패했습니다.');
            }
        }
        
        loadOrders();
        setInterval(loadOrders, 30000); // 30초마다 새로고침
    </script>
</body>
</html>
    `);
});

// 서버 시작
app.listen(CONFIG.port, () => {
    console.log(`서버가 포트 ${CONFIG.port}에서 실행 중입니다.`);
    console.log(`웹사이트: http://localhost:${CONFIG.port}`);
    console.log(`관리자 페이지: http://localhost:${CONFIG.port}/admin`);
});

module.exports = app; 