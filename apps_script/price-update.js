/**
 * 【FSM 批量历史净值同步 - 10Y 定向同名更新修复版】
 * 支持多行区间批量处理（例如：'HR Model Portfolio Constitution 2026'!V3:W10）
 * 每一行：第 1 列为 ISIN，第 2 列为带有 FSM 链接的基金名称
 * 规则：默认抓取 10Y 历史；仅更新已存在的同名工作表，若同名工作表不存在则跳过并报警
 * 输出规范：A: Date | B: Price | C: Change | D: Change % | E: Date
 */
function runBatchPriceUpdate() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. 初始化控制台
  setupDebugConsole(); 
  logToConsole("INFO", "=== 启动 FSM 基金价格批量更新任务 (修复版 10Y) ===");
  
  // 2. 弹窗询问目标区间
  var response = ui.prompt(
    '🚀 批量同步基金历史价格 (10Y)',
    '请输入需要批量同步的区间（例如：HR Model Portfolio Constitution 2026!V3:W10）：',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response.getSelectedButton() !== ui.Button.OK) {
    logToConsole("WARN", "用户取消了批量更新。");
    return;
  }
  
  var rangeText = response.getResponseText().trim();
  if (!rangeText) {
    logToConsole("ERROR", "输入的范围为空。");
    ui.alert('⚠️ 提示', '请输入有效的单元格范围！', ui.ButtonSet.OK);
    return;
  }
  
  try {
    var range = getSafeRange(ss, rangeText);
    var numRows = range.getNumRows();
    var numCols = range.getNumColumns();
    
    if (numCols < 2) {
      ui.alert('❌ 错误', '选定的区域至少需要包含两列（第 1 列为 ISIN，第 2 列为基金名称/超链接）！', ui.ButtonSet.OK);
      return;
    }
    
    logToConsole("INFO", "检测到总共 " + numRows + " 行待处理数据，开始逐行批量执行...");
    
    var successCount = 0;
    var skipCount = 0;
    var failCount = 0;
    
    // 3. 逐行循环执行
    for (var r = 1; r <= numRows; r++) {
      var isinCell = range.getCell(r, 1);
      var nameCell = range.getCell(r, 2);
      
      var isin = isinCell.getValue().toString().trim();
      var fundName = nameCell.getValue().toString().trim();
      
      // 空行跳过
      if (!isin && !fundName) {
        continue;
      }
      
      if (!fundName) {
        logToConsole("WARN", "第 " + r + " 行跳过：基金名称为空。");
        skipCount++;
        continue;
      }
      
      logToConsole("INFO", "----------------------------------------");
      logToConsole("INFO", "正在处理 [" + r + "/" + numRows + "] : " + fundName);
      
      // 提取链接中的 SEDOL 编号
      var url = extractUrlFromCell(nameCell);
      var sedol = "";
      if (url) {
        var match = url.match(/\/funds\/factsheet\/([^\/\?#]+)/i);
        if (match && match[1]) {
          sedol = match[1].trim();
        }
      }
      
      // 兜底：无链接但填写了简短编号
      if (!sedol && isin && isin.length <= 8) {
        sedol = isin;
      }
      
      if (!sedol) {
        logToConsole("ERROR", "❌ 基金 [" + fundName + "] 提取 SEDOL 失败，未检测到有效超链接，跳过本行。");
        failCount++;
        continue;
      }
      
      // 执行单只基金的请求与更新同名 Sheet
      try {
        var result = fetchAndSaveFundPrices(fundName, sedol, isin);
        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (rowErr) {
        logToConsole("ERROR", "处理基金 [" + fundName + "] 时遇到异常: " + rowErr.toString());
        failCount++;
      }
      
      // 800 毫秒延时，防止频控
      Utilities.sleep(800);
    }
    
    logToConsole("SUCCESS", "=== 批量同步完成！成功: " + successCount + " 只 | 失败/缺失Sheet: " + failCount + " 只 | 跳过: " + skipCount + " 只 ===");
    ui.alert('🎯 批量同步完成', '处理结果汇总：\n✅ 成功: ' + successCount + '\n❌ 失败/未找到同名Sheet: ' + failCount + '\n⚠️ 跳过: ' + skipCount + '\n详细日志请查看 Debug_Console。', ui.ButtonSet.OK);
    
  } catch (e) {
    logToConsole("CRITICAL_BUG", "💥 任务崩溃！错误详情: " + e.toString() + " | 堆栈: " + e.stack);
    ui.alert('💥 探测到代码 Bug', "错误原因:\n" + e.toString(), ui.ButtonSet.OK);
  }
}

/**
 * 单只基金核心抓取与保存逻辑
 */
function fetchAndSaveFundPrices(fundName, sedol, isin) {
  var apiUrl = "https://fsm.global/sg/rest/fund/find-daily-price-history-by-period";
  var rawPayload = "paramSedolnumber=" + encodeURIComponent(sedol) + "&paramPeriod=10y";
  
  var headers = {
    'accept': 'application/json, text/plain, */*',
    'application-type': 'web',
    'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
    'expanded-locale': 'en',
    'locale': 'en',
    'origin': 'https://fsm.global',
    'platform': 'FSM',
    'referer': 'https://fsm.global/sg/funds/factsheet/' + sedol,
    'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'x-app-id': 'sgfsm'
  };
  
  var options = {
    'method': 'post',
    'headers': headers,
    'payload': rawPayload,
    'muteHttpExceptions': true
  };
  
  var responseObj = UrlFetchApp.fetch(apiUrl, options);
  var responseCode = responseObj.getResponseCode();
  var responseText = responseObj.getContentText().trim();
  
  if (responseCode !== 200) {
    logToConsole("ERROR", "接口响应异常，状态码: " + responseCode + " | SEDOL: " + sedol);
    return { success: false };
  }
  
  var jsonResult = JSON.parse(responseText);
  var rawList = jsonResult.dailyPriceHistory || [];
  
  if (!Array.isArray(rawList) || rawList.length === 0) {
    logToConsole("ERROR", "未获取到 [" + fundName + "] 的历史数据，请检查编号: " + sedol);
    return { success: false };
  }
  
  var dataPoints = [];
  for (var i = 0; i < rawList.length; i++) {
    var item = rawList[i];
    var timestamp = item.dailyPricePk ? item.dailyPricePk.showDate : null;
    var priceVal = (item.bidPrice !== null && item.bidPrice !== undefined) ? item.bidPrice :
                   ((item.bidPriceSgd !== null && item.bidPriceSgd !== undefined) ? item.bidPriceSgd : item.navPrice);
    
    var price = parseFloat(priceVal);
    if (timestamp && !isNaN(price)) {
      dataPoints.push([new Date(timestamp), price]);
    }
  }
  
  // 数据排重与倒序排序
  var uniqueData = [];
  var seen = {};
  for (var j = 0; j < dataPoints.length; j++) {
    var dateKey = dataPoints[j][0].toISOString().split('T')[0];
    if (!seen[dateKey]) { 
      seen[dateKey] = true; 
      uniqueData.push(dataPoints[j]); 
    }
  }
  uniqueData.sort(function(a, b) { return b[0] - a[0]; });
  
  return updateFundSheet(fundName, uniqueData);
}

/**
 * 【修复升级版】辅助函数：更新或全量初始化同名工作表
 */
function updateFundSheet(fundName, newData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var targetSheet = ss.getSheetByName(fundName);
  
  if (!targetSheet) {
    logToConsole("ERROR", "❌ 未找到同名工作表: [" + fundName + "]，已跳过写入！请先建立该工作表。");
    return { success: false };
  }
  
  // 1. 确保第 1 行为五列标准表头
  targetSheet.getRange(1, 1, 1, 5).setValues([["Date", "Price", "Change", "Change %", "Date"]]);
  targetSheet.getRange("A1:E1").setFontWeight("bold").setBackground("#F1F5F9");
  
  var lastRow = targetSheet.getLastRow();
  
  // =========================================================================
  // 场景 A：工作表是空的（<=1 行，仅有表头） -> 执行【全量 10Y 极速初始化写入】
  // =========================================================================
  if (lastRow <= 1) {
    logToConsole("INFO", "检测到 [" + fundName + "] 为空表，启动【全量 10Y 初始化写入】...");
    
    var outputRows = [];
    for (var k = 0; k < newData.length; k++) {
      var curD = newData[k][0];
      var curP = newData[k][1];
      
      var prevP = null;
      if (k + 1 < newData.length) {
        prevP = newData[k + 1][1];
      }
      
      var chgVal = "";
      var chgPct = "";
      if (prevP !== null && !isNaN(prevP) && prevP > 0) {
        chgVal = curP - prevP;
        chgPct = (curP - prevP) / prevP;
      }
      outputRows.push([curD, curP, chgVal, chgPct, curD]);
    }
    
    if (outputRows.length > 0) {
      targetSheet.getRange(2, 1, outputRows.length, 5).setValues(outputRows);
      formatFundSheetRanges(targetSheet, 2, outputRows.length);
      logToConsole("SUCCESS", "✅ 成功初始化写入 [" + fundName + "] " + outputRows.length + " 条 10 年完整历史记录！");
    }
    return { success: true };
  }
  
  // =========================================================================
  // 场景 B：工作表已有数据 -> 执行【高可靠增量追加】
  // =========================================================================
  var topCellDate = targetSheet.getRange(2, 1).getValue();
  var topCellPrice = parseFloat(targetSheet.getRange(2, 2).getValue());
  
  var topDateStr = "";
  if (topCellDate instanceof Date) {
    topDateStr = Utilities.formatDate(topCellDate, "GMT+8", "yyyy-MM-dd");
  } else {
    topDateStr = topCellDate.toString().trim();
  }
  
  var newRowsToAppend = [];
  for (var i = 0; i < newData.length; i++) {
    var curDateStr = Utilities.formatDate(newData[i][0], "GMT+8", "yyyy-MM-dd");
    if (curDateStr > topDateStr) {
      newRowsToAppend.push(newData[i]);
    } else {
      break; 
    }
  }
  
  if (newRowsToAppend.length === 0) {
    logToConsole("INFO", "基金 [" + fundName + "] 已是最新（最新日期: " + topDateStr + "），无需追加。");
    return { success: true };
  }
  
  var incrementalOutput = [];
  for (var j = 0; j < newRowsToAppend.length; j++) {
    var cDate = newRowsToAppend[j][0];
    var cPrice = newRowsToAppend[j][1];
    
    var pPrice = null;
    if (j + 1 < newRowsToAppend.length) {
      pPrice = newRowsToAppend[j + 1][1];
    } else {
      pPrice = topCellPrice;
    }
    
    var cVal = "";
    var cPct = "";
    if (pPrice !== null && !isNaN(pPrice) && pPrice > 0) {
      cVal = cPrice - pPrice;
      cPct = (cPrice - pPrice) / pPrice;
    }
    incrementalOutput.push([cDate, cPrice, cVal, cPct, cDate]);
  }
  
  targetSheet.insertRowsAfter(1, incrementalOutput.length);
  targetSheet.getRange(2, 1, incrementalOutput.length, 5).setValues(incrementalOutput);
  formatFundSheetRanges(targetSheet, 2, incrementalOutput.length);
  
  logToConsole("SUCCESS", "✅ 成功向 [" + fundName + "] 增量追加 " + incrementalOutput.length + " 条最新行情！");
  return { success: true };
}

/**
 * 格式化辅助
 */
function formatFundSheetRanges(sheet, startRow, numRows) {
  sheet.getRange(startRow, 1, numRows, 1).setNumberFormat('yyyy-mm-dd');
  sheet.getRange(startRow, 2, numRows, 1).setNumberFormat('$#,##0.0000');
  sheet.getRange(startRow, 3, numRows, 1).setNumberFormat('+$#,##0.0000;-$#,##0.0000;$0.0000');
  sheet.getRange(startRow, 4, numRows, 1).setNumberFormat('+0.00%;-0.00%;0.00%');
  sheet.getRange(startRow, 5, numRows, 1).setNumberFormat('yyyy-mm-dd');
}

/**
 * 辅助解析：智能提取超链接
 */
function extractUrlFromCell(cell) {
  var richText = cell.getRichTextValue();
  if (richText && richText.getLinkUrl()) {
    return richText.getLinkUrl();
  }
  
  var formula = cell.getFormula();
  if (formula) {
    var match = formula.match(/HYPERLINK\(\s*["']([^"']+)["']/i);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  var val = cell.getValue().toString();
  if (val.indexOf("http") === 0) {
    return val;
  }
  
  return null;
}

/**
 * 核心公用解析器：安全处理范围字符串
 */
function getSafeRange(ss, rangeText) {
  if (rangeText.indexOf("!") > -1) {
    var parts = rangeText.split("!");
    var sheetName = parts[0].replace(/['"]/g, ""); 
    var targetSheet = ss.getSheetByName(sheetName);
    if (!targetSheet) throw new Error("找不到名为 [" + sheetName + "] 的工作表，请检查拼写是否完全一致！");
    return targetSheet.getRange(parts[1]);
  } else {
    return ss.getActiveSheet().getRange(rangeText);
  }
}

/**
 * 辅助函数：可视化日志控制台
 */
function logToConsole(level, message) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var consoleSheet = ss.getSheetByName("Debug_Console");
  if (!consoleSheet) return;
  var timestamp = Utilities.formatDate(new Date(), "GMT+8", "yyyy-MM-dd HH:mm:ss");
  
  consoleSheet.insertRowBefore(2); 
  consoleSheet.getRange(2, 1, 1, 3).setValues([[timestamp, level, message]]);
  var levelRange = consoleSheet.getRange(2, 2);
  if (level === "ERROR" || level === "CRITICAL_BUG") {
    levelRange.setBackground("#FCE8E6").setFontColor("#C5221F").setFontWeight("bold");
  } else if (level === "SUCCESS") {
    levelRange.setBackground("#E6F4EA").setFontColor("#137333").setFontWeight("bold");
  } else if (level === "WARN") {
    levelRange.setBackground("#FEF7E0").setFontColor("#B06000").setFontWeight("bold");
  } else {
    levelRange.setBackground("#E8F0FE").setFontColor("#1A73E8");
  }
  SpreadsheetApp.flush();
}

function setupDebugConsole() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var consoleSheet = ss.getSheetByName("Debug_Console");
  if (!consoleSheet) {
    consoleSheet = ss.insertSheet("Debug_Console");
    consoleSheet.appendRow(["时间戳", "级别", "执行消息 / Bug 详细追踪"]);
    consoleSheet.getRange("A1:C1").setBackground("#343A40").setFontColor("#FFFFFF").setFontWeight("bold");
    consoleSheet.setFrozenRows(1);
    consoleSheet.setColumnWidth(1, 160);
    consoleSheet.setColumnWidth(2, 120);
    consoleSheet.setColumnWidth(3, 700);
  }
}

function clearDebugConsole() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var consoleSheet = ss.getSheetByName("Debug_Console");
  if (consoleSheet && consoleSheet.getLastRow() >= 2) consoleSheet.deleteRows(2, consoleSheet.getLastRow() - 1);
}