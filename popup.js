document.addEventListener("DOMContentLoaded", () => {
  const volSlider = document.getElementById("volSlider");
  const volDisplay = document.getElementById("volDisplay");
  const voiceToggle = document.getElementById("voiceToggle");
  const saveBtn = document.getElementById("saveBtn");
  const statusDiv = document.getElementById("status");
  const telegramTokenInput = document.getElementById("telegramToken");
  const telegramChatIdInput = document.getElementById("telegramChatId");

  // 1. Load dữ liệu đã lưu khi mở Popup
  chrome.storage.local.get(
    ["minVolume", "isVoiceEnabled", "telegramToken", "telegramChatId"],
    (data) => {
      const savedVol = data.minVolume !== undefined ? data.minVolume : 100;
      volSlider.value = savedVol;
      volDisplay.innerText = Number(savedVol).toLocaleString("vi-VN");

      voiceToggle.checked =
        data.isVoiceEnabled !== undefined ? data.isVoiceEnabled : true;

      if (data.telegramToken) telegramTokenInput.value = data.telegramToken;
      if (data.telegramChatId) telegramChatIdInput.value = data.telegramChatId;
    },
  );

  // 2. Cập nhật con số hiển thị ngay khi kéo thanh trượt
  volSlider.addEventListener("input", () => {
    volDisplay.innerText = Number(volSlider.value).toLocaleString("vi-VN");
  });

  // 3. Tự động lưu trạng thái bật/tắt (Không cần bấm nút Lưu)
  voiceToggle.addEventListener("change", () => {
    chrome.storage.local.set({ isVoiceEnabled: voiceToggle.checked });
  });

  // 4. Nút Lưu (Slider + Telegram)
  saveBtn.addEventListener("click", () => {
    chrome.storage.local.set(
      {
        minVolume: parseInt(volSlider.value),
        isVoiceEnabled: voiceToggle.checked,
        telegramToken: (telegramTokenInput.value || "").trim(),
        telegramChatId: (telegramChatIdInput.value || "").trim(),
      },
      () => {
        statusDiv.style.display = "block";
        setTimeout(() => (statusDiv.style.display = "none"), 1500);
      },
    );
  });
});
