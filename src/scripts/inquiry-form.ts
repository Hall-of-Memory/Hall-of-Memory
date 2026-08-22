import {
  buildInquirySubmission,
  createInquiryController,
  type InquiryOutcome,
} from '../lib/inquiry-form';

interface TurnstileApi {
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      theme: 'dark';
      size: 'flexible';
      retry: 'auto';
      'refresh-expired': 'auto';
      callback(token: string): void;
      'expired-callback'(): void;
      'timeout-callback'(): void;
      'error-callback'(code: string): boolean;
    },
  ): string;
  reset(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-turnstile-api]');
    const script = existing ?? document.createElement('script');
    const complete = () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error('Turnstile API did not initialize.'));
    };

    script.addEventListener('load', complete, { once: true });
    script.addEventListener('error', () => reject(new Error('Turnstile API failed to load.')), {
      once: true,
    });
    if (!existing) {
      script.src = TURNSTILE_SCRIPT;
      script.async = true;
      script.defer = true;
      script.dataset.turnstileApi = 'true';
      document.head.append(script);
    }
  });
}

function initializeInquiryForm(form: HTMLFormElement) {
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const buttonIdle = form.querySelector<HTMLElement>('[data-submit-idle]');
  const buttonBusy = form.querySelector<HTMLElement>('[data-submit-busy]');
  const errorStatus = form.querySelector<HTMLElement>('[data-form-error]');
  const successStatus = form.querySelector<HTMLElement>('[data-form-success]');
  const turnstileContainer = form.querySelector<HTMLElement>('[data-turnstile-container]');
  const turnstileStatus = form.querySelector<HTMLElement>('[data-turnstile-status]');
  const endpoint = form.dataset.apiUrl ?? '';
  const siteKey = form.dataset.turnstileSiteKey ?? '';

  if (
    !button ||
    !buttonIdle ||
    !buttonBusy ||
    !errorStatus ||
    !successStatus ||
    !turnstileContainer ||
    !turnstileStatus ||
    !endpoint ||
    !siteKey
  ) {
    return;
  }

  let token = '';
  let verificationUnavailable = false;
  let turnstile: TurnstileApi | undefined;
  let widgetId: string | undefined;

  const clearFeedback = () => {
    errorStatus.hidden = true;
    errorStatus.textContent = '';
    successStatus.hidden = true;
    successStatus.textContent = '';
  };
  const focusTurnstile = () => {
    const frame = turnstileContainer.querySelector<HTMLIFrameElement>('iframe');
    (frame ?? turnstileContainer).focus();
  };
  const publish = (outcome: InquiryOutcome, focus = true) => {
    if (outcome.code === 'duplicate-ignored') return;
    clearFeedback();
    const target = outcome.ok ? successStatus : errorStatus;
    target.textContent = outcome.message;
    target.hidden = false;
    if (!focus) return;
    if (outcome.focus === 'turnstile') focusTurnstile();
    else if (outcome.focus === 'status') target.focus();
  };

  const controller = createInquiryController(endpoint, {
    setSubmitting(submitting) {
      form.setAttribute('aria-busy', String(submitting));
      button.disabled = submitting;
      buttonIdle.hidden = submitting;
      buttonBusy.hidden = !submitting;
    },
    publish,
    renewVerification() {
      token = '';
      if (turnstile && widgetId) turnstile.reset(widgetId);
    },
    resetAfterSuccess() {
      form.reset();
    },
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearFeedback();
    if (verificationUnavailable) {
      publish({
        ok: false,
        code: 'human-verification-unavailable',
        focus: 'turnstile',
        message:
          'Die Sicherheitsprüfung ist vorübergehend nicht verfügbar. Bitte warte kurz und versuche es erneut.',
      });
      return;
    }
    const submission = buildInquirySubmission(new FormData(form), token);
    void controller.submit(submission);
  });

  let verificationStarted = false;
  const startVerification = () => {
    if (verificationStarted) return;
    verificationStarted = true;
    turnstileStatus.textContent = 'Sicherheitsprüfung wird geladen …';
    void loadTurnstile()
      .then((api) => {
        turnstile = api;
        widgetId = api.render(turnstileContainer, {
          sitekey: siteKey,
          theme: 'dark',
          size: 'flexible',
          retry: 'auto',
          'refresh-expired': 'auto',
          callback(value) {
            verificationUnavailable = false;
            token = value;
            turnstileStatus.textContent = 'Sicherheitsprüfung abgeschlossen.';
          },
          'expired-callback'() {
            token = '';
            turnstileStatus.textContent = 'Die Sicherheitsprüfung ist abgelaufen und wird erneuert.';
          },
          'timeout-callback'() {
            token = '';
            turnstileStatus.textContent = 'Die Sicherheitsprüfung braucht länger. Bitte versuche sie erneut.';
          },
          'error-callback'() {
            verificationUnavailable = true;
            token = '';
            turnstileStatus.textContent = 'Die Sicherheitsprüfung ist vorübergehend nicht verfügbar.';
            publish(
              {
                ok: false,
                code: 'human-verification-unavailable',
                focus: 'turnstile',
                message:
                  'Die Sicherheitsprüfung ist vorübergehend nicht verfügbar. Bitte warte kurz und versuche es erneut.',
              },
              false,
            );
            return true;
          },
        });
        turnstileStatus.textContent = 'Sicherheitsprüfung bereit.';
      })
      .catch(() => {
        verificationUnavailable = true;
        token = '';
        turnstileStatus.textContent = 'Die Sicherheitsprüfung konnte nicht geladen werden.';
        publish(
          {
            ok: false,
            code: 'human-verification-unavailable',
            focus: 'turnstile',
            message:
              'Die Sicherheitsprüfung ist vorübergehend nicht verfügbar. Bitte lade die Seite später neu.',
          },
          false,
        );
      });
  };

  turnstileStatus.textContent = 'Sicherheitsprüfung wird beim Erreichen des Formulars geladen.';
  form.addEventListener('focusin', startVerification, { once: true });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        startVerification();
      },
      { rootMargin: '300px 0px' },
    );
    observer.observe(form);
  } else {
    startVerification();
  }
}

document.querySelectorAll<HTMLFormElement>('form[data-inquiry-form]').forEach(initializeInquiryForm);
