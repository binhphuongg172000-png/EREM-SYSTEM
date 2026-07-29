export interface GreetingInfo {
  greeting: string;
  humorTag: string;
  icon: string;
}

export function getSmartGreeting(userName: string = "Bạn"): GreetingInfo {
  const hour = new Date().getHours();

  let greeting = "";
  let icon = "👋";
  let humorTags: string[] = [];

  // Greetings & Funny Humor Tags by precise time of day
  if (hour >= 5 && hour < 11) {
    // BUỔI SÁNG (5h - 11h)
    const morningGreetings = [
      `Chào buổi sáng tỉnh táo, ${userName}!`,
      `Sáng rồi, nổ deal thôi sếp ${userName}!`,
      `Cà phê phin đậm đà, sẵn sàng chốt hợp đồng ${userName}!`,
      `Nạp full 100% pin buổi sáng thôi ${userName}!`,
      `Chào chiến thần chốt đơn ${userName}!`,
    ];
    greeting = morningGreetings[Math.floor(Math.random() * morningGreetings.length)];
    icon = "☀️";
    humorTags = [
      "Húp ngụm cà phê, chốt deal giòn giã! ☕",
      "Sáng ra tài lộc ào ào gõ cửa! 💰",
      "Máy tính thơm mùi deal mới! 💻",
      "Thời tiết đẹp, sếp duyệt ngân sách liền tay! ☀️",
      `KPI sáng nay gọi tên ${userName}! 🎯`,
    ];
  } else if (hour >= 11 && hour < 14) {
    // BUỔI TRƯA (11h - 14h) - TRÀ SỮA, CƠM TẤM, NẠP PIN
    const noonGreetings = [
      `Buổi trưa nạp pin, đặt trà sữa chưa sếp ${userName}?`,
      `Ăn trưa cơm tấm no nê thôi ${userName}!`,
      `Nghỉ tay uống trà sữa full topping sếp ${userName} ơi!`,
      `Trưa rồi, tạm gác dự trù làm ly trà sữa nhé ${userName}!`,
      `Nạp năng lượng cơm trưa thôi ${userName}!`,
      `Trưa nắng nóng, trà sữa mát lạnh thôi ${userName}!`,
    ];
    greeting = noonGreetings[Math.floor(Math.random() * noonGreetings.length)];
    icon = "🍱";
    humorTags = [
      "Trà sữa 70% đường, 100% năng lượng nổ deal! 🥤",
      "Bụng no tròn, hợp đồng tròn trĩnh! 🍱",
      "Ăn trưa no nê, chiều chốt trăm triệu! 💰",
      "Một ly trà sữa giải tỏa mọi áp lực KPI! 🥤",
      "Cơm trưa thơm phức, sếp duyệt ngân sách vèo vèo! 🍛",
      "Trà sữa full topping = KPI full target! 🎯",
      "Ăn trưa xong nghỉ 15 phút rồi cày deal tiếp! ☕",
    ];
  } else if (hour >= 14 && hour < 18) {
    // BUỔI CHIỀU (14h - 18h)
    const afternoonGreetings = [
      `Chiều nay bứt phá doanh số nào ${userName}!`,
      `Cày KPI buổi chiều sung sức nhé ${userName}!`,
      `Chiều nắng đẹp, chốt đơn giòn giã ${userName}!`,
      `Sắp hết giờ rồi, nổ hũ hợp đồng thôi ${userName}!`,
    ];
    greeting = afternoonGreetings[Math.floor(Math.random() * afternoonGreetings.length)];
    icon = "⚡";
    humorTags = [
      "Chiều nay chốt deal giòn tan như bánh quẩy! ⚡",
      "Tần số nổ hợp đồng đang đạt đỉnh! 🚀",
      "Máy tính mát rượi, dự trù chuẩn đét! 💻",
      "Chỉ chờ khách gật đầu là tinh tinh liền! 🔔",
      "Làm ly trà đá chiều cho tỉnh táo chốt deal! ☕",
    ];
  } else if (hour >= 18 && hour < 22) {
    // BUỔI TỐI (18h - 22h)
    const eveningGreetings = [
      `Chào buổi tối rực rỡ, ${userName}!`,
      `Thành quả rực rỡ hôm nay thuộc về ${userName}!`,
      `Tối mát mẻ, đếm lại doanh số thôi ${userName}!`,
    ];
    greeting = eveningGreetings[Math.floor(Math.random() * eveningGreetings.length)];
    icon = "🌆";
    humorTags = [
      "Tối nay đếm tiền mỏi tay luôn nha! 💰",
      "Ăn mừng hợp đồng mới nổ hôm nay! 🎉",
      "KPI hoàn thành, tâm trạng thong dong! ✨",
      "Chốt xong deal tối về ngủ ngon giấc! 🌙",
    ];
  } else {
    // ĐÊM KHUYA (22h - 5h)
    const nightGreetings = [
      `Cú đêm săn deal đỉnh cao, ${userName}!`,
      `Khuya rồi, sếp ${userName} nhớ giữ sức khỏe nha!`,
      `Bắt gặp ${userName} cày dự trù lúc nửa đêm!`,
    ];
    greeting = nightGreetings[Math.floor(Math.random() * nightGreetings.length)];
    icon = "🌙";
    humorTags = [
      "Cú đêm cày KPI, mai sếp thưởng trà sữa! 🥤",
      "Giao diện ban đêm nhưng năng lượng ban ngày! 🌙",
      "Dự trù khuya chuẩn từng xu! 🎯",
      "Đêm muộn tĩnh lặng, ý tưởng chốt deal tuôn trào! ✨",
    ];
  }

  const humorTag = humorTags[Math.floor(Math.random() * humorTags.length)];

  return { greeting, humorTag, icon };
}
