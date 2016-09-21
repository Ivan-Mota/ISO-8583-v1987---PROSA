//
// To create a remote system configuration of your own:
//
// 1. Copy one of bundled templates (smartVista.js, openWay.js, etc) to a file named <your template>.js
// 2. Start SocketQueue with --hostConfig=<your template> parameter
//
// See lib/iso8583/lib/packer folder for the list of available data types
//
'use strict';

exports.options = {
    // Packets older than given amount of times will be treated as outdated. This is to prevent some virtualization systems
    expirationLimitSeconds: 30,

    // TODO: missing data to be researched
    // The following errors should be treated as system or critical
    sysErrors: [],

    // The values of the following fields should be padded automatically
    padFields: [0, 7, 11, 12, 22, 41, 42, 49],

    // Reference of obligatory fields for different MTIs
    obligatoryFields: {
        '0800': [0, 1, 7, 11, 70],
        '0810': [0, 1, 7, 11, 39, 70],
        '0200': [0, 1, 3, 4, 7, 11, 12, 13, 17, 18, 22, 25, 32, 37, 42, 43, 48, 49, 54, 60, 61, 63, 90, 95, 100, 120, 121, 123, 125, 126],
        '0210': [0, 1, 3, 4, 7, 11, 12, 13, 17, 18, 22, 25, 32, 37, 38, 39, 41, 42, 44, 48, 49, 54, 60, 61, 63, 90, 95, 100, 102, 120, 121, 122, 125, 126],
        '0220': [0, 1, 3, 4, 7, 11, 12, 13, 17, 22, 25, 32, 37, 38, 39, 41, 42, 43, 44, 48, 49, 54, 60, 61, 63, 90, 95, 100, 102, 120, 121, 122, 123, 125, 126],
        '0221': [0, 1, 3, 4, 7, 11, 12, 13, 17, 22, 25, 32, 37, 38, 39, 41, 42, 43, 44, 48, 49, 54, 60, 61, 63, 90, 95, 100, 102, 120, 121, 122, 123, 125, 126],
        '0230': [0, 1, 3, 4, 7, 11, 22, 25, 32, 37, 39, 41, 49, 61, 63, 102, 120, 126],
        '0400': [0, 1, 3, 4, 7, 11, 12, 13, 17, 22, 25, 32, 37, 39, 41, 42, 48, 49, 54, 60, 61, 63, 90, 95, 100, 102, 120, 121, 122, 123, 125, 126],
        '0420': [0, 1, 3, 4, 7, 11, 12, 13, 17, 22, 18, 25, 32, 37, 38, 39, 41, 42, 43, 48, 49, 54, 60, 61, 63, 90, 95, 100, 102, 120, 121, 122, 123, 125, 126],
        '0421': [0, 1, 3, 4, 7, 11, 12, 13, 17, 22, 18, 25, 32, 37, 38, 39, 41, 42, 43, 48, 49, 54, 60, 61, 63, 90, 95, 100, 102, 120, 121, 122, 123, 125, 126],
        '0430': [0, 1, 3, 4, 7, 11, 12, 13, 18, 22, 25, 32, 37, 39, 41, 49, 54, 61, 63, 90, 102, 120, 121, 126]
    },

    cardDataInputModes: {
    },

    cardholderAuthMethods: {
    },

    // System error messages reference by code ['\(\d{2,3},']
    errors: {
        50: 'Declinada',
        51: 'Tarjeta Expirada',
        52: 'Intentos de PIN excedidos',
        53: 'Uso compartido no soportado',
        54: 'Modulo de seguridad incorrecto',
        55: 'Transaccion Invalida',
        56: 'Transaccion no soportada',
        57: 'Tarjeta Reportada',
        58: 'Tarjeta Invalida',
        59: 'Tarjeta Restringida',
        60: 'Cuenta sin CAF',
        61: 'Cuenta sin PBF',
        62: 'PBF erroneo',
        64: 'Track Data Erroneo',
        67: 'Fecha de Transacción Invalida',
        68: 'Error en PTLF',
        69: 'Revisión de Mensaje Incorrecta',
        70: 'No IDF',
        73: 'Ruteo Incorrecto',
        74: 'Inhabilitado para Autoriza',
        76: 'Fondos Insuficientes',
        77: 'Limite de autorización rechazado',
        78: 'Transacción duplicada',
        81: 'Monto de devolución mayor al credito',
        82: 'Intentos de devolución excedidos',
        84: 'Cliente sin NEG',
        85: 'Consulta no Permitida',
        86: 'Limite de piso Excedido',
        87: 'Intentos de devolución excedidos',
        88: 'Transacción Referida',
        89: 'Tarjeta Inactiva',
        92: 'Monto de disposición menor',
        94: 'Limite excedido',
        95: 'Monto maximo excedido',
        97: 'MOD 10 CHECK',
        99: 'PBF erroneo',
        100: 'Inhabilitado para procesar',
        101: 'Llame para autorizar',
        105: 'Tarjeta no soportada',
        107: 'Limite de devoliciones excedido',
        113: 'TIMEOUT',
        150: 'No existe el Comercio',
        200: 'Cuenta Invalida',
        201: 'PIN incorrecto',
        204: 'Ingrese un monto menor',
        205: 'Monto de disposiciÃ³n invalido',
        206: 'CAF no presente',
        208: 'Fecha de expiraciÃ³n Invalida',
        251: 'CASH BACK excede limite diario',
        300: 'Comercio Fraudulento',
        302: 'Promocion Inexistente',
        303: 'Promocion Invalida',
        400: 'ARQC Invalido',
        406: 'NULL',
        901: 'Tarjeta Expirada',
        902: 'NEG CAPTURE CARD',
        903: 'CAF STATUS 3',
        906: 'Captura Tarjeta Pago',
        908: 'NULL',
        909: 'Capturada'
    }

};

exports.format = {
    '0': {
        length: 4,
        name: 'Message Type Indicator',
        type: 'n'
    },
    '1': {
        length: 32,
        name: 'Bitmap',
        type: 'ban'
    },
    '2': {
        length: 19,
        name: 'Primary Account Number',
        type: 'lln'
    },
    '3': {
        length: 6,
        name: 'Processing Code',
        type: 'n'
    },
    '4': {
        length: 12,
        name: 'Amount, Transaction',
        type: 'n'
    },
    '5': {
        length: 12,
        name: 'Amount, Settlement',
        type: 'n'
    },
    '6': {
        length: 12,
        name: 'Amount, Cardholder Billing',
        type: 'n'
    },
    '7': {
        length: 10,
        name: 'Transmission Date and Time',
        type: 'n'
    },
    '8': {
        length: 8,
        name: 'Amount, Cardholder Billing Fee',
        type: 'n'
    },
    '9': {
        length: 8,
        name: 'Conversion Rate, Settlement',
        type: 'n'
    },
    '10': {
        length: 8,
        name: 'Conversion Rate, Cardholder Billing',
        type: 'n'
    },
    '11': {
        length: 6,
        name: 'System Trace Audit Number',
        type: 'n'
    },
    '12': {
        length: 6,
        name: 'Time, Local Transaction',
        type: 'n'
    },
    '13': {
        length: 4,
        name: 'Date, Local Transaction',
        type: 'n'
    },
    '14': {
        length: 4,
        name: 'Date, Expiration',
        type: 'n'
    },
    '15': {
        length: 4,
        name: 'Date, Settlement',
        type: 'n'
    },
    '17': {
        length: 4,
        name: 'Capture Date',
        type: 'n'
    },
    '18': {
        length: 4,
        name: 'Merchant Type',
        type: 'n'
    },
    '22': {
        length: 3,
        name:   'Point of Service Entry Mode',
        type:   'n'
    },
    '24': {
        length: 3,
        name:   'Function Code',
        type:   'n'
    },
    '25': {
        length: 2,
        name:   'Point of Service Condition Code',
        type:   'n'
    },
    '32': {
        length: 11,
        name: 'Acquiring Institution Ident Code',
        type: 'n'
    },
    '35': {
        length: 37,
        name: 'Track 2 Data',
        type: 'ans'
    },
    '37': {
        length: 12,
        name: 'Retrieval Reference Number',
        type: 'an'
    },
    '38': {
        length: 6,
        name: 'Authorization identification response',
        type: 'an'
    },
    '39': {
        length: 2,
        name: 'Response code',
        type: 'an'
    },
    //
    '41': {
        length: 16,
        name: 'Card Acceptor Terminal Identification',
        type: 'ans'
    },
    '42': {
        length: 15,
        name: 'Card Acceptor ID Code',
        type: 'ans'
    },
    '43': {
        length: 40,
        name: 'Card Acceptor Name / Location',
        type: 'ans'
    },
    '44': {
        length: 4,
        name: 'Additional Response Data',
        type: 'ans'
    },
    '45': {
        length: 76,
        name: 'Track1 Data',
        type: 'ans'
    },
    '48': {
        length: 30,
        name: 'Retailer Data',
        type: 'ans'
    },
    '49': {
        length: 3,
        name: 'Currency code, transaction',
        type: 'n'
    },
    '54': {
        length: 15,
        name: 'Additional amounts',
        type: 'lllans'
    },
    '60': {
        //length: 3,
        length: 19,
        name: 'Terminal Data',
        type: 'n'
    },
    '61': {
        //length: 3,
        length: 22,
        name: 'Card Issuer-Category- Response Code Data',
        type: 'ans'
    },
    '63': {
        length: 600,
        name: 'Additional Data',
        type: 'ans'
    },
    '70': {
        length: 3,
        name: 'Network Management Information Code',
        type: 'n'
    },
    '90': {
        length: 42,
        name: 'Original Data Elements',
        type: 'an'
    },
    '95': {
        length: 42,
        name: 'Replacement Amounts',
        type: 'n'
    },
    '100': {
        length: 11,
        name: 'Receiving Institution ID Code',
        type: 'an'
    },
    '102': {
        length: 28,
        name: 'Account ID 1',
        type: 'ans'
    },
    '120': {
        length: 32,
        name: 'Terminal Address-Branch',
        type: 'ans'
    },
    '121': {
        length: 23,
        name: 'Authorization Indicators',
        type: 'ans'
    },
    '122': {
        length: 14,
        name: 'Card Issuer ID Code',
        type: 'ans'
    },
    '123': {
        length: 23,
        name: 'Pos Invoice Data',
        type: 'ans'
    },
    '125': {
        length: 15,
        name: 'Pos Settlement Data',
        type: 'ans'
    },
    '126': {
        length: 41,
        name: 'Pos Preauthorization and Chrgeback Data',
        type: 'ans'
    }
};

