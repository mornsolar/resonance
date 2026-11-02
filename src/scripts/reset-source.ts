import { parsePlacement, sourceFor } from '../lib/reset-promo';

// A visitor who arrives from a promo (?from=home) is recorded in the form's hidden "source" field,
// so the Formspree inbox shows which placement brought each sign-up. Nothing is stored anywhere else.
const placement = parsePlacement(window.location.search);
const source = document.querySelector<HTMLInputElement>('form[data-reset-form] input[name="source"]');
if (source && placement) source.value = sourceFor(placement);
