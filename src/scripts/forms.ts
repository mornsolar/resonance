import { CAMPAIGN_FIELD, browserStorage, captureCampaign } from '../lib/campaign';

// A tagged link (?src=youtube-description) is remembered for this tab and sent with any form.
const campaign = captureCampaign(window.location.search, browserStorage());

const DEFAULT_SUCCESS = "Thank you, you're in. Look out for a note from me soon.";
const FAILURE =
  'Something went wrong sending that. Please try again, or email me at chernyang.lee@gmail.com.';

function setStatus(form: HTMLFormElement, message: string): void {
  const status = form.querySelector<HTMLElement>('.form-status');
  if (status) status.textContent = message;
}

function formDataWithCampaign(form: HTMLFormElement): FormData {
  const body = new FormData(form);
  if (campaign) body.set(CAMPAIGN_FIELD, campaign);
  return body;
}

async function submitForm(form: HTMLFormElement): Promise<void> {
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (button) button.disabled = true;
  setStatus(form, 'Sending…');
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: formDataWithCampaign(form),
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`Form endpoint returned ${response.status}`);
    form.reset();
    setStatus(form, form.dataset.success ?? DEFAULT_SUCCESS);
  } catch {
    setStatus(form, FAILURE);
  } finally {
    if (button) button.disabled = false;
  }
}

for (const form of document.querySelectorAll<HTMLFormElement>('form[data-ajax-form]')) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    void submitForm(form);
  });
}
