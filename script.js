/* ============================================================
   Convite — Almoço CHROs com Amy Edmondson · Mind Summit 2026

   Estado local único (modal aberto/fechado) + envio do RSVP.

   ENVIO: enquanto RSVP_ENDPOINT for null, o formulário cai no
   mailto: do protótipo. Para ligar um envio real (Formspree /
   Basin / RD Station / endpoint próprio), basta preencher a
   constante abaixo — o resto do fluxo (loading, sucesso, erro)
   já está implementado.
   ============================================================ */

(function () {
  'use strict';

  var RSVP_ENDPOINT = null;
  var RSVP_EMAIL = 'contato@joinmind.com.br';
  var RSVP_SUBJECT = 'Confirmação — Almoço CHROs com Amy Edmondson (16/09)';

  var stage = document.getElementById('stage');
  var modal = document.getElementById('modal');
  var card = document.getElementById('modal-card');
  var openBtn = document.getElementById('abrir-form');
  var closeBtn = document.getElementById('fechar-form');
  var form = document.getElementById('form-rsvp');
  var submitBtn = document.getElementById('enviar-form');
  var submitLabel = submitBtn.querySelector('.submit__label');
  var errorBox = document.getElementById('form-erro');
  var success = document.getElementById('sucesso');
  var successTitle = document.getElementById('sucesso-titulo');
  var successText = document.getElementById('sucesso-texto');

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
  var lastFocused = null;
  var closeTimer = null;

  /* ---------- Modal ---------- */

  function openModal() {
    if (!modal.hidden) return;
    clearTimeout(closeTimer);
    lastFocused = document.activeElement;

    modal.hidden = false;
    // força um reflow para que a transição de entrada rode
    void modal.offsetWidth;
    modal.classList.add('is-open');

    var target = success.hidden ? form.querySelector('input') : success.querySelector('.success__close');
    if (target) target.focus();

    if ('inert' in HTMLElement.prototype) stage.inert = true;
    stage.setAttribute('aria-hidden', 'true');
  }

  function closeModal() {
    if (modal.hidden) return;
    modal.classList.remove('is-open');

    if ('inert' in HTMLElement.prototype) stage.inert = false;
    stage.removeAttribute('aria-hidden');

    // espera a transição de saída antes de tirar o modal do fluxo
    closeTimer = setTimeout(function () {
      modal.hidden = true;
    }, 220);

    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);

  // clique no overlay fecha; clique dentro do card não
  modal.addEventListener('click', function (event) {
    if (event.target === modal) closeModal();
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-fechar]'), function (el) {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', function (event) {
    if (modal.hidden) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }

    if (event.key !== 'Tab') return;

    // prende o foco dentro do card enquanto o modal está aberto
    var items = Array.prototype.filter.call(card.querySelectorAll(FOCUSABLE), function (el) {
      return el.offsetParent !== null;
    });
    if (!items.length) return;

    var first = items[0];
    var last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* ---------- Máscara de WhatsApp: (00) 00000-0000 ---------- */

  function maskPhone(value) {
    var d = value.replace(/\D/g, '').slice(0, 11);
    if (!d) return '';
    if (d.length <= 2) return '(' + d;
    if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-mask="telefone"]'), function (input) {
    input.addEventListener('input', function () {
      var atEnd = input.selectionStart === input.value.length;
      input.value = maskPhone(input.value);
      if (atEnd) input.setSelectionRange(input.value.length, input.value.length);
    });
  });

  /* ---------- Envio ---------- */

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  function clearError() {
    errorBox.hidden = true;
    errorBox.textContent = '';
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitLabel.textContent = isLoading ? 'Enviando…' : 'Enviar confirmação';
  }

  function showSuccess(title, text) {
    successTitle.textContent = title;
    successText.textContent = text;
    form.hidden = true;
    success.hidden = false;
    success.querySelector('.success__close').focus();
  }

  function buildMailto(data) {
    var body = [
      'Nome: ' + data.nome + ' ' + data.sobrenome,
      'Empresa: ' + data.empresa,
      'Cargo: ' + data.cargo,
      'E-mail: ' + data.email,
      'WhatsApp: ' + data.whatsapp,
      '',
      'Confirmo minha presença no almoço com Amy Edmondson — 16/09, 13h30.'
    ].join('\n');

    return 'mailto:' + RSVP_EMAIL +
      '?subject=' + encodeURIComponent(RSVP_SUBJECT) +
      '&body=' + encodeURIComponent(body);
  }

  function sendRsvp(data) {
    if (!RSVP_ENDPOINT) {
      window.location.href = buildMailto(data);
      return Promise.resolve('mailto');
    }

    return fetch(RSVP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data)
    }).then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return 'endpoint';
    });
  }

  var whatsappInput = form.querySelector('[name="whatsapp"]');

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    clearError();

    // validação nativa (required + type="email")
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // o telefone precisa de DDD + número
    if (whatsappInput.value.replace(/\D/g, '').length < 10) {
      whatsappInput.setAttribute('aria-invalid', 'true');
      whatsappInput.focus();
      showError('Informe um WhatsApp válido com DDD — por exemplo (11) 99999-9999.');
      return;
    }
    whatsappInput.removeAttribute('aria-invalid');

    var raw = new FormData(form);
    var data = {};
    ['nome', 'sobrenome', 'empresa', 'cargo', 'email', 'whatsapp'].forEach(function (key) {
      data[key] = (raw.get(key) || '').toString().trim();
    });
    data.evento = 'Almoço CHROs com Amy Edmondson — Mind Summit 2026';

    setLoading(true);

    sendRsvp(data)
      .then(function (via) {
        if (via === 'mailto') {
          showSuccess(
            'Falta um passo',
            'Abrimos seu aplicativo de e-mail com a confirmação pronta — é só enviar a mensagem. ' +
            'Se nada abrir, escreva direto para ' + RSVP_EMAIL + '.'
          );
        } else {
          showSuccess(
            'Presença confirmada',
            'Obrigado. Guardamos seu lugar no almoço com Amy Edmondson — 16/09, 13h30, São Paulo Expo.'
          );
        }
      })
      .catch(function () {
        showError('Não conseguimos enviar sua confirmação agora. Tente de novo ou escreva para ' + RSVP_EMAIL + '.');
      })
      .then(function () {
        setLoading(false);
      });
  });
})();
