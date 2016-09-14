var conv = require('binstring');
var iso8583 = require('../../../lib/iso8583');
var packager = new iso8583('smartVista');
//packager = new iso8583('openWay');
//packager = new iso8583('originalProsa');

var strng = '9210623A40010AC180000608400138000104022047200000132047200402040360120300200000000001300DEVELKAI201000400200000088PWT';
var binStrng = conv(strng, { in:'binary', out:'hex' });
//binStrng = conv('hello', { in:'binary' });
console.log(binStrng);

var msg = new Buffer(binStrng, 'hex');
//msg = new Buffer(binStrng);

console.log('Original message: ');
console.log(msg);
console.log();

console.log('Parsed message fields: ');
var parsed = packager.unpack(msg);
console.log(parsed);
console.log();

console.log('Repacked message: ');
var msg = packager.packWithBinMask(parsed);
console.log(msg);

