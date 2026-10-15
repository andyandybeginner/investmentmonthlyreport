/**
 * Google Apps Script for Phillip Havenport MAF Monthly Report Automation
 * Instructions:
 * 1. Open your Google Sheet (imported from MAF_Model_Portfolio_Template.xlsx).
 * 2. Click "Extensions" -> "Apps Script".
 * 3. Paste this code into Code.gs and save.
 * 4. Refresh your sheet, and you will see a new menu: "🚀 MAF Automation".
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 MAF Portfolio Tools')
    .addItem('📊 1. 重新计算组合加权收益率 (Recalculate Weighted Return)', 'recalculateWeightedReturns')
    .addItem('🔄 2. 更新最新月份标题 (Update Month Header)', 'updateReportingMonth')
    .addSeparator()
    .addItem('📑 3. 一键同步数据至 Google Slides (Sync to Slides)', 'syncToGoogleSlides')
    .addToUi();
}

/**
 * Recalculates weighted monthly return based on underlying fund returns and portfolio weights.
 */
function recalculateWeightedReturns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const modelSheet = ss.getSheetByName('2_Model_Portfolios');
  const fundSheet = ss.getSheetByName('1_Fund_Master');
  
  if (!modelSheet || !fundSheet) {
    SpreadsheetApp.getUi().alert('Error: 找不到 2_Model_Portfolios 或 1_Fund_Master 工作表！');
    return;
  }
  
  SpreadsheetApp.getActiveSpreadsheet().toast('正在重新计算加权收益率与资产占比...', '计算中', 3);
  
  // Formulas in row 16 for weighted returns:
  // Conservative: SUMPRODUCT(D3:D7, G3:G7) + SUMPRODUCT(D10:D14, G10:G14)
  modelSheet.getRange('D16').setFormula('=SUMPRODUCT(D3:D7,$G$3:$G$7)+SUMPRODUCT(D10:D14,$G$10:$G$14)');
  modelSheet.getRange('E16').setFormula('=SUMPRODUCT(E3:E7,$G$3:$G$7)+SUMPRODUCT(E10:E14,$G$10:$G$14)');
  modelSheet.getRange('F16').setFormula('=SUMPRODUCT(F3:F7,$G$3:$G$7)+SUMPRODUCT(F10:F14,$G$10:$G$14)');
  
  SpreadsheetApp.getUi().alert('✅ 加权收益率与模型资产配比已更新完毕！');
}

/**
 * Prompts user for new reporting month (e.g. "October 2026") and updates Control Panel
 */
function updateReportingMonth() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('更新报告月份', '请输入新的报告月份与年份 (例如: October 2026):', ui.ButtonSet.OK_CANCEL);
  
  if (response.getSelectedButton() == ui.Button.OK) {
    const newMonth = response.getResponseText().trim();
    if (newMonth) {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const ctrlSheet = ss.getSheetByName('0_Control_Panel');
      if (ctrlSheet) {
        ctrlSheet.getRange('B2').setValue(newMonth);
        ui.alert('✅ 报告月份已成功更新为: ' + newMonth);
      }
    }
  }
}

/**
 * Optional: Push specific summary table directly into a Google Slides presentation
 * Replace SLIDES_PRESENTATION_ID with your Google Slides ID
 */
function syncToGoogleSlides() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const promptResp = ui.prompt(
    '同步至 Google Slides', 
    '请输入您的 Google Slides Presentation ID (可在 PPT 的浏览器链接中找到):', 
    ui.ButtonSet.OK_CANCEL
  );
  
  if (promptResp.getSelectedButton() != ui.Button.OK) return;
  const presentationId = promptResp.getResponseText().trim();
  
  if (!presentationId) {
    ui.alert('Presentation ID 不能为空。');
    return;
  }
  
  try {
    const presentation = SlidesApp.openById(presentationId);
    const slides = presentation.getSlides();
    
    // Read current month text
    const ctrlSheet = ss.getSheetByName('0_Control_Panel');
    const monthText = ctrlSheet.getRange('B2').getValue();
    
    // Replace {{MONTH_YEAR}} placeholder across slides
    presentation.replaceAllText('{{MONTH_YEAR}}', monthText);
    
    ui.alert('✅ 已成功连接 Google Slides 并更新月份占位符！\n\n提示：对于图表和表格，请在 Google Slides 菜单中点击 "工具" -> "链接的对象" -> "全部更新"，即可一键刷新所有来自该表格的图表！');
  } catch (e) {
    ui.alert('❌ 同步失败: ' + e.message);
  }
}
