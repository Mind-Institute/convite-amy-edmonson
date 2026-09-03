/* ============================================================
   Convites dos almoços fechados — Mind Summit 2026

   Compartilhado pelas duas páginas de convite. O modal, a máscara
   de WhatsApp e o envio são idênticos; o que muda é o valor de
   `convite`, lido de data-convite no <body> de cada página.

   ENVIO: grava direto na tabela `rsvps` do Supabase. A chave abaixo
   é a PUBLICÁVEL (anon) — ela é feita para ficar exposta no
   navegador. A proteção não é a chave: é o RLS, que dá a anon só
   INSERT. Com essa chave não se lê a lista de convidados.
   ============================================================ */

(function () {
  'use strict';

  var SUPABASE_URL = 'https://qokdydgdovswjalpummr.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_VMFQryd0sENG0sCg2mdBfA_bHWapfIt';
  var CONTATO = 'contato@joinmind.com.br';

  // qual convite originou a confirmação — definido em data-convite no <body>
  var CONVITE = document.body.getAttribute('data-convite') || '';

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

  /* ---------- Revelação ao rolar ----------
     Só liga se houver JS e IntersectionObserver, e só depois de
     marcar o <html>: as regras de CSS que escondem os blocos
     dependem dessa classe, então sem JS nada fica escondido.
     Também não liga para quem pediu menos movimento. */

  (function revelarAoRolar() {
    var blocos = document.querySelectorAll(
      '.tela--lineup .secao__topo, .tela--lineup .legend, .tela--lineup .lineup__rodape,' +
      '.tela--mais .secao__titulo, .tela--mais .bloco, .tela--mais .arena, .tela--mais .time'
    );
    if (!blocos.length || !('IntersectionObserver' in window)) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.documentElement.classList.add('revela-ao-rolar');

    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('aparece');
        observador.unobserve(e.target);   // revela uma vez só
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(blocos, function (b) { observador.observe(b); });
  })();

  /* ---------- Máscaras ---------- */

  function digitos(value) {
    return value.replace(/\D/g, '');
  }

  // (00) 00000-0000
  function maskPhone(value) {
    var d = digitos(value).slice(0, 11);
    if (!d) return '';
    if (d.length <= 2) return '(' + d;
    if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }

  // 000.000.000-00
  function maskCpf(value) {
    var d = digitos(value).slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return d.slice(0, 3) + '.' + d.slice(3);
    if (d.length <= 9) return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6);
    return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6, 9) + '-' + d.slice(9);
  }

  // dígitos verificadores — pega erro de digitação antes de virar linha no banco
  function cpfValido(d) {
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
    var soma, resto, i;
    soma = 0;
    for (i = 0; i < 9; i++) soma += parseInt(d.charAt(i), 10) * (10 - i);
    resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    if (resto !== parseInt(d.charAt(9), 10)) return false;
    soma = 0;
    for (i = 0; i < 10; i++) soma += parseInt(d.charAt(i), 10) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    return resto === parseInt(d.charAt(10), 10);
  }

  var MASCARAS = { telefone: maskPhone, cpf: maskCpf };

  Array.prototype.forEach.call(document.querySelectorAll('[data-mask]'), function (input) {
    var aplicar = MASCARAS[input.getAttribute('data-mask')];
    if (!aplicar) return;
    input.addEventListener('input', function () {
      var atEnd = input.selectionStart === input.value.length;
      input.value = aplicar(input.value);
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

  function sendRsvp(data) {
    return fetch(SUPABASE_URL + '/rest/v1/rsvps', {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(data)
    }).then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response;
    });
  }

  var whatsappInput = form.querySelector('[name="whatsapp"]');
  var cpfInput = form.querySelector('[name="cpf"]');

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

    if (!cpfValido(digitos(cpfInput.value))) {
      cpfInput.setAttribute('aria-invalid', 'true');
      cpfInput.focus();
      showError('Confira o CPF — os dígitos não fecham.');
      return;
    }
    cpfInput.removeAttribute('aria-invalid');

    var raw = new FormData(form);
    var data = {};
    ['nome', 'sobrenome', 'empresa', 'cargo', 'email', 'whatsapp'].forEach(function (key) {
      data[key] = (raw.get(key) || '').toString().trim();
    });
    data.cpf = digitos(cpfInput.value);   // o banco guarda só os 11 dígitos
    data.convite = CONVITE;

    setLoading(true);

    sendRsvp(data)
      .then(function () {
        showSuccess('Presença confirmada', success.getAttribute('data-mensagem') || '');
      })
      .catch(function () {
        showError('Não conseguimos enviar sua confirmação agora. Tente de novo ou escreva para ' + CONTATO + '.');
      })
      .then(function () {
        setLoading(false);
      });
  });
})();
