// 설정 파일 예시
// 실제 사용시 이 파일을 config.js로 복사하고 실제 값으로 변경하세요

module.exports = {
    // 서버 설정
    port: process.env.PORT || 3000,
    
    // 텔레그램 봇 설정
    telegram: {
        token: 'YOUR_TELEGRAM_BOT_TOKEN', // 텔레그램 봇 토큰
        chatId: 'YOUR_CHAT_ID' // 알림을 받을 채팅 ID
    },
    
    // 이메일 설정
    email: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'your-email@gmail.com', // 발송용 이메일
            pass: 'your-app-password' // Gmail 앱 패스워드
        }
    },
    
    // 계좌 정보
    bankAccount: {
        bank: '국민은행',
        account: '123456-78-901234',
        holder: '워프스타'
    }
}; 