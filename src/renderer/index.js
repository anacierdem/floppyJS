import { number } from './test.ts';

const { remote, ipcRenderer } = require('electron');

const mainProcess = remote.require('./src/app/exports.js');

function littleEndianInteger(length, data, startOffset) {
  var value = 0;
  for (var i = 0; i < length; i++) {
    value += data[startOffset + i] << 8 * i;
  }
  return value;
};

function stringFromBytes(length, data, startOffset) {
  var value = "";
  for(var i = 0; i < length; i++) {
    value += String.fromCharCode(data[startOffset + i]);
  }
  return value;
};

function getBitFromByte(data, startOffset, bitNo) {
  var value = (data[startOffset] & (1 << bitNo)) >> bitNo;
  return value;
};

function getFileFromFAT(entryNO) {
  var fileData = [];
  if (FAT1[entryNO] == 0) {
    return fileData;
  } else if(FAT1[entryNO] >= 0xFF0 && FAT1[entryNO] <= 0xFF6 ) {
    return fileData = getClusterFromFAT(entryNO);
  } else if (FAT1[entryNO] == 0xFF7) {
    return fileData;
  } else if ((FAT1[entryNO] >= 0xFF8 && FAT1[entryNO] <= 0xFFF) || FAT1[entryNO] > 2849 ) {
    return fileData = fileData.concat(getClusterFromFAT(entryNO));
  } else {
    fileData = fileData.concat(getClusterFromFAT(entryNO));
    return fileData.concat(getFileFromFAT(FAT1[entryNO]));
  }
};

function getClusterFromFAT(entryNO) {
  var sectorNo = 33 + entryNO - 2;
  var value = sectors[sectorNo];
  return value;
}

function readFAT (FATNo) {
  var FATData = [];
  var FATEntries = [];

  //Make FAT bytes a single array
  for (var i = 0; i < 9; i++){
    for (var j = 0; j < 512; j++){
      FATData = FATData.concat(sectors[i + FATNo * 9 + 1][j]);
    }
  }
  
  for (var i = 0; i < 9 * 512; i = i + 3){
    var byte1 = FATData[i + 0];

    //second 4bit
    var second4bit = FATData[i + 1] & 0xF

    //first 4bit
    var first4bit = (FATData[i + 1] & 0xF0) >> 4

    var byte3 = FATData[i + 2]

    var firstAddress = (second4bit << 8) + byte1;
    var secondAddress = first4bit + (byte3 << 4);

    if (i / 3 * 2 == 249 || i / 3 * 2 + 1 == 249) {
      a = 1;
    }

    FATEntries[i / 3 * 2] = firstAddress;
    FATEntries[i / 3 * 2 + 1] = secondAddress;
  }
  return FATEntries;
};

function readAndAppendDirectorySector(data, parentEntry) {
  var EOD = false;
  //loop directory entries
  for (var j = 0; j < 16; j++) {
    var byteNo = j * 32;

    if (data[byteNo + 0] == 0)
      EOD = true;

    if (EOD)
      break;

    var filename = stringFromBytes(8, data, byteNo + 0).trim();
    var fileext = stringFromBytes(3, data, byteNo + 8).trim();

    var fullname = filename + (fileext == "" ? "" : ("." + fileext))

    var attributes = {};
    attributes.ro = getBitFromByte(data, byteNo + 11, 0);
    attributes.hidden = getBitFromByte(data, byteNo + 11, 1);
    attributes.system = getBitFromByte(data, byteNo + 11, 2);
    attributes.label = getBitFromByte(data, byteNo + 11, 3);
    attributes.dir = getBitFromByte(data, byteNo + 11, 4);
    attributes.arch = getBitFromByte(data, byteNo + 11, 5);

    var fileSize = littleEndianInteger(4, data, byteNo + 28);
    var firstCluster = littleEndianInteger(2, data, byteNo + 26);

    if (fullname != "." && fullname != ".." && attributes.label != 1){
      var scriptToRun = "";

      if (attributes.dir != 1) {
        if (fileSize > 0) {
          var clusterCount = Math.ceil(fileSize/512);
          var finalClusterByteCount = (1-clusterCount)*512+fileSize;
          scriptToRun = "var fileContents = getFileFromFAT("+firstCluster+");";
          scriptToRun += "var finalCluster = new Uint8Array("+finalClusterByteCount+");";
          scriptToRun += "finalCluster.set(fileContents["+(clusterCount-1)+"].slice(0,"+finalClusterByteCount+"));";
          scriptToRun += "fileContents["+(clusterCount-1)+"] = finalCluster;";
          scriptToRun += "var blob = new Blob(fileContents, {type: 'application/octet-stream', endings: 'transparent'});";
          scriptToRun += "saveAs(blob, '"+fullname+"', true);var size = "+fileSize+";";
          console.log(uniqueID,parentEntry,fullname, "javascript:"+scriptToRun); 
          uniqueID++;
        }
      } else {
        console.log(uniqueID, parentEntry, fullname, ""); 
        uniqueID++;
      }

      if (attributes.dir == 1){
        var currentParent = uniqueID - 1;
        var tmpClusters = getFileFromFAT(firstCluster);
        for (var k = 0; k < tmpClusters.length; k++){
          readAndAppendDirectorySector(tmpClusters[k], currentParent)
        }
      }
    }
  }
  return EOD;
};

var sectors = [];

var FAT1 = [];
var FAT2 = [];

var uniqueID = 0;

var fileInput = document.getElementById("browseOpen");
fileInput.onclick = function () {    
  mainProcess.loadData();
};

ipcRenderer.on('fileLoaded', (evt, msg) => {
  sectors = msg;

  console.log("Bytes per sector: " + littleEndianInteger(2, sectors[0], 11));
  console.log("Sectors per cluster: " + littleEndianInteger(1, sectors[0], 13));
  console.log("Number of reserved sectors: " + littleEndianInteger(2, sectors[0], 14));
  console.log("Number of FATs: " + littleEndianInteger(1, sectors[0], 16));
  console.log("Maximum number of root directory entries: " + littleEndianInteger(2, sectors[0], 17));
  console.log("Total sector count: " + littleEndianInteger(2, sectors[0], 19));
  console.log("Sectors per FAT: " + littleEndianInteger(2, sectors[0], 22));
  console.log("Sectors per track: " + littleEndianInteger(2, sectors[0], 24));
  console.log("Number of heads: " + littleEndianInteger(2, sectors[0], 26));
  console.log("Boot signature: " + sectors[0][38].toString(16));
  console.log("Volume id: " + littleEndianInteger(4, sectors[0], 39));
  console.log("Volume label: " + stringFromBytes(11, sectors[0], 43));
  console.log("File system type: " + stringFromBytes(8, sectors[0], 54));

  uniqueID = 0;

  // Volume label
  console.log(uniqueID, -1, stringFromBytes(11, sectors[0], 43));
  uniqueID++;

  FAT1 = readFAT(0);

  // TODO: FAT2 seems unused - fix
  FAT2 = readFAT(1);

  // Loop directory sectors (14 total)
  for (var i = 0; i < 14; i++) {
    // First 18 sectors are FATs
    readAndAppendDirectorySector(sectors[19 + i], 0);
  }
});