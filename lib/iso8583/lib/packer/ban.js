exports.unpack = function(msg, packager) {
  var data = msg.slice(0, packager.length).toString('ascii');
  var bitmap = hex2bin(data);

  return {
    data: data,
    restData: msg.slice(packager.length),
    bitmap: bitmap,
    fieldIds: getAndAddIndicesOf('1', bitmap, false, 1)
  };
};

exports.pack = function(row, packager) {
  if (typeof row == 'number') row = row.toString();

  return {
    msg: ('000000000000000000000000000000000000000000000000000000' + row).slice(-packager.length)
  }
};

var hex2bin = function(hexStrng) {
  var hexToBinStr = {
    '0': '0000',
    '1': '0001',
    '2': '0010',
    '3': '0011',
    '4': '0100',
    '5': '0101',
    '6': '0110',
    '7': '0111',
    '8': '1000',
    '9': '1001',
    'a': '1010',
    'A': '1010',
    'b': '1011',
    'B': '1011',
    'c': '1100',
    'C': '1100',
    'd': '1101',
    'D': '1101',
    'e': '1110',
    'E': '1110',
    'f': '1111',
    'F': '1111'
  };

  var stringConverted = '';
  for (var i = 0; i < hexStrng.length; i++) {
    stringConverted += hexToBinStr[hexStrng.charAt(i)];
  }

  console.log(':::hex2bin', stringConverted);
  return stringConverted;
}

var getAndAddIndicesOf = function(searchStr, str, caseSensitive, addVal) {
  var addToIndex = addVal ? addVal : 0;
  var startIndex = 1, searchStrLen = searchStr.length;
  var index, indices = [];
  if (!caseSensitive) {
    str = str.toLowerCase();
    searchStr = searchStr.toLowerCase();
  }
  while ((index = str.indexOf(searchStr, startIndex)) > -1) {
    indices.push(index + addToIndex);
    startIndex = index + searchStrLen;
  }
  return indices;
}