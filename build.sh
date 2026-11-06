#!/bin/bash
# Tạo nam.html và nu.html từ cùng một khung. Chạy: bash build.sh
HEAD='<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,600&family=JetBrains+Mono:wght@500;700;800&display=swap">
<link rel="stylesheet" href="style.css">'
TOP='<div class="tape" aria-hidden="true"><div class="tape-track" id="tape"></div></div>'
page() { # file key title desc
cat > $1 <<EOF
<!doctype html>
<html lang="vi">
<head>
<title>$3</title>
<meta name="description" content="$4">
$HEAD
</head>
<body class="$2">
$TOP
<main class="wrap">
  <header class="mast">
    <div class="mast-top">
      <nav class="nav"><a href="index.html">← Trang chủ</a><a href="nam.html"$([ $2 = nam ] && echo ' aria-current="page"')>Quiz Nam</a><a href="nu.html"$([ $2 = nu ] && echo ' aria-current="page"')>Quiz Nữ</a></nav>
      <button class="theme" id="themeBtn" type="button">Giao diện: Tự động</button>
    </div>
    <span class="label" id="mastLabel"></span>
    <h1 id="mastTitle"></h1>
    <p id="mastIntro"></p>
  </header>

  <section class="stats" id="stats" aria-label="Thống kê học tập"></section>
  <p class="save-note">💾 Tiến độ lưu trên trình duyệt này, dùng chung cho quiz Nam và quiz Nữ.</p>
  <div class="toast" id="toast" role="status" aria-live="polite" hidden></div>

  <nav class="parts" id="parts" role="tablist" aria-label="Chọn phần"></nav>

  <section class="panel" id="setup">
    <div class="panel-head">
      <span class="label" id="setupLabel"></span>
      <h2 id="setupTitle"></h2>
      <p class="note" id="setupDesc"></p>
    </div>
    <div class="field">
      <span class="label">Số câu mỗi lượt</span>
      <div class="chips" id="lengths"></div>
      <p class="note" id="countNote"></p>
    </div>
    <button class="go" id="startBtn" type="button">Bắt đầu</button>
  </section>

  <section class="panel" id="play" hidden>
    <div class="hud">
      <span class="label" id="hudPos"></span>
      <span class="label" id="hudScore"></span>
    </div>
    <div class="bar"><i id="hudBar"></i></div>
    <div class="prompt">
      <span class="label" id="qLabel"></span>
      <div class="big" id="qMain"></div>
    </div>
    <div class="opts" id="opts"></div>
    <div class="explain" id="explain" hidden></div>
    <div class="actions">
      <button class="go" id="nextBtn" type="button" hidden>Câu tiếp →</button>
      <button class="ghost" id="quitBtn" type="button">Dừng</button>
      <span class="hint">Phím tắt: 1–4 để chọn, Enter để sang câu</span>
    </div>
  </section>

  <section class="panel" id="result" hidden>
    <span class="label" id="rLabel"></span>
    <div class="score" id="rScore"></div>
    <p id="rMsg" style="margin:0"></p>
    <p class="note" id="rTotal"></p>
    <div class="review" id="rReview"></div>
    <div class="actions">
      <button class="go" id="retryBtn" type="button" hidden>Ôn lại câu sai</button>
      <button class="go" id="againBtn" type="button">Chơi lại</button>
      <button class="ghost" id="setupBtn" type="button">Đổi thiết lập</button>
      <a class="ghost" id="otherLink" href="#"></a>
    </div>
  </section>

  <section class="panel">
    <div class="panel-head">
      <span class="label" id="boardLabel">Bảng tra cứu</span>
      <h2>Ôn lại trước khi chơi</h2>
    </div>
    <input class="search" id="search" type="search" placeholder="Tìm theo từ khóa, ví dụ: hormone, trầm cảm…" aria-label="Tìm trong bảng tra cứu">
    <div class="board-wrap">
      <table class="board">
        <thead><tr><th>Câu hỏi</th><th>Đáp án và giải thích</th></tr></thead>
        <tbody id="boardBody"></tbody>
      </table>
    </div>
    <p class="note">Nội dung mang tính giáo dục, mô tả xu hướng trung bình của nhóm; khác biệt giữa các cá nhân luôn lớn hơn khác biệt giữa hai giới. Không thay thế tư vấn chuyên môn. Nếu bạn hoặc người thân đang gặp khủng hoảng tâm lý, hãy tìm đến chuyên gia hoặc cơ sở y tế gần nhất.</p>
  </section>

  <footer>Quiz Tâm Lý Giới Tính · $3 · Chỉ để ôn tập và tham khảo</footer>
</main>
<script src="data-$2.js"></script>
<script src="app.js"></script>
</body>
</html>
EOF
}
page nam.html nam "Quiz Tâm Lý Nam Giới" "Quiz 32 câu về cảm xúc, sức khỏe tâm thần, các mối quan hệ và sinh học của nam giới."
page nu.html nu "Quiz Tâm Lý Nữ Giới" "Quiz 32 câu về hormone, sức khỏe tâm thần, công việc, xã hội và các mối quan hệ của nữ giới."

cat > index.html <<EOF
<!doctype html>
<html lang="vi">
<head>
<title>Quiz Tâm Lý Giới Tính</title>
<meta name="description" content="Hai bộ quiz tâm lý học về nam giới và nữ giới, mỗi bộ 4 phần, 32 câu, có giải thích sau mỗi câu.">
$HEAD
</head>
<body>
$TOP
<main class="wrap">
  <header class="mast">
    <div class="mast-top">
      <span class="label">Tâm lý học giới tính</span>
      <button class="theme" id="themeBtn" type="button">Giao diện: Tự động</button>
    </div>
    <h1>Quiz Tâm Lý <span>Giới Tính</span></h1>
    <p>Hai bộ quiz dựa trên các nghiên cứu tâm lý học. Mỗi bộ có 4 phần và một phần tổng hợp, tổng cộng 32 câu. Sau mỗi câu có giải thích ngắn để bạn hiểu vì sao.</p>
  </header>

  <section class="stats" id="stats" aria-label="Thống kê học tập"></section>
  <p class="save-note">💾 Tiến độ lưu trên trình duyệt này, dùng chung cho quiz Nam và quiz Nữ.</p>
  <div class="toast" id="toast" role="status" aria-live="polite" hidden></div>

  <div class="choose">
    <a class="pick nam" href="nam.html" data-home="nam" data-parts="camxuc,suckhoe,quanhe,sinhhoc,tonghop">
      <span class="sym">♂</span><h2>Tâm lý Nam giới</h2>
      <p>Cảm xúc bị kìm nén, trầm cảm "ẩn", áp lực phải mạnh mẽ, tình bạn và hormone.</p>
      <span class="parts-list"><span>Cảm xúc</span><span>Sức khỏe tâm thần</span><span>Mối quan hệ</span><span>Sinh học</span></span>
      <span class="meta"></span>
      <span class="go-link">Vào quiz Nam →</span>
    </a>
    <a class="pick nu" href="nu.html" data-home="nu" data-parts="hormone,suckhoe,xahoi,quanhe,tonghop">
      <span class="sym">♀</span><h2>Tâm lý Nữ giới</h2>
      <p>Hormone và tâm trạng, gánh nặng vô hình, định kiến nơi công sở, tình bạn và giao tiếp.</p>
      <span class="parts-list"><span>Hormone</span><span>Sức khỏe tâm thần</span><span>Công việc & xã hội</span><span>Mối quan hệ</span></span>
      <span class="meta"></span>
      <span class="go-link">Vào quiz Nữ →</span>
    </a>
  </div>

  <p class="note">Lưu ý: kết quả nghiên cứu mô tả xu hướng trung bình của nhóm. Khác biệt giữa các cá nhân luôn lớn hơn khác biệt giữa hai giới, nên đừng dùng chúng để gán nhãn một người cụ thể.</p>
  <footer>Quiz Tâm Lý Giới Tính · Chỉ để ôn tập và tham khảo</footer>
</main>
<script>window.HOME_TAPE=[["Quiz Nam","32 câu"],["Quiz Nữ","32 câu"],["Khác biệt giới nhỏ","78%"],["Tự tử ở nam","×2–4"],["Trầm cảm ở nữ","×2"],["Bạn thân","vai kề vai"],["Tình bạn nữ","mặt đối mặt"],["Gánh nặng vô hình","mental load"],["Não bộ","bức khảm"],["Đặt tên cảm xúc","giảm căng thẳng"]];</script>
<script src="app.js"></script>
</body>
</html>
EOF
