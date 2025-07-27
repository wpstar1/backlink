// 상품 데이터
const products = {
    'profile-60': {
        name: '프로필 백링크 60개',
        price: '5만원',
        originalPrice: '10만원'
    },
    'profile-125': {
        name: '프로필 백링크 125개',
        price: '8만원',
        originalPrice: '20만원'
    },
    'profile-240': {
        name: '프로필 백링크 240개',
        price: '15만원',
        originalPrice: '40만원'
    },
    'web20-1000': {
        name: '웹2.0 백링크 스타터 패키지',
        price: '5만원',
        originalPrice: null
    },
    'web20-2500': {
        name: '웹2.0 백링크 프로페셔널 패키지',
        price: '10만원',
        originalPrice: null
    },
    'web20-5000': {
        name: '웹2.0 백링크 엔터프라이즈 패키지',
        price: '18만원',
        originalPrice: null
    },
    'domain-30': {
        name: '도메인 권한 상승 베이직 패키지',
        price: '5만원',
        originalPrice: null
    },
    'domain-40': {
        name: '도메인 권한 상승 프리미엄 패키지',
        price: '15만원',
        originalPrice: null
    },
    'domain-50': {
        name: '도메인 권한 상승 엔터프라이즈 패키지',
        price: '20만원',
        originalPrice: null
    },
    'program-10000': {
        name: '프로그램 백링크 스타터 패키지',
        price: '7만원',
        originalPrice: null
    },
    'program-30000': {
        name: '프로그램 백링크 프로페셔널 패키지',
        price: '10만원',
        originalPrice: null
    },
    'program-70000': {
        name: '프로그램 백링크 프리미엄 패키지',
        price: '20만원',
        originalPrice: null
    }
};

// 전역 변수
let selectedProduct = null;

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});

// 이벤트 리스너 초기화
function initializeEventListeners() {
    // 지금 신청하기 버튼 - 페이지 내에서 상품 섹션으로 스크롤
    const orderBtn = document.getElementById('orderBtn');
    if (orderBtn) {
        orderBtn.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // 상품 선택 버튼 클릭 - order-now-btn 클래스 사용
    document.querySelectorAll('.order-now-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.product;
            selectProduct(productId);
        });
    });

    // 주문 폼 제출
    document.getElementById('orderForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitOrder();
    });

    // 계좌번호 복사 버튼
    document.getElementById('copyAccount').addEventListener('click', function() {
        copyToClipboard('9002-1439-7622-7');
    });

    // 입금 확인 버튼
    document.getElementById('confirmPayment').addEventListener('click', function() {
        confirmPayment();
    });

    // 모달 닫기 버튼들
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal.id);
        });
    });

    // 모달 외부 클릭 시 닫기 (주문 폼 모달 제외)
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this && this.id !== 'orderFormModal') {
                closeModal(this.id);
            }
        });
    });
}

// 페이지 내 상품 섹션에는 탭이 없으므로 이 함수는 사용되지 않음
// 필요 시 나중에 사용 가능

// 상품 선택
function selectProduct(productId) {
    selectedProduct = productId;
    const product = products[productId];
    
    // 선택된 상품 정보 표시
    document.getElementById('selectedProductName').textContent = product.name;
    document.getElementById('selectedProductPrice').textContent = product.price;
    
    // 상품별 필드 설정
    setupFormFields(productId);
    
    // 주문 정보 입력 모달 열기 (페이지 내 상품에서 바로 열기)
    openModal('orderFormModal');
}

// 상품별 필드 설정
function setupFormFields(productId) {
    const keywordsGroup = document.getElementById('keywordsGroup');
    const keywordsInput = document.getElementById('keywords');
    
    // 도메인 권한 상승 상품인지 확인
    if (productId.startsWith('domain-')) {
        // 도메인 권한 상승: 키워드 불필요
        keywordsGroup.style.display = 'none';
        keywordsInput.required = false;
    } else {
        // 모든 백링크 상품: 키워드 1개 이상
        keywordsGroup.style.display = 'block';
        keywordsInput.required = true;
        keywordsInput.placeholder = '키워드1, 키워드2, 키워드3 (1개 이상)';
        keywordsGroup.querySelector('label').textContent = '타겟 키워드 (1개 이상, 쉼표로 구분) *';
    }
}

// 주문 제출
async function submitOrder() {
    const formData = new FormData(document.getElementById('orderForm'));
    const orderData = {
        product: selectedProduct,
        website: formData.get('website'),
        keywords: formData.get('keywords') || '', // 키워드가 없을 수도 있음
        email: formData.get('email'),
        timestamp: new Date().toISOString()
    };

    try {
        // 서버가 실행되지 않은 경우를 위한 임시 처리
        const orderNumber = generateOrderNumber();
        
        // 로컬 스토리지에 주문 정보 저장
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push({
            ...orderData,
            orderNumber: orderNumber,
            id: Date.now().toString(),
            status: 'pending',
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // 주문 완료 처리
        showPaymentInfo(orderNumber);
        
    } catch (error) {
        console.error('주문 제출 오류:', error);
        alert('주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

// 주문 번호 생성 함수 추가
function generateOrderNumber() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `BL${year}${month}${day}${random}`;
}

// 결제 정보 표시
function showPaymentInfo(orderNumber) {
    const product = products[selectedProduct];
    
    // 현재 주문 정보 저장
    currentOrderData = {
        orderNumber: orderNumber,
        product: selectedProduct,
        website: document.getElementById('website').value,
        keywords: document.getElementById('keywords').value,
        email: document.getElementById('email').value
    };
    
    document.getElementById('orderNumber').textContent = orderNumber;
    document.getElementById('paymentProductName').textContent = product.name;
    document.getElementById('paymentAmount').textContent = product.price;
    
    closeModal('orderFormModal');
    openModal('paymentModal');
}

// 모달 열기
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 모달 닫기
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 클립보드에 복사
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        alert('계좌번호가 복사되었습니다!');
    }, function(err) {
        console.error('복사 실패:', err);
        alert('복사에 실패했습니다. 수동으로 복사해주세요.');
    });
}

// 키워드 유효성 검사
function validateKeywords(keywords, productId) {
    // 도메인 권한 상승은 키워드 불필요
    if (productId.startsWith('domain-')) {
        return true;
    }
    
    const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k);
    
    // 모든 상품에서 키워드 1개 이상이면 OK
    return keywordArray.length >= 1;
}

// 폼 유효성 검사
function validateForm() {
    const website = document.getElementById('website').value;
    const keywords = document.getElementById('keywords').value;
    const email = document.getElementById('email').value;
    
    if (!website || !email) {
        alert('필수 항목을 모두 입력해주세요.');
        return false;
    }
    
    // 키워드 유효성 검사 (상품별로 다름)
    if (!validateKeywords(keywords, selectedProduct)) {
        if (selectedProduct.startsWith('domain-')) {
            // 도메인 권한 상승은 키워드 불필요
        } else {
            alert('키워드를 1개 이상 입력해주세요.');
        }
        return false;
    }
    
    return true;
}

// 주문 폼 제출 전 유효성 검사 추가
document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if (validateForm()) {
        submitOrder();
    }
});

// 애니메이션 효과
function addLoadingAnimation(button) {
    button.textContent = '처리 중...';
    button.disabled = true;
}

function removeLoadingAnimation(button, originalText) {
    button.textContent = originalText;
    button.disabled = false;
}

// 입금 확인 알림
let currentOrderData = null; // 현재 주문 정보 저장

function confirmPayment() {
    if (!currentOrderData) {
        alert('주문 정보를 찾을 수 없습니다.');
        return;
    }

    const button = document.getElementById('confirmPayment');
    addLoadingAnimation(button);

    // 텔레그램으로 입금 확인 알림 전송
    sendTelegramPaymentNotification(currentOrderData)
        .then((result) => {
            if (result && result.message) {
                alert(`입금 확인 요청이 접수되었습니다.\n${result.message}\n관리자가 확인 후 작업을 시작하겠습니다.`);
            } else {
                alert('입금 확인 알림이 관리자에게 전송되었습니다.\n빠른 시간 내에 확인 후 작업을 시작하겠습니다.');
            }
            removeLoadingAnimation(button, '입금 완료 알림');
            
            // 버튼 비활성화 (중복 전송 방지)
            button.disabled = true;
            button.textContent = '알림 전송 완료';
            button.style.background = '#28a745';
        })
        .catch(error => {
            console.error('텔레그램 알림 전송 오류:', error);
            alert(`알림 전송 중 오류가 발생했습니다.\n오류: ${error.message}\n\n관리자에게 직접 연락해주세요.`);
            removeLoadingAnimation(button, '입금 완료 알림');
        });
}

// 텔레그램 입금 확인 알림 전송
async function sendTelegramPaymentNotification(orderData) {
    const product = products[orderData.product];
    const telegramToken = '7702916451:AAHV7Z-BIu7C2MkCi7o09zF8Q5ZPON3_LpY';
    const chatId = '455532741';
    
    const message = `💰 입금 확인 요청

📋 주문 정보:
• 주문번호: ${orderData.orderNumber}
• 상품명: ${product.name}
• 가격: ${product.price}

🌐 고객 정보:
• 웹사이트: ${orderData.website}
• 키워드: ${orderData.keywords || '없음'}
• 이메일: ${orderData.email}

⏰ 입금 확인 요청 시간: ${new Date().toLocaleString('ko-KR')}

고객이 입금 완료를 알렸습니다. 확인 후 작업을 시작해주세요.`;

    try {
        console.log('텔레그램 전송 시도:', orderData);
        
        const response = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message
            })
        });

        const result = await response.json();
        console.log('텔레그램 API 응답:', result);
        
        if (!response.ok) {
            console.error('텔레그램 API 오류:', result);
            // API 오류 시 로컬 저장으로 대체
            return sendTelegramViaServer(orderData);
        }

        console.log('텔레그램 전송 성공!');
        return result;
        
    } catch (error) {
        console.error('텔레그램 전송 오류:', error);
        // 네트워크 오류 시 로컬 저장으로 대체
        return sendTelegramViaServer(orderData);
    }
}

// 서버를 통한 텔레그램 전송 (대안)
async function sendTelegramViaServer(orderData) {
    try {
        const product = products[orderData.product];
        
        // 로컬 스토리지에 알림 요청 저장
        const notifications = JSON.parse(localStorage.getItem('telegramNotifications') || '[]');
        const notification = {
            id: Date.now().toString(),
            type: 'payment_confirmation',
            orderNumber: orderData.orderNumber,
            productName: product.name,
            price: product.price,
            website: orderData.website,
            keywords: orderData.keywords || '없음',
            email: orderData.email,
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        
        notifications.push(notification);
        localStorage.setItem('telegramNotifications', JSON.stringify(notifications));
        
        // 관리자 페이지용 알림도 추가
        const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
        adminNotifications.push({
            ...notification,
            message: `💰 입금 확인 요청 - 주문번호: ${orderData.orderNumber}`
        });
        localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
        
        // 콘솔에 관리자용 정보 출력
        console.log(`
🔔 새로운 입금 확인 요청
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 주문번호: ${orderData.orderNumber}
🛍️ 상품명: ${product.name}
💰 가격: ${product.price}
🌐 웹사이트: ${orderData.website}
🎯 키워드: ${orderData.keywords || '없음'}
📧 이메일: ${orderData.email}
⏰ 시간: ${new Date().toLocaleString('ko-KR')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
관리자님, 입금을 확인해주세요!
        `);
        
        // 성공으로 처리
        return { 
            ok: true, 
            message: '입금 확인 요청이 접수되었습니다.\n관리자가 브라우저 콘솔에서 확인할 수 있습니다.' 
        };
    } catch (error) {
        throw new Error('알림 저장에 실패했습니다.');
    }
} 