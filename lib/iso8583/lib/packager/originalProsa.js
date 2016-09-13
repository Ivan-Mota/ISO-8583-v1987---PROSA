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

}

exports.format = {
    '0': {
        length: 4,
        name: 'Message Type Indicator',
        type: 'n'
    },
    '1': {
        length: 32,
        name: 'Bitmap',
        type: 'an'
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
    '32': {
        length: 11,
        name: 'Acquiring Institution Ident Code',
        type: 'lln'
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
        length: 8,
        name: 'Card Acceptor Terminal Identification',
        type: 'ans'
    },
    '49': {
        length: 3,
        name: 'Currency code, transaction',
        type: 'a'
    },
    '54': {
        length: 120,
        name: 'Additional amounts',
        type: 'lllan'
    },
    '70': {
        length: 3,
        name: 'Network Management Information Code',
        type: 'n'
    }
};

