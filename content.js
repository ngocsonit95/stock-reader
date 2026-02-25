// 1. Cấu hình giọng đọc
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "vi-VN";
  utterance.rate = 1.1;
  window.speechSynthesis.speak(utterance);
}

// 2. Khai báo biến ghi nhớ để tránh đọc trùng
let lastTradeKey = "";

const observer = new MutationObserver((mutations) => {
  // Tìm danh sách các mục trong sổ lệnh
  const items = document.querySelectorAll(
    '[data-test-id="virtuoso-item-list"] [data-item-index]',
  );

  if (items.length > 0) {
    // Lấy mục đầu tiên (lệnh mới nhất thường nằm ở index 0 hoặc index cuối tùy sắp xếp)
    // Dựa vào HTML của Sơn, index 0 là 14:46:15 (mới nhất)
    const latestNode = items[0];
    const cells = latestNode.querySelectorAll(".flex-row > div");

    if (cells.length >= 4) {
      const time = cells[0].innerText; // 14:46:15
      const price = cells[1].innerText; // 10.70
      const volume = cells[3].innerText; // 5,500
      const side = cells[4].innerText || "ATC"; // M/B (Nếu trống thường là lệnh khớp định kỳ)

      // Tạo key duy nhất để kiểm tra lệnh mới
      const currentTradeKey = `${time}_${volume}_${price}`;

      if (currentTradeKey !== lastTradeKey) {
        // Lọc: Chỉ đọc lệnh của IJC (Giả định Sơn đang mở đúng tab IJC)
        // Vì giao diện sổ lệnh con không hiện chữ IJC, nên Extension mặc định
        // là Sơn đang xem IJC rồi mới đọc.

        let sideText = side === "M" ? "Mua" : side === "B" ? "Bán" : "Khớp";
        const msg = `I J C. ${sideText} ${volume} cổ. Giá ${price}`;

        speak(msg);
        lastTradeKey = currentTradeKey;
      }
    }
  }
});

// 3. Kết nối vào Scroller của FireAnt
// Chúng ta bắt đầu quan sát cái div chứa danh sách ảo
const targetNode = document.querySelector(
  '[data-test-id="virtuoso-item-list"]',
);

if (targetNode) {
  observer.observe(targetNode, { childList: true, subtree: true });
  speak(" Đã kết nối vào Sổ lệnh thành công!");
} else {
  // Nếu chưa tìm thấy (do web chưa load xong), thử lại sau 2 giây
  setTimeout(() => location.reload(), 5000);
  console.log("waiting for FireAnt to load...");
}
