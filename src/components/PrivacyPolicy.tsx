import React from 'react';
import { X } from 'lucide-react';

interface PrivacyPolicyProps {
  onClose: () => void;
  language: 'lv' | 'en' | 'ru';
}

export function PrivacyPolicy({ onClose, language }: PrivacyPolicyProps) {
  return (
    <section className="pt-32 pb-24 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-3xl md:text-5xl text-black">Privātuma politika</h2>
          <button onClick={onClose} className="flex items-center gap-2 text-black/60 hover:text-black transition-colors text-sm font-bold tracking-widest uppercase">
            <X className="w-5 h-5" />
            Aizvērt
          </button>
        </div>
        
        <div className="bg-white/40 backdrop-blur-xl border border-black/10 rounded-2xl p-8 md:p-12 shadow-sm prose prose-neutral max-w-none prose-headings:font-serif prose-headings:font-normal prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-black/80 prose-p:leading-relaxed prose-li:text-black/80">
          <p>
            Šī privātuma politika (turpmāk — “Politika”) skaidri un saprotami apraksta, kā Aplikācija atzinumu izstrādei (turpmāk — “Mēs”, “Uzņēmums”) vācam, izmantojam, glabājam un aizsargā jūsu personas datus, kādas ir jūsu tiesības un kā jūs varat iesniegt sūdzību. Šī Politika attiecas uz tīmekļa vietni un pakalpojumiem, kurus nodrošinām, lai pēc klienta uzdotā jautājuma sagatavotu juridisku atzinumu.
          </p>

          <h3>1. Datu pārzinis un kontaktinformācija</h3>
          <p>
            <strong>Datu pārzinis:</strong> Ivars Bajārs<br />
            <strong>Kontakttālrunis:</strong> +371 29421602<br />
            <strong>E-pasts privātuma jautājumiem:</strong> ivars.bajars@gmail.com<br />
            <strong>Adrese:</strong> Mazcenu aleja 10, Jaunmārupe, Mārupes novads, LV-2166
          </p>

          <h3>2. Piemērojamā tiesiskā regulējošā bāze</h3>
          <p>
            Mūsu darbībā piemērojama Eiropas Savienības Vispārīgā datu aizsardzības regula (GDPR) un Latvijas nacionālā datu aizsardzības regula. GDPR nosaka personas datu apstrādes principus un tiesības datu subjektam.
            Latvijas tiesiskais ietvars papildina un īsteno ES prasības (piem., Fizisko personu datu apstrādes likums).
          </p>

          <h3>3. Kādus datus mēs vācam</h3>
          <h4>3.1 Dati, kurus jūs sniedzat tieši</h4>
          <ul>
            <li>Vārds, uzvārds (reģistrācijai un pakalpojuma nodrošināšanai).</li>
            <li>E-pasta adrese (kontam, komunikācijai un atskaitēm).</li>
            <li>Jautājuma saturs / informācija, ko iesniedzat, lai saņemtu atzinumu (tā var ietvert faktu aprakstus, dokumentu fragmentus utt.). Uzņēmums neapstrādā sensitīvus personas datus (piem., veselības, reliģijas, politiskās pārliecības, seksuālas dzīves u.tml.), ja vien jūs tos nepiegādājat — ja šāds saturs tiek iesniegts, mēs ar to rīkosimies saskaņā ar piemērojamiem likumiem un iepriekš norādīsim speciālas apstrādes pamatojumu.</li>
          </ul>

          <h4>3.2 Dati, kas tiek vākti automātiski</h4>
          <ul>
            <li>IP adrese un ierīces informācija;</li>
            <li>Cookies un līdzīgi izsekošanas tehnoloģijas (lai nodrošinātu funkcionalitāti, drošību un produktu uzlabošanu).</li>
          </ul>
          <p>
            Šo informāciju var izmantot arī tehnisko problēmu novēršanai, ļaunprātības atklāšanai un lietotāja pieredzes uzlabošanai.
          </p>

          <h3>4. Datu vākšanas mērķi un tiesiskie pamati</h3>
          <p>Mēs apstrādājam jūsu datus šādiem mērķiem:</p>
          <ul>
            <li><strong>Pakalpojuma sniegšana</strong> (reģistrācija, atzinuma sagatavošana) — tiesiskais pamats: līguma izpilde vai darbības pasākumi pirms līguma slēgšanas pēc jūsu pieprasījuma.</li>
            <li><strong>Komunikācija</strong> (e-pasta paziņojumi, atbildes uz pieprasījumiem) — tiesiskais pamats: līguma izpilde / leģitīmas intereses.</li>
            <li><strong>Drošība, krāpšanas novēršana, tehniskā uzturēšana</strong> — tiesiskais pamats: leģitīmas intereses (sistēmas drošība, tiesību aizsardzība).</li>
            <li><strong>Tiesiska pienākumu izpilde</strong> (piem., pieprasījumi no valsts iestādēm) — tiesiskais pamats: juridiska saistība.</li>
            <li><strong>Mārketings un tiešā saziņa</strong> (ja tiek pieprasīta) — tiesiskais pamats: jūsu piekrišana (ja nosūtām komerciālas ziņas, to darīsim tikai ar jūsu skaidru piekrišanu un ar iespēju atteikties).</li>
          </ul>

          <h3>5. Datu glabāšanas termiņi</h3>
          <ul>
            <li><strong>Konta pamatdati</strong> (vārds, e-pasts): glabājam tik ilgi, kamēr aktīvs jūsu konts un pēc tam ierakstus dzēšam/anonimizējam saskaņā ar iekšējām procedūrām.</li>
            <li><strong>Atzinumu un pakalpojuma ieraksti:</strong> parasti saglabājam 3–7 gadus, ja nepieciešams par tiesisku prasību, kvalitātes nodrošināšanas vai strīdu izšķiršanas nolūkos.</li>
            <li><strong>Drošības žurnāli (logs):</strong> parasti līdz 12 mēnešiem drošības un krāpšanas apkarošanas nolūkos.</li>
            <li><strong>Rezerves kopijas un arhīvi:</strong> var tikt glabāti līdz 6 mēnešiem pēc dzēšanas, lai nodrošinātu atgūšanas iespēju.</li>
          </ul>
          <p className="text-sm text-black/60 italic">
            (Mēs dzēšam datus agrāk, ja to pieprasāt, ja nav tiesisku pamatu to turpināt glabāt.)
          </p>

          <h3>6. Trešās puses un datu apstrādātāji</h3>
          <p>
            Mēs varam nodot jūsu datus uzticamiem datu apstrādātājiem (piem., hostinga pakalpojumu sniedzēji, e-pasta pakalpojumu sniedzēji, analītikas rīki). Ar visiem apstrādātājiem noslēdzam datu apstrādes līgumus, kuri nosaka drošības prasības un apstrādes mērķus.
          </p>
          <p>
            Ja dati tiek pārsūtīti ārpus Eiropas Ekonomiskās zonas (EEZ), mēs to darām tikai, ja tiek piemēroti atbilstoši drošības pasākumi (piem., Eiropas Komisijas konstatēta atbilstība, standarta līguma noteikumi vai citi tiesiski droši risinājumi). ES noteikumi par datu pārraidi ārpus ES/EEZ nosaka stingras garantijas.
          </p>

          <h3>7. Jūsu tiesības</h3>
          <p>Saskaņā ar piemērojamo datu aizsardzības tiesību aktu (t.sk. GDPR) jums ir tiesības:</p>
          <ul>
            <li><strong>Piekļuve</strong> saviem personas datiem;</li>
            <li><strong>Labojums</strong> (koriģēt neprecizitātes);</li>
            <li><strong>Dzēšana</strong> (“tikt aizmirstam”), kur to pieprasa likums;</li>
            <li><strong>Apstrādes ierobežošana;</strong></li>
            <li><strong>Pārnesamība</strong> (saņemt struktūrētus datus mašīnlasāmā formātā);</li>
            <li><strong>Iebildums pret apstrādi</strong>, kas balstīta uz leģitīmām interesēm vai tiešo mārketingu;</li>
            <li><strong>Piekrišanas atsaukšana</strong> (ja apstrāde balstās uz piekrišanu) — piekrišanas atsaukšana neietekmē jau līdz tam likumīgi veiktās apstrādes.</li>
            <li><strong>Tiesības nepieļaut pilnībā automatizētu lēmumu pieņemšanu</strong>, kur tai ir juridiskas vai būtiskas sekas, un pieprasīt cilvēka iejaukšanos vai paskaidrojumu par apstrādes loģiku.</li>
          </ul>
          <p>
            Ja vēlaties izmantot jebkuru no šīm tiesībām, lūdzu sazinieties ar mums, izmantojot sadaļā 1 norādītos kontaktus. Par jūsu pieprasījumu rīkosimies bez nepamatota kavējuma un, ja iespējams, 1 mēneša laikā (saskaņā ar GDPR prasībām), ņemot vērā nepieciešamos drošības pārbaudus.
          </p>

          <h3>8. Kā iesniegt sūdzību pie uzraugošās iestādes</h3>
          <p>
            Ja uzskatāt, ka jūsu personas dati tiek apstrādāti nelikumīgi vai ka jūsu tiesības netiek ievērotas, jums ir tiesības iesniegt sūdzību Latvijas uzraudzības iestādei — Datu valsts inspekcijai (DVI). DVI kontakti un informācija pieejama iestādes tīmekļa vietnē.
          </p>

          <h3>9. Datu drošība</h3>
          <p>
            Mēs īstenojam atbilstošus tehniskos un organizatoriskos pasākumus, lai aizsargātu jūsu datus pret nejaušu vai nelikumīgu iznīcināšanu, zudumu, izpausmi vai piekļuvi. Tie ietver datu šifrēšanu pārsūtīšanas laikā (HTTPS), piekļuves tiesību kontroli, regulāras drošības pārbaudes un sadarbību ar uzticamiem apstrādātājiem.
          </p>
          <p>
            Tomēr neviena interneta pārraide vai datu glabāšanas metode nav pilnīgi droša; mēs darīsim visu saprātīgu, lai mazinātu riskus.
          </p>

          <h3>10. Par datu pārkāpumiem (breaches)</h3>
          <p>
            Ja notiek datu drošības pārkāpums, kas, visticamāk, rada risku jūsu tiesībām un brīvībām, mēs vispirms novērsīsim pārkāpuma ietekmi un, ja nepieciešams, informēsim ietekmētās personas un uzraugošo iestādi saskaņā ar GDPR noteikto termiņu (parasti bez nepamatota kavējuma un, ja iespējams, 72 stundu laikā pēc pārkāpuma konstatēšanas).
          </p>

          <h3>11. Sīkdatnes (Cookies)</h3>
          <p>
            Mūsu vietnē tiek izmantotas sīkdatnes funkcionalitātei, analītikai un (ja piekrītat) mārketingam. Pēc nepieciešamības jums tiks dota iespēja piekrist vai noraidīt neobligātās sīkdatnes; pamatfunkcionalitātes sīkdatnes ir nepieciešamas, lai nodrošinātu konta darbību un drošību.
          </p>

          <h3>12. Automatizēta lēmumu pieņemšana un profilēšana</h3>
          <p>
            Lai nodrošinātu pakalpojumu (piem., ģenerētu atzinumu sagatavošana), mēs varam izmantot automatizētus rīkus vai algoritmus. Ja automatizēta apstrāde radītu lietotājam juridiskas vai būtiskas sekas, jums ir tiesības pieprasīt cilvēka iejaukšanos, izskaidrojumu par lēmuma loģiku un iebilst pret automatizētu lēmumu pieņemšanu, kā to paredz tiesiskie akti. Ja vēlaties, varat pieprasīt, lai mēs nodrošinātu neatkarīgu pārskatīšanu.
          </p>

          <h3>13. Bērni</h3>
          <p>
            Mūsu pakalpojumi nav paredzēti bērniem, un mēs neapzināti nesaglabājam bērnu datus. Ja uzzinām, ka esam apstrādājuši bērna datus bez vecāku piekrišanas, mēs rīkosimies, lai šos datus dzēstu.
          </p>

          <h3>14. Izmaiņas politikā</h3>
          <p>
            Mēs varam laiku pa laikam atjaunināt šo Privātuma politiku. Ja izmaiņas ir būtiskas, mēs to skaidri norādīsim vietnē vai nosūtīsim paziņojumu pa e-pastu. Datums “Pēdējais atjauninājums” tiks atbilstoši atjaunināts.
          </p>

          <h3>15. Papildu informācija un kontaktēšanās</h3>
          <p>
            Ja jums ir jautājumi par šo Politiku, vēlaties īstenot savas tiesības vai iesniegt sūdzību, sazinieties ar mums:<br />
            <strong>E-pasts:</strong> ivars.bajars@gmail.com<br />
            <strong>Adrese:</strong> Mazcenu aleja 10, Jaunmārupe, Mārupes novads, LV-2166
          </p>
          <p>
            Ja jūsu sūdzība nav atrisināta pie mums, jums ir tiesības vērsties pie Latvijas uzraugošās iestādes — Datu valsts inspekcija (DVI). Kontakti un informācija pieejama DVI mājaslapā.
          </p>

          <h3>16. Atsauces uz tiesību aktiem un vadlīnijām</h3>
          <ul>
            <li>Vispārīgā datu aizsardzības regula (GDPR).</li>
            <li>Latvijas Fizisko personu datu apstrādes likums.</li>
            <li>Eiropas Komisijas informācija par datu pārsūtīšanu ārpus ES/EEZ.</li>
            <li>Datu valsts inspekcija (Latvija) — uzraugošā iestāde.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
