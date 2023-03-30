const sheet = SpreadsheetApp.openById("SHEET_ID").getSheetByName("Sheet1");

function doGet(e) {
  var key = e.queryString;
  var response = { success: false, message: "No value found for key '" + key + "'" };
  if (key == undefined || key === "") {
    response = { success: false, message: "No key provided!" }
    return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
  }
  var dataList = sheet.getDataRange().getValues();
  var rowIndex = binarySearch(dataList, 1, key);
  if (rowIndex > 0) {
    response = { success: true, key, value: sheet.getRange(rowIndex, 2).getValue() }
  }
  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var action = e.queryString;
  var response = null;
  if (action == undefined || action === "") {
    response = { success: false, message: "No action found!" }
    return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
  } else if (action == "new") {
    if (e.postData == undefined || e.postData.contents == undefined || e.postData.contents == "") {
      response = { success: false, message: "No content found for value" }
    } else {
      var value = e.postData.contents;
      var key = new Date().getTime().toString();
      sheet.appendRow([key, value]);
      response = { success: true, key }
    }
  } else if (action.startsWith("delete")) {
    var key = e.parameter.delete;
    if (key == "") {
      response = { success: false, message: "No key was provided to delete" }
      return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
    }
    response = { success: false, message: key + " not found!" }
    var dataList = sheet.getDataRange().getValues();
    var rowIndex = binarySearch(dataList, 1, key);
    if (rowIndex > 0) {
      sheet.deleteRow(rowIndex);
      response = { success: true, message: key + " deleted successfully" }
    }
  } else {
    response = { success: false, message: "Unknown action" }
  }
  if (response == null) response = { success: false, message: "Unknown error" }
  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

function getCurrentDate() {
  return Utilities.formatDate(new Date(), "GMT+06:00", "dd/MM/yyyy HH:mm:ss"); // For Bangladeshi time
}

function base64Decode(base64Data) {
  var decoded = Utilities.base64Decode(base64Data);
  return Utilities.newBlob(decoded).getDataAsString();
}

function base64Encode(text) {
  return Utilities.base64Encode(text);
}

function binarySearch(dataList, columnIndex, valueToSearch) {
  var start = 0;
  var end = dataList.length - 1;
  var column = columnIndex - 1;
  var value = parseInt(valueToSearch);

  while (start <= end) {
    var mid = Math.floor((start + end) / 2);

    if (dataList[mid][column] == value) {
      return mid + 1;
    }
    if (value < dataList[mid][column]) {
      end = mid - 1;
    } else {
      start = mid + 1;
    }
  }
  return -1;
}