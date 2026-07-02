/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const MINISTRY_NAME = "PHOTIZO PORCH CHRISTIAN ASSEMBLY";
export const LEADERS = {
  prophet: "Prophet Japhet Tsukwas",
  pastor: "Mrs. Regina Japheth"
};

export const CONTACT_INFO = {
  whatsapp: "+234 706 819 2881",
  email: "fporchministries@gmail.com",
  facebook: "https://www.facebook.com/share/1BagLykc5j/",
  youtube: "https://youtube.com/@japhettsukwas?si=1OWWYwnqHoxjR0xK"
};

export const GIVING_OPTIONS = [
  { id: 'offering', label: 'Offering' },
  { id: 'tithe', label: 'Tithe' },
  { id: 'seed', label: 'Seed' },
  { id: 'gift', label: 'Special Gift' },
  { id: 'others', label: 'Others' }
];

export const BANK_DETAILS = {
  local: {
    bankName: "Keystone Bank",
    accountName: "PHOTIZO PORCH CHRISTIAN ASSEMBLY",
    accountNumber: "1013244531",
    accountType: "Ministry Account",
    description: "For local tithes, offerings, seeds, and partnership in Nigeria"
  },
  dom: {
    bankName: "KEYSTONE BANK LIMITED",
    accountName: "PHOTIZO PORCH CHRISTIAN ASSEMBLY",
    accountNumber: "1014165093",
    iban: "GB90CITI18500812690365",
    swift: "PLNINGLA",
    sortCode: "082300809",
    bankAddress: "1 KEYSTONE BANK CRESCENT, OFF ADEYEMO ALAKIJA STR, LAGOS",
    accountType: "Ministry Domiciliary Account (USD)",
    description: "For international followers wishing to give directly to the Ministry's USD Domiciliary Account"
  },
  europe: {
    bankName: "OPENPAYD FINANCIAL SERVICES MALTA LTD",
    accountName: "JAPHETH TSUKWAS MBALUMUNGA",
    iban: "MT08CFTE280040000000000006190261",
    swift: "CFTEMTM1XXX",
    bankAddress: "Floor 3, 137 Spinola Road, Eastern Region, St. Julian's, STJ 3011",
    accountType: "Prophet's Account",
    description: "For international transfers in EUR, GBP, and European zones"
  },
  usa: {
    beneficiaryName: "JAPHETH TSUKWAS MBALUMUNGA",
    accountNumber: "213551358425",
    routingNumber: "101019644",
    bankName: "LEAD BANK",
    bankAddress: "1801 Main St, MO, Kansas City, 64108",
    accountType: "Prophet's Account",
    description: "For international transfers from USA (ACH, Routing, Wire)"
  }
};
