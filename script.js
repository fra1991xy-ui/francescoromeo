const form = document.getElementById('form-cantiere');
const listaCantieri = document.getElementById('lista-cantieri');
const btnNuovo = document.getElementById('btn-nuovo');
const sezioneModulo = document.getElementById('sezione-modulo');
const btnSalvaForm = document.getElementById('btn-salva-form');

function valore(id, fallback = "") {
    const el = document.getElementById(id);
    return el ? el.value : fallback;
}

function testo(id, valore) {
    const el = document.getElementById(id);
    if (el) el.textContent = valore || "";
}

function html(id, valore) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = valore || "";
}

const sezioneElenco = document.getElementById('sezione-elenco');

if (sezioneElenco && listaCantieri) {
    const barraFiltro = document.createElement('div');
    barraFiltro.style.marginBottom = '15px';
    barraFiltro.innerHTML = `
        <label style="font-size:0.9rem; font-weight:bold;">👁️ Visualizza Report: </label>
        <select id="filtro-stato" style="padding:6px; border-radius:4px; font-size:0.9rem;">
            <option value="ATTIVO">Solo Attivi</option>
            <option value="ARCHIVIATO">Archiviati / Nascosti</option>
        </select>
    `;
    sezioneElenco.insertBefore(barraFiltro, listaCantieri);
    document.getElementById('filtro-stato').addEventListener('change', mostraCantieri);
}

if (btnNuovo && sezioneModulo) {
    btnNuovo.addEventListener('click', function () {
        if (sezioneModulo.style.display === 'none' || sezioneModulo.style.display === '') {
            sezioneModulo.style.display = 'block';
            btnNuovo.textContent = '❌ Chiudi';
            btnNuovo.style.backgroundColor = '#ef4444';
        } else {
            sezioneModulo.style.display = 'none';
            btnNuovo.textContent = '+ Nuovo Cantiere';
            btnNuovo.style.backgroundColor = '#f59e0b';
        }
    });
}

function mostraCantieri() {
    let cantieri = JSON.parse(localStorage.getItem('databaseCantieri')) || [];
    const filtro = document.getElementById('filtro-stato');
    const statoSelezionato = filtro ? filtro.value : "ATTIVO";

    if (!listaCantieri) return;
    listaCantieri.innerHTML = "";

    cantieri.forEach(function (cantiere, indice) {
        const statoReport = cantiere.stato || "ATTIVO";
        if (statoReport !== statoSelezionato) return;

        const tessera = document.createElement('div');
        tessera.className = 'scheda-cantiere';

        let tagFoto1 = cantiere.foto1 ? `<div><img src="${cantiere.foto1}" class="foto-report"></div>` : '';
        let tagFoto2 = cantiere.foto2 ? `<div><img src="${cantiere.foto2}" class="foto-report"></div>` : '';
        let testoBtnArchivia = statoReport === "ATTIVO" ? "📦 Archivia" : "📥 Ripristina";

        tessera.innerHTML = `
            <span style="font-size:0.8rem; color:gray;">📅 Sopralluogo: ${cantiere.data || ""}</span>
            <div class="barra-verde-report">${(cantiere.nome || "").toUpperCase()} - Report: ${cantiere.data || ""}</div>
            <div class="info-aziende">
                <strong>Affidataria:</strong> ${cantiere.affidataria || ""}<br>
                <strong>Esecutrice:</strong> ${cantiere.esecutrice || ""}<br>
                <strong>Tecnico:</strong> ${cantiere.tecnico || ""}<br>
                <strong>Fabbricato:</strong> ${cantiere.fabbricato || ""} | <strong>Piano:</strong> ${cantiere.piano || ""}<br>
                <strong>Scelta Sicurezza:</strong> ${cantiere.tempistica_sicurezza || ""}
            </div>

            <div class="blocco-ia">
                <div class="titolo-blocco-ia">Descrizione (Tocca per modificare)</div>
                <div class="testo-blocco-ia" contenteditable="true" onblur="aggiornaTestoManuale(${indice}, 'iaDescrizione', this.innerText)">${cantiere.iaDescrizione || ""}</div>
            </div>

            <div class="blocco-ia">
                <div class="titolo-blocco-ia">Misure Attuate (Tocca per modificare)</div>
                <div class="testo-blocco-ia" contenteditable="true" onblur="aggiornaTestoManuale(${indice}, 'iaMisure', this.innerText)">${cantiere.iaMisure || ""}</div>
            </div>

            <div class="blocco-ia">
                <div class="titolo-blocco-ia">Misure Correttive (Tocca per modificare)</div>
                <div class="testo-blocco-ia" contenteditable="true" onblur="aggiornaTestoManuale(${indice}, 'iaCorrettive', this.innerText)">${cantiere.iaCorrettive || ""}</div>
            </div>

            <div class="griglia-foto-report">${tagFoto1}${tagFoto2}</div>

            <div class="area-pulsanti-scheda" style="grid-template-columns: 1fr 1fr 1fr;">
                <button class="btn-pdf" onclick="scaricaPDF(${indice})">🖨️ PDF</button>
                <button style="background-color:#10b981; color:white; border:none; padding:10px; border-radius:6px; font-weight:bold; cursor:pointer;" onclick="condividiReport(${indice})">🔗 Condividi</button>
                <button style="background-color:#64748b; color:white; border:none; padding:10px; border-radius:6px; font-weight:bold; cursor:pointer;" onclick="cambiaStatoReport(${indice})">${testoBtnArchivia}</button>
                <button class="btn-elimina-report" style="grid-column: span 3; margin-top:5px; background-color:#ef4444; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer;" onclick="eliminaCantiere(${indice})">🗑️ Elimina Definitivamente</button>
            </div>
        `;

        listaCantieri.appendChild(tessera);
    });
}

function cambiaStatoReport(indice) {
    let cantieri = JSON.parse(localStorage.getItem('databaseCantieri')) || [];
    let statoAttuale = cantieri[indice].stato || "ATTIVO";
    cantieri[indice].stato = statoAttuale === "ATTIVO" ? "ARCHIVIATO" : "ATTIVO";
    localStorage.setItem('databaseCantieri', JSON.stringify(cantieri));
    mostraCantieri();
}

function eliminaCantiere(indice) {
    let cantieri = JSON.parse(localStorage.getItem('databaseCantieri')) || [];
    cantieri.splice(indice, 1);
    localStorage.setItem('databaseCantieri', JSON.stringify(cantieri));
    mostraCantieri();
}

function aggiornaTestoManuale(indice, campo, nuovoTesto) {
    let cantieri = JSON.parse(localStorage.getItem('databaseCantieri')) || [];
    if (!cantieri[indice]) return;

    cantieri[indice][campo] = nuovoTesto;
    localStorage.setItem('databaseCantieri', JSON.stringify(cantieri));

    if (campo === 'iaDescrizione') testo('pdf-ia-descrizione', nuovoTesto);
    if (campo === 'iaMisure') testo('pdf-ia-misure', nuovoTesto);
    if (campo === 'iaCorrettive') testo('pdf-ia-correttive', nuovoTesto);
}

function convertiInBase64(inputElement) {
    return new Promise((resolve) => {
        if (!inputElement || !inputElement.files || inputElement.files.length === 0) {
            resolve("");
            return;
        }

        const file = inputElement.files[0];
        const lettore = new FileReader();

        lettore.onload = function (e) {
            const img = new Image();

            img.onload = function () {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                const maxDim = 700;
                let w = img.width;
                let h = img.height;

                if (w > h && w > maxDim) {
                    h *= maxDim / w;
                    w = maxDim;
                } else if (h > maxDim) {
                    w *= maxDim / h;
                    h = maxDim;
                }

                canvas.width = w;
                canvas.height = h;
                ctx.drawImage(img, 0, 0, w, h);

                resolve(canvas.toDataURL('image/jpeg', 0.65));
            };

            img.onerror = function () {
                resolve("");
            };

            img.src = e.target.result;
        };

        lettore.onerror = function () {
            resolve("");
        };

        lettore.readAsDataURL(file);
    });
}

async function chiediAIA(appuntoUtente) {
    return {
        descrizione:
            "Durante il sopralluogo è stata rilevata la seguente situazione: " +
            appuntoUtente,

        misure:
            "Verificare immediatamente l'utilizzo corretto dei DPI, la delimitazione dell'area di lavoro, " +
            "la presenza di protezioni collettive e la conformità delle lavorazioni in corso.",

        correttive:
            "Provvedere alla messa in sicurezza dell'area, all'adeguamento delle lavorazioni e alla verifica " +
            "delle condizioni operative secondo quanto previsto dal D.Lgs. 81/08."
    };
}

if (form) {
    form.addEventListener('submit', async function (evento) {
        evento.preventDefault();

        if (btnSalvaForm) {
            btnSalvaForm.textContent = "⌛ Generazione con IA...";
            btnSalvaForm.disabled = true;
        }

        try {
            const inputF1 = document.getElementById('foto-cantiere');
            const inputF2 = document.getElementById('foto-cantiere-2');

            const foto1Base64 = await convertiInBase64(inputF1);
            const foto2Base64 = await convertiInBase64(inputF2);

            let attivitaScelte = [];
            document.querySelectorAll('.check-attivita:checked').forEach(function (checkbox) {
                attivitaScelte.push(checkbox.value);
            });

            const nome = valore('nome-cantiere');
            const affidataria = valore('impresa-affidataria');
            const esecutrice = valore('impresa-esecutrice');
            const noteAppunto = valore('note-cantiere');
            const respLavori = valore('responsabile-lavori');
            const tecnico = valore('tecnico-sopralluogo');
            const fabbricato = valore('input-fabbricato');
            const piano = valore('input-piano');

            const radioTempistica = document.querySelector('input[name="tempistica_sicurezza"]:checked');
            const tempistica_sicurezza = radioTempistica ? radioTempistica.value : "";

            const risultatoIA = await chiediAIA(noteAppunto);

            const d = new Date();
            const dataAttuale =
                d.getDate().toString().padStart(2, '0') + '/' +
                (d.getMonth() + 1).toString().padStart(2, '0') + '/' +
                d.getFullYear();

            const nuovoReport = {
                nome: nome,
                affidataria: affidataria,
                esecutrice: esecutrice,
                respLavori: respLavori,
                tecnico: tecnico,
                fabbricato: fabbricato,
                piano: piano,
                tempistica_sicurezza: tempistica_sicurezza,
                attivita: attivitaScelte,
                data: dataAttuale,
                foto1: foto1Base64,
                foto2: foto2Base64,
                iaDescrizione: risultatoIA.descrizione,
                iaMisure: risultatoIA.misure,
                iaCorrettive: risultatoIA.correttive,
                stato: "ATTIVO"
            };

            let cantieri = JSON.parse(localStorage.getItem('databaseCantieri')) || [];
            cantieri.unshift(nuovoReport);
            localStorage.setItem('databaseCantieri', JSON.stringify(cantieri));

            mostraCantieri();
            form.reset();

            if (sezioneModulo) sezioneModulo.style.display = 'none';
            if (btnNuovo) {
                btnNuovo.textContent = '+ Nuovo Cantiere';
                btnNuovo.style.backgroundColor = '#f59e0b';
            }

        } catch (errore) {
            console.error("Errore salvataggio report:", errore);
            alert("Errore durante la generazione del report. Apri F12 > Console per vedere il dettaglio.");
        }

        if (btnSalvaForm) {
            btnSalvaForm.textContent = "Genera con IA e Salva";
            btnSalvaForm.disabled = false;
        }
    });
}

function condividiReport(indice) {
    let cantieri = JSON.parse(localStorage.getItem('databaseCantieri')) || [];
    let c = cantieri[indice];

    if (!c) return;

    let testoCondivisione =
        `👷 REPORT CSE: ${(c.nome || "").toUpperCase()}\n` +
        `📅 Data: ${c.data || ""}\n` +
        `🏢 Affidataria: ${c.affidataria || ""}\n` +
        `🏗️ Esecutrice: ${c.esecutrice || ""}\n\n` +
        `📝 NOTE INOSSERVANZA:\n${c.iaDescrizione || ""}\n\n` +
        `🛡️ MISURE VIOLATE:\n${c.iaMisure || ""}\n\n` +
        `🛑 AZIONI CORRETTIVE:\n${c.iaCorrettive || ""}`;

    if (navigator.share) {
        navigator.share({
            title: `Report CSE - ${c.nome || ""}`,
            text: testoCondivisione
        }).catch(console.error);
    } else {
        window.open(`mailto:?subject=Report CSE ${encodeURIComponent(c.nome || "")}&body=${encodeURIComponent(testoCondivisione)}`);
    }
}

function scaricaPDF(indice) {
    let cantieri = JSON.parse(localStorage.getItem('databaseCantieri')) || [];
    let c = cantieri[indice];

    if (!c) return;

    if (typeof html2pdf === "undefined") {
        alert("Errore: libreria html2pdf non caricata. Controlla index.html.");
        return;
    }

    if (document.getElementById('pdf-identificativo-codice')) {
        const dataPulita = (c.data || "").replace(/\//g, '');
        testo('pdf-identificativo-codice', `${(c.nome || "").toUpperCase()}_${dataPulita}_`);
    }

    testo('pdf-txt-affidataria', c.affidataria);
    testo('pdf-txt-responsabile', c.respLavori);
    testo('pdf-coinvolta-affidataria', c.affidataria);
    testo('pdf-coinvolta-esecutrice', c.esecutrice);
    testo('pdf-tab-esecutrice', c.esecutrice);
    testo('pdf-txt-fabbricato', c.fabbricato);
    testo('pdf-txt-piano', c.piano);
    testo('pdf-firma-nome-p1', c.tecnico);
    testo('pdf-firma-nome-p2', c.tecnico);

    testo('pdf-ia-descrizione', c.iaDescrizione);
    testo('pdf-ia-misure', c.iaMisure);
    testo('pdf-ia-correttive', c.iaCorrettive);

    if (document.getElementById('pdf-quadratini-attivita')) {
        const elencoTotale = [
            "Carpenteria metallica, in acciaio e opere complementari",
            "Opere murarie e opere complementari",
            "Impianti meccanici e opere complementari",
            "Impianti elettrici e opere complementari",
            "Impianti idraulici e opere complementari"
        ];

        let htmlAttivita = "";

        elencoTotale.forEach(att => {
            let spunta = (c.attivita || []).includes(att) ? "<strong>[X]</strong>" : "[ ]";
            htmlAttivita += `<p style="margin: 4px 0; font-weight: normal;">${spunta} ${att}</p>`;
        });

        html('pdf-quadratini-attivita', htmlAttivita);
    }

    if (document.getElementById('pdf-quadratini-tempistiche')) {
        const elencoTempistiche = [
            "Attività sospesa fino ad adempimento",
            "Messa in sicurezza immediata",
            "Messa in sicurezza entro 2 giorni",
            "Messa in sicurezza entro 3 giorni",
            "Messa in sicurezza giornata"
        ];

        let htmlTempistiche = "<p style='margin:0 0 6px 0;'><strong>Disposizioni operative e scadenze:</strong></p>";

        elencoTempistiche.forEach(temp => {
            let spunta = (c.tempistica_sicurezza === temp) ? "<strong>[X]</strong>" : "[ ]";
            htmlTempistiche += `<p style="margin: 4px 0; font-weight: normal;">${spunta} ${temp}</p>`;
        });

        html('pdf-quadratini-tempistiche', htmlTempistiche);
    }

    const imgGenerale = document.getElementById('pdf-img-cantiere-generale');
    const placeholder1 = document.getElementById('pdf-placeholder-img1');

    if (imgGenerale && placeholder1) {
        if (c.foto1) {
            imgGenerale.src = c.foto1;
            imgGenerale.style.display = 'block';
            placeholder1.style.display = 'none';
        } else {
            imgGenerale.style.display = 'none';
            placeholder1.style.display = 'block';
        }
    }

    const imgDettaglio =
        document.getElementById('pdf-foto-2') ||
        document.getElementById('pdf-foto2');

    const placeholder2 = document.getElementById('pdf-placeholder-img2');

    if (imgDettaglio) {
        if (c.foto2) {
            imgDettaglio.src = c.foto2;
            imgDettaglio.style.display = 'block';
            if (placeholder2) placeholder2.style.display = 'none';
        } else {
            imgDettaglio.style.display = 'none';
            if (placeholder2) placeholder2.style.display = 'block';
        }
    }

    const elementoPdf = document.getElementById('modello-pdf-invisibile');

    if (elementoPdf) {
        elementoPdf.style.display = 'block';

        const opzioni = {
    margin: 0,
            filename: `Verbale_CSE_${(c.nome || "report").toUpperCase()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                letterRendering: true
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait'
            },
            pagebreak: {
                mode: ['avoid-all', 'css']
            }
        };
        setTimeout(function () {
            html2pdf()
                .set(opzioni)
                .from(elementoPdf)
                .toPdf()
                .get('pdf')
                .then(function (pdf) {
                    elementoPdf.style.display = 'none';
                    pdf.autoPrint();
                    window.open(pdf.output('bloburl'), '_blank');
                })
                .catch(function (errore) {
                    elementoPdf.style.display = 'none';
                    console.error("Errore PDF completo:", errore);
                    alert("Errore durante la generazione del PDF.");
                });
        }, 500);
    }
}

mostraCantieri();
    
