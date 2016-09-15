var util = require('util');
var fs   = require('fs');

var ISO8583 = function(packagerName) {
  // Loading the proper packager
  var packagerConfigFile = './packager/' + packagerName + '.js';

  if (fs.existsSync(packagerConfigFile)) {
    console.log('File not found: ' + packagerConfigFile);
    console.log(('Invalid packager name: ' + packagerName).red);
    process.exit(1);
  }

  this.config = require(packagerConfigFile);

  this.format = this.config.format;

  this.fields = {};
  
  this._unpack = function(msg, id) {
    var result;
    try {
      var packager = this.format[id];
      if (!packager) throw new Error('Unknown packager ' + id);

      result = require('./packer/' + packager.type).unpack(msg, packager);
      this.fields[id] = result.data;
    } catch(e) {
      var errMsg = 'Error unpacking data from bit ' + id + '\nPackager: ' + util.inspect(packager);

      throw new Error(errMsg + ': ' + e.message + " " + e.stack);
    }
    
    return result;
  };
  
  this._pack = function(row, id) {
    var result;
    try {
      var packager = this.format[id];

      result = require('./packer/' + packager.type).pack(row, packager);
    } catch(e) {
      var errMsg = 'Error packing data from bit ' + id + '\nPackager: ' + util.inspect(packager);
      throw new Error(errMsg + ': ' + e.message + " " + e.stack);
    }

    return result;
  };
  
  this.unpack = function(msg) {
    var result;
    var fields = {};
    this.fields = {};

    result = this._unpack(msg, 0);
    fields['0'] = result.data;
    result = this._unpack(result.restData, 1);
    fields['1'] = result.data;
    var fieldIds = result.fieldIds;
    console.log('fieldIds ::: ', fieldIds);

    for(var i in fieldIds) {
      try {
        result = this._unpack(result.restData, fieldIds[i]);
        fields[i] = result.data;
      } catch(e) {
        console.log(e.message);
      }
    }

    return this.fields;
  };
  
  this._sort = function(o) {
    var sorted = {},
    key, a = [];

    for (key in o) {
      if (o.hasOwnProperty(key)) {
          a.push(key);
      }
    }

    a.sort();

    for (key = 0; key < a.length; key++) {
      sorted[a[key]] = o[a[key]];
    }

    return sorted;
  };
  
  this.pack = function(data) {
    var retMsg = '', retMap = {};
    var result;
    data = this._sort(data);
    for(var i in data) {
      if (i == 1) {
        result = this._pack(data, i);
      } else {
        result = this._pack(data[i], i);
      }
      
      retMap[i] = result.msg;
      retMsg += result.msg;
    }
    
    return retMsg;
  };

  this.packWithBinMask = function(data) {
    data = this._sort(data);
    var retArr = [];
    var totalLength = 0;

    data = this._sort(data);

    for(var i in data) {
      if (i == 1) continue;

      var result = this._pack(data[i], i);
      
      var length = typeof result.msg == 'number' ? result.msg.toString().length : result.msg.length;
      totalLength += length;

      if (typeof result.msg != 'object' && result.msg instanceof Buffer) {
        retArr.push(result.msg);
      } else {
        retArr.push(new Buffer(result.msg));
      }
    }

    var bitMask = this.getBinMask(data);
    retArr.splice(1, 0, bitMask);
    totalLength += bitMask.length;

    return Buffer.concat(retArr, totalLength);
  }

  this.getBinMask = function(data) {
    var maskBuf = new Buffer([0, 0, 0, 0, 0, 0, 0, 0], 'ascii');
    var totalLength = 0;

    data = this._sort(data);

    for(var i in data) {
      if (i == 1) continue;
      var bIdx = Math.ceil(i / 8) - 1;
      if (!i % 8 || i == 0) bIdx ++;
      if (i != 0) maskBuf[bIdx] |= (1 << (8 - (i - bIdx * 8)));
    }

    return maskBuf;
  }

  this.hexMask = function(data) {
    return data.toString('hex')
  }
};

ISO8583.prototype.getOptions = function() {
  return this.config.hasOwnProperty('options') ? this.config.options : {};
}

ISO8583.prototype.getOption = function(optionName) {
  if (this.config.hasOwnProperty('options') && this.config.options.hasOwnProperty('optionName')) {
    return this.config.options.optionName;
  } else {
    return null;
  }
}

module.exports = ISO8583;