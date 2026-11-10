const calculator = document.querySelector('#rate-form');
const rateResult = document.querySelector('#rate');
calculator.addEventListener('input', () => { rateResult.value = ''; });
calculator.addEventListener('submit', (event) => {
  event.preventDefault();
  const views = calculator.elements.views.valueAsNumber;
  const shares = calculator.elements.shares.valueAsNumber;
  rateResult.value = '分享率 ' + (100 * shares / views).toFixed(2) + '%';
});
