// ===== FIREBASE & GEMINI CONFIGURATION =====
const firebaseConfig = {
    apiKey: "AIzaSyCPLUsJ-bbKRCeNS2hMpLcON3wz9iYLqw0",
    authDomain: "congquacach-ed087.firebaseapp.com",
    projectId: "congquacach-ed087",
    storageBucket: "congquacach-ed087.firebasestorage.app",
    messagingSenderId: "895889020313",
    appId: "1:895889020313:web:de65e81b0df3f7782cef08",
    measurementId: "G-Z6CFF22EBM"
};

// ===== INITIALIZE FIREBASE =====
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ===== INITIALIZE AI ANALYZER =====
const aiAnalyzer = new CongQuaCachAI();

// ===== APPLICATION STATE =====
let currentUser = null;
let userStats = {
    totalPoints: 0,
    streak: 0,
    rank: 'moi_tu_tap',
    lastEntryDate: null,
    achievements: []
};

// ===== RANK SYSTEM - 18 CẤP BẬC THEO CÔNG QUÁ CÁCH =====
const RANKS = [
    { 
        id: 'moi_tu_tap', 
        name: '🌱 Người Mới Bắt Đầu',
        min: 0,
        gradient: 'linear-gradient(135deg, #90EE90, #98FB98)',
        icon: '🌱',
        unlockMessage: 'Chào mừng bạn! Mọi hành trình vĩ đại đều bắt đầu từ bước đầu tiên.',
        reward: null
    },
    { 
        id: 'nguoi_tot', 
        name: '😊 Người Tốt Bụng',
        min: 30,
        gradient: 'linear-gradient(135deg, #87CEEB, #4682B4)',
        icon: '😊',
        unlockMessage: 'Bạn đã bắt đầu làm những việc tốt đầu tiên!',
        reward: '+5 điểm thưởng'
    },
    { 
        id: 'tam_lanh', 
        name: '💚 Tâm Lành Ý Đẹp',
        min: 100,
        gradient: 'linear-gradient(135deg, #FFB347, #FF8C00)',
        icon: '💚',
        unlockMessage: 'Tâm bạn ngày càng trong sáng, không còn nhiều tạp niệm!',
        reward: '+10 điểm thưởng'
    },
    { 
        id: 'noi_lanh', 
        name: '🗣️ Nói Lành Làm Lành',
        min: 200,
        gradient: 'linear-gradient(135deg, #DDA0DD, #BA55D3)',
        icon: '🗣️',
        unlockMessage: 'Lời nói của bạn mang lại điều tốt cho người khác!',
        reward: '+20 điểm thưởng'
    },
    { 
        id: 'tu_tap_tien_bo', 
        name: '📈 Tu Tập Tiến Bộ',
        min: 300,
        gradient: 'linear-gradient(135deg, #20B2AA, #008B8B)',
        icon: '📈',
        unlockMessage: 'Bạn đang tiến bộ từng ngày trên con đường tu tâm!',
        reward: '+30 điểm thưởng'
    },
    { 
        id: 'dong_tam', 
        name: '🥉 Đồng Tâm Kiên Định',
        min: 500,
        gradient: 'linear-gradient(135deg, #CD7F32, #B8860B)',
        icon: '🥉',
        unlockMessage: 'Bạn đã kiên định, không bỏ cuộc giữa chừng!',
        reward: '+50 điểm thưởng, Badge Đồng'
    },
    { 
        id: 'hieu_hanh', 
        name: '🙏 Người Hiếu Hạnh',
        min: 700,
        gradient: 'linear-gradient(135deg, #FF69B4, #FF1493)',
        icon: '🙏',
        unlockMessage: 'Hiếu thảo với cha mẹ, kính trọng người lớn tuổi!',
        reward: '+70 điểm thưởng'
    },
    { 
        id: 'nhan_ai', 
        name: '❤️ Người Nhân Ái',
        min: 1000,
        gradient: 'linear-gradient(135deg, #FF6B6B, #EE5A6F)',
        icon: '❤️',
        unlockMessage: 'Bạn có tấm lòng nhân ái, luôn giúp đỡ người khác!',
        reward: '+100 điểm thưởng'
    },
    { 
        id: 'bac_tam', 
        name: '🥈 Bạc Tâm Tinh Tấn',
        min: 1500,
        gradient: 'linear-gradient(135deg, #C0C0C0, #A9A9A9)',
        icon: '🥈',
        unlockMessage: 'Tinh tấn tu hành mỗi ngày, không ngừng nghỉ!',
        reward: '+150 điểm thưởng, Badge Bạc'
    },
    { 
        id: 'vang_tam', 
        name: '🥇 Vàng Tâm Chánh Niệm',
        min: 2000,
        gradient: 'linear-gradient(135deg, #FFD700, #FFA500)',
        icon: '🥇',
        unlockMessage: 'Chánh niệm thường trực, mỗi hành động đều có ý thức!',
        reward: '+200 điểm thưởng, Badge Vàng'
    },
    { 
        id: 'tam_thanh_tinh', 
        name: '🧘 Tâm Thanh Tịnh',
        min: 2500,
        gradient: 'linear-gradient(135deg, #9370DB, #8A2BE2)',
        icon: '🧘',
        unlockMessage: 'Tâm đã thanh tịnh, ít phiền não, nhiều an lạc!',
        reward: '+250 điểm thưởng'
    },
    { 
        id: 'cao_nhan', 
        name: '⭐ Chánh Kiến Sáng Ngời',
        min: 3000,
        gradient: 'linear-gradient(135deg, #FF69B4, #FF1493)',
        icon: '⭐',
        unlockMessage: 'Chánh kiến đã sáng, phân biệt rõ thiện ác, đúng sai!',
        reward: '+300 điểm thưởng'
    },
    { 
        id: 'kim_cuong', 
        name: '💎 Tâm Kim Cương',
        min: 4000,
        gradient: 'linear-gradient(135deg, #00CED1, #4169E1)',
        icon: '💎',
        unlockMessage: 'Tâm như kim cương, vững chãi trước mọi nghịch cảnh phiền não!',
        reward: '+400 điểm thưởng'
    },
    { 
        id: 'thap_thien', 
        name: '🌟 Thập Thiện Viên Mãn',
        min: 5000,
        gradient: 'linear-gradient(135deg, #FF6347, #DC143C)',
        icon: '🌟',
        unlockMessage: 'Thực hành đủ 10 điều thiện: Thân 3, Khẩu 4, Ý 3!',
        reward: '+500 điểm thưởng'
    },
    { 
        id: 'phat_bo_de_tam', 
        name: '🙌 Phát Bồ Đề Tâm',
        min: 7000,
        gradient: 'linear-gradient(135deg, #FFD700, #FF8C00, #FF4500)',
        icon: '🙌',
        unlockMessage: 'Phát khởi Bồ Đề Tâm, nguyện lợi mình lợi người!',
        reward: '+700 điểm thưởng'
    },
    { 
        id: 'cong_duc_vien_man', 
        name: '🏆 Công Đức Trang Nghiêm',
        min: 10000,
        gradient: 'linear-gradient(135deg, #FF1493, #FF69B4, #FFB6C1)',
        icon: '🏆',
        unlockMessage: 'Công đức trang nghiêm, phước báu dồi dào, tâm địa thanh tịnh!',
        reward: '+1000 điểm thưởng'
    },
    { 
        id: 'tu_hanh_kien_co', 
        name: '👑 Tu Hành Kiên Cố',
        min: 15000,
        gradient: 'linear-gradient(135deg, #800080, #9400D3, #8B008B)',
        icon: '👑',
        unlockMessage: 'Tu hành kiên cố, tâm không lay động, là gương sáng cho mọi người!',
        reward: '+1500 điểm thưởng'
    },
    { 
        id: 'cuc_thanh', 
        name: '🌌 Đại Công Đức Viên Mãn',
        min: 20000,
        gradient: 'linear-gradient(135deg, #FFD700, #FF1493, #00CED1, #9400D3)',
        icon: '🌌',
        unlockMessage: '🎉 ĐẠI CÔNG ĐỨC VIÊN MÃN! Phước báu vô lượng, công đức dồi dào!',
        reward: '+2000 điểm thưởng'
    },
    // === CẤP BẬC CAO - HÀNH GIẢ TINH TẤN ===
    { 
        id: 'tinh_tan_hanh_gia', 
        name: '📿 Tinh Tấn Hành Giả',
        min: 30000,
        gradient: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460, #e94560)',
        icon: '📿',
        unlockMessage: '📿 TINH TẤN HÀNH GIẢ! Bạn siêng năng tu hành, không mỏi không chán!',
        reward: '+3000 điểm thưởng'
    },
    { 
        id: 'tu_bi_cu_si', 
        name: '🙏 Từ Bi Cư Sĩ',
        min: 50000,
        gradient: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        icon: '🙏',
        unlockMessage: '🙏 TỪ BI CƯ SĨ! Lòng từ bi của bạn lan tỏa lợi ích chúng sinh!',
        reward: '+5000 điểm thưởng'
    },
    { 
        id: 'chanh_niem_truong_duong', 
        name: '🧘 Chánh Niệm Trường Dưỡng',
        min: 75000,
        gradient: 'linear-gradient(135deg, #232526, #414345, #ffd700)',
        icon: '🧘',
        unlockMessage: '🧘 CHÁNH NIỆM TRƯỜNG DƯỠNG! Chánh niệm tỉnh giác, tâm an tuệ sáng!',
        reward: '+7500 điểm thưởng'
    },
    { 
        id: 'bo_tat_hanh', 
        name: '🪷 Hành Bồ Tát Đạo',
        min: 100000,
        gradient: 'linear-gradient(135deg, #FFD700, #FFA500, #FF6347, #FF1493, #9400D3, #00CED1)',
        icon: '🪷',
        unlockMessage: '🪷 HÀNH BỒ TÁT ĐẠO! Phát tâm Bồ Đề, lợi mình lợi người!',
        reward: '+10000 điểm thưởng'
    },
    { 
        id: 'luc_do_vien_man', 
        name: '☸️ Lục Độ Ba La Mật',
        min: 200000,
        gradient: 'linear-gradient(135deg, #000000, #434343, #FFD700, #FFFFFF)',
        icon: '☸️',
        unlockMessage: '☸️ LỤC ĐỘ BA LA MẬT! Thực hành đầy đủ: Bố thí, Trì giới, Nhẫn nhục, Tinh tấn, Thiền định, Trí tuệ!',
        reward: '+20000 điểm thưởng'
    },
    { 
        id: 'phuoc_hue_song_tu', 
        name: '🌟 Phước Huệ Song Tu',
        min: 500000,
        gradient: 'linear-gradient(45deg, #FFD700 0%, #FFFFFF 25%, #FFD700 50%, #FFFFFF 75%, #FFD700 100%)',
        icon: '🌟',
        unlockMessage: '🌟 PHƯỚC HUỆ SONG TU! Phước đức và Trí tuệ song hành viên mãn!',
        reward: '+50000 điểm thưởng'
    },
    { 
        id: 'vo_luong_cong_duc', 
        name: '✨ Vô Lượng Công Đức',
        min: 1000000,
        gradient: 'linear-gradient(135deg, #FFD700, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7, #DDA0DD)',
        icon: '✨',
        unlockMessage: '✨ VÔ LƯỢNG CÔNG ĐỨC! Công đức không thể nghĩ bàn, phước báu vô biên vô tận!',
        reward: '+100000 điểm thưởng'
    }
];

// ===== STREAK BONUS =====
const STREAK_REWARDS = {
    3: { points: 5, message: '🔥 3 ngày liên tiếp! +5 điểm' },
    5: { points: 10, message: '🔥 5 ngày! +10 điểm' },
    7: { points: 30, message: '🔥🔥 1 TUẦN! +30 điểm' },
    10: { points: 50, message: '⚡ 10 ngày! +50 điểm' },
    14: { points: 70, message: '🔥🔥🔥 2 TUẦN! +70 điểm' },
    21: { points: 100, message: '⚡ 3 TUẦN! +100 điểm' },
    30: { points: 200, message: '💎 1 THÁNG! +200 điểm' },
    60: { points: 500, message: '🏆 2 THÁNG! +500 điểm' },
    90: { points: 1000, message: '👑 3 THÁNG! +1000 điểm' },
    180: { points: 3000, message: '🌟 NỬA NĂM! +3000 điểm' },
    365: { points: 10000, message: '🌌 1 NĂM! +10000 điểm' }
};

const DAILY_ENTRY_BONUS = 1; // +1 điểm mỗi ngày ghi nhật ký


// ===== ACHIEVEMENTS SYSTEM - MỞ RỘNG =====
const ACHIEVEMENTS = [
    // === NHÓM KHỞI ĐẦU ===
    {
        id: 'first_entry',
        name: '🌱 Bước Chân Đầu Tiên',
        description: 'Ghi nhật ký đầu tiên',
        icon: '🌱',
        category: 'start',
        condition: (stats) => stats.totalEntries >= 1,
        reward: 5
    },
    {
        id: 'entries_10',
        name: '📖 Người Viết Chăm Chỉ',
        description: 'Ghi 10 nhật ký',
        icon: '📖',
        category: 'entries',
        condition: (stats) => stats.totalEntries >= 10,
        reward: 30
    },
    {
        id: 'entries_50',
        name: '📚 Nhà Văn Tâm Linh',
        description: 'Ghi 50 nhật ký',
        icon: '📚',
        category: 'entries',
        condition: (stats) => stats.totalEntries >= 50,
        reward: 100
    },
    {
        id: 'entries_100',
        name: '🏛️ Sử Gia Công Đức',
        description: 'Ghi 100 nhật ký',
        icon: '🏛️',
        category: 'entries',
        condition: (stats) => stats.totalEntries >= 100,
        reward: 300
    },
    {
        id: 'entries_365',
        name: '📜 Thánh Sử Ký',
        description: 'Ghi 365 nhật ký',
        icon: '📜',
        category: 'entries',
        condition: (stats) => stats.totalEntries >= 365,
        reward: 1000
    },
    
    // === NHÓM STREAK - KIÊN TRÌ ===
    {
        id: 'streak_3',
        name: '🔥 Khởi Động',
        description: '3 ngày liên tiếp',
        icon: '🔥',
        category: 'streak',
        condition: (stats) => stats.streak >= 3,
        reward: 15
    },
    {
        id: 'streak_7',
        name: '🔥 Chiến Binh Tuần Lễ',
        description: '7 ngày liên tiếp',
        icon: '🔥',
        category: 'streak',
        condition: (stats) => stats.streak >= 7,
        reward: 50
    },
    {
        id: 'streak_14',
        name: '⚡ Dũng Sĩ Kiên Cường',
        description: '14 ngày liên tiếp',
        icon: '⚡',
        category: 'streak',
        condition: (stats) => stats.streak >= 14,
        reward: 100
    },
    {
        id: 'streak_30',
        name: '💎 Bất Khuất Tháng Đầu',
        description: '30 ngày liên tiếp',
        icon: '💎',
        category: 'streak',
        condition: (stats) => stats.streak >= 30,
        reward: 300
    },
    {
        id: 'streak_60',
        name: '🌊 Sóng Không Ngừng',
        description: '60 ngày liên tiếp',
        icon: '🌊',
        category: 'streak',
        condition: (stats) => stats.streak >= 60,
        reward: 600
    },
    {
        id: 'streak_90',
        name: '⛰️ Núi Không Lay Chuyển',
        description: '90 ngày liên tiếp',
        icon: '⛰️',
        category: 'streak',
        condition: (stats) => stats.streak >= 90,
        reward: 1000
    },
    {
        id: 'streak_180',
        name: '🌅 Nửa Năm Bất Diệt',
        description: '180 ngày liên tiếp',
        icon: '🌅',
        category: 'streak',
        condition: (stats) => stats.streak >= 180,
        reward: 2000
    },
    {
        id: 'streak_365',
        name: '🌌 Huyền Thoại Bất Tử',
        description: '365 ngày liên tiếp - 1 NĂM!',
        icon: '🌌',
        category: 'streak',
        condition: (stats) => stats.streak >= 365,
        reward: 5000
    },
    
    // === NHÓM ĐIỂM SỐ ===
    {
        id: 'score_50',
        name: '⭐ Ánh Sáng Đầu Tiên',
        description: 'Đạt 50 điểm',
        icon: '⭐',
        category: 'points',
        condition: (stats) => stats.totalPoints >= 50,
        reward: 5
    },
    {
        id: 'score_100',
        name: '✨ Tia Sáng Thiện Lành',
        description: 'Đạt 100 điểm',
        icon: '✨',
        category: 'points',
        condition: (stats) => stats.totalPoints >= 100,
        reward: 10
    },
    {
        id: 'score_500',
        name: '🌟 Ngôi Sao Thiện Tâm',
        description: 'Đạt 500 điểm',
        icon: '🌟',
        category: 'points',
        condition: (stats) => stats.totalPoints >= 500,
        reward: 50
    },
    {
        id: 'score_1000',
        name: '💫 Vầng Hào Quang',
        description: 'Đạt 1,000 điểm',
        icon: '💫',
        category: 'points',
        condition: (stats) => stats.totalPoints >= 1000,
        reward: 100
    },
    {
        id: 'score_2500',
        name: '🌙 Ánh Trăng Từ Bi',
        description: 'Đạt 2,500 điểm',
        icon: '🌙',
        category: 'points',
        condition: (stats) => stats.totalPoints >= 2500,
        reward: 250
    },
    {
        id: 'score_5000',
        name: '☀️ Mặt Trời Công Đức',
        description: 'Đạt 5,000 điểm',
        icon: '☀️',
        category: 'points',
        condition: (stats) => stats.totalPoints >= 5000,
        reward: 500
    },
    {
        id: 'score_10000',
        name: '🔱 Vương Giả Thiện Lành',
        description: 'Đạt 10,000 điểm',
        icon: '🔱',
        category: 'points',
        condition: (stats) => stats.totalPoints >= 10000,
        reward: 1000
    },
    {
        id: 'score_20000',
        name: '👑 Đế Vương Công Đức',
        description: 'Đạt 20,000 điểm',
        icon: '👑',
        category: 'points',
        condition: (stats) => stats.totalPoints >= 20000,
        reward: 2000
    },
    {
        id: 'score_50000',
        name: '🏆 Bất Hủ Thiên Thu',
        description: 'Đạt 50,000 điểm',
        icon: '🏆',
        category: 'points',
        condition: (stats) => stats.totalPoints >= 50000,
        reward: 5000
    },
    
    // === NHÓM VIỆC THIỆN ===
    {
        id: 'good_10',
        name: '🤝 Người Tốt Bụng',
        description: 'Làm 10 việc thiện',
        icon: '🤝',
        category: 'good',
        condition: (stats) => stats.totalGoodActions >= 10,
        reward: 10
    },
    {
        id: 'good_50',
        name: '💝 Tấm Lòng Vàng',
        description: 'Làm 50 việc thiện',
        icon: '💝',
        category: 'good',
        condition: (stats) => stats.totalGoodActions >= 50,
        reward: 50
    },
    {
        id: 'good_100',
        name: '🙏 Bồ Tát Nhân Gian',
        description: 'Làm 100 việc thiện',
        icon: '🙏',
        category: 'good',
        condition: (stats) => stats.totalGoodActions >= 100,
        reward: 150
    },
    {
        id: 'good_500',
        name: '🕊️ Thiên Sứ Từ Bi',
        description: 'Làm 500 việc thiện',
        icon: '🕊️',
        category: 'good',
        condition: (stats) => stats.totalGoodActions >= 500,
        reward: 500
    },
    {
        id: 'good_1000',
        name: '🦋 Phật Tâm Hiển Hiện',
        description: 'Làm 1,000 việc thiện',
        icon: '🦋',
        category: 'good',
        condition: (stats) => stats.totalGoodActions >= 1000,
        reward: 1000
    },
    
    // === NHÓM HOÀN HẢO ===
    {
        id: 'perfect_day',
        name: '🌸 Ngày Hoàn Hảo',
        description: '1 ngày không có quá lỗi',
        icon: '🌸',
        category: 'perfect',
        condition: (stats) => stats.perfectDays >= 1,
        reward: 10
    },
    {
        id: 'perfect_week',
        name: '🌺 Tuần Lễ Thánh Thiện',
        description: '7 ngày không có quá lỗi',
        icon: '🌺',
        category: 'perfect',
        condition: (stats) => stats.perfectDays >= 7,
        reward: 100
    },
    {
        id: 'perfect_month',
        name: '🏵️ Tháng Thanh Tịnh',
        description: '30 ngày không có quá lỗi',
        icon: '🏵️',
        category: 'perfect',
        condition: (stats) => stats.perfectDays >= 30,
        reward: 500
    },
    {
        id: 'perfect_100',
        name: '💮 Trăm Ngày Vô Nhiễm',
        description: '100 ngày không có quá lỗi',
        icon: '💮',
        category: 'perfect',
        condition: (stats) => stats.perfectDays >= 100,
        reward: 1500
    },
    
    // === NHÓM ĐẶC BIỆT ===
    {
        id: 'high_score_day',
        name: '🎯 Ngày Đại Cát',
        description: 'Đạt 50+ điểm trong 1 ngày',
        icon: '🎯',
        category: 'special',
        condition: (stats) => stats.bestDayScore >= 50,
        reward: 50
    },
    {
        id: 'super_score_day',
        name: '🎪 Ngày Huy Hoàng',
        description: 'Đạt 100+ điểm trong 1 ngày',
        icon: '🎪',
        category: 'special',
        condition: (stats) => stats.bestDayScore >= 100,
        reward: 150
    },
    {
        id: 'legendary_day',
        name: '🎭 Ngày Huyền Thoại',
        description: 'Đạt 200+ điểm trong 1 ngày',
        icon: '🎭',
        category: 'special',
        condition: (stats) => stats.bestDayScore >= 200,
        reward: 300
    },
    {
        id: 'comeback_king',
        name: '🦅 Phượng Hoàng Tái Sinh',
        description: 'Quay lại sau 7+ ngày không ghi',
        icon: '🦅',
        category: 'special',
        condition: (stats) => stats.hasComeback,
        reward: 30
    },
    {
        id: 'early_bird',
        name: '🐓 Người Thức Sớm',
        description: 'Ghi nhật ký trước 6h sáng',
        icon: '🐓',
        category: 'special',
        condition: (stats) => stats.hasEarlyEntry,
        reward: 20
    },
    {
        id: 'night_owl',
        name: '🦉 Người Tĩnh Tâm Đêm',
        description: 'Ghi nhật ký sau 11h đêm',
        icon: '🦉',
        category: 'special',
        condition: (stats) => stats.hasLateEntry,
        reward: 20
    }
];

async function checkAchievements() {
    if (!currentUser) return;
    
    // Get user achievements
    if (!userStats.achievements) {
        userStats.achievements = [];
    }
    
    // Get stats for checking
    const stats = await getAchievementStats();
    
    // Check each achievement
    for (const achievement of ACHIEVEMENTS) {
        if (userStats.achievements.includes(achievement.id)) continue;
        
        if (achievement.condition(stats)) {
            // Unlock achievement!
            userStats.achievements.push(achievement.id);
            userStats.totalPoints += achievement.reward;
            
            showAchievementPopup(
                achievement.icon,
                'THÀNH TỰU MỚI! 🎉',
                `${achievement.name}\n\n${achievement.description}\n\n🎁 Thưởng: +${achievement.reward} điểm`
            );
            
            await saveUserStats();
            updateDisplay();
        }
    }
}

async function getAchievementStats() {
    const snapshot = await db.collection('entries')
        .where('userId', '==', currentUser.uid)
        .get();
    
    let totalGoodActions = 0;
    let totalBadActions = 0;
    let perfectDays = 0;
    let bestDayScore = 0;
    let hasEarlyEntry = false;
    let hasLateEntry = false;
    let hasComeback = false;
    const dailyScores = {};
    const sortedDates = [];
    
    snapshot.forEach(doc => {
        const data = doc.data();
        const date = data.date;
        
        if (!dailyScores[date]) {
            dailyScores[date] = { good: 0, bad: 0, score: 0 };
            sortedDates.push(date);
        }
        
        dailyScores[date].good += data.analysis.good_actions?.length || 0;
        dailyScores[date].bad += data.analysis.bad_actions?.length || 0;
        dailyScores[date].score += data.analysis.total_score || 0;
        
        totalGoodActions += data.analysis.good_actions?.length || 0;
        totalBadActions += data.analysis.bad_actions?.length || 0;
        
        // Check for early/late entries
        if (data.timestamp) {
            const entryTime = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
            const hour = entryTime.getHours();
            if (hour < 6) hasEarlyEntry = true;
            if (hour >= 23) hasLateEntry = true;
        }
    });
    
    // Count perfect days and find best day score
    for (const date in dailyScores) {
        if (dailyScores[date].bad === 0 && dailyScores[date].score > 0) {
            perfectDays++;
        }
        if (dailyScores[date].score > bestDayScore) {
            bestDayScore = dailyScores[date].score;
        }
    }
    
    // Check for comeback (7+ days gap between entries)
    sortedDates.sort();
    for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
        if (diffDays >= 7) {
            hasComeback = true;
            break;
        }
    }
    
    return {
        totalEntries: snapshot.size,
        totalPoints: userStats.totalPoints,
        streak: userStats.streak,
        totalGoodActions,
        totalBadActions,
        perfectDays,
        bestDayScore,
        hasEarlyEntry,
        hasLateEntry,
        hasComeback
    };
}

// Gọi check achievements sau khi lưu entry
const originalSaveEntryBtn = document.getElementById('saveEntryBtn').onclick;
document.getElementById('saveEntryBtn').addEventListener('click', async function() {
    // ... existing save code ...
    await checkAchievements();
});

// ===== AUTHENTICATION - POPUP PRIORITY WITH LOCAL PERSISTENCE =====

// STEP 1: Set persistence to LOCAL immediately (lưu session vĩnh viễn)
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
        console.log('✅ Auth persistence: LOCAL (session will persist)');
    })
    .catch((error) => {
        console.error('❌ Persistence error:', error);
    });

// STEP 2: Handle redirect result (if using redirect method)
auth.getRedirectResult()
    .then((result) => {
        if (result && result.user) {
            console.log('✅ Redirect result found:', result.user.email);
            handleSuccessfulLogin(result.user);
        } else {
            console.log('ℹ️ No redirect result - first load or using popup');
        }
    })
    .catch((error) => {
        console.error('❌ Redirect result error:', error);
    });

// STEP 3: Auth state listener (detects any login state change)
auth.onAuthStateChanged((user) => {
    console.log('🔄 Auth state changed:', user ? user.email : 'No user');
    
    // Small delay to ensure DOM is ready
    setTimeout(() => {
        const authSection = document.getElementById('authSection');
        const appSection = document.getElementById('appSection');
        
        if (!authSection || !appSection) {
            console.error('❌ DOM sections not found!');
            return;
        }
        
        if (user) {
            handleSuccessfulLogin(user);
        } else {
            handleLogout();
        }
    }, 300);
});

// ===== LOGIN FUNCTION - POPUP PRIORITY (Most reliable!) =====
async function startLogin() {
    console.log('🔐 Login initiated (popup method - most stable)');
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
        prompt: 'select_account'  // Always show account picker
    });
    
    try {
        // USE POPUP (not redirect!) - this is key!
        const result = await auth.signInWithPopup(provider);
        console.log('✅ POPUP LOGIN SUCCESS:', result.user.email);
        handleSuccessfulLogin(result.user);
        
    } catch (error) {
        console.error('❌ Popup login error:', error.code, error.message);
        
        // Handle specific errors
        if (error.code === 'auth/popup-blocked') {
            alert('⚠️ Popup bị chặn! Vui lòng:\n1. Cho phép popup từ congqua.pages.dev\n2. Tắt ad blocker\n3. Thử lại');
        } else if (error.code === 'auth/popup-closed-by-user') {
            console.log('ℹ️ User closed popup');
        } else {
            alert('Lỗi đăng nhập: ' + error.message);
        }
    }
}

// ===== SUCCESS HANDLER =====
function handleSuccessfulLogin(user) {
    currentUser = user;
    console.log('✅ User authenticated:', user.email);
    
    // Update UI elements
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userAvatar = document.getElementById('userAvatar');
    
    if (userName) userName.textContent = user.displayName || 'Người dùng';
    if (userEmail) userEmail.textContent = user.email;
    if (userAvatar) userAvatar.src = user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || 'User');
    
    // Show app screen, hide login
    const authSection = document.getElementById('authSection');
    const appSection = document.getElementById('appSection');
    if (authSection) authSection.classList.add('hidden');
    if (appSection) appSection.classList.remove('hidden');
    
    console.log('🖥️ App screen shown - loading user data...');
    
    // Load user data (with error handling)
    setTimeout(async () => {
        try {
            if (typeof loadUserData === 'function') await loadUserData();
            if (typeof loadHistory === 'function') await loadHistory();
            if (typeof updateDisplay === 'function') updateDisplay();
            console.log('✅ User data loaded successfully!');
        } catch (error) {
            console.error('❌ Error loading user data:', error);
        }
    }, 500);
}

// ===== LOGOUT HANDLER =====
function handleLogout() {
    currentUser = null;
    const authSection = document.getElementById('authSection');
    const appSection = document.getElementById('appSection');
    if (authSection) authSection.classList.remove('hidden');
    if (appSection) appSection.classList.add('hidden');
    console.log('👋 Logged out - showing login screen');
}

// ===== ATTACH EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM ready - attaching auth listeners');
    
    // Login button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', startLogin);
        console.log('✅ Login button ready (popup method)');
    } else {
        console.error('❌ Login button not found!');
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Bạn có chắc muốn đăng xuất?')) {
                auth.signOut().then(() => console.log('✅ Signed out'));
            }
        });
        console.log('✅ Logout button ready');
    }
});

// Make startLogin global for HTML onclick fallback
window.startLogin = startLogin;


// ===== ANALYZE DIARY =====
document.getElementById('analyzeBtn').addEventListener('click', async () => {
    const diaryText = document.getElementById('diaryInput').value.trim();
    
    if (!diaryText) {
        alert('⚠️ Vui lòng nhập nhật ký của bạn');
        return;
    }

    if (diaryText.length < 20) {
        alert('⚠️ Nhật ký quá ngắn. Hãy viết chi tiết hơn (tối thiểu 20 ký tự)');
        return;
    }

    document.getElementById('loadingIndicator').classList.remove('hidden');
    document.getElementById('analysisResult').classList.add('hidden');
    document.getElementById('analyzeBtn').disabled = true;

    try {
        const analysis = await aiAnalyzer.analyzeDiary(diaryText);
        aiAnalyzer.validateAnalysis(analysis);
        displayAnalysis(analysis);
    } catch (error) {
        console.error('Analysis error:', error);
        alert('❌ Lỗi phân tích: ' + error.message);
    } finally {
        document.getElementById('loadingIndicator').classList.add('hidden');
        document.getElementById('analyzeBtn').disabled = false;
    }
});

// ===== SAVE ENTRY =====
document.getElementById('saveEntryBtn').addEventListener('click', async () => {
    if (!window.currentAnalysis || !currentUser) {
        alert('⚠️ Không có dữ liệu để lưu');
        return;
    }

    const diaryText = document.getElementById('diaryInput').value.trim();
    const today = new Date().toISOString().split('T')[0];

    try {
        await db.collection('entries').add({
            userId: currentUser.uid,
            date: today,
            diaryText: diaryText,
            analysis: window.currentAnalysis,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Cộng điểm từ AI analysis + daily bonus
        userStats.totalPoints += window.currentAnalysis.total_score + DAILY_ENTRY_BONUS;
        
        updateStreak(today);
        checkRankUp();
        await saveUserStats();

        document.getElementById('diaryInput').value = '';
        document.getElementById('analysisResult').classList.add('hidden');
        window.currentAnalysis = null;

        showNotification('✅ Đã lưu nhật ký! +1 điểm ghi chép đều đặn', 'success');
        
        loadHistory();
        updateDisplay();
		updateDetailedStats(); // ← THÊM DÒNG NÀY

    } catch (error) {
        console.error('Save error:', error);
        alert('❌ Lỗi lưu dữ liệu: ' + error.message);
    }
});

// ===== DISPLAY ANALYSIS =====
function displayAnalysis(analysis) {
    const scoreEl = document.getElementById('todayScore');
    const score = analysis.total_score || 0;
    scoreEl.textContent = (score >= 0 ? '+' : '') + score;
    scoreEl.className = 'score-value ' + (score >= 0 ? 'positive' : 'negative');

    const goodActionsEl = document.getElementById('goodActions');
    if (analysis.good_actions && analysis.good_actions.length > 0) {
        goodActionsEl.innerHTML = analysis.good_actions.map(action => `
            <div class="action-item good">
                <div class="action-info">
                    <strong>${action.action}</strong>
                    <p>${action.explanation}</p>
                </div>
                <span class="action-points positive">+${action.points}</span>
            </div>
        `).join('');
    } else {
        goodActionsEl.innerHTML = '<p class="empty-message">Không có hành động thiện nào</p>';
    }

    const badActionsEl = document.getElementById('badActions');
    if (analysis.bad_actions && analysis.bad_actions.length > 0) {
        badActionsEl.innerHTML = analysis.bad_actions.map(action => `
            <div class="action-item bad">
                <div class="action-info">
                    <strong>${action.action}</strong>
                    <p>${action.explanation}</p>
                </div>
                <span class="action-points negative">${action.points}</span>
            </div>
        `).join('');
    } else {
        badActionsEl.innerHTML = '<p class="empty-message">Không có quá lỗi! 🎉</p>';
    }

    document.getElementById('aiAdvice').textContent = analysis.advice || 'Hãy tiếp tục! 🙏';
    window.currentAnalysis = analysis;
    document.getElementById('analysisResult').classList.remove('hidden');
}

// ===== LOAD DATA =====
async function loadUserData() {
    if (!currentUser) return;

    try {
        const statsDoc = await db.collection('userStats').doc(currentUser.uid).get();
        if (statsDoc.exists) {
            userStats = { ...userStats, ...statsDoc.data() };
        }
        updateDisplay();
        loadHistory();
		updateDetailedStats(); // ← THÊM DÒNG NÀY
    } catch (error) {
        console.error('Load error:', error);
    }
}

async function loadHistory() {
    if (!currentUser) return;

    try {
        const snapshot = await db.collection('entries')
            .where('userId', '==', currentUser.uid)
            .orderBy('timestamp', 'desc')
            .limit(30) // Lấy 30 để dự phòng
            .get();

        const historyEl = document.getElementById('historyList');
        
        if (snapshot.empty) {
            historyEl.innerHTML = '<div class="empty-state"><p>📝 Chưa có nhật ký nào</p></div>';
            return;
        }

        const entries = [];
        snapshot.forEach(doc => {
            entries.push({ id: doc.id, data: doc.data() });
        });
        
        // Sắp xếp theo thời gian
        entries.sort((a, b) => {
            const timeA = a.data.timestamp?.toMillis() || 0;
            const timeB = b.data.timestamp?.toMillis() || 0;
            return timeB - timeA;
        });

        // ===== HIỂN THỊ 7 LOG GẦN NHẤT =====
        const displayCount = 7;
        const topEntries = entries.slice(0, displayCount);
        historyEl.innerHTML = '';
        
        topEntries.forEach((entry, index) => {
            const data = entry.data;
            const date = new Date(data.date);
            const analysis = data.analysis;
            
            // Truncate text cho nhật ký dài
            const truncatedDiary = truncateText(data.diaryText, 200);
            const isLong = data.diaryText.length > 200;
            
            // Tính badge đặc biệt
            const badges = getEntryBadges(analysis, data.date);
            
                    const entryCard = document.createElement('div');
            entryCard.className = 'history-card';
            entryCard.id = `card-${entry.id}`;
            entryCard.innerHTML = `
                <div class="history-header" onclick="toggleHistory('${entry.id}')">
                    <div class="history-date">
                        <span class="date-icon">📅</span>
                        <span>${date.toLocaleDateString('vi-VN', { 
                            weekday: 'short', 
                            day: '2-digit', 
                            month: '2-digit'
                        })}</span>
                        ${badges}
                    </div>
                    <div class="history-score ${analysis.total_score >= 0 ? 'positive' : 'negative'}">
                        ${analysis.total_score >= 0 ? '+' : ''}${analysis.total_score}
                    </div>
                </div>
                <div id="detail-${entry.id}" class="history-detail collapsed">
                    <div class="diary-excerpt">
                        <strong>📝 Nhật ký:</strong>
                        <p id="diary-text-${entry.id}">${truncatedDiary}</p>
                        ${isLong ? `
                            <button class="btn-expand" onclick="expandDiary('${entry.id}', event)">
                                Xem đầy đủ ↓
                            </button>
                        ` : ''}
                    </div>
                    <div class="analysis-summary">
                        ${analysis.good_actions && analysis.good_actions.length > 0 ? `
                        <div class="summary-section">
                            <strong>✅ Công: ${analysis.good_actions.length} việc</strong>
                            ${analysis.good_actions.slice(0, 3).map(a => 
                                `<p>• ${a.action} (+${a.points})</p>`
                            ).join('')}
                            ${analysis.good_actions.length > 3 ? `<p class="more-indicator">... và ${analysis.good_actions.length - 3} việc khác</p>` : ''}
                        </div>
                        ` : ''}
                        ${analysis.bad_actions && analysis.bad_actions.length > 0 ? `
                        <div class="summary-section">
                            <strong>⚠️ Quá: ${analysis.bad_actions.length} việc</strong>
                            ${analysis.bad_actions.slice(0, 3).map(a => 
                                `<p>• ${a.action} (${a.points})</p>`
                            ).join('')}
                            ${analysis.bad_actions.length > 3 ? `<p class="more-indicator">... và ${analysis.bad_actions.length - 3} việc khác</p>` : ''}
                        </div>
                        ` : ''}
                    </div>
                    <!-- NÚT XÓA NHẬT KÝ -->
                    <div class="entry-actions">
                        <button class="btn-delete-entry" onclick="deleteEntry('${entry.id}', ${analysis.total_score || 0}, event)">
                            🗑️ Xóa nhật ký này
                        </button>
                    </div>
                </div>
            `;
            historyEl.appendChild(entryCard);
        });
        
        // Nút "Xem thêm" nếu có nhiều hơn 7
        if (entries.length > displayCount) {
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.className = 'btn-load-more';
            loadMoreBtn.textContent = `📜 Xem thêm ${entries.length - displayCount} nhật ký cũ hơn`;
            loadMoreBtn.onclick = () => loadMoreHistory(entries, displayCount);
            historyEl.appendChild(loadMoreBtn);
        }
        
    } catch (error) {
        console.error('Load history error:', error);
        document.getElementById('historyList').innerHTML = 
            '<div class="empty-state"><p>❌ Lỗi tải lịch sử</p></div>';
    }
}

// ===== HELPER FUNCTIONS =====

function truncateText(text, maxLength = 200) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Lưu text đầy đủ trong memory
window.fullDiaryTexts = {};

window.expandDiary = function(entryId, event) {
    event.stopPropagation();
    const textEl = document.getElementById(`diary-text-${entryId}`);
    const btn = event.target;
    
    if (!window.fullDiaryTexts[entryId]) {
        // Lấy từ Firebase nếu chưa có
        db.collection('entries').doc(entryId).get().then(doc => {
            if (doc.exists) {
                window.fullDiaryTexts[entryId] = doc.data().diaryText;
                textEl.textContent = window.fullDiaryTexts[entryId];
                btn.textContent = 'Thu gọn ↑';
                btn.onclick = () => collapseDiary(entryId, event);
            }
        });
    } else {
        textEl.textContent = window.fullDiaryTexts[entryId];
        btn.textContent = 'Thu gọn ↑';
        btn.onclick = () => collapseDiary(entryId, event);
    }
};

window.collapseDiary = function(entryId, event) {
    event.stopPropagation();
    const textEl = document.getElementById(`diary-text-${entryId}`);
    const btn = event.target;
    const truncated = truncateText(window.fullDiaryTexts[entryId], 200);
    
    textEl.textContent = truncated;
    btn.textContent = 'Xem đầy đủ ↓';
    btn.onclick = () => expandDiary(entryId, event);
};

function getEntryBadges(analysis, date) {
    const badges = [];
    
    // Perfect day
    if (analysis.total_score >= 50 && (!analysis.bad_actions || analysis.bad_actions.length === 0)) {
        badges.push('<span class="entry-badge perfect">🌟 Hoàn hảo</span>');
    }
    
    // High score
    if (analysis.total_score >= 100) {
        badges.push('<span class="entry-badge high-score">💎 Xuất sắc</span>');
    }
    
    return badges.join('');
}

function loadMoreHistory(allEntries, currentCount) {
    const historyEl = document.getElementById('historyList');
    const nextBatch = allEntries.slice(currentCount, currentCount + 7);
    
    // Remove "load more" button
    const loadMoreBtn = historyEl.querySelector('.btn-load-more');
    if (loadMoreBtn) loadMoreBtn.remove();
    
    // Render next batch - FIXED: Complete rendering logic
    nextBatch.forEach(entry => {
        const data = entry.data;
        const date = new Date(data.date);
        const analysis = data.analysis;
        
        const truncatedDiary = truncateText(data.diaryText, 200);
        const isLong = data.diaryText.length > 200;
        const badges = getEntryBadges(analysis, data.date);
        
        const entryCard = document.createElement('div');
        entryCard.className = 'history-card';
        entryCard.id = `card-${entry.id}`;
        entryCard.innerHTML = `
            <div class="history-header" onclick="toggleHistory('${entry.id}')">
                <div class="history-date">
                    <span class="date-icon">📅</span>
                    <span>${date.toLocaleDateString('vi-VN', { 
                        weekday: 'short', 
                        day: '2-digit', 
                        month: '2-digit'
                    })}</span>
                    ${badges}
                </div>
                <div class="history-score ${analysis.total_score >= 0 ? 'positive' : 'negative'}">
                    ${analysis.total_score >= 0 ? '+' : ''}${analysis.total_score}
                </div>
            </div>
            <div id="detail-${entry.id}" class="history-detail collapsed">
                <div class="diary-excerpt">
                    <strong>📝 Nhật ký:</strong>
                    <p id="diary-text-${entry.id}">${truncatedDiary}</p>
                    ${isLong ? `
                        <button class="btn-expand" onclick="expandDiary('${entry.id}', event)">
                            Xem đầy đủ ↓
                        </button>
                    ` : ''}
                </div>
                <div class="analysis-summary">
                    ${analysis.good_actions && analysis.good_actions.length > 0 ? `
                    <div class="summary-section">
                        <strong>✅ Công: ${analysis.good_actions.length} việc</strong>
                        ${analysis.good_actions.slice(0, 3).map(a => 
                            `<p>• ${a.action} (+${a.points})</p>`
                        ).join('')}
                        ${analysis.good_actions.length > 3 ? `<p class="more-indicator">... và ${analysis.good_actions.length - 3} việc khác</p>` : ''}
                    </div>
                    ` : ''}
                    ${analysis.bad_actions && analysis.bad_actions.length > 0 ? `
                    <div class="summary-section">
                        <strong>⚠️ Quá: ${analysis.bad_actions.length} việc</strong>
                        ${analysis.bad_actions.slice(0, 3).map(a => 
                            `<p>• ${a.action} (${a.points})</p>`
                        ).join('')}
                        ${analysis.bad_actions.length > 3 ? `<p class="more-indicator">... và ${analysis.bad_actions.length - 3} việc khác</p>` : ''}
                    </div>
                    ` : ''}
                </div>
                <!-- NÚT XÓA NHẬT KÝ -->
                <div class="entry-actions">
                    <button class="btn-delete-entry" onclick="deleteEntry('${entry.id}', ${analysis.total_score || 0}, event)">
                        🗑️ Xóa nhật ký này
                    </button>
                </div>
            </div>
        `;
        historyEl.appendChild(entryCard);
    });
    
    // Add load more again if needed
    if (allEntries.length > currentCount + 7) {
        const newLoadMoreBtn = document.createElement('button');
        newLoadMoreBtn.className = 'btn-load-more';
        newLoadMoreBtn.textContent = `📜 Xem thêm ${allEntries.length - currentCount - 7} nhật ký`;
        newLoadMoreBtn.onclick = () => loadMoreHistory(allEntries, currentCount + 7);
        historyEl.appendChild(newLoadMoreBtn);
    }
}

window.toggleHistory = function(id) {
    const detail = document.getElementById(`detail-${id}`);
    if (detail) {
        detail.classList.toggle('collapsed');
    }
};


window.toggleHistory = function(id) {
    const detail = document.getElementById(`detail-${id}`);
    if (detail) detail.classList.toggle('collapsed');
};

// ===== UPDATE DISPLAY =====
function updateDisplay() {
    if (!currentUser) return;

    document.getElementById('userName').textContent = currentUser.displayName || 'Tu Sinh';
    document.getElementById('userAvatar').src = currentUser.photoURL || '';
    document.getElementById('totalPoints').textContent = userStats.totalPoints;
    document.getElementById('streak').textContent = userStats.streak + ' ngày';
    
    const streakNumEl = document.getElementById('streakNumber');
    if (streakNumEl) streakNumEl.textContent = userStats.streak;
    
    const currentRank = getCurrentRank();
    document.getElementById('rankBadge').textContent = currentRank.name;
    document.getElementById('pointsBadge').textContent = userStats.totalPoints + ' điểm';
    
    updateRankShowcase(currentRank);
    updateRankProgress();
    updateRanksGrid();
    
    document.getElementById('todayDate').textContent = 
        new Date().toLocaleDateString('vi-VN', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
}

function getCurrentRank() {
    let current = RANKS[0];
    for (const rank of RANKS) {
        if (userStats.totalPoints >= rank.min) {
            current = rank;
        }
    }
    userStats.rank = current.id; // Sync rank
    return current;
}

function updateRankShowcase(rank) {
    const showcase = document.querySelector('.current-rank-showcase');
    if (!showcase) return;
    
    showcase.innerHTML = `
        <div class="rank-icon-large">${rank.icon}</div>
        <h2 class="rank-name-large">${rank.name}</h2>
        <p class="rank-points-display">${userStats.totalPoints} điểm công đức</p>
        ${rank.reward ? `<p style="color: #10b981; font-weight: 600; margin-top: 10px;">🎁 ${rank.reward}</p>` : ''}
    `;
    showcase.style.background = rank.gradient;
}

function updateRankProgress() {
    const currentRank = getCurrentRank();
    const currentIndex = RANKS.indexOf(currentRank);
    
    if (currentIndex < RANKS.length - 1) {
        const nextRank = RANKS[currentIndex + 1];
        const progress = ((userStats.totalPoints - currentRank.min) / (nextRank.min - currentRank.min)) * 100;
        
        document.getElementById('rankProgress').style.width = Math.min(progress, 100) + '%';
        document.getElementById('rankProgressText').textContent = 
            `Cần ${nextRank.min - userStats.totalPoints} điểm để lên ${nextRank.name}`;
    } else {
        document.getElementById('rankProgress').style.width = '100%';
        document.getElementById('rankProgressText').textContent = '🎉 Đã đạt hạng cao nhất!';
    }
}

function updateRanksGrid() {
    const ranksGrid = document.querySelector('.ranks-grid');
    if (!ranksGrid) return;

    const currentRank = getCurrentRank();
    
    // Legendary ranks (30k+) - Cấp bậc cao
    const legendaryRanks = ['tinh_tan_hanh_gia', 'tu_bi_cu_si', 'chanh_niem_truong_duong'];
    // Mythic ranks (100k+) - Cấp bậc tối cao
    const mythicRanks = ['bo_tat_hanh', 'luc_do_vien_man', 'phuoc_hue_song_tu', 'vo_luong_cong_duc'];

    ranksGrid.innerHTML = RANKS.map(rank => {
        const isUnlocked = userStats.totalPoints >= rank.min;
        const isCurrent = rank.id === currentRank.id;
        const isLegendary = legendaryRanks.includes(rank.id);
        const isMythic = mythicRanks.includes(rank.id);
        
        let extraClass = '';
        if (isLegendary && isUnlocked) extraClass = ' legendary';
        if (isMythic && isUnlocked) extraClass = ' mythic';
        
        // Format large numbers
        let minDisplay = rank.min;
        if (rank.min >= 1000000) minDisplay = (rank.min / 1000000) + 'M';
        else if (rank.min >= 1000) minDisplay = (rank.min / 1000) + 'K';
        
        return `
            <div class="rank-item ${isUnlocked ? 'unlocked' : 'locked'}${isCurrent ? ' current' : ''}${extraClass}"
                 style="${isUnlocked ? `background: ${rank.gradient};` : ''}"
                 title="${rank.unlockMessage}${rank.reward ? '\n🎁 ' + rank.reward : ''}">
                ${isCurrent ? '<div class="current-badge">HIỆN TẠI</div>' : ''}
                ${isMythic && !isUnlocked ? '<div class="mythic-badge">⚡ HUYỀN THOẠI</div>' : ''}
                <span class="rank-item-icon">${rank.icon}</span>
                <span class="rank-item-name">${rank.name}</span>
                <span class="rank-item-min">${minDisplay} điểm</span>
            </div>
        `;
    }).join('');
}

// ===== STREAK & RANK UP =====
function updateStreak(today) {
    const oldStreak = userStats.streak;
    
    if (!userStats.lastEntryDate) {
        userStats.streak = 1;
    } else {
        const lastDate = new Date(userStats.lastEntryDate);
        const currentDate = new Date(today);
        const diffDays = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            userStats.streak++;
        } else if (diffDays > 1) {
            userStats.streak = 1;
        }
    }
    
    userStats.lastEntryDate = today;
    
    if (userStats.streak > oldStreak) {
        checkStreakRewards();
    }
}

function checkStreakRewards() {
    const reward = STREAK_REWARDS[userStats.streak];
    if (reward) {
        userStats.totalPoints += reward.points;
        showAchievementPopup('🔥', 'STREAK BONUS!', reward.message);
        saveUserStats();
        updateDisplay();
    }
}

function checkRankUp() {
    const oldRankId = userStats.rank;
    const newRank = getCurrentRank();
    
    if (oldRankId !== newRank.id) {
        userStats.rank = newRank.id;
        
        showAchievementPopup(newRank.icon, 'RANK UP! 🎉', 
            `${newRank.unlockMessage}\n\n${newRank.reward || ''}`);
        
        if (newRank.reward) {
            const match = newRank.reward.match(/\+(\d+) điểm/);
            if (match) {
                userStats.totalPoints += parseInt(match[1]);
            }
        }
    }
}

async function saveUserStats() {
    if (!currentUser) return;
    try {
        await db.collection('userStats').doc(currentUser.uid).set(userStats, { merge: true });
    } catch (error) {
        console.error('Save stats error:', error);
    }
}

// ===== ACHIEVEMENT POPUP =====
function showAchievementPopup(icon, title, message) {
    const existing = document.querySelector('.achievement-popup');
    if (existing) existing.remove();
    
    const popup = document.createElement('div');
    popup.className = 'achievement-popup';
    popup.innerHTML = `
        <div class="achievement-icon">${icon}</div>
        <h2 class="achievement-title">${title}</h2>
        <p class="achievement-message">${message}</p>
        <button class="achievement-close">Tuyệt vời! 🎉</button>
    `;
    
    document.body.appendChild(popup);
    createConfetti();
    playSuccessSound();
    
    popup.querySelector('.achievement-close').addEventListener('click', () => {
        popup.remove();
    });
    
    setTimeout(() => {
        if (document.body.contains(popup)) popup.remove();
    }, 5000);
}

function createConfetti() {
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${['#667eea', '#764ba2', '#FFD700', '#FF6B6B'][Math.floor(Math.random() * 4)]};
                top: -10px;
                left: ${Math.random() * 100}%;
                animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
                z-index: 9999;
                border-radius: 50%;
            `;
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 5000);
        }, i * 30);
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        to { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
`;
document.head.appendChild(style);

function playSuccessSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
}

// ===== HELPERS =====
function showLogin() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('appScreen').classList.add('hidden');
}

function showApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.remove('hidden');
}

function showNotification(message, type = 'info') {
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = message;
    document.body.appendChild(notif);
    
    setTimeout(() => notif.classList.add('show'), 100);
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}
// ===== DETAILED STATS =====
// ===== DETAILED STATS - FIX UNIQUE DAYS =====
// ===== DETAILED STATS - FIX NGÀY TÍCH CỰC =====
async function updateDetailedStats() {
    if (!currentUser) return;
    
    try {
        const snapshot = await db.collection('entries')
            .where('userId', '==', currentUser.uid)
            .get();
        
        let totalGoodActions = 0;
        let totalBadActions = 0;
        let bestDay = { score: -Infinity, date: null };
        
        // ĐẾM NGÀY UNIQUE
        const uniqueDates = new Set();
        
        // ĐẾM NGÀY TÍCH CỰC UNIQUE - Quan trọng!
        const positiveDates = {}; // { 'YYYY-MM-DD': totalScore }
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const analysis = data.analysis;
            const date = data.date;
            
            // Thêm vào set để đếm tổng số ngày
            uniqueDates.add(date);
            
            // Cộng dồn điểm theo ngày
            if (!positiveDates[date]) {
                positiveDates[date] = 0;
            }
            positiveDates[date] += analysis.total_score || 0;
            
            // Đếm số việc thiện/ác
            totalGoodActions += analysis.good_actions?.length || 0;
            totalBadActions += analysis.bad_actions?.length || 0;
            
            // Tìm ngày tốt nhất
            if (analysis.total_score > bestDay.score) {
                bestDay = { score: analysis.total_score, date: data.date };
            }
        });
        
        // ĐẾM SỐ NGÀY CÓ ĐIỂM DƯƠNG (tổng các entry trong ngày > 0)
        let totalPositiveDays = 0;
        for (const date in positiveDates) {
            if (positiveDates[date] > 0) {
                totalPositiveDays++;
            }
        }
        
        const statsContainer = document.querySelector('.detailed-stats');
        if (!statsContainer) return;
        
        const totalUniqueDays = uniqueDates.size;
        const avgScore = totalUniqueDays > 0 ? Math.round(userStats.totalPoints / totalUniqueDays) : 0;
        
        statsContainer.innerHTML = `
            <div class="stat-box">
                <div class="stat-value">${totalUniqueDays}</div>
                <div class="stat-label">📝 Tổng số ngày</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${totalGoodActions}</div>
                <div class="stat-label">✅ Việc thiện</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${totalBadActions}</div>
                <div class="stat-label">⚠️ Quá lỗi</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${totalPositiveDays}</div>
                <div class="stat-label">😊 Ngày tích cực</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${avgScore}</div>
                <div class="stat-label">📊 Điểm TB/ngày</div>
            </div>
            <div class="stat-box highlight">
                <div class="stat-value">+${bestDay.score > -Infinity ? bestDay.score : 0}</div>
                <div class="stat-label">🏆 Ngày tốt nhất</div>
                ${bestDay.date ? `<div class="stat-date">${new Date(bestDay.date).toLocaleDateString('vi-VN')}</div>` : ''}
            </div>
        `;
    } catch (error) {
        console.error('Stats error:', error);
    }
}
// ===== PROGRESS CHART =====
let progressChart = null;

async function initProgressChart() {
    const ctx = document.getElementById('progressChart');
    if (!ctx) return;
    
    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Điểm công đức',
                data: [],
                borderColor: 'rgb(102, 126, 234)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return 'Điểm: ' + (context.parsed.y >= 0 ? '+' : '') + context.parsed.y;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // Load default 7 days
    await updateChart(7);
    
    // Setup controls
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            await updateChart(parseInt(this.dataset.period));
        });
    });
}

async function updateChart(days) {
    if (!currentUser || !progressChart) return;
    
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const snapshot = await db.collection('entries')
            .where('userId', '==', currentUser.uid)
            .get();
        
        // Tạo map điểm theo ngày
        const dailyScores = {};
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const date = data.date;
            if (!dailyScores[date]) {
                dailyScores[date] = 0;
            }
            dailyScores[date] += data.analysis.total_score || 0;
        });
        
        // Tạo labels và data cho chart
        const labels = [];
        const scores = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            labels.push(date.toLocaleDateString('vi-VN', { 
                day: '2-digit', 
                month: '2-digit' 
            }));
            scores.push(dailyScores[dateStr] || 0);
        }
        
        // Update chart
        progressChart.data.labels = labels;
        progressChart.data.datasets[0].data = scores;
        progressChart.update();
        
    } catch (error) {
        console.error('Chart error:', error);
    }
}

// Gọi init chart sau khi load user data
const originalLoadUserData = loadUserData;
loadUserData = async function() {
    await originalLoadUserData();
    setTimeout(() => initProgressChart(), 500);
};

function updateAchievementsDisplay() {
    const grid = document.getElementById('achievementsGrid');
    if (!grid) return;
    
    const unlockedAchievements = userStats.achievements || [];
    const unlockedCount = unlockedAchievements.length;
    const totalCount = ACHIEVEMENTS.length;
    
    // Group achievements by category
    const categories = {
        start: { name: '🌱 Khởi Đầu', achievements: [] },
        entries: { name: '📖 Nhật Ký', achievements: [] },
        streak: { name: '🔥 Kiên Trì', achievements: [] },
        points: { name: '⭐ Điểm Số', achievements: [] },
        good: { name: '🙏 Việc Thiện', achievements: [] },
        perfect: { name: '🌸 Hoàn Hảo', achievements: [] },
        special: { name: '🎯 Đặc Biệt', achievements: [] }
    };
    
    ACHIEVEMENTS.forEach(a => {
        const cat = a.category || 'special';
        if (categories[cat]) {
            categories[cat].achievements.push(a);
        }
    });
    
    let html = `
        <div class="achievements-summary">
            <div class="achievements-progress">
                <span class="progress-text">🏆 ${unlockedCount}/${totalCount} thành tựu</span>
                <div class="progress-bar-mini">
                    <div class="progress-fill-mini" style="width: ${(unlockedCount/totalCount)*100}%"></div>
                </div>
            </div>
        </div>
    `;
    
    for (const [catId, category] of Object.entries(categories)) {
        if (category.achievements.length === 0) continue;
        
        const unlockedInCat = category.achievements.filter(a => unlockedAchievements.includes(a.id)).length;
        
        html += `
            <div class="achievement-category">
                <h4 class="category-title">
                    ${category.name}
                    <span class="category-count">${unlockedInCat}/${category.achievements.length}</span>
                </h4>
                <div class="category-grid">
                    ${category.achievements.map(achievement => {
                        const isUnlocked = unlockedAchievements.includes(achievement.id);
                        return `
                            <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}" 
                                 title="${achievement.description}${isUnlocked ? '\n🎁 Đã nhận: +' + achievement.reward + ' điểm' : '\n🎁 Thưởng: +' + achievement.reward + ' điểm'}">
                                <div class="achievement-icon-large">${achievement.icon}</div>
                                <div class="achievement-name">${achievement.name}</div>
                                <div class="achievement-desc">${achievement.description}</div>
                                <div class="achievement-reward">+${achievement.reward}</div>
                                ${isUnlocked ? '<div class="achievement-unlocked">✅</div>' : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    grid.innerHTML = html;
}

// Gọi sau updateDisplay
const originalUpdateDisplay = updateDisplay;
updateDisplay = function() {
    originalUpdateDisplay();
    updateAchievementsDisplay();
};

// ===== XÓA NHẬT KÝ =====
window.deleteEntry = async function(entryId, entryScore, event) {
    if (event) event.stopPropagation();
    
    if (!currentUser) {
        alert('⚠️ Bạn cần đăng nhập để thực hiện thao tác này');
        return;
    }
    
    // Xác nhận xóa
    const confirmDelete = confirm(
        `🗑️ Xác nhận xóa nhật ký này?\n\n` +
        `Điểm công đức sẽ bị trừ: ${entryScore >= 0 ? '-' : '+'}${Math.abs(entryScore)} điểm\n\n` +
        `⚠️ Hành động này không thể hoàn tác!`
    );
    
    if (!confirmDelete) return;
    
    try {
        // Xóa entry từ Firestore
        await db.collection('entries').doc(entryId).delete();
        
        // Trừ điểm từ tổng điểm
        userStats.totalPoints -= entryScore;
        if (userStats.totalPoints < 0) userStats.totalPoints = 0;
        
        // Cập nhật rank nếu cần
        const newRank = getCurrentRank();
        userStats.rank = newRank.id;
        
        // Lưu stats mới
        await saveUserStats();
        
        // Xóa card khỏi UI với animation
        const card = document.getElementById(`card-${entryId}`);
        if (card) {
            card.style.transition = 'all 0.3s ease';
            card.style.opacity = '0';
            card.style.transform = 'translateX(-100%)';
            setTimeout(() => card.remove(), 300);
        }
        
        // Cập nhật UI
        updateDisplay();
        updateDetailedStats();
        
        showNotification(`✅ Đã xóa nhật ký. ${entryScore > 0 ? '-' : '+'}${Math.abs(entryScore)} điểm`, 'info');
        
    } catch (error) {
        console.error('Delete error:', error);
        alert('❌ Lỗi khi xóa: ' + error.message);
    }
};

// ===== XÓA TẤT CẢ DỮ LIỆU =====
window.deleteAllData = async function() {
    if (!currentUser) {
        alert('⚠️ Bạn cần đăng nhập để thực hiện thao tác này');
        return;
    }
    
    // Xác nhận 2 lần
    const confirm1 = confirm(
        '⚠️ CẢNH BÁO: Xóa toàn bộ dữ liệu?\n\n' +
        'Bao gồm:\n' +
        '• Tất cả nhật ký đã ghi\n' +
        '• Toàn bộ điểm công đức\n' +
        '• Streak và thành tựu\n\n' +
        'Hành động này KHÔNG THỂ HOÀN TÁC!'
    );
    
    if (!confirm1) return;
    
    const confirm2 = prompt(
        'Để xác nhận, hãy nhập "XOA TAT CA" (viết hoa):'
    );
    
    if (confirm2 !== 'XOA TAT CA') {
        alert('❌ Xác nhận không đúng. Dữ liệu được giữ nguyên.');
        return;
    }
    
    try {
        showNotification('🔄 Đang xóa dữ liệu...', 'info');
        
        // Xóa tất cả entries của user
        const entriesSnapshot = await db.collection('entries')
            .where('userId', '==', currentUser.uid)
            .get();
        
        const batch = db.batch();
        entriesSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        // Xóa userStats
        batch.delete(db.collection('userStats').doc(currentUser.uid));
        
        await batch.commit();
        
        // Reset local state
        userStats = {
            totalPoints: 0,
            streak: 0,
            rank: 'moi_tu_tap',
            lastEntryDate: null,
            achievements: []
        };
        
        // Cập nhật UI
        updateDisplay();
        loadHistory();
        updateDetailedStats();
        
        showNotification('✅ Đã xóa toàn bộ dữ liệu. Bắt đầu lại từ đầu!', 'success');
        
    } catch (error) {
        console.error('Delete all error:', error);
        alert('❌ Lỗi khi xóa: ' + error.message);
    }
};

// ===== XUẤT DỮ LIỆU =====
window.exportData = async function() {
    if (!currentUser) {
        alert('⚠️ Bạn cần đăng nhập để xuất dữ liệu');
        return;
    }
    
    try {
        showNotification('🔄 Đang chuẩn bị dữ liệu...', 'info');
        
        const snapshot = await db.collection('entries')
            .where('userId', '==', currentUser.uid)
            .orderBy('timestamp', 'desc')
            .get();
        
        const entries = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            entries.push({
                date: data.date,
                diary: data.diaryText,
                score: data.analysis.total_score,
                good_actions: data.analysis.good_actions,
                bad_actions: data.analysis.bad_actions,
                advice: data.analysis.advice
            });
        });
        
        const exportData = {
            user: currentUser.email,
            exportDate: new Date().toISOString(),
            totalPoints: userStats.totalPoints,
            streak: userStats.streak,
            rank: userStats.rank,
            entries: entries
        };
        
        // Tạo file download
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `congquacach_${currentUser.email}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('✅ Đã xuất dữ liệu thành công!', 'success');
        
    } catch (error) {
        console.error('Export error:', error);
        alert('❌ Lỗi khi xuất dữ liệu: ' + error.message);
    }
};

// ===== TÍNH LẠI ĐIỂM TỪ ENTRIES =====
window.recalculatePoints = async function() {
    if (!currentUser) {
        alert('⚠️ Bạn cần đăng nhập');
        return;
    }
    
    const confirm1 = confirm(
        '🔄 Tính lại toàn bộ điểm từ nhật ký?\n\n' +
        'Điều này sẽ:\n' +
        '• Cộng lại tất cả điểm từ các entry\n' +
        '• Cập nhật rank phù hợp\n\n' +
        'Tiếp tục?'
    );
    
    if (!confirm1) return;
    
    try {
        showNotification('🔄 Đang tính lại điểm...', 'info');
        
        const snapshot = await db.collection('entries')
            .where('userId', '==', currentUser.uid)
            .get();
        
        let totalPoints = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            totalPoints += (data.analysis.total_score || 0) + DAILY_ENTRY_BONUS;
        });
        
        // Thêm streak bonuses (ước tính)
        // Không thể tính chính xác vì không có history của streak
        
        userStats.totalPoints = totalPoints;
        const newRank = getCurrentRank();
        userStats.rank = newRank.id;
        
        await saveUserStats();
        updateDisplay();
        updateDetailedStats();
        
        showNotification(`✅ Đã tính lại! Tổng điểm: ${totalPoints}`, 'success');
        
    } catch (error) {
        console.error('Recalculate error:', error);
        alert('❌ Lỗi: ' + error.message);
    }
};

console.log('🪷 Sổ Công Quá Cách AI initialized');
console.log('📱 Firebase:', firebaseConfig.projectId);
console.log('🤖 Gemini AI ready');
