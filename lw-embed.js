/**
 * LearnWorlds Audio-Text Embed Component
 * JavaScript voor de songtekst weergave met SoundCloud integratie
 * 
 * Versie: 1.1.0
 * -------------------------------------------
 */

(function () {
    'use strict';

    var idx = 0, totaal = 0, staten = [];

    function $(id) { return document.getElementById(id); }
    function $$(sel) { return document.querySelectorAll(sel); }

    function initialiseer() {
        // Stel titel en auteur in
        var titelEl = $('lw-titel');
        var auteurEl = $('lw-auteur');

        if (titelEl && typeof LIED_TITEL !== 'undefined') {
            titelEl.textContent = LIED_TITEL;
        }
        if (auteurEl && typeof LIED_AUTEUR !== 'undefined') {
            auteurEl.textContent = LIED_AUTEUR;
        }

        var container = $('lw-tekst');
        if (!container || typeof TEKST_INHOUD === 'undefined') {
            console.log('LW Embed: Container of tekst niet gevonden');
            return;
        }

        var temp = document.createElement('div');
        temp.innerHTML = TEKST_INHOUD;
        var paras = temp.querySelectorAll('p');
        totaal = paras.length;

        if (totaal === 0) {
            console.log('LW Embed: Geen paragrafen gevonden');
            return;
        }

        var html = '';
        for (var i = 0; i < paras.length; i++) {
            var inhoud = paras[i].innerHTML.replace(/\(([^)]+)\)/g, '<span class="lw-word">$1</span>');
            html += '<div class="lw-para-wrap" data-idx="' + i + '">';
            html += '<p data-i="' + i + '">' + inhoud + '</p>';
            html += '<div class="lw-inline-btns">';
            html += '<button class="lw-inline-btn hide-btn" data-i="' + i + '">▼</button>';
            html += '<button class="lw-inline-btn show-btn show" data-i="' + i + '">▲</button>';
            html += '</div>';
            html += '</div>';
            staten[i] = false;
        }
        container.innerHTML = html;

        // SoundCloud
        var sc = $('lw-sc');
        if (sc && typeof SOUNDCLOUD_URL !== 'undefined' && SOUNDCLOUD_URL) {
            sc.src = SOUNDCLOUD_URL;
        }

        // Event listeners voor de bar knoppen
        var btnVorige = $('btnVorige');
        var btnVolgende = $('btnVolgende');
        var btnWissel = $('btnWissel');
        var btnVerbergAlles = $('btnVerbergAlles');
        var btnToonAlles = $('btnToonAlles');
        var btnAfdrukken = $('btnAfdrukken');

        if (btnVorige) btnVorige.onclick = function () { if (idx > 0) { idx--; bijwerken(); scrollen(); } };
        if (btnVolgende) btnVolgende.onclick = function () { if (idx < totaal - 1) { idx++; bijwerken(); scrollen(); } };
        if (btnWissel) btnWissel.onclick = wissel;
        if (btnVerbergAlles) btnVerbergAlles.onclick = function () { stelAllesIn(true); };
        if (btnToonAlles) btnToonAlles.onclick = function () { stelAllesIn(false); };
        if (btnAfdrukken) btnAfdrukken.onclick = function () { window.print(); };

        // Event listeners voor paragraaf klikken
        var wrappers = $$('.lw-para-wrap');
        for (var j = 0; j < wrappers.length; j++) {
            wrappers[j].querySelector('p').onclick = function (e) {
                var wrap = e.target.closest('.lw-para-wrap');
                var paraIdx = parseInt(wrap.getAttribute('data-idx'));

                // Deselecteer alle andere
                var allWraps = $$('.lw-para-wrap');
                for (var k = 0; k < allWraps.length; k++) {
                    allWraps[k].classList.remove('selected');
                }

                // Selecteer deze
                wrap.classList.add('selected');
                idx = paraIdx;
                bijwerken();
            };
        }

        // Event listeners voor inline knoppen
        var hideBtns = $$('.hide-btn');
        var showBtns = $$('.show-btn');

        for (var h = 0; h < hideBtns.length; h++) {
            hideBtns[h].onclick = function (e) {
                e.stopPropagation();
                var paraIdx = parseInt(this.getAttribute('data-i'));
                verbergParagraaf(paraIdx);
            };
        }

        for (var s = 0; s < showBtns.length; s++) {
            showBtns[s].onclick = function (e) {
                e.stopPropagation();
                var paraIdx = parseInt(this.getAttribute('data-i'));
                toonParagraaf(paraIdx);
            };
        }

        // Initiële update
        bijwerken();
    }

    function verbergParagraaf(paraIdx) {
        var p = document.querySelector('[data-i="' + paraIdx + '"]');
        if (!p) return;
        staten[paraIdx] = true;
        var woorden = p.querySelectorAll('.lw-word');
        for (var i = 0; i < woorden.length; i++) {
            woorden[i].classList.add('hide');
        }
        bijwerken();
    }

    function toonParagraaf(paraIdx) {
        var p = document.querySelector('[data-i="' + paraIdx + '"]');
        if (!p) return;
        staten[paraIdx] = false;
        var woorden = p.querySelectorAll('.lw-word');
        for (var i = 0; i < woorden.length; i++) {
            woorden[i].classList.remove('hide');
        }
        bijwerken();
    }

    function bijwerken() {
        var indEl = $('lw-ind');
        if (indEl) indEl.textContent = (idx + 1) + '/' + totaal;

        var paras = $$('[data-i]');
        for (var i = 0; i < paras.length; i++) {
            if (paras[i].tagName === 'P') {
                paras[i].classList.remove('active');
            }
        }

        var huidige = document.querySelector('p[data-i="' + idx + '"]');
        if (huidige) huidige.classList.add('active');

        var btn = $('btnWissel');
        if (btn) {
            btn.textContent = staten[idx] ? 'Tonen' : 'Verbergen';
            btn.classList.toggle('on', staten[idx]);
        }
    }

    function scrollen() {
        var p = document.querySelector('p[data-i="' + idx + '"]');
        if (p) {
            p.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function wissel() {
        var p = document.querySelector('p[data-i="' + idx + '"]');
        if (!p) return;

        staten[idx] = !staten[idx];
        var woorden = p.querySelectorAll('.lw-word');
        for (var i = 0; i < woorden.length; i++) {
            woorden[i].classList.toggle('hide', staten[idx]);
        }
        bijwerken();
    }

    function stelAllesIn(verbergen) {
        var paras = $$('p[data-i]');
        for (var i = 0; i < paras.length; i++) {
            var x = parseInt(paras[i].getAttribute('data-i'));
            if (staten[x] !== verbergen) {
                staten[x] = verbergen;
                var woorden = paras[i].querySelectorAll('.lw-word');
                for (var j = 0; j < woorden.length; j++) {
                    woorden[j].classList.toggle('hide', verbergen);
                }
            }
        }
        bijwerken();
    }

    // Start de initialisatie
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialiseer);
    } else {
        setTimeout(initialiseer, 10);
    }
})();
