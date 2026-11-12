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
  youtube: "https://youtube.com/@japhettsukwas?si=1OWWYwnqHoxjR0xK",
  telegram: "https://t.me/photizoporchchristianassembly/366?single"
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
    bankName: "Zenith Bank",
    accountName: "PHOTIZO PORCH CHRISTIAN ASSEMBLY",
    accountNumber: "1312595176",
    accountType: "Local Account (Naira)",
    description: "Primary local church account for tithes, offerings, partnerships, and seeds"
  },
  localSecondary: {
    bankName: "Keystone Bank",
    accountName: "PHOTIZO PORCH CHRISTIAN ASSEMBLY",
    accountNumber: "1013244531",
    accountType: "Local Account (Naira)",
    description: "For local tithes, offerings, seeds, and partnership in Nigeria"
  },
  dom: {
    bankName: "Zenith Bank (USD Domiciliary)",
    currency: "USD ($)",
    accountName: "PHOTIZO PORCH CHRISTIAN ASSEMBLY",
    accountNumber: "5076124603",
    accountType: "Domiciliary Account (USD)",
    description: "Official United States Dollar Domiciliary Account for international followers, partners, and kingdom builders"
  },
  domGbp: {
    bankName: "Zenith Bank (Pounds / GBP Domiciliary)",
    currency: "GBP (£)",
    accountName: "PHOTIZO PORCH CHRISTIAN ASSEMBLY",
    accountNumber: "5061826541",
    accountType: "Domiciliary Account (POUNDS / GBP)",
    description: "Official British Pounds Domiciliary Account for UK, European, and worldwide global partners"
  },
  domKeystone: {
    bankName: "Keystone Bank / Sky Bank Dom",
    currency: "USD ($)",
    accountName: "PHOTIZO PORCH CHRISTIAN ASSEMBLY",
    accountNumber: "1014165093",
    iban: "GB90CITI18500812690365",
    swift: "PLNINGLA",
    sortCode: "082300809",
    bankAddress: "1 KEYSTONE BANK CRESCENT, OFF ADEYEMO ALAKIJA STR, LAGOS",
    accountType: "Ministry Domiciliary Account (USD)",
    description: "USD Domiciliary Account via Keystone Bank"
  },
  paypal: {
    email: "tsukwasjapheth01@gmail.com",
    accountName: "Photizo Porch Ministry / Japheth Tsukwas",
    accountType: "PayPal Global Giving",
    statusNotice: "Our PayPal account is still under review. However, you can still send your ministry support from the USA to Nigeria using PayPal Xoom.",
    description: "Instant and secure international giving via PayPal account, debit/credit card, or PayPal Xoom.",
    xoom: {
      serviceName: "PayPal Xoom",
      url: "https://www.xoom.com/nigeria/send-money",
      bankName: "Fidelity Bank",
      accountName: "Japheth Mbalumunga Tsukwas",
      accountNumber: "6977216553",
      country: "Nigeria",
      steps: [
        {
          step: 1,
          title: "Visit Xoom",
          details: "Open the official website: https://www.xoom.com/nigeria/send-money",
          actionUrl: "https://www.xoom.com/nigeria/send-money"
        },
        {
          step: 2,
          title: "Log in",
          points: [
            "Click Log In.",
            "Sign in using your US PayPal account if that option is available.",
            "Complete any security verification requested."
          ]
        },
        {
          step: 3,
          title: "Select Nigeria",
          points: [
            "Choose Nigeria as the receiving country.",
            "Enter the amount you wish to send in US dollars.",
            "Check the displayed exchange rate to Nigerian naira."
          ]
        },
        {
          step: 4,
          title: "Select Bank Deposit",
          points: [
            "Choose Bank Deposit as the receiving method.",
            "Select Fidelity Bank from the list of available banks."
          ]
        },
        {
          step: 5,
          title: "Enter the Recipient's Bank Details",
          points: [
            "Bank Name: Fidelity Bank",
            "Account Name: Japheth Mbalumunga Tsukwas",
            "Account Number: 6977216553",
            "Country: Nigeria"
          ]
        },
        {
          step: 6,
          title: "Select Your Payment Method",
          points: [
            "Choose an eligible payment method available on your Xoom account, such as:",
            "• PayPal balance",
            "• Linked US bank account",
            "• Eligible debit card"
          ]
        },
        {
          step: 7,
          title: "Review the Transaction",
          points: [
            "Before proceeding, carefully check: Recipient's full name, Account number, Bank name, Amount being sent, Exchange rate, Transfer fees, and Final amount to be received in naira.",
            "IMPORTANT: Since this money is intended as voluntary ministry support, please confirm that Xoom permits this type of donation to a personal Nigerian bank account."
          ]
        },
        {
          step: 8,
          title: "Confirm and Send",
          points: [
            "If Xoom accepts the transaction: Click Send.",
            "Complete the required security verification.",
            "Save your transaction receipt.",
            "Kindly share the transaction confirmation with us."
          ]
        }
      ],
      blessing: "Thank you for your generosity and partnership in supporting the Gospel of Jesus Christ. May God richly bless you! PHOTIZO PORCH CHRISTIAN ASSEMBLY, Nigeria"
    }
  }
};
