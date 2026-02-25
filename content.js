let MIN_VOLUME = 100;
let IS_VOICE_ENABLED = true; // Biến kiểm soát âm thanh
const TELEGRAM_TOKEN = "8780337688:AAGXja1qaJg3Mp9Me-X1B3zwycKXCdlx5Ms"; // Thay Token của bạn
const TELEGRAM_CHAT_ID = "1435951187"; // Thay Chat ID của bạn
const SHARK_VOLUME = 50000; // Ngưỡng gọi là "Cá mập" (VD: 50,000 cổ)

// 1. Lấy cấu hình ban đầu
chrome.storage.local.get(["minVolume", "isVoiceEnabled"], (data) => {
  if (data.minVolume !== undefined) MIN_VOLUME = parseInt(data.minVolume);
  if (data.isVoiceEnabled !== undefined) IS_VOICE_ENABLED = data.isVoiceEnabled;
  console.log(
    `[Khởi động] Đọc lệnh >= ${MIN_VOLUME} cổ. Trạng thái loa: ${IS_VOICE_ENABLED ? "BẬT" : "TẮT"}`,
  );
});

// 2. Lắng nghe thay đổi từ Popup (Công tắc & Slider)
chrome.storage.onChanged.addListener((changes) => {
  if (changes.minVolume) {
    MIN_VOLUME = parseInt(changes.minVolume.newValue);
    console.log(`[Cập nhật] Lọc lệnh >= ${MIN_VOLUME} cổ`);
  }
  if (changes.isVoiceEnabled) {
    IS_VOICE_ENABLED = changes.isVoiceEnabled.newValue;
    console.log(`[Cập nhật] Loa đang: ${IS_VOICE_ENABLED ? "BẬT" : "TẮT"}`);
    // Tắt ngay lập tức nếu đang đọc dở câu
    if (!IS_VOICE_ENABLED) window.speechSynthesis.cancel();
  }
});

// 1. CƠ CHẾ ĐÁNH THỨC: Liên tục "đá" (resume) engine giọng nói để nó không bị treo
setInterval(() => {
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
}, 10000); // 10 giây gọi 1 lần

function speak(text) {
  // 🎯 CHẶN ĐỌC: Nếu công tắc đang tắt, thoát hàm ngay lập tức
  if (!IS_VOICE_ENABLED) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "vi-VN";
  utterance.rate = 1.3;
  window.speechSynthesis.speak(utterance);
}

let lastTradeKey = "";
let heartbeatCount = 0;

setInterval(() => {
  // 2. NHỊP TIM: Báo hiệu Bot vẫn sống mỗi 10 giây (20 chu kỳ * 500ms)
  heartbeatCount++;
  if (heartbeatCount % 20 === 0) {
    console.log("💓 Bot vẫn đang thở và quét dữ liệu...");
  }

  const allVisibleItems = document.querySelectorAll(
    '[data-test-id="virtuoso-item-list"] [data-index]',
  );

  if (allVisibleItems.length > 0) {
    // Tìm item có data-index nhỏ nhất (lệnh mới nhất)
    let latestItem = Array.from(allVisibleItems).reduce((prev, curr) => {
      return parseInt(prev.getAttribute("data-index")) <
        parseInt(curr.getAttribute("data-index"))
        ? prev
        : curr;
    });

    // 🎯 Đi sâu vào lớp chứa 5 cột (time, price, +/-, vol, side)
    const innerRow = latestItem.querySelector(".flex-row .flex-row");

    if (innerRow && innerRow.children.length >= 5) {
      // Lấy trực tiếp các thẻ con bên trong cùng
      const cells = innerRow.children;

      const time = cells[0].innerText.trim();
      const price = cells[1].innerText.trim();
      const volume = cells[3].innerText.trim();
      const side = cells[4].innerText.trim();

      const currentKey = `${time}_${volume}_${price}_${side}`;

      if (currentKey !== lastTradeKey) {
        const cleanVol = parseInt(volume.replace(/,/g, ""));

        // có thể bỏ comment dòng này để xem Console có lấy đúng số chưa
        // console.log(`[DEBUG] Lấy được: T=${time}, P=${price}, V=${cleanVol}, S=${side}`);

        if (cleanVol >= 100) {
          let sideText = side === "M" ? "Mua" : side === "B" ? "Bán" : "Khớp";
          const cleanPrice = price.replace(".", " chấm ");
          const msg = `${sideText} ${cleanVol} cổ. Giá ${cleanPrice}`;
          speak(msg);

          // 🎯 KÍCH HOẠT BÁO ĐỘNG CÁ MẬP (TELEGRAM)
          if (cleanVol >= SHARK_VOLUME) {
            sendTelegramAlert(sideText, cleanVol, price);
          }
        }
        lastTradeKey = currentKey;
      }
    }
  }
}, 500);

// Hàm bắn thông báo khẩn cấp qua Telegram
async function sendTelegramAlert(side, volume, price) {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) return;

  // Tự động lấy tên mã cổ phiếu từ tiêu đề trang web (VD: "IJC - Công ty Cổ phần...")
  const symbol = document.title.split("-")[0].trim() || "Cổ Phiếu";

  const emoji = side === "Mua" ? "🟢" : side === "Bán" ? "🔴" : "⚪";
  const alertMsg =
    `🚨 <b>CÁ MẬP XUẤT HIỆN</b> 🚨\n\n` +
    `📊 Mã: <b>${symbol}</b>\n` +
    `🔥 Hành động: ${emoji} <b>${side} CHỦ ĐỘNG</b>\n` +
    `💰 Khối lượng: <b>${Number(volume).toLocaleString("vi-VN")} cổ</b>\n` +
    `💵 Mức giá: <b>${price}</b>\n\n` +
    `<i>🕒 ${new Date().toLocaleTimeString("vi-VN")} - Từ Stock Radar</i>`;

  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: alertMsg,
        parse_mode: "HTML", // Để hiển thị in đậm, in nghiêng
      }),
    });
    console.log(`✈️ [Telegram] Đã báo động Cá Mập mã ${symbol}!`);
  } catch (error) {
    console.error("Lỗi gửi Telegram:", error);
  }
}
