
'use strict';

const display = document.querySelector('#display');
const expression = document.querySelector('#expression');
const error = document.querySelector('#error');

let current = '0';
let first = null;
let operator = null;
let newEntry = false;
let busy = false;

const signs = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷'
};

function render() {
  display.textContent = current;
  expression.textContent = operator !== null
    ? `${first} ${signs[operator]}`
    : '\u00a0';
}

function clearError() {
  error.hidden = true;
  error.textContent = '';
}

function showError(message) {
  error.hidden = false;
  error.textContent = message;
}

function digit(value) {
  clearError();

  if (newEntry) {
    current = value;
    newEntry = false;
  } else if (current.replace(/[-.]/g, '').length < 16) {
    current = current === '0'
      ? value
      : current === '-0'
        ? '-' + value
        : current + value;
  }

  render();
}

function decimal() {
  clearError();

  if (newEntry) {
    current = '0.';
    newEntry = false;
  } else if (!current.includes('.')) {
    current += '.';
  }

  render();
}

function reset() {
  current = '0';
  first = null;
  operator = null;
  newEntry = false;
  clearError();
  render();
}

function del() {
  clearError();

  if (newEntry) {
    current = '0';
    newEntry = false;
  } else {
    current = current.length <= 1 ||
      (current.length === 2 && current[0] === '-')
      ? '0'
      : current.slice(0, -1);
  }

  render();
}

function sign() {
  clearError();

  if (current !== '0') {
    current = current.startsWith('-')
      ? current.slice(1)
      : '-' + current;
  }

  render();
}

async function requestCalculation(a, op, b) {
  const response = await fetch('/api/calculate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      a,
      operator: op,
      b
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'No se pudo calcular.');
  }

  return data.result;
}

async function squareRoot() {
  if (busy) return;

  clearError();
  busy = true;

  const value = current;

  try {
    current = await requestCalculation(value, 'sqrt', null);
    newEntry = false;
  } catch (e) {
    showError(
      e.message || 'No se pudo calcular la raíz cuadrada.'
    );
  } finally {
    busy = false;
    render();
  }
}

async function chooseOperator(op) {
  clearError();

  if (busy) return;

  if (operator !== null && !newEntry) {
    busy = true;

    try {
      current = await requestCalculation(
        first, operator, current
      );
    } catch (e) {
      showError(e.message);
      first = null;
      operator = null;
      newEntry = true;
      render();
      busy = false;
      return;
    } finally {
      busy = false;
    }
  }

  first = current;
  operator = op;
  newEntry = true;
  render();
}

async function equals() {
  if (busy || operator === null) return;

  clearError();
  busy = true;

  const a = first;
  const op = operator;
  const b = current;

  try {
    current = await requestCalculation(a, op, b);
  } catch (e) {
    showError(e.message);
  } finally {
    first = null;
    operator = null;
    newEntry = true;
    busy = false;
    render();
  }
}

function handle(btn) {
  if (busy) return;

  if (btn.dataset.digit !== undefined) {
    digit(btn.dataset.digit);
  } else if (btn.dataset.operator) {
    void chooseOperator(btn.dataset.operator);
  } else if (btn.dataset.action === 'decimal') {
    decimal();
  } else if (btn.dataset.action === 'clear') {
    reset();
  } else if (btn.dataset.action === 'delete') {
    del();
  } else if (btn.dataset.action === 'sign') {
    sign();
  } else if (btn.dataset.action === 'equals') {
    void equals();
  } else if (btn.dataset.action === 'sqrt') {
    void squareRoot();
  }
}

document.querySelector('.keys').addEventListener(
  'click',
  event => {
    const btn = event.target.closest('button');
    if (btn) handle(btn);
  }
);

document.addEventListener('keydown', event => {
  const key = event.key;
  let button;

  if (/^[0-9]$/.test(key)) {
    button = document.querySelector(`[data-digit="${key}"]`);
  } else if (['+', '-', '*', '/'].includes(key)) {
    button = document.querySelector(`[data-operator="${key}"]`);
  } else if (key === '.' || key === ',') {
    button = document.querySelector('[data-action="decimal"]');
  } else if (key === 'Enter' || key === '=') {
    button = document.querySelector('[data-action="equals"]');
  } else if (key === 'Backspace') {
    button = document.querySelector('[data-action="delete"]');
  } else if (key === 'Escape') {
    button = document.querySelector('[data-action="clear"]');
  } else if (key.toLowerCase() === 'r') {
    button = document.querySelector('[data-action="sqrt"]');
  }

  if (button) {
    event.preventDefault();
    handle(button);
  }
});

render();
