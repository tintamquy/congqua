// ===== CÔNG QUÁ CÁCH AI ANALYZER - PROMPT THÔNG MINH =====
class CongQuaCachAI {
    constructor(options = {}) {
        this.directApiKey = options.apiKey || null;
        this.directApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
        this.proxyEndpoint = options.proxyEndpoint || '/api/gemini';
        
        // Link Google Sheets công khai chứa bảng điểm đầy đủ
        this.fullScoringTableUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTExwxJQZbZskzJ7J0Yy_2tRu9bTkocJVhvd7H1-FRwzH2F9RMySbi5sg2Ei5cBKA/pubhtml';
    }

    async analyzeDiary(diaryText) {
        const prompt = this.buildSmartPrompt(diaryText);
        
        try {
            const data = this.directApiKey
                ? await this.callGeminiDirect(prompt)
                : await this.callGeminiViaProxy(prompt);
            
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!rawText) {
                throw new Error('Invalid response from AI');
            }
            
            // Parse JSON từ response
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Invalid JSON response from AI');
            }

            const analysis = JSON.parse(jsonMatch[0]);
            
            // Normalize và validate
            return this.normalizeAnalysis(analysis);
            
        } catch (error) {
            console.error('AI Analysis Error:', error);
            throw new Error('Không thể phân tích nhật ký. Vui lòng thử lại.');
        }
    }

    async callGeminiViaProxy(prompt) {
        const response = await fetch(this.proxyEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} ${errorText}`);
        }

        return response.json();
    }

    async callGeminiDirect(prompt) {
        const response = await fetch(`${this.directApiUrl}?key=${this.directApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 2048
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return response.json();
    }

    buildSmartPrompt(diaryText) {
        return `BẠN LÀ CHUYÊN GIA CHẤM ĐIỂM CÔNG QUÁ CÁCH THEO TRUYỀN THỐNG PHẬT GIÁO & NHO GIÁO.

📖 THAM KHẢO: Bảng điểm chi tiết đầy đủ tại:
${this.fullScoringTableUrl}

NHIỆM VỤ: Phân tích nhật ký và chấm điểm CHÍNH XÁC, NHẤT QUÁN theo bảng điểm chuẩn.

NHẬT KÝ:
"""
${diaryText}
"""

===== BẢNG ĐIỂM TÓM TẮT - 17 NHÓM CÔNG QUÁ CÁCH =====

**1. ĐỐI VỚI CHA MẸ** (41 điều - QUAN TRỌNG NHẤT)
   📌 Nguyên tắc: Hiếu đạo là gốc của trăm hạnh
   
   CÔNG (+1 đến +1000):
   • Yêu thương, hòa nhã: +1
   • Hỏi thăm sức khỏe: +1
   • Chi tiêu, cho tiền: +3 đến +10
   • Khuyên điều tốt: +3 đến +10
   • Chăm sóc bệnh: +30 đến +50
   • Làm rạng danh: +50 đến +100
   • Cứu cha mẹ: +100 đến +1000
   
   QUÁ (-1 đến -100):
   • Không quan tâm: -1
   • Làm cha mẹ khổ: -10
   • Trách móc: -10 đến -30
   • Nóng giận, đánh đập: -20 đến -100

**2. ĐỐI VỚI ANH EM** (24 điều)
   📌 Nguyên tắc: Huynh đệ hòa thuận
   
   CÔNG: Thương yêu (+1), Giúp đỡ (+1 đến +50), Nhường tài sản (+10 đến +100)
   QUÁ: Ganh tị (-2), Tranh chấp (-10), Chia rẽ (-100)

**3. ĐỐI VỚI VỢ CON** (15+13 điều)
   📌 Nguyên tắc: Hòa thuận gia đạo
   
   CÔNG: Nhường nhịn (+1 đến +10), Dạy dỗ con (+1 đến +100)
   QUÁ: Bạo hành (-10 đến -100), Nuông chiều con (-5 đến -10)

**4. THẦY BẠN** (17 điều)
   📌 Nguyên tắc: Tôn sư trọng đạo
   
   CÔNG: Kính trọng thầy (+1 đến +10), Giữ lời hứa (+1 đến +10)
   QUÁ: Bội nghĩa (-10 đến -100)

**5. GIA NHÂN/NHÂN VIÊN** (16 điều)
   📌 Nguyên tắc: Đối xử công bằng
   
   CÔNG: Chu cấp tốt (+1 đến +10), Dạy dỗ (+5)
   QUÁ: Áp bức (-10 đến -100)

**6. BÁC ÁI TỪ THIỆN** (75 điều - QUAN TRỌNG)
   📌 Nguyên tắc: Từ bi hỷ xả
   
   CÔNG (+1 đến +100):
   • Cho ăn/uống: +1
   • Giúp người nghèo: +1 đến +10
   • Chữa bệnh: +1 đến +10
   • Giúp vốn kinh doanh: +50 đến +100
   • Cứu người nguy hiểm: +20 đến +50
   • Cứu mạng người: +100
   
   QUÁ (-50 đến -1000):
   • Không cứu người nguy: -50
   • Hại người: -100
   • Giết người: -1000

**7. THƯƠNG YÊU ĐỘNG VẬT** (16 điều)
   📌 Nguyên tắc: Bất sát sinh
   
   CÔNG: Cứu động vật (+1 đến +10), Ăn chay (+5), Phóng sinh (+1 đến +5)
   QUÁ: Đánh động vật (-20 đến -30), Giết (-5 đến -100)

**8. VIỆC THIỆN/ÁC** (40 điều)
   📌 Nguyên tắc: Làm phước cho đời
   
   CÔNG: Khuyên người (+30), In sách thiện (+50 đến +1000), Xây chùa/cầu (+100 đến +1000)
   QUÁ: Phá hoại (-50 đến -100), Gieo rắc bất hòa (-100)

**9. TƯ TƯỞNG - Ý THIỆN** (12 điều)
   📌 Nguyên tắc: Tâm tịnh thì cảnh tịnh
   
   CÔNG (+10 đến +50):
   • Thanh tịnh, thiền định: +10
   • Vui vẻ không giận: +10
   • Kiềm chế dục vọng: +10 đến +20
   • Thấy người đẹp không động lòng: +50
   
   QUÁ (-10):
   • Nghĩ xấu, lười biếng, ganh ghét, giận dữ: -10 mỗi loại

**10. HÀNH VI** (19 điều)
   📌 Nguyên tắc: Làm việc chính đáng
   
   CÔNG: Chăm chỉ (+1 đến +10), Hoàn thành nhiệm vụ (+1 đến +10)
   QUÁ: Lười nhác (-1 đến -10)

**11. NGÔN NGỮ** (18 điều)
   📌 Nguyên tắc: Cẩn ngôn
   
   CÔNG (+1 đến +50):
   • Nói thật: +1
   • Chỉ đường, dạy dỗ: +1 đến +5
   • Khuyên người làm lành: +30 đến +50
   
   QUÁ (-5 đến -500):
   • Nói dối: -5
   • Mắng chửi: -5
   • Nói xấu: -5
   • **Nói lỗi cha mẹ: -500 (CỰC NẶNG!)**

**12. THÁNH THẦN - THỜ CÚNG** (16 điều)
   📌 Nguyên tắc: Tôn kính tam bảo
   
   CÔNG: Thờ cúng đúng lễ (+1 đến +10), Tôn kính Phật (+10 đến +100)
   QUÁ: Chế giễu tôn giáo (-50), Xúc phạm kinh sách (-50)

**13. DỤC VỌNG & TỰ CHẾ** (15 điều)
   📌 Nguyên tắc: Thiểu dục tri túc
   
   CÔNG: Kiềm chế dục vọng (+10 đến +20), Nhẫn nhịn (+5 đến +10)
   QUÁ: Ham muốn quá độ (-10 đến -30), Giận mất kiểm soát (-10)

**14. ĂN MẶC** (7 điều)
   📌 Nguyên tắc: Tiết kiệm giản dị
   
   CÔNG: Tiết kiệm (+1), Ăn lành mạnh (+1)
   QUÁ: Lãng phí (-1), Ăn uống sa đọa (-5)

**15. TÀI SẢN** (31 điều)
   📌 Nguyên tắc: Chính đáng, trung thực
   
   CÔNG: Kinh doanh trung thực (+1 đến +10), Cho vay không lãi (+10 đến +50)
   QUÁ: Lừa đảo (-100), Trộm cắp (-50 đến -100), Tham ô (-100)

**16. GIỚI DÂM** (38 điều)
   📌 Nguyên tắc: Giữ gìn tiết hạnh
   
   CÔNG: Tôn trọng phụ nữ (+1 đến +100), Giữ danh tiết (+50 đến +1000)
   QUÁ: Ngoại tình (-100 đến -1000), Cưỡng dâm (-1000)

**17. CÔNG VIỆC THIỆN KHÁC** (40 điều)
   CÔNG: Cứu người khỏi tai nạn (+20 đến +100), Xây dựng công trình (+50 đến +1000)

===== QUY TẮC CHẤM ĐIỂM BẮT BUỘC =====

1. ✅ CHỈ chấm hành động CỤ THỂ, RÕ RÀNG có ý nghĩa đạo đức
2. ❌ KHÔNG chấm hoạt động thường ngày vô nghĩa (ăn cơm, đi làm, đi học, ngủ)
3. 🔄 Hành động lặp lại trong ngày → CHỈ tính 1 lần
4. ⚖️ Phải CÔNG BẰNG, NHẤT QUÁN mọi lần phân tích
5. 📊 Ưu tiên hành động có tác động đạo đức lớn (17 nhóm trên)
6. 🎯 Điểm phải hợp lý, không quá cao hoặc quá thấp

===== VÍ DỤ THỰC TẾ CHI TIẾT =====

**VÍ DỤ 1: Nhật ký tốt**
Nhật ký: "Sáng dậy 6h, tập gym. Tôi cho mẹ 50k. Chiều học bài 2 tiếng. Tối thiền 30 phút."

Phân tích:
✅ Dậy sớm: +1 (Nhóm 14: Ăn mặc)
✅ Tập gym: +1 (Nhóm 14)
✅ Cho mẹ 50k: +3 (Nhóm 1: Cha mẹ)
✅ Học bài: +1 (Nhóm 10: Hành vi)
✅ Thiền định: +10 (Nhóm 9: Tư tưởng)
**TỔNG: +16 điểm**

**VÍ DỤ 2: Nhật ký xấu**
Nhật ký: "Hôm nay tôi cãi nhau với mẹ và la mắng. Tối tôi giận và đá con chó."

Phân tích:
❌ La mắng mẹ: -10 (Nhóm 1: Cha mẹ)
❌ Đá chó: -20 (Nhóm 7: Động vật)
**TỔNG: -30 điểm**

**VÍ DỤ 3: Nhật ký bình thường**
Nhật ký: "Hôm nay tôi ăn sáng, đi làm, về nhà ăn tối, xem TV, đi ngủ."

Phân tích:
(Không có hành động đáng chấm điểm - tất cả đều là hoạt động thường ngày)
**TỔNG: 0 điểm**

**VÍ DỤ 4: Nhật ký phức tạp**
Nhật ký: "Sáng tôi dậy lúc 6h, tập thể dục. Tôi cho mẹ 20k để gửi xe. Trưa tôi giúp bà cụ qua đường và cho người ăn xin 10k. Chiều học bài. Tối tôi giận và đá con chó vì phá đồ."

Phân tích:
✅ Dậy sớm: +1 (Nhóm 14)
✅ Tập thể dục: +1 (Nhóm 14)
✅ Cho mẹ 20k: +3 (Nhóm 1)
✅ Giúp bà cụ: +1 (Nhóm 6: Bác ái)
✅ Cho người nghèo: +1 (Nhóm 6)
✅ Học bài: +1 (Nhóm 10)
❌ Đá chó: -20 (Nhóm 7)
**TỔNG: -12 điểm**

===== TRẢ VỀ JSON (BẮT BUỘC FORMAT CHÍNH XÁC) =====

{
  "good_actions": [
    {
      "action": "Tên hành động ngắn gọn",
      "points": X,
      "category": "Nhóm X: Tên nhóm",
      "explanation": "Lý do 1 câu ngắn"
    }
  ],
  "bad_actions": [
    {
      "action": "Tên hành động ngắn gọn",
      "points": -X,
      "category": "Nhóm X: Tên nhóm",
      "explanation": "Lý do 1 câu ngắn"
    }
  ],
  "total_score": 0,
  "advice": "Lời khuyên ngắn gọn 1-2 câu, khích lệ tích cực"
}

===== LƯU Ý QUAN TRỌNG =====

⚠️ TUYỆT ĐỐI KHÔNG được chấm điểm:
- Ăn (trừ khi ăn chay hoặc ăn uống sa đọa)
- Ngủ
- Đi học/làm (hoạt động thường ngày)
- Đi chơi bình thường
- Xem TV, đọc báo bình thường

✅ CHỈ chấm điểm:
- Hành động có ý nghĩa đạo đức rõ ràng
- Thuộc 17 nhóm trong bảng Công Quá Cách
- Có tác động tích cực hoặc tiêu cực đến người khác/bản thân

📌 Khi nhật ký dài:
- Ưu tiên hành động quan trọng (cha mẹ, bác ái, động vật)
- Không liệt kê hành động thường ngày
- Tóm gọn, chỉ chấm điều cốt lõi

BẮT ĐẦU PHÂN TÍCH NGAY:`;
    }

    normalizeAnalysis(analysis) {
        // Khởi tạo mặc định
        if (!analysis.good_actions) analysis.good_actions = [];
        if (!analysis.bad_actions) analysis.bad_actions = [];
        
        // Loại bỏ duplicate
        analysis.good_actions = this.removeDuplicates(analysis.good_actions);
        analysis.bad_actions = this.removeDuplicates(analysis.bad_actions);
        
        // Validate điểm từng action
        analysis.good_actions = analysis.good_actions.map(action => {
            action.points = Math.min(Math.max(action.points, 1), 1000);
            return action;
        });
        
        analysis.bad_actions = analysis.bad_actions.map(action => {
            action.points = Math.max(Math.min(action.points, -1), -1000);
            return action;
        });
        
        // Tính lại tổng điểm
        const goodTotal = analysis.good_actions.reduce((sum, a) => sum + a.points, 0);
        const badTotal = analysis.bad_actions.reduce((sum, a) => sum + a.points, 0);
        analysis.total_score = goodTotal + badTotal;
        
        // Giới hạn tổng điểm hợp lý
        analysis.total_score = Math.max(Math.min(analysis.total_score, 1000), -1000);
        
        return analysis;
    }

    removeDuplicates(actions) {
        const seen = new Set();
        return actions.filter(action => {
            const key = action.action.toLowerCase().trim();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    validateAnalysis(analysis) {
        if (!analysis.good_actions || !Array.isArray(analysis.good_actions)) {
            throw new Error('Invalid good_actions');
        }
        if (!analysis.bad_actions || !Array.isArray(analysis.bad_actions)) {
            throw new Error('Invalid bad_actions');
        }
        if (typeof analysis.total_score !== 'number') {
            throw new Error('Invalid total_score');
        }
        return true;
    }
}

// Export cho window
if (typeof window !== 'undefined') {
    window.CongQuaCachAI = CongQuaCachAI;
}
