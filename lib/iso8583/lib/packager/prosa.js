//
// To create a remote system configuration of your own:
//
// 1. Copy one of bundled templates (smartVista.js, openWay.js, etc) to a file named <your template>.js
// 2. Start SocketQueue with --hostConfig=<your template> parameter
//
// See lib/iso8583/lib/packer folder for the list of available data types
//
'use strict';
var _ = require('lodash');


function validateISOPROSAMessage(isoPROSA) {

    var isoLiteral = 'ISO';
    var isoExternalMessageHeaderLength = 9;
    var messageTypeIdentificationLength = 4;
    var primaryBitmapLength = 16;
    /*#
     var dataElements;
     var DE = dataElements;
     #*/

    console.log('ISO_Literal', isoPROSA.substr(0, isoLiteral.length));
    console.log('ISO_Literal_start?', isoPROSA.indexOf(isoLiteral) === 0);
    console.log('\n');

    var isoExtMsgHdr = isoPROSA.substr(isoLiteral.length, isoExternalMessageHeaderLength);
    console.log('ISO_External_Message_Header', isoExtMsgHdr);
    externalMessageHeaderExploit(isoExtMsgHdr);
    console.log('\n');

    var MTI = isoPROSA.substr(isoLiteral.length + isoExternalMessageHeaderLength, messageTypeIdentificationLength);
    console.log('Message_Type_Identification', MTI);
    messageTypeIdentificationExploit(MTI);
    console.log('\n');

    //var prmryBtmp = isoPROSA.substr(isoLiteral.length + isoExternalMessageHeaderLength + messageTypeIdentificationLength, primaryBitmapLength);
    //console.log('Primary_Bitmap', prmryBtmp);
    //bitmapExploitDeprecated(prmryBtmp);

    var btmp = isoPROSA.substr(isoLiteral.length + isoExternalMessageHeaderLength + messageTypeIdentificationLength);
    console.log('Bitmap', btmp);

    var bitmap = bitmapExploit(btmp);
    var btMpIndxArry = bitmap.btmpIndxArry;
    var primary_bitmap = bitmap.btmpExploitedArry[0];
    var secondary_bitmap, tertiary_bitmap;
    if(bitmap.btmpExploitedArry.length > 1) {
        secondary_bitmap = bitmap.btmpExploitedArry[1];
    }
    console.log('bitmap :::: ', bitmap);

    var fromIndx = 16, length = 0;
    for (var indx = 0; indx < btMpIndxArry.length; indx++) {
        var key = btMpIndxArry[indx];
        var currDataElement = {};
        currDataElement[key] = dataElement[key];
        currDataElement['value'] = btmp.substr(fromIndx, (length = dataElement[key][1]));
        fromIndx += length;

        console.log(key, _.assignIn({}, currDataElement));
    }
    console.log('\n');

    console.log('Data_Elements', isoPROSA.substr(isoLiteral.length + isoExternalMessageHeaderLength + messageTypeIdentificationLength + primaryBitmapLength));
}


function externalMessageHeaderExploit(extMsgHdr) {
    console.log(':::Product_Indicator', extMsgHdr.substr(0, 2));
    console.log(':::Release_Number', extMsgHdr.substr(2, 2));
    console.log(':::Status', extMsgHdr.substr(4, 3));
    console.log(':::Originator_Code_(Acquirer)', extMsgHdr.substr(7, 1));
    console.log(':::Responder_Code_(Issuer)', extMsgHdr.substr(8, 1));
}


function messageTypeIdentificationExploit(mti) {
    var messageClass = {
        '02': 'Financial Transaction',
        '04': 'Reversal',
        '08': 'Network Management'
    };

    var messageType = {
        '00': 'Request',
        '10': 'Request Response',
        '20': 'Advice',
        '21': 'Advice Repeat',
        '30': 'Advice Response'
    };

    console.log(':::messageTypeIdentificationExploit', messageClass[mti.substr(0, 2)], messageType[mti.substr(2)]);
}


function bitmapExploitDeprecated(bitmap) {
    var stringConverted = hex2bin(bitmap);
    // console.log(stringConverted.search('1'));
    // console.log(getIndicesOf('1', stringConverted, false));
    console.log(':::bitmapExploit', getAndAddIndicesOf('1', stringConverted, false, 1));
    return (bitmap.charAt((0) === '1'));
}

function bitmapExploit(bitmap) {

    var index = 0;
    var indexArry = -1;
    var stringConvertedArry = new Array();

    do {
        stringConvertedArry.push(hex2bin(bitmap.substr(index, 16)));
        index += 16;
        indexArry += 1;
    } while(stringConvertedArry[indexArry].charAt(0) === '1');
    console.log(stringConvertedArry, index, indexArry);

    var stringConverted = _.join(stringConvertedArry, '');

    // console.log(stringConverted.search('1'));
    // console.log(getIndicesOf('1', stringConverted, false));
    var indexArry = getAndAddIndicesOf('1', stringConverted, false, 1)
    console.log(':::bitmapExploit', indexArry);
    // return (bitmap.charAt((0) === '1'));
    // return (stringConvertedArry.length)

    var rtrnObjct = {
        btmpExploited: stringConverted,
        btmpExploitedArry: stringConvertedArry,
        btmpIndxArry: indexArry
    };
    return rtrnObjct;

}


function hex2bin(hexStrng) {
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
        'A': '1010',
        'B': '1011',
        'C': '1100',
        'D': '1101',
        'E': '1110',
        'F': '1111'
    };

    var stringToConvert = 'B238C40128A1801A';
    stringToConvert = '4210001102C04804';
    stringToConvert = '7234054128C28805';
    stringToConvert = '8000000000000001';
    stringToConvert = '0000000000000003';

    var stringConverted = '';
    for (var i = 0; i < hexStrng.length; i++) {
        stringConverted += hexToBinStr[hexStrng.charAt(i)];
    }

    console.log(':::hex2bin', stringConverted);
    return stringConverted;
}


function getIndicesOf(searchStr, str, caseSensitive) {
    var startIndex = 0, searchStrLen = searchStr.length;
    var index, indices = [];
    if (!caseSensitive) {
        str = str.toLowerCase();
        searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
}


function getAndAddIndicesOf(searchStr, str, caseSensitive, addVal) {
	var addToIndex = addVal ? addVal : 0;
    var startIndex = 0, searchStrLen = searchStr.length;
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


var FIXED_LENGTH = false;
var VARIABLE_LENGTH = true;

var dataElement = {
    1   : ['b',   16,  FIXED_LENGTH],           //Bit Map Extended
    2   : ['an',  19,  VARIABLE_LENGTH],        //Primary account number (PAN
    3   : ['n',   6,   FIXED_LENGTH],           //Precessing code
    4   : ['n',   12,  FIXED_LENGTH],           //Amount transaction
    5   : ['n',   12,  FIXED_LENGTH],           //Amount reconciliation
    6   : ['n',   12,  FIXED_LENGTH],           //Amount cardholder billing
    7   : ['an',  10,  FIXED_LENGTH],           //Date and time transmission
    8   : ['n',   8,   FIXED_LENGTH],           //Amount cardholder billing fee
    9   : ['n',   8,   FIXED_LENGTH],           //Conversion rate reconciliation
    10  : ['n',   8,   FIXED_LENGTH],           //Conversion rate cardholder billing
    11  : ['n',   6,   FIXED_LENGTH],           //Systems trace audit number
    12  : ['n',   6,   FIXED_LENGTH],           //Date and time local transaction
    13  : ['n',   4,   FIXED_LENGTH],           //Date effective
    14  : ['n',   4,   FIXED_LENGTH],           //Date expiration
    15  : ['n',   4,   FIXED_LENGTH],           //Date settlement
    16  : ['n',   4,   FIXED_LENGTH],           //Date conversion
    17  : ['n',   4,   FIXED_LENGTH],           //Date capture
    18  : ['n',   4,   FIXED_LENGTH],           //Message error indicator
    19  : ['n',   3,   FIXED_LENGTH],           //Country code acquiring institution
    20  : ['n',   3,   FIXED_LENGTH],           //Country code primary account number (PAN
    21  : ['n',   3,   FIXED_LENGTH],           //Transaction life cycle identification data
    22  : ['n',   3,   FIXED_LENGTH],           //Point of service data code
    23  : ['n',   3,   FIXED_LENGTH],           //Card sequence number
    24  : ['n',   3,   FIXED_LENGTH],           //Function code
    25  : ['n',   2,   FIXED_LENGTH],           //Message reason code
    26  : ['n',   2,   FIXED_LENGTH],           //Merchant category code
    27  : ['n',   1,   FIXED_LENGTH],           //Point of service capability
    28  : ['n',   8,   FIXED_LENGTH],           //Date reconciliation
    29  : ['an',  9,   FIXED_LENGTH],           //Reconciliation indicator
    30  : ['n',   8,   FIXED_LENGTH],           //Amounts original
    31  : ['an',  9,   FIXED_LENGTH],           //Acquirer reference number
    32  : ['n',   11,  VARIABLE_LENGTH],        //Acquiring institution identification code
    33  : ['n',   11,  VARIABLE_LENGTH],        //Forwarding institution identification code
    34  : ['an',  28,  VARIABLE_LENGTH],        //Electronic commerce data
    35  : ['z',   37,  VARIABLE_LENGTH],        //Track 2 data
    36  : ['n',   104, VARIABLE_LENGTH],        //Track 3 data
    37  : ['an',  12,  FIXED_LENGTH],           //Retrieval reference number
    38  : ['an',  6,   FIXED_LENGTH],           //Approval code
    39  : ['an',  2,   FIXED_LENGTH],           //Action code
    40  : ['an',  3,   FIXED_LENGTH],           //Service code
    41  : ['ans', 8,   FIXED_LENGTH],           //Card acceptor terminal identification
    42  : ['ans', 15,  FIXED_LENGTH],           //Card acceptor identification code
    43  : ['ans', 40,  FIXED_LENGTH],           //Card acceptor name/location
    44  : ['an',  25,  VARIABLE_LENGTH],        //Additional response data
    45  : ['an',  76,  VARIABLE_LENGTH],        //Track 1 data
    46  : ['an',  999, VARIABLE_LENGTH],        //Amounts fees
    47  : ['an',  999, VARIABLE_LENGTH],        //Additional data national
    //48  : ['ans', 119, VARIABLE_LENGTH],        //Additional data private
    48  : ['ans', 30, VARIABLE_LENGTH],        //Additional data private
    49  : ['an',  3,   FIXED_LENGTH],           //Verification data
    50  : ['an',  3,   FIXED_LENGTH],           //Currency code, settlement
    51  : ['a',   3,   FIXED_LENGTH],           //Currency code, cardholder billing
    52  : ['an',  16,  FIXED_LENGTH],           //Personal identification number (PIN) data
    53  : ['an',  18,  FIXED_LENGTH],           //Security related control information
    54  : ['an',  120, FIXED_LENGTH],           //Amounts additional
    55  : ['ans', 999, VARIABLE_LENGTH],        //Integrated circuit card (ICC) system related data
    56  : ['ans', 999, VARIABLE_LENGTH],        //Original data elements
    57  : ['ans', 999, VARIABLE_LENGTH],        //Authorisation life cycle code
    58  : ['ans', 999, VARIABLE_LENGTH],        //Authorising agent institution identification code
    59  : ['ans', 99,  VARIABLE_LENGTH],        //Transport data
    //60  : ['ans', 60,  VARIABLE_LENGTH],        //Reserved for national use
    60  : ['ans', 19,  VARIABLE_LENGTH],        //Reserved for national use
    //61  : ['ans', 99,  VARIABLE_LENGTH],        //Reserved for national use
    61  : ['ans', 22,  VARIABLE_LENGTH],        //Reserved for national use
    62  : ['ans', 999, VARIABLE_LENGTH],        //Reserved for private use
    //63  : ['ans', 999, VARIABLE_LENGTH],        //Reserved for private use
    63  : ['ans', 600, VARIABLE_LENGTH],        //Reserved for private use
    64  : ['b',   16,  FIXED_LENGTH],           //Message authentication code (MAC) field
    65  : ['b',   16,  FIXED_LENGTH],           //Bitmap tertiary
    66  : ['n',   1,   FIXED_LENGTH],           //Settlement code
    67  : ['n',   2,   FIXED_LENGTH],           //Extended payment data
    68  : ['n',   3,   FIXED_LENGTH],           //Receiving institution country code
    69  : ['n',   3,   FIXED_LENGTH],           //Settlement institution county code
    70  : ['n',   3,   FIXED_LENGTH],           //Network management Information code
    71  : ['n',   4,   FIXED_LENGTH],           //Message number
    72  : ['ans', 999, VARIABLE_LENGTH],        //Data record
    73  : ['n',   6,   FIXED_LENGTH],           //Date action
    74  : ['n',   10,  FIXED_LENGTH],           //Credits, number
    75  : ['n',   10,  FIXED_LENGTH],           //Credits, reversal number
    76  : ['n',   10,  FIXED_LENGTH],           //Debits, number
    77  : ['n',   10,  FIXED_LENGTH],           //Debits, reversal number
    78  : ['n',   10,  FIXED_LENGTH],           //Transfer number
    79  : ['n',   10,  FIXED_LENGTH],           //Transfer, reversal number
    80  : ['n',   10,  FIXED_LENGTH],           //Inquiries number
    81  : ['n',   10,  FIXED_LENGTH],           //Authorizations, number
    82  : ['n',   12,  FIXED_LENGTH],           //Credits, processing fee amount
    83  : ['n',   12,  FIXED_LENGTH],           //Credits, transaction fee amount
    84  : ['n',   12,  FIXED_LENGTH],           //Debits, processing fee amount
    85  : ['n',   12,  FIXED_LENGTH],           //Debits, transaction fee amount
    86  : ['n',   15,  FIXED_LENGTH],           //Credits, amount
    87  : ['an',   16, FIXED_LENGTH],           //Credits, reversal amount
    88  : ['n',   16,  FIXED_LENGTH],           //Debits, amount
    89  : ['n',   16,  FIXED_LENGTH],           //Debits, reversal amount
    90  : ['an',  42,  FIXED_LENGTH],           //Original data elements
    91  : ['an',  1,   FIXED_LENGTH],           //File update code
    92  : ['n',   2,   FIXED_LENGTH],           //File security code
    93  : ['n',   5,   FIXED_LENGTH],           //Response indicator
    94  : ['an',  7,   FIXED_LENGTH],           //Service indicator
    95  : ['an',  42,  FIXED_LENGTH],           //Replacement amounts
    96  : ['an',  8,   FIXED_LENGTH],           //Message security code
    97  : ['an',  17,  FIXED_LENGTH],           //Amount, net settlement
    98  : ['ans', 25,  FIXED_LENGTH],           //Payee
    99  : ['n',   11,  VARIABLE_LENGTH],        //Settlement institution identification code
    100 : ['n',   11,  VARIABLE_LENGTH],        //Receiving institution identification code
    101 : ['ans', 17,  FIXED_LENGTH],           //File name
    102 : ['ans', 28,  VARIABLE_LENGTH],        //Account identification 1
    103 : ['ans', 28,  VARIABLE_LENGTH],        //Account identification 2
    104 : ['an',  99,  VARIABLE_LENGTH],        //Transaction description
    105 : ['ans', 999, VARIABLE_LENGTH],        //Reserved for ISO use
    106 : ['ans', 999, VARIABLE_LENGTH],        //Reserved for ISO use
    107 : ['ans', 999, VARIABLE_LENGTH],        //Reserved for ISO use
    108 : ['ans', 999, VARIABLE_LENGTH],        //Reserved for ISO use
    109 : ['ans', 999, VARIABLE_LENGTH],        //Reserved for ISO use
    110 : ['ans', 999, VARIABLE_LENGTH],        //Reserved for ISO use
    111 : ['ans', 999, VARIABLE_LENGTH],        //Reserved for private use
    112 : ['ans', 999, VARIABLE_LENGTH],        //Reserved for private use
    113 : ['n',   11,  VARIABLE_LENGTH],        //Reserved for private use
    114 : ['ans', 999, VARIABLE_LENGTH],        //Reserved for national use
    115 : ['ans', 999, VARIABLE_LENGTH],        //Reserved for national use
    116 : ['ans', 999, VARIABLE_LENGTH],        //Reserved for national use
    117 : ['ans', 999, VARIABLE_LENGTH],        //Reserved for national use
    118 : ['ans', 999, VARIABLE_LENGTH],        //Reserved for national use
    119 : ['ans', 999, VARIABLE_LENGTH],        //Reserved for national use
    //120 : ['ans', 999, VARIABLE_LENGTH],        //Reserved for private use
    120 : ['ans', 32, VARIABLE_LENGTH],        //Terminal Address-Branch
    //121 : ['ans', 999, VARIABLE_LENGTH],        //Reserved for private use
    121 : ['ans', 23, VARIABLE_LENGTH],        //Authorization Indicators
    //122 : ['ans', 999, VARIABLE_LENGTH],        //Reserved for national use
    122 : ['ans', 14, VARIABLE_LENGTH],        //Card Issuer ID Code
    //123 : ['ans', 999, VARIABLE_LENGTH],        //Reserved for private use
    123 : ['ans', 23, VARIABLE_LENGTH],        //Pos Invoice Data
    124 : ['ans', 255, VARIABLE_LENGTH],        //Info Text
    //125 : ['ans', 50,  VARIABLE_LENGTH],        //Network management information
    125 : ['ans', 15,  VARIABLE_LENGTH],        //Pos Settlement Data
    //126 : ['ans', 6,   VARIABLE_LENGTH],        //Issuer trace id
    126 : ['ans', 41,   VARIABLE_LENGTH],        //Pos Preauthorization and Chrgeback Data
    127 : ['ans', 999, VARIABLE_LENGTH],        //Reserved for private use
    128 : ['b',   16,  FIXED_LENGTH]            //Message authentication code (MAC) field
};

/*#
module.exports = {
    DataElement : dataElement,
    FIXED_LENGTH : FIXED_LENGTH,
    VARIABLE_LENGTH : VARIABLE_LENGTH
}
#*/




var isoPROSATest = 'ISO0250000100200B238C40128A1801A00000000100001BC00000000';
isoPROSATest = 'ISO00260000502003238C4810821801A000000001000018C00000000000300000008241035377752121035370824082453990220400000000005012345678909venders owner s.a c.v mexico CDMMX02710283836352435262610192019248401601920192108310920190192019210101928372 ! Q100002 0 ! C000026 469 001 701 023! 0400020 00000000000 EXICOY ! EZ00098 00000000000000000000000000000101030;4111111111111111=180992210000469?11110000000001029venders s.a de c.v 000009283820001110001092838211012VD00000005000380000000000000010000';
isoPROSATest = 'ISO0026000050200B3238C4810821801A000000021000018C00000000000001000009050526265632370526260905090581204000000000051092837281000000000undefinedvenders    mexicoCDMMX027102838363524352626101920192484016019201921083undefined0190192019210101928372! Q100002 0 ! 0400020 098  001          701 023! 0400020  00000000000 EXICOY ! EZ00098 00000000000000000000000000000101030;4111111111111111=181012210000098?1111                                                                                                                                                                                                                                                                                                                                                                                                                                                        0000000100000000000000000000000000000000000000000001029venders s.a de c.v       000009283820001110001092838211012VD000000050003800000000000000100000000000000000000';
isoPROSATest = 'ISO0026000050200B238C4810821801A000000021000018C0000000000000100000905055020727241055020090509058120400000000005001092837281            Venders tevendersmexicoCDMMX027102838363524352626101920192484016019201921083undefined0190192019210101928372! Q100002 0 ! 0400020 098  001          701 023! 0400020  00000000000 EXICOY ! EZ00098 00000000000000000000000000000101030;4111111111111111=181012210000098?1111                                                                                                                                                                                                                                                                                                                                                                                                                                                        0000000100000000000000000000000000000000000000000001029venders s.a de c.v       000009283820001110001092838211012VD000000050003800000000000000100000000000000000000120';
isoPROSATest = 'ISO0026000050200B238C4810821801A000000021000018C00000000000001000009050556112310860556110905090553998120400000000005001092837281            Venders tevendersmexicoCDMMX027102838363524352626101920192484016019201921083undefined0190192019210101928372! Q100002 0 ! 0400020 098  001          701 023! 0400020  00000000000 EXICOY ! EZ00098 00000000000000000000000000000101030;4111111111111111=181012210000098?1111                                                                                                                                                                                                                                                                                                                                                                                                                                                        0000000100000000000000000000000000000000000000000001029venders s.a de c.v       000009283820001110001092838211012VD000000050003800000000000000100000000000000000000120';
isoPROSATest = 'ISO0026000050200B238C4810821801A000000021000018C00000000000001000009050616502286060616500905090553998120400000000005001092837281            Venders tevendersmexicoCDMMX02710283836352435262610192019248401601920192108391820190192019210101928372! Q100002 0 ! 0400020 098  001          701 023! 0400020  00000000000 EXICOY ! EZ00098 00000000000000000000000000000101030;4111111111111111=181012210000098?1111                                                                                                                                                                                                                                                                                                                                                                                                                                                        0000000100000000000000000000000000000000000000000001029venders s.a de c.v       000009283820001110001092838211012VD000000050003800000000000000100000000000000000000120';
isoPROSATest = 'ISO0260000500200B238C4810821801A000000021000018C00000000000001000009150157422321410157420915091553998120400000000005001092837281            Venders tevendersmexicoCDMMX02710283836352435262610192019248401601920192108391820190192019210101928372& 0000800462! C000026 098  001          701 023! 0400020  00000000000 EXICOY ! Q200002 09! B200158 4CF0    83                          000000010000000000000000        MEX48416091502                                                                                ! B300080 8C00000000                    1101                                         ! B400020    00            0     ! EZ00098 00000000000000000000000000000101030;4111111111111111=181012210000098?11110000000100000000000000000000000000000000000000000001029venders s.a de c.v       000009283820001110001092838211012VD000000050003800000000000000100000000000000000000120';

validateISOPROSAMessage(isoPROSATest);