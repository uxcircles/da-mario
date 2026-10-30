# Da Mario — 網站改版提案

純靜態網站（HTML / CSS / JS），不需要建置步驟，任何靜態主機都能直接部署。

> **概念設計展示**：這是由 [UX CIRCLES](https://ux-circles.com/web) 設計的改版提案，並非 Da Mario 官方網站。
> 每頁頂端有「Concept」標示列，所有頁面都設為 `noindex`，`robots.txt` 也禁止搜尋引擎收錄，避免和官方網站搶搜尋結果。
> 如果店家正式採用：刪掉各頁的 `.concept-bar`、`<meta name="robots" content="noindex, nofollow">`，並把 `robots.txt` 改回 `Allow: /`。

## 檔案結構

```
index.html            首頁（看戲前用餐規劃、劇院步行地圖、招牌菜、故事、酒窖、相簿、評論、交通與營業時間）
menu.html             完整菜單與酒單（HTML 版，可搜尋、可只看素食、分類分頁籤）
book.html             訂位頁（連到店家現有的 Dojo 訂位系統，並列出訂金與用餐規定）
zh/                   繁體中文版（index / menu / book）
it/                   義大利文版（index / menu / book）；右上角可在 EN／IT／中文 之間切換，手機版在選單裡
styles.css            全站樣式（顏色、字體都在最上面的 :root 變數）
main.js               互動：手機選單、營業中狀態、看戲前規劃、相簿燈箱、菜單搜尋、捲動淡入
assets/map.js         地圖樣式與標記（顏色都在檔案最上面的 C 物件）
assets/vendor/maplibre 地圖套件 MapLibre GL JS 4.7.1（BSD-3 授權），地圖捲到附近才載入
assets/img/           照片（WebP，取自現有的 da-mario.co.uk）、og.jpg 分享圖
favicon.svg, apple-touch-icon.png
robots.txt
_redirects            舊網址轉址（Netlify / Cloudflare Pages）
vercel.json           舊網址轉址＋快取設定（Vercel）
```

## 本機預覽

```bash
python3 -m http.server 5173
```

然後打開 http://localhost:5173 。

## 部署

- **Netlify**：把整個資料夾拖到 app.netlify.com/drop，會自動讀取 `_redirects`。
- **Cloudflare Pages**：建立專案，選「直接上傳」。同樣會讀取 `_redirects`。
- **Vercel**：在資料夾裡執行 `npx vercel`，會讀取 `vercel.json`。
- **GitHub Pages**：可以展示，但不支援轉址。

九個頁面的 `canonical`、`hreflang`、`og:url` 和 JSON-LD 目前寫的是 `https://uxcircles.github.io/da-mario/`，換網域時記得一起改。

舊網址（`/menus.aspx`、`/location.aspx`、`/local.aspx`、`/reviews.aspx`、`/gallery.aspx`、`/default.aspx`）會 301 轉到新頁面。

## 設計方向

- **概念**：「劇院區的白桌布義大利館」。Da Mario 最大的賣點是離西區劇院和皇家歌劇院只有幾分鐘，所以整個網站用劇場語言：首頁兩側是紅絲絨布幕、頂端是布幔花邊、「最後入座 17:30」做成一張戲票。
- **相框**：店裡最有名的是整面義裔演員黑白肖像牆，所以網站上的照片全部裝在黑框白卡紙或金框裡，像掛在牆上一樣。這也解決了現有照片解析度很低（最大 500px）的問題：照片以相框尺寸呈現，不放大到全版。
- **配色**：白桌布米白（`--linen`）、logo 的深藍炭色（`--ink`）、畫框金（`--gold`）、布幕紅／玫瑰紅（`--rosso`）、logo 的淺藍（`--sky`，只用在深色底）
- **字體**：標題 Bodoni Moda（高對比襯線，劇院節目單感）、標籤與 logo 字 Tenor Sans（接近現有 logo 的字形）、內文 Jost
- **中文字體**：Noto Serif TC／Noto Sans TC，只在中文頁載入
- **看戲前規劃**：選劇院、開演時間和星期，算出最晚幾點入座（開演時間 − 步行時間 − 10 分鐘緩衝 − 2 小時用餐，取 15 分鐘整點；超過 17:30 就以 17:30 為準；早於開門時間就建議散場後再來）。地圖用 MapLibre 向量地圖，街道資料來自 OpenFreeMap（OpenStreetMap，免費、不需金鑰），每一層顏色都照網站配色自訂：米白地面、淺亞麻色建築、白色街道、金色 5／10 分鐘步行圈、紅色路線，Thames 河用 logo 的淺藍。劇院、地鐵站和 Da Mario 的座標都取自 OpenStreetMap。劇院名稱標籤會自動找不重疊的位置（右、左、上、下），真的放不下就只在滑過或選取時顯示。點地圖上的劇院也會更新規劃結果。手機單指會捲動頁面，兩指才移動地圖；手機上只標示目前選的劇院，其他看下方列表。

## 現有網站檢視結果（2026-10-30）

| # | 問題 | 改版怎麼處理 |
|---|---|---|
| 1 | 網站標題寫成「**Convent** Garden」 | 修正，並重寫各頁 title / description / og 標籤 |
| 2 | 「Logo」其實是一張 900×300 的照片，網站沒有向量 logo | 用 Tenor Sans 重做文字 logo，保留原本的字形感覺與金色 |
| 3 | 頁尾「E-mail」連結是空的 `mailto:` | 拿掉；改以電話與訂位為主（見待確認） |
| 4 | 營業時間只在首頁最下方，Google 結構化資料沒有 | 首頁 Visit 區塊列出，自動標示今天，寫進 JSON-LD；首頁上方顯示「營業中／幾點開門」 |
| 5 | 看戲前用餐的規則（17:30 最後入座、兩小時、兩道菜、17:00 後僅限成人）埋在一大段文字裡 | 做成看戲前規劃工具＋清楚的條列規則 |
| 6 | 「Map & Theatres」頁只列四家劇院，沒有步行時間 | 十家劇院與三個地鐵站的步行時間，配示意地圖 |
| 7 | 菜單分六個 `?course=` 頁面，要一頁一頁點 | 一頁完整菜單＋酒單，可搜尋、可只看素食 |
| 8 | 相簿頁大部分圖片是縮圖、alt 寫「home」「home 1」或整站重複同一句 | 每張照片都有描述，燈箱可鍵盤操作 |
| 9 | 訂金與取消規定（£15/人、48 小時）只在頁尾小字 | 訂位頁和首頁都清楚列出 |
| 10 | 評論頁要填驗證碼表單，評論者稱謂顯示「Mr Anna」「Mr marilyn」 | 精選三則評論、只寫名字縮寫與地點，連到 Tripadvisor |
| 11 | ASP.NET 舊網站、表格排版、手機版不友善 | 響應式設計，手機底部固定「來電／訂位」按鈕，一支 CSS、一支 JS、無追蹤 cookie |

## 上線前待確認

還需要店家提供或確認：
- [ ] **照片**：現有照片最大只有 500px，改版已用相框設計遮掩，但若能提供原始高解析度照片（尤其是肖像牆、戶外座位、主廚與 Mario／Maria 本人），效果會好很多
- [ ] **故事區的事實**：「超過三十年」「家族經營」「Maria 的蘋果塔」都取自現有網站；Maria 與 Mario 的身分、開店年份請店家補充
- [ ] **「全球前 10%」**：現有網站寫「Award winning & proud to be in the Top 10% of restaurants worldwide」，看起來是 Tripadvisor Travellers' Choice，請確認來源與年份
- [ ] **12 月週日營業時間**：現有網站寫 12 月 6、13、20 日週日營業，但沒寫時間；網站目前以平日 12:30–23:00 計算「營業中」狀態
- [ ] **Email**：現有網站沒有 email 地址，若有請提供
- [ ] **菜單價格**：現有網站只有分類價格區間（例如前菜 £9–19），沒有單品價格；改版沿用區間。若店家有完整價目表，可以每道菜標價
- [ ] **酒單**：「Tentangeli, Tormaresca」照現有網站寫法保留，請確認酒名
- [ ] **Sinatra 之夜**：Aiden Kent 2027 年 1 月 13 日起每週三 17:30，確認後可以改成有日期的活動
- [ ] **步行時間**：以直線距離 × 1.3、每分鐘 80 公尺估算；地圖上的紅線是直線方向，不是實際步行路線
- [ ] **訂位**：沿用店家現有的 Dojo 訂位連結。Dojo 頁面嵌在 iframe 裡會載入失敗，所以改成按鈕開新分頁
- [ ] 中文版翻譯請母語人士再順一次（中文菜單每道菜都保留義大利原名與英文說明，方便點餐時對照）
- [ ] 義大利文版請店家（或義大利籍員工）校對，尤其是菜單描述與訂位規定；劇院和地鐵站名保留英文原名

## 日常更新

| 要改什麼 | 改哪裡 |
|---|---|
| 菜色／價格 | `menu.html`、`it/menu.html` **和** `zh/menu.html` 的各 `.menu-section`；首頁「La carta」的四道菜與分類價格也要一起改 |
| 營業時間 | `index.html`、`it/index.html` **和** `zh/index.html` 的 Visit 區塊與 JSON-LD，還有 `main.js` 的 `hoursFor()` |
| 劇院 | 首頁 `#theatre` 區塊的下拉選單、列表和 `#map-data` JSON（三種語言的頁面都要改） |
| 其他文字 | 英文、義大利文、中文頁面是各自獨立的 HTML，改一邊記得三個都要改 |
| 照片 | 放進 `assets/img/`，建議做成 WebP |
| 改了 CSS／JS | 把六個頁面 `styles.css?v=5`、`main.js?v=4` 的版本號 +1，避免訪客看到快取的舊版 |
