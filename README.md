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
it/                   義大利文版（index / menu / book）；右上角的語言下拉選單可切換 English／Italiano／中文，手機版在選單裡
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

## 日常更新

| 要改什麼 | 改哪裡 |
|---|---|
| 菜色／價格 | `menu.html`、`it/menu.html` **和** `zh/menu.html` 的各 `.menu-section`；首頁「La carta」的四道菜與分類價格也要一起改 |
| 營業時間 | `index.html`、`it/index.html` **和** `zh/index.html` 的 Visit 區塊與 JSON-LD，還有 `main.js` 的 `hoursFor()` |
| 劇院 | 首頁 `#theatre` 區塊的下拉選單、列表和 `#map-data` JSON（三種語言的頁面都要改） |
| 其他文字 | 英文、義大利文、中文頁面是各自獨立的 HTML，改一邊記得三個都要改 |
| 照片 | 放進 `assets/img/`，建議做成 WebP |
| 改了 CSS／JS | 把六個頁面 `styles.css?v=11`、`main.js?v=6` 的版本號 +1，避免訪客看到快取的舊版 |

## 內部筆記

原網站檢視結果、待店家確認事項和 pitch 資料放在本機的 `.private/`（已被 `.gitignore` 排除，不會進 git）。

第一次 clone 後啟用 git hooks：

```
git config core.hooksPath .githooks
```

之後每次 commit / push 會擋下 `.private/` 的檔案和 `.private/blocklist.txt` 裡的敏感字詞，並列出 `.private/NOTES.md` 裡未完成的待辦。隨時查看：`sh .githooks/remind.sh`
