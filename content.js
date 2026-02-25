// 1. CƠ CHẾ ĐÁNH THỨC: Liên tục "đá" (resume) engine giọng nói để nó không bị treo
setInterval(() => {
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
}, 10000); // 10 giây gọi 1 lần

function speak(text) {
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
        }
        lastTradeKey = currentKey;
      }
    }
  }
}, 500);
