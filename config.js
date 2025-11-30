// Firebase Configuration
// Lấy từ Firebase Console > Project Settings > Your apps > SDK setup and configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCPLUsJ-bbKRCeNS2hMpLcON3wz9iYLqw0",
    authDomain: "congquacach-ed087.firebaseapp.com",
    projectId: "congquacach-ed087",
    storageBucket: "congquacach-ed087.firebasestorage.app",
    messagingSenderId: "895889020313",
    appId: "1:895889020313:web:de65e81b0df3f7782cef08",
    measurementId: "G-Z6CFF22EBM"
  };

// Gemini API Key
// Lấy từ aistudio.google.com/apikey
const GEMINI_API_KEY = "AIzaSyCqTk4lLdPBR07Q233BgXx9vO8Ozf9U4RU"; // Thay bằng Gemini API Key

// Export để dùng trong các file khác
window.CONFIG = {
    firebase: firebaseConfig,
    gemini: GEMINI_API_KEY
};
