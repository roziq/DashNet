function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (contents.type === 'network_sync') {
      // 1. Simpan AP Stats
      var sheetAp = getOrCreateSheet(ss, "AP_Stats", ["Timestamp", "APName", "ClientCount"]);
      if (sheetAp.getLastRow() > 1) {
        sheetAp.getRange(2, 1, sheetAp.getLastRow() - 1, 3).clearContent();
      }
      var timestamp = new Date();
      var apRows = [];
      if (contents.ap_data) {
        contents.ap_data.forEach(function(item) {
          apRows.push([timestamp, item.APName, item.ClientCount]);
        });
        if (apRows.length > 0) {
          sheetAp.getRange(2, 1, apRows.length, 3).setValues(apRows);
        }
      }

      // 2. Simpan Switch Stats dari UDM Pro
      var sheetSwitch = getOrCreateSheet(ss, "Switch_Stats", ["Timestamp", "SwitchName", "Model", "Status"]);
      if (contents.switch_data) {
        contents.switch_data.forEach(function(item) {
          var swName = item.SwitchName;
          var swModel = item.Model;
          var swStatus = item.Status;
          
          var data = sheetSwitch.getDataRange().getValues();
          var foundRow = -1;
          for (var i = 1; i < data.length; i++) {
            if (data[i][1] === swName) {
              foundRow = i + 1;
              break;
            }
          }

          if (foundRow > -1) {
            sheetSwitch.getRange(foundRow, 1, 1, 4).setValues([[timestamp, swName, swModel, swStatus]]);
          } else {
            sheetSwitch.appendRow([timestamp, swName, swModel, swStatus]);
          }
        });
      }

      return responseJSON({ status: "success", message: "Network sync success" });
    }
    
    return responseJSON({ status: "error", message: "Unknown payload type" });
  } catch (err) {
    return responseJSON({ status: "error", message: err.toString() });
  }
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var params = e ? e.parameter : {};
  var type = params.type || "";

  var sheetDevices = getOrCreateSheet(ss, "Devices", ["Timestamp", "DeviceName", "Type", "Status", "CpuLoad", "Uptime", "ActiveClients", "Note"]);
  var sheetWan     = getOrCreateSheet(ss, "WAN_Stats", ["Timestamp", "WANName", "Status", "RxMbps", "TxMbps"]);
  var sheetVlans   = getOrCreateSheet(ss, "VLAN_Stats", ["Timestamp", "VLANName", "RxMbps", "TxMbps"]);
  var sheetAp      = getOrCreateSheet(ss, "AP_Stats", ["Timestamp", "APName", "ClientCount"]);
  var sheetSwitch  = getOrCreateSheet(ss, "Switch_Stats", ["Timestamp", "SwitchName", "Model", "Status"]);

  // A. MIKROTIK SYSTEM METRICS
  if (type === "mikrotik") {
    var devName = params.device_name || "CCR2004|SMEGA";
    var cpuLoad = params.cpu_load || "0%";
    var uptime  = params.uptime || "Online";
    var leases  = params.active_leases || 0;
    var timestamp = new Date();

    sheetDevices.appendRow([timestamp, devName, "mikrotik", "Online", cpuLoad, uptime, leases, "Normal"]);
    limitSheetRows(sheetDevices, 100);

    return responseJSON({ status: "success", message: "MikroTik metrics appended" });
  }

  // B. MULTI-WAN METRICS
  if (type === "wan_traffic") {
    var wanName   = params.wan_name || "";
    var wanStatus = params.status || "Down";
    
    var rxBps = parseFloat(params.rx_bps || 0);
    var txBps = parseFloat(params.tx_bps || 0);
    var rxMbps = params.rx_mbps !== undefined ? parseFloat(params.rx_mbps) : (rxBps / 1000000);
    var txMbps = params.tx_mbps !== undefined ? parseFloat(params.tx_mbps) : (txBps / 1000000);

    var timestamp = new Date();

    if (wanName !== "") {
      sheetWan.appendRow([timestamp, wanName, wanStatus, rxMbps.toFixed(3), txMbps.toFixed(3)]);
      limitSheetRows(sheetWan, 200);
    }
    return responseJSON({ status: "success", message: "WAN metric appended" });
  }

  // C. VLAN METRICS
  if (type === "vlan_traffic") {
    var vlanName = params.vlan_name || "";
    var rxBps = parseFloat(params.rx_bps || 0);
    var txBps = parseFloat(params.tx_bps || 0);
    
    var clientRxMbps = params.rx_mbps !== undefined ? parseFloat(params.tx_mbps || 0) : (txBps / 1000000);
    var clientTxMbps = params.tx_mbps !== undefined ? parseFloat(params.rx_mbps || 0) : (rxBps / 1000000);

    var timestamp = new Date();

    if (vlanName !== "") {
      sheetVlans.appendRow([timestamp, vlanName, clientRxMbps.toFixed(3), clientTxMbps.toFixed(3)]);
      limitSheetRows(sheetVlans, 500);
    }
    return responseJSON({ status: "success", message: "VLAN metric appended" });
  }

  // D. MIKROTIK PING SWITCH STATUS (EDGESWITCH)
  if (type === "switch_ping") {
    var swName   = params.switch_name || "EdgeSwitch 8 150W";
    var swModel  = params.model || "ES-8-150W";
    var swStatus = params.status || "OFFLINE";
    var timestamp = new Date();

    var data = sheetSwitch.getDataRange().getValues();
    var foundRow = -1;
    for (var i = 1; i < data.length; i++) {
      if (data[i][1] === swName) {
        foundRow = i + 1;
        break;
      }
    }

    if (foundRow > -1) {
      sheetSwitch.getRange(foundRow, 1, 1, 4).setValues([[timestamp, swName, swModel, swStatus]]);
    } else {
      sheetSwitch.appendRow([timestamp, swName, swModel, swStatus]);
    }

    return responseJSON({ status: "success", message: "Switch ping status updated" });
  }

  // OUTPUT JSON UNTUK VERCEL DASHBOARD
  var devicesData = getSheetDataAsJSON(sheetDevices);
  var wanData     = getSheetDataAsJSON(sheetWan);
  var vlansData   = getSheetDataAsJSON(sheetVlans);
  var apData      = getSheetDataAsJSON(sheetAp);
  var switchData  = getSheetDataAsJSON(sheetSwitch);

  return responseJSON({
    status: "success",
    devices: devicesData,
    wans: wanData,
    vlans: vlansData,
    switches: switchData,
    ap_distribution: apData
  });
}

function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length > 0) sheet.appendRow(headers);
  }
  return sheet;
}

function limitSheetRows(sheet, maxRows) {
  var lastRow = sheet.getLastRow();
  if (lastRow > (maxRows + 1)) {
    sheet.deleteRows(2, lastRow - (maxRows + 1));
  }
}

function getSheetDataAsJSON(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var val = row[j];
      if (val instanceof Date) val = val.toISOString();
      obj[headers[j]] = val;
    }
    result.push(obj);
  }
  return result;
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
