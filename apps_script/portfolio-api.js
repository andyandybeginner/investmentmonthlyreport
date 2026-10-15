/**
 * HR Model Portfolio Live Web API for Google Apps Script
 * 部署为 Web 应用后，可直接为本地与网页前端提供实时只读 JSON 数据接口
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var curSheet = ss.getSheetByName('HR_Model_Port_Current');
    var pastSheet = ss.getSheetByName('HR_Model_Port_Past');
    var calcSheet = ss.getSheetByName('Calculation_Engine');
    
    // 1. 获取 HR_Model_Port_Current 最新一行数据
    var curData = curSheet.getDataRange().getValues();
    var lastRowIdx = curData.length - 1;
    while (lastRowIdx > 0 && !curData[lastRowIdx][1]) {
      lastRowIdx--;
    }
    var latestRow = curData[lastRowIdx];
    var settleDate = Utilities.formatDate(new Date(latestRow[1]), "GMT+8", "yyyy-MM-dd");
    var totalVal = Number(latestRow[18]); // Col S (index 18)
    
    var funds = [];
    var fundNames = [
      "United China A Shares Innovation A Acc",
      "FULLERTON LUX - GLOBAL ABSOLUTE ALPHA",
      "EASTSPRING - GLOBAL TECHNOLOGY SGD",
      "Janus Henderson Global Life Sciences",
      "United Gold and General A Acc SGD",
      "FSSA Asian Growth Fund (Class A)",
      "Nikko AM Japan Dividend"
    ];
    var roles = ["中国创新", "全天候底仓", "科技成长", "生命科学", "黄金对冲", "亚洲主题", "日本高息"];
    
    for (var i = 0; i < 7; i++) {
      var val = Number(latestRow[10 + i]); // Col K to Q
      var targetW = Number(latestRow[28 + i]); // Col AC to AI
      var actualW = totalVal > 0 ? (val / totalVal) : 0;
      funds.push({
        id: i + 1,
        role: roles[i],
        name: fundNames[i],
        value: val,
        actualWeight: actualW,
        targetWeight: targetW
      });
    }
    
    // 2. 获取 Calculation_Engine 从 Row 29 到最后一行的净值序列
    var calcData = calcSheet.getDataRange().getValues();
    var timeSeries = {
      dates: [],
      current: [],
      past: [],
      sp500: [],
      msci: []
    };
    
    for (var r = 28; r < calcData.length; r++) { // Row 29 is index 28
      var row = calcData[r];
      if (row[0]) {
        var dStr = Utilities.formatDate(new Date(row[0]), "GMT+8", "yyyy-MM");
        timeSeries.dates.push(dStr);
        timeSeries.current.push(Number(row[5])); // Col F
        timeSeries.past.push(Number(row[6]));    // Col G
        timeSeries.sp500.push(Number(row[7]));   // Col H
        timeSeries.msci.push(Number(row[8]));    // Col I
      }
    }
    
    var result = {
      status: "success",
      settleDate: settleDate,
      totalPortfolioValue: totalVal,
      funds: funds,
      timeSeries: timeSeries,
      updatedAt: new Date().toISOString()
    };
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
