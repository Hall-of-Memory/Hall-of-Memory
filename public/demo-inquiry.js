const form = document.querySelector('form[data-demo-inquiry-form]');

if (form instanceof HTMLFormElement) {
  const status = form.querySelector('[data-demo-inquiry-status]');
  const offerSelect = form.querySelector('select[name="offerId"]');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity() || !(status instanceof HTMLElement)) return;

    status.hidden = false;
    status.textContent =
      'Beispielhafte Rückmeldung: Eine echte Anfrage würde jetzt persönlich geprüft. Sie wäre noch keine Buchung und keine Verfügbarkeitsbestätigung. In dieser Demo wurden keine Formulardaten an den echten Anfrage-Service gesendet oder dort gespeichert.';
    form.reset();
    status.focus();
  });

  document.querySelectorAll('[data-demo-offer-choice]').forEach((choice) => {
    choice.addEventListener('click', () => {
      const offerId = choice.getAttribute('data-demo-offer-choice');
      if (offerSelect instanceof HTMLSelectElement && offerId) offerSelect.value = offerId;
    });
  });
}
