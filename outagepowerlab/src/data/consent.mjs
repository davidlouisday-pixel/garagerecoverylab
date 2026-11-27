// The exact consent language shown next to the quote form checkbox. The worker stores
// CONSENT_VERSION and CONSENT_TEXT with every lead, so we can prove what each person agreed to.
// Change the text => bump the version. TODO(owner): have a lawyer review before selling any lead.
import { SITE_NAME } from '../site.config.mjs';

export const CONSENT_VERSION = '2026-11-27';
export const CONSENT_TEXT =
  `By checking this box, I agree that ${SITE_NAME} may share my information with one licensed installer in my area that ${SITE_NAME} selects, ` +
  `and that ${SITE_NAME} and that installer may contact me about my request at the phone number and email I provided, including by calls and texts ` +
  `made with automated technology or prerecorded messages. Consent is not a condition of any purchase. Message and data rates may apply. ` +
  `I can opt out at any time by replying STOP to a text or emailing us.`;
