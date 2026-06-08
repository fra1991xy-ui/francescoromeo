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

    try {
        const risposta = await fetch(
            "https://romeo.fra-1991xy.workers.dev",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    appunto: appuntoUtente
                })
            }
        );

        const dati = await risposta.json();

        if (!risposta.ok) {
            throw new Error(dati.error || "Errore AI");
        }

        return {
            descrizione: dati.descrizione || "-",
            misure: dati.misure || "-",
            correttive: dati.correttive || "-"
        };

    } catch (errore) {
        console.error("Errore AI:", errore);

        return {
            descrizione: "Errore generazione descrizione tecnica.",
            misure: "Errore collegamento AI.",
            correttive: "Verificare Cloudflare Worker o connessione."
        };
    }
}
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
async function scaricaPDF(indice) {
    const { jsPDF } = window.jspdf;

    let cantieri = JSON.parse(localStorage.getItem('databaseCantieri')) || [];
    let c = cantieri[indice];

    if (!c) {
        alert("Report non trovato.");
        return;
    }

    const pdf = new jsPDF("p", "mm", "a4");

    async function caricaImmagine(src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = function () {
                resolve(img);
            };
            img.onerror = function () {
                resolve(null);
            };
            img.src = src;
        });
    }

    const logo = await caricaImmagine("logo-romeo.png");
    const certificazioni = await caricaImmagine("certificazioni.png");
    const planimetria = await caricaImmagine("planimetria.png");

    const verde = [146, 208, 80];

    function intestazione() {
        if (logo) {
            pdf.addImage(logo, "PNG", 20, 12, 170, 18);
        }
    }

    function footer() {
        if (certificazioni) {
            pdf.addImage(certificazioni, "PNG", 18, 262, 55, 18);
        }

        pdf.setFontSize(7);
        pdf.setTextColor(80, 80, 80);
        pdf.text("Romeo Safety Italia S.r.l.", 185, 264, { align: "right" });
        pdf.text("Sede: Via Imperia, 25 - 20142 MILANO", 185, 268, { align: "right" });
        pdf.text("Tel. 02/84.800.210 · C.F. e P.IVA 12689530157", 185, 272, { align: "right" });

        pdf.setTextColor(0, 0, 0);
    }

    function testoMultiriga(testo, x, y, larghezza, altezzaRiga = 4) {
        const righe = pdf.splitTextToSize(testo || "-", larghezza);
        pdf.text(righe, x, y);
        return y + righe.length * altezzaRiga;
    }

    // ======================
    // PAGINA 1
    // ======================

    intestazione();

    pdf.setFontSize(8);
    pdf.text(`${(c.nome || "").toUpperCase()}_${(c.data || "").replaceAll("/", "")}_`, 18, 45);

    pdf.setFont(undefined, "bold");
    pdf.text(`Spett.le Affidataria: ${c.affidataria || "-"}`, 185, 45, { align: "right" });
    pdf.text(`p.c. Spett.le Responsabile dei Lavori: ${c.respLavori || "-"}`, 185, 53, { align: "right" });
    pdf.setFont(undefined, "normal");

    pdf.setFillColor(...verde);
    pdf.rect(15, 63, 180, 7, "FD");
    pdf.setFont(undefined, "bold");
    pdf.setFontSize(8);
    pdf.text("Report di Sopralluogo CSE – Cantiere “R3” STMicroelectronics Sito di Agrate Brianza (MB)", 105, 68, { align: "center" });

    pdf.setDrawColor(0, 0, 0);
    pdf.rect(15, 70, 180, 58);

    pdf.line(125, 70, 125, 128);

    pdf.setFontSize(8);
    pdf.text("Attività svolta durante il sopralluogo:", 18, 77);

    const elencoAttivita = [
        "Carpenteria metallica, in acciaio e opere complementari",
        "Opere murarie e opere complementari",
        "Impianti meccanici e opere complementari",
        "Impianti elettrici e opere complementari",
        "Impianti idraulici e opere complementari"
    ];

    let y = 83;

    elencoAttivita.forEach(att => {
        const check = (c.attivita || []).includes(att) ? "[X]" : "[ ]";
        pdf.setFont(undefined, "normal");
        pdf.text(`${check} ${att}`, 18, y);
        y += 5;
    });

    y += 8;
    pdf.setFont(undefined, "bold");
    pdf.text("Impresa Affidataria coinvolta:", 18, y);
    pdf.setFont(undefined, "normal");
    pdf.text(c.affidataria || "-", 18, y + 5);

    y += 18;
    pdf.setFont(undefined, "bold");
    pdf.text("Impresa Esecutrice coinvolta:", 18, y);
    pdf.setFont(undefined, "normal");
    pdf.text(c.esecutrice || "-", 18, y + 5);

    if (planimetria) {
        pdf.addImage(planimetria, "PNG", 130, 75, 58, 48);
    }

    pdf.setFillColor(...verde);
    pdf.rect(15, 128, 180, 8, "FD");
    pdf.setFont(undefined, "bold");
    pdf.text(`Fabbricato: ${c.fabbricato || "-"}    Piano: ${c.piano || "-"}`, 105, 133, { align: "center" });

    pdf.setFillColor(...verde);
    pdf.rect(15, 155, 115, 8, "F");
    pdf.setFontSize(10);
    pdf.text(`Sopralluogo effettuato da:  ☐  ${c.tecnico || "-"}`, 18, 161);

    pdf.setFontSize(8);
    pdf.text("ASPETTI – IMPATTI E RELATIVE MISURE DI PREVENZIONE E PROTEZIONE", 15, 212);

    footer();

    // ======================
    // PAGINA 2
    // ======================

    pdf.addPage();

    intestazione();

    pdf.setFillColor(...verde);
    pdf.rect(15, 42, 180, 8, "FD");

    pdf.setFontSize(8);
    pdf.setFont(undefined, "bold");
    pdf.text(`Fabbricato: ${c.fabbricato || "-"}    Piano: ${c.piano || "-"}`, 18, 47);

    pdf.rect(15, 50, 180, 70);

    pdf.setFont(undefined, "bold");
    pdf.text("Descrizione attività:", 18, 58);
    pdf.setFont(undefined, "normal");
    let y2 = testoMultiriga(c.iaDescrizione, 18, 63, 170, 4);

    pdf.setFont(undefined, "bold");
    pdf.text("Misure di sicurezza attuate:", 18, y2 + 3);
    pdf.setFont(undefined, "normal");
    y2 = testoMultiriga(c.iaMisure, 18, y2 + 8, 170, 4);

    pdf.setFont(undefined, "bold");
    pdf.text("Misure correttive:", 18, y2 + 3);
    pdf.setFont(undefined, "normal");
    testoMultiriga(c.iaCorrettive, 18, y2 + 8, 170, 4);

    pdf.line(15, 120, 195, 120);

    pdf.setFontSize(7);
    pdf.text("Disposizioni operative e scadenze:", 18, 126);

    const tempistiche = [
        "Attività sospesa fino ad adempimento",
        "Messa in sicurezza immediata",
        "Messa in sicurezza entro 2 giorni",
        "Messa in sicurezza entro 3 giorni",
        "Messa in sicurezza giornata"
    ];

    let yt = 131;
    tempistiche.forEach(t => {
        const check = c.tempistica_sicurezza === t ? "[X]" : "[ ]";
        pdf.text(`${check} ${t}`, 18, yt);
        yt += 4;
    });

    // Area foto
    pdf.rect(15, 150, 180, 70);
    pdf.setFillColor(...verde);
    pdf.rect(15, 150, 10, 70, "FD");

    pdf.setFontSize(8);
    pdf.text("foto NC n.1", 20, 190, { angle: 90 });

    pdf.line(105, 150, 105, 220);

    if (c.foto1) {
        pdf.addImage(c.foto1, "JPEG", 35, 158, 60, 45);
    } else {
        pdf.setFontSize(24);
        pdf.text("foto", 60, 185, { align: "center" });
    }

    if (c.foto2) {
        pdf.addImage(c.foto2, "JPEG", 120, 158, 60, 45);
    } else {
        pdf.setFontSize(24);
        pdf.text("foto", 150, 185, { align: "center" });
    }

    pdf.setFontSize(8);
    pdf.text("Foto1 - non conformità", 65, 215, { align: "center" });
    pdf.text("Foto 2", 150, 215, { align: "center" });

    pdf.setFontSize(8);
    pdf.text("sospese: ☒ NON APPLICABILE - ☐ APPLICABILE", 15, 228);

    pdf.setFillColor(...verde);
    pdf.rect(15, 232, 180, 7, "FD");
    pdf.setFontSize(7);
    pdf.text("Attività", 18, 237);
    pdf.text("Data Sospensione attività", 40, 237);
    pdf.text("Attività sospesa", 85, 237);
    pdf.text("Data ripresa attività", 125, 237);
    pdf.text("Descrizione dell’adempimento", 155, 237);

    pdf.rect(15, 232, 180, 14);
    pdf.line(35, 232, 35, 246);
    pdf.line(80, 232, 80, 246);
    pdf.line(120, 232, 120, 246);
    pdf.line(150, 232, 150, 246);
    pdf.line(15, 239, 195, 239);

    pdf.text("1", 18, 244);
    pdf.text("-", 40, 244);
    pdf.text("Lavori in quota", 85, 244);
    pdf.text("-", 125, 244);
    pdf.text("-", 155, 244);

    pdf.setFontSize(8);
    pdf.text(`Il CSE p.i.e. ${c.tecnico || "-"}`, 185, 255, { align: "right" });

    footer();

    pdf.save(`Verbale_CSE_${(c.nome || "report").toUpperCase()}.pdf`);
}

mostraCantieri();
    
