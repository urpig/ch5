# 碳的千面術：解讀《百工秘卷》

國二下理化第五章有機化合物。小葵與阿公翻開木匣暗格中的《百工秘卷》，依次閱讀、預測、操作、找證據，再補上科學旁註。16卡含26段原創仿古卷文、104項觀念核對條目、23題練習與10題章末挑戰。完整故事、卷文與觀念對照見 [docs/storyline.md](docs/storyline.md)。

## 本機啟動

需要 Node.js，沒有第三方套件安裝步驟。在此資料夾執行：

```powershell
node server.mjs
```

開啟 http://127.0.0.1:4177/ 。Windows 也可雙擊 `Start-preview.cmd`。

入口是根目錄 `index.html`，為相對路徑的靜態網站，無外部字型、CDN、追蹤或後端服務。部署階段尚未執行；沒有建立 commit、push 或修改 Pages。

## 架構

- `content.js`：16卡故事、23題卡內練習、10題章末題、逐選項錯因與來源。
- `core.js`：材料資料、反應條件、觀察狀態、完成判準、作答與保存格式。
- `lab-art.js`：可縮放科學裝置、分子及材料示意圖。
- `labs.js`：16 種器材導向工作台、下一步引導與證據進度。
- `lab-gestures.js`：滑鼠／觸控拖放、點選替代、短暫操作動畫與共用動作入口。
- `studio.css`：玻璃與木質工作台、試劑托盤、直接器材控制、手機操作列。
- `app.js`：語意控制元件、鍵盤及分類拖曳、觀察解鎖、進度保存。
- `story.css`、`chapter-navigation.css`、`character-story.css`：原樣沿用 urpig/ch2/main 的設計系統（檢查時間 2026-10-29；來源樹 a61e7ea13b8a9e012bff2431dd8e1329072746a3）。
- `chapter5.css`：在第二章設計上增加第五章工作台與響應式調整。
- `assets/story/`：沿用既有小葵、阿公角色表情圖，以及第四章木匣故事插畫。沒有改畫角色。

所有卡片保留在單頁，可用側欄及上下張連結移動。每卡先留預測，操作取得必要證據後顯示原理與測驗。猜錯預測不扣分；測驗每次答案及首次答案都會保存。重設只清除該卡。

## 驗證

```powershell
node --test tests/core.test.mjs tests/studio.test.mjs
node --check app.js
node --check core.js
node --check labs.js
node --check lab-art.js
node --check lab-gestures.js
node --check content.js
```

測試涵蓋16卡流程、重設一致性、答案與錯因、序列化保存、危險或錯誤反應組合、燃燒原子守恆。實際瀏覽器驗收紀錄見 `ACCEPTANCE.md`。

## 科學範圍

主要依108自然科學Jf-Ⅳ-1～4，另連結Cb-Ⅳ-3、材料應用與Na-Ⅳ-4。以康軒第五章主題為骨架，參照公開翰林、教育雲與學校課程資料。未取得三家完整現行電子課本，不能宣稱逐頁核對三版本；南一公開資源入口與核對限制已在網站來源區註明。

乾餾不指定產率；酯化為定性可逆模型，不假造平衡轉化率；清潔不以泡沫量等同去油能力；衣料不使用虛構吸水率或伸長率。所有裝置、縮短時間與分子位置都是教學示意，不是居家實驗配方。食品與部分材料作跨版本延伸。

進度以 `ch5-carbon-journal-v1` 儲存在此瀏覽器的 localStorage，不會傳到伺服器。localhost 的連接埠更換會視為另一個來源，進度不會共用。
