/**
 * 批量下载选定基金的 Factsheet PDF 并保存到 Google Drive 
 */
function downloadFactsheetsToDrive() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. 弹出对话框请求输入范围（支持带工作表名的完整范围）
  var response = ui.prompt(
    '🚀 批量下载 Factsheet PDF',
    '请输入基金数据区间（例如：HR Model Portfolio Constitution 2026!D3:E10）：',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response.getSelectedButton() !== ui.Button.OK) {
    return;
  }
  
  var rangeText = response.getResponseText().trim();
  if (!rangeText) {
    ui.alert('⚠️ 提示', '输入的区间为空！', ui.ButtonSet.OK);
    return;
  }
  
  // 2. 自动获取或创建云端保存文件夹
  var folderName = "FSM_Fund_Factsheets";
  var folders = DriveApp.getFoldersByName(folderName);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
  
  try {
    // 使用核心解析器安全获取 Range，完美兼容跨表输入
    var range = getSafeRange(ss, rangeText);
    var values = range.getValues();
    
    var successCount = 0;
    var failCount = 0;
    
    for (var i = 0; i < values.length; i++) {
      var isin = values[i][0] ? values[i][0].toString().trim() : "";
      var fundName = values[i][1] ? values[i][1].toString().trim() : "";
      
      if (!isin || !fundName) continue;
      
      // 构造 FSM 标准 Factsheet 官方 PDF 链接
      var factsheetUrl = "https://secure.fundsupermart.com/fsm/admin/buy/factsheet/factsheet_" + isin + ".pdf";
      
      try {
        var responsePdf = UrlFetchApp.fetch(factsheetUrl, {
          "muteHttpExceptions": true,
          "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
          }
        });
        
        if (responsePdf.getResponseCode() === 200) {
          var blob = responsePdf.getBlob();
          blob.setName(fundName + "_Factsheet_" + isin + ".pdf");
          
          // 如果云端已存在同名旧文件，先清理
          var existingFiles = folder.getFilesByName(blob.getName());
          while (existingFiles.hasNext()) {
            existingFiles.next().setTrashed(true);
          }
          
          // 写入 Drive 并开放只读共享链接
          var file = folder.createFile(blob);
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        failCount++;
      }
    }
    
    ui.alert(
      '🎉 任务完成',
      'Factsheet 下载结束！\n' +
      '📂 保存文件夹: Google Drive -> ' + folderName + '\n' +
      '🟢 成功数: ' + successCount + '\n' +
      '🔴 失败数: ' + failCount,
      ui.ButtonSet.OK
    );
    
  } catch (e) {
    ui.alert('💥 执行崩溃', '错误详情: ' + e.toString(), ui.ButtonSet.OK);
  }
}
