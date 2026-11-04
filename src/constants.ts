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
  paypal: {
    email: "tsukwasjapheth01@gmail.com",
    accountName: "Photizo Porch Ministry / Japheth Tsukwas",
    accountType: "PayPal Global Giving",
    description: "Instant and secure international giving via PayPal account or debit/credit card"
  }
};
