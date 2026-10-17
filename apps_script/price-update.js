/**
 * 【FSM 批量历史净值同步 - 10Y 定向同名更新修复版】
 * 支持多行区间批量处理（例如：'HR Model Portfolio Constitution 2026'!V3:W10）
 * 每一行：第 1 列为 ISIN，第 2 列为带有 FSM 链接的基金名称
 * 规则：默认抓取 10Y 历史；仅更新已存在的同名工作表，若同名工作表不存在则跳过并报警
 * 输出规范：A: Date | B: Price | C: Change | D: Change % | E: Date（日期按新加坡时区归一）
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
  
  // 统一按 FSM 所在时区（新加坡）把 showDate 转成纯日期字符串 yyyy-MM-dd。
  // 旧版用 toISOString()（UTC）做排重、用 new Date() 直接写入表格（按表格时区显示），
  // 新加坡 00:00 = UTC 前一天 16:00，导致部分日期被错位到前一天、出现周日日期/重复日期/丢失日期。
  var dataPoints = [];
  for (var i = 0; i < rawList.length; i++) {
    var item = rawList[i];
    var dateKey = toFundDateKey(item.dailyPricePk ? item.dailyPricePk.showDate : null);
    var priceVal = (item.bidPrice !== null && item.bidPrice !== undefined) ? item.bidPrice :
                   ((item.bidPriceSgd !== null && item.bidPriceSgd !== undefined) ? item.bidPriceSgd : item.navPrice);

    var price = parseFloat(priceVal);
    if (dateKey && !isNaN(price)) {
      dataPoints.push([dateKey, price]);
    }
  }

  // 数据排重与倒序排序（按日期字符串）
  var uniqueData = [];
  var seen = {};
  for (var j = 0; j < dataPoints.length; j++) {
    if (!seen[dataPoints[j][0]]) {
      seen[dataPoints[j][0]] = true;
      uniqueData.push(dataPoints[j]);
    }
  }
  uniqueData.sort(function(a, b) { return a[0] < b[0] ? 1 : (a[0] > b[0] ? -1 : 0); });

  return updateFundSheet(fundName, uniqueData);
}

var FUND_TIMEZONE = "Asia/Singapore";

/**
 * 把 FSM 返回的 showDate（毫秒时间戳或日期字符串）转成新加坡时区的 yyyy-MM-dd
 */
function toFundDateKey(raw) {
  if (raw === null || raw === undefined || raw === "") return null;
  if (typeof raw === "string" && /^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return raw.substring(0, 10);
  }
  var d = new Date(typeof raw === "string" && /^\d+$/.test(raw) ? Number(raw) : raw);
  if (isNaN(d.getTime())) return null;
  return Utilities.formatDate(d, FUND_TIMEZONE, "yyyy-MM-dd");
}

/**
 * 把表格中已有的日期单元格转成 yyyy-MM-dd（按表格自身时区读取）
 */
function sheetCellToDateKey(val, sheetTz) {
  if (val instanceof Date) return Utilities.formatDate(val, sheetTz, "yyyy-MM-dd");
  var s = (val || "").toString().trim();
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.substring(0, 10) : null;
}

/**
 * 辅助函数：全量重建同名工作表（自动修复错位日期）
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
  
  var sheetTz = ss.getSpreadsheetTimeZone();
  var lastRow = targetSheet.getLastRow();
  
  // =========================================================================
  // 全量重建：以 FSM 返回的 10Y 数据为准，覆盖表内对应时间段；
  // 表内早于 10Y 窗口的旧记录予以保留。每次运行都会自动修复历史错位数据。
  // =========================================================================
  var merged = newData.slice(); // [dateKey, price]，已倒序
  var oldestFetched = newData.length > 0 ? newData[newData.length - 1][0] : null;
  var keptOld = 0;
  
  if (lastRow > 1 && oldestFetched) {
    var existing = targetSheet.getRange(2, 1, lastRow - 1, 2).getValues();
    for (var e = 0; e < existing.length; e++) {
      var oldKey = sheetCellToDateKey(existing[e][0], sheetTz);
      var oldPrice = parseFloat(existing[e][1]);
      if (oldKey && oldKey < oldestFetched && !isNaN(oldPrice)) {
        merged.push([oldKey, oldPrice]);
        keptOld++;
      }
    }
    merged.sort(function(a, b) { return a[0] < b[0] ? 1 : (a[0] > b[0] ? -1 : 0); });
  }
  
  var outputRows = [];
  for (var k = 0; k < merged.length; k++) {
    // 按表格时区构造当天 00:00，保证单元格显示的日期就是 dateKey
    var curD = Utilities.parseDate(merged[k][0], sheetTz, "yyyy-MM-dd");
    var curP = merged[k][1];
    var prevP = (k + 1 < merged.length) ? merged[k + 1][1] : null;
    
    var chgVal = "";
    var chgPct = "";
    if (prevP !== null && !isNaN(prevP) && prevP > 0) {
      chgVal = curP - prevP;
      chgPct = (curP - prevP) / prevP;
    }
    outputRows.push([curD, curP, chgVal, chgPct, curD]);
  }
  
  if (outputRows.length === 0) {
    logToConsole("WARN", "基金 [" + fundName + "] 无可写入数据。");
    return { success: false };
  }
  
  if (lastRow > 1) {
    targetSheet.getRange(2, 1, lastRow - 1, 5).clearContent();
  }
  targetSheet.getRange(2, 1, outputRows.length, 5).setValues(outputRows);
  formatFundSheetRanges(targetSheet, 2, outputRows.length);
  
  logToConsole("SUCCESS", "✅ 已全量重建 [" + fundName + "] 共 " + outputRows.length + " 条记录（最新: " + merged[0][0] + "，保留 10Y 之前旧记录 " + keptOld + " 条）");
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