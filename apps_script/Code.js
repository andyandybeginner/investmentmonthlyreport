/**
 * 初始化工具栏菜单
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('📊 基金工具箱 (研发调试版)')
      // 1. 绑定 price-update.gs 中的价格测试相关函数
      .addItem('🧪 [价格功能] 逐个基金测试价格更新并输出日志', 'runBatchPriceUpdate')
      .addItem('🧹 [价格功能] 清空调试控制台日志', 'clearDebugConsole')
      .addSeparator()
      // 2. 绑定 factsheet-download.gs 中的 PDF 下载函数
      .addItem('🚀 [Factsheet功能] 批量下载 Factsheet 到 Google Drive', 'downloadFactsheetsToDrive') 
      .addToUi();
}
