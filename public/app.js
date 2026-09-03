/* ============================================================
   Convites e confirmações — página interna em /

   Sem biblioteca: fala direto com a API REST e a de auth do
   Supabase. A chave abaixo é a publicável, a mesma das páginas de
   convite — ela não dá acesso a nada sozinha. Quem libera a leitura
   é a RLS: só quem está em public.admins lê public.rsvps, e só
   depois de autenticar.
   ============================================================ */

(function () {
  'use strict';

  var SUPABASE_URL = 'https://qokdydgdovswjalpummr.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_VMFQryd0sENG0sCg2mdBfA_bHWapfIt';
  var GUARDA = 'mind-rsvp-sessao';

  var telaLogin = document.getElementById('entrar');
  var telaPainel = document.getElementById('painel');
  var formLogin = document.getElementById('form-login');
  var loginErro = document.getElementById('login-erro');
  var btnEntrar = document.getElementById('btn-entrar');
  var aviso = document.getElementById('aviso');
  var linhas = document.getElementById('linhas');
  var busca = document.getElementById('busca');

  var sessao = null;
  var dados = [];
  var filtro = '';

  /* ---------- sessão ---------- */

  function guardarSessao(s) {
    sessao = s;
    try { sessionStorage.setItem(GUARDA, JSON.stringify(s)); } catch (e) {}
  }

  function lerSessao() {
    try { return JSON.parse(sessionStorage.getItem(GUARDA) || 'null'); } catch (e) { return null; }
  }

  function limparSessao() {
    sessao = null;
    try { sessionStorage.removeItem(GUARDA); } catch (e) {}
  }

  function auth(caminho, corpo) {
    return fetch(SUPABASE_URL + '/auth/v1/' + caminho, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo)
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error(j.error_description || j.msg || j.error || 'HTTP ' + r.status);
        return j;
      });
    });
  }

  function renovar() {
    if (!sessao || !sessao.refresh_token) return Promise.reject(new Error('sem sessão'));
    return auth('token?grant_type=refresh_token', { refresh_token: sessao.refresh_token })
      .then(function (s) { guardarSessao(s); return s; });
  }

  /* ---------- leitura ---------- */

  function api(caminho) {
    return fetch(SUPABASE_URL + '/rest/v1/' + caminho, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: 'Bearer ' + sessao.access_token,
        Accept: 'application/json'
      }
    }).then(function (r) {
      if (r.status === 401) {
        // token vencido: renova uma vez e repete
        return renovar().then(function () { return api(caminho); });
      }
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function carregar() {
    mostrarAviso('Carregando…');
    return api('admins?select=user_id')
      .then(function (admins) {
        if (!admins.length) {
          throw new Error('Esta conta não tem acesso ao painel. Fale com quem administra o projeto.');
        }
        return api('rsvps?select=*&order=criado_em.desc');
      })
      .then(function (rows) {
        dados = rows;
        esconderAviso();
        render();
      })
      .catch(function (e) {
        mostrarAviso(e.message || 'Não foi possível carregar.');
        linhas.innerHTML = '';
      });
  }

  /* ---------- render ---------- */

  function mostrarAviso(t) { aviso.textContent = t; aviso.hidden = false; }
  function esconderAviso() { aviso.hidden = true; }

  function quandoLegivel(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  function cpfLegivel(c) {
    if (!c || c.length !== 11) return c || '';
    return c.slice(0, 3) + '.' + c.slice(3, 6) + '.' + c.slice(6, 9) + '-' + c.slice(9);
  }

  function visiveis() {
    var termo = (busca.value || '').trim().toLowerCase();
    return dados.filter(function (r) {
      if (filtro && r.convite !== filtro) return false;
      if (!termo) return true;
      return [r.nome, r.sobrenome, r.empresa, r.cargo, r.email]
        .join(' ').toLowerCase().indexOf(termo) !== -1;
    });
  }

  function render() {
    var lista = visiveis();

    document.getElementById('n-total').textContent = dados.length;
    document.getElementById('n-amy').textContent =
      dados.filter(function (r) { return r.convite === 'Amy Edmondson'; }).length;
    document.getElementById('n-christina').textContent =
      dados.filter(function (r) { return r.convite === 'Christina Maslach'; }).length;
    document.getElementById('n-christina-inscritos').textContent =
      dados.filter(function (r) { return r.convite === 'Christina Maslach (inscritos)'; }).length;

    if (!lista.length) {
      linhas.innerHTML = '<tr><td colspan="8" class="vazio">' +
        (dados.length ? 'Nada encontrado com esse filtro.' : 'Nenhuma confirmação ainda.') + '</td></tr>';
      return;
    }

    linhas.innerHTML = lista.map(function (r) {
      var marca = r.convite === 'Amy Edmondson' ? 'verde'
                : r.convite === 'Christina Maslach' ? 'coral' : 'neutra';
      return '<tr>' +
        '<td class="col-quando">' + esc(quandoLegivel(r.criado_em)) + '</td>' +
        '<td><b>' + esc(r.nome + ' ' + r.sobrenome) + '</b></td>' +
        '<td>' + esc(r.empresa) + '</td>' +
        '<td>' + esc(r.cargo) + '</td>' +
        '<td><a href="mailto:' + esc(r.email) + '">' + esc(r.email) + '</a></td>' +
        '<td class="col-nowrap"><a href="https://wa.me/55' + esc((r.whatsapp || '').replace(/\D/g, '')) + '">' + esc(r.whatsapp) + '</a></td>' +
        '<td class="col-nowrap">' + esc(cpfLegivel(r.cpf)) + '</td>' +
        '<td><span class="tag tag--' + marca + '">' + esc(r.convite) + '</span></td>' +
      '</tr>';
    }).join('');
  }

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------- CSV ---------- */

  function baixarCsv() {
    var lista = visiveis();
    if (!lista.length) return;
    var col = ['criado_em', 'convite', 'nome', 'sobrenome', 'empresa', 'cargo', 'email', 'whatsapp', 'cpf'];
    var linhasCsv = [col.join(';')].concat(lista.map(function (r) {
      return col.map(function (c) {
        var v = r[c] == null ? '' : String(r[c]);
        return '"' + v.replace(/"/g, '""') + '"';
      }).join(';');
    }));
    // BOM para o Excel abrir os acentos certos
    var blob = new Blob(['﻿' + linhasCsv.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'confirmacoes-mind-summit.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  /* ---------- telas ---------- */

  function abrirPainel() {
    telaLogin.hidden = true;
    telaPainel.hidden = false;
    var email = (sessao.user && sessao.user.email) || '';
    document.getElementById('quem').textContent = email;
    carregar();
  }

  function abrirLogin(msg) {
    telaPainel.hidden = true;
    telaLogin.hidden = false;
    if (msg) { loginErro.textContent = msg; loginErro.hidden = false; }
  }

  formLogin.addEventListener('submit', function (e) {
    e.preventDefault();
    loginErro.hidden = true;
    btnEntrar.disabled = true;
    btnEntrar.textContent = 'Entrando…';

    var f = new FormData(formLogin);
    auth('token?grant_type=password', {
      email: (f.get('email') || '').toString().trim(),
      password: (f.get('senha') || '').toString()
    })
      .then(function (s) { guardarSessao(s); abrirPainel(); })
      .catch(function () {
        loginErro.textContent = 'E-mail ou senha incorretos.';
        loginErro.hidden = false;
      })
      .then(function () {
        btnEntrar.disabled = false;
        btnEntrar.textContent = 'Entrar';
      });
  });

  document.getElementById('btn-sair').addEventListener('click', function () {
    limparSessao();
    formLogin.reset();
    abrirLogin();
  });

  document.getElementById('btn-recarregar').addEventListener('click', carregar);
  document.getElementById('btn-csv').addEventListener('click', baixarCsv);
  busca.addEventListener('input', render);

  Array.prototype.forEach.call(document.querySelectorAll('.filtro'), function (b) {
    b.addEventListener('click', function () {
      filtro = b.getAttribute('data-filtro');
      Array.prototype.forEach.call(document.querySelectorAll('.filtro'), function (o) {
        o.classList.toggle('is-ativo', o === b);
      });
      render();
    });
  });

  /* ---------- Compartilhar convite ---------- */

  var avisoCopia = document.getElementById('aviso-copia');
  var relogioAviso = null;

  function piscar(texto) {
    avisoCopia.textContent = texto;
    avisoCopia.hidden = false;
    clearTimeout(relogioAviso);
    relogioAviso = setTimeout(function () { avisoCopia.hidden = true; }, 2200);
  }

  function copiar(texto) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(texto);
    }
    // fallback para contexto sem clipboard API
    return new Promise(function (ok, falha) {
      var campo = document.createElement('textarea');
      campo.value = texto;
      campo.setAttribute('readonly', '');
      campo.style.position = 'fixed';
      campo.style.opacity = '0';
      document.body.appendChild(campo);
      campo.select();
      var deu = false;
      try { deu = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(campo);
      deu ? ok() : falha();
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('.convite'), function (card) {
    var link = card.getAttribute('data-link');
    var msg = card.getAttribute('data-msg');

    card.addEventListener('click', function (evento) {
      var botao = evento.target.closest('[data-acao]');
      if (!botao) return;

      if (botao.getAttribute('data-acao') === 'whatsapp') {
        // wa.me sem número abre a lista de contatos com a mensagem pronta
        window.open('https://wa.me/?text=' + encodeURIComponent(msg + ' ' + link), '_blank', 'noopener');
        return;
      }

      copiar(link)
        .then(function () { piscar('Link copiado'); })
        .catch(function () { piscar('Não consegui copiar — o link está no card'); });
    });
  });

  // retoma a sessão da aba, se houver
  var guardada = lerSessao();
  if (guardada && guardada.access_token) {
    sessao = guardada;
    abrirPainel();
  }
})();
