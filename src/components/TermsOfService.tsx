import React from 'react';
import { X } from 'lucide-react';

export function TermsOfService({ onClose, language }: { onClose: () => void, language: string }) {
  return (
    <section className="pt-32 pb-24 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-3xl md:text-5xl text-black">
            {language === 'lv' ? 'Lietošanas noteikumi' : language === 'en' ? 'Terms of Service' : 'Условия использования'}
          </h2>
          <button onClick={onClose} className="flex items-center gap-2 text-black/60 hover:text-black transition-colors text-sm font-bold tracking-widest uppercase">
            <X className="w-5 h-5" />
            {language === 'lv' ? 'Aizvērt' : language === 'en' ? 'Close' : 'Закрыть'}
          </button>
        </div>
        
        <div className="gold-glass rounded-2xl p-8 md:p-12 shadow-sm prose prose-black max-w-none">
          <p className="text-sm text-black/60 mb-8">Spēkā no: 2024. gada 1. janvāra</p>

          <h3 className="text-xl font-bold mb-4 font-serif">1. Vispārīgie noteikumi</h3>
          <p className="mb-4">1.1. Šie Lietošanas noteikumi nosaka kārtību, kādā tiek izmantota juridisko atzinumu sagatavošanas tiešsaistes platforma (turpmāk – Platforma).</p>
          <p className="mb-4">1.2. Pakalpojuma sniedzējs ir Ivars Bajārs, fiziska persona (turpmāk – Pakalpojuma sniedzējs).</p>
          <p className="mb-4">1.3. Reģistrējoties Platformā un/vai izmantojot to, lietotājs apliecina, ka ir iepazinies ar šiem noteikumiem, tos saprot un piekrīt tiem pilnībā.</p>
          <p className="mb-8">1.4. Ja lietotājs nepiekrīt noteikumiem, Platformas izmantošana nav atļauta.</p>

          <h3 className="text-xl font-bold mb-4 font-serif">2. Pakalpojuma būtība</h3>
          <p className="mb-4">2.1. Platformā juridiska rakstura atzinumus sniedz mākslīgā intelekta rīks, kas izstrādāts pēc jurista Ivana Bajāra definētas metodoloģijas un atbilžu sniegšanas kārtības.</p>
          <p className="mb-4">2.2. Sniegtie atzinumi tiek ģenerēti automatizēti bez individuālas cilvēka iesaistes katrā konkrētā jautājumā.</p>
          <p className="mb-4">2.3. Pakaljopums ir informatīvs raksturs un nav uzskatāms par juridisku konsultāciju, juridisku palīdzību vai advokāta pakalpojumu.</p>
          <p className="mb-8">2.4. Platformas sniegtā informācija neaizstāj individuālu konsultāciju ar kvalificētu juristu vai advokātu.</p>

          <h3 className="text-xl font-bold mb-4 font-serif">3. Reģistrācija un lietotāja konts</h3>
          <p className="mb-4">3.1. Platformā var reģistrēties jebkura fiziska vai juridiska persona.</p>
          <p className="mb-2">3.2. Reģistrācijai nepieciešams norādīt:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>fiziskai personai – vārdu, uzvārdu un e-pasta adresi;</li>
            <li>juridiskai personai – nosaukumu un e-pasta adresi.</li>
          </ul>
          <p className="mb-4">3.3. Lietotājs ir atbildīgs par sniegtās informācijas patiesumu.</p>
          <p className="mb-8">3.4. Lietotājs ir atbildīgs par piekļuves datu drošību un nedrīkst tos nodot trešajām personām.</p>

          <h3 className="text-xl font-bold mb-4 font-serif">4. Abonēšana un norēķini</h3>
          <p className="mb-4">4.1. Platformas pakalpojumi tiek sniegti par abonēšanas maksu.</p>
          <p className="mb-4">4.2. Abonēšanas maksa, termiņš un apmaksas kārtība tiek norādīta Platformā pirms pakalpojuma iegādes.</p>
          <p className="mb-4">4.3. Abonements stājas spēkā pēc maksājuma saņemšanas.</p>
          <p className="mb-8">4.4. Ja pakalpojuma saņēmējs ir patērētājs, tam var būt piemērojamas normatīvajos aktos paredzētās atteikuma tiesības, izņemot gadījumus, kad pakalpojuma sniegšana ir uzsākta ar patērētāja piekrišanu.</p>

          <h3 className="text-xl font-bold mb-4 font-serif">5. Lietotāja ievadītā informācija</h3>
          <p className="mb-4">5.1. Lietotājs var ievadīt jebkādu informāciju pēc saviem ieskatiem.</p>
          <p className="mb-4">5.2. Lietotājs ir pilnībā atbildīgs par ievadītās informācijas saturu un tiesiskumu.</p>
          <p className="mb-4">5.3. Lietotāja ievadītā informācija netiek pastāvīgi saglabāta un pēc apstrādes tiek dzēsta.</p>
          <p className="mb-8">5.4. Tiek saglabāts tikai ģenerētais atzinums, kas ir pieejams lietotājam un Platformas administratoram.</p>

          <h3 className="text-xl font-bold mb-4 font-serif">6. Personas datu apstrāde</h3>
          <p className="mb-4">6.1. Personas datu apstrāde notiek saskaņā ar spēkā esošajiem normatīvajiem aktiem un atsevišķu Privātuma politiku.</p>
          <p className="mb-4">6.2. Reģistrācijas dati tiek apstrādāti pakalpojuma nodrošināšanas nolūkā.</p>
          <p className="mb-8">6.3. Platforma neveic lietotāja ievadītās juridiskās informācijas ilgtermiņa uzglabāšanu.</p>

          <h3 className="text-xl font-bold mb-4 font-serif">7. Atbildības ierobežojums</h3>
          <p className="mb-4">7.1. Platformā sniegtā informācija ir tikai informatīva rakstura.</p>
          <p className="mb-2">7.2. Pakalpojuma sniedzējs neuzņemas atbildību par:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>lietotāja pieņemtajiem lēmumiem, pamatojoties uz sniegto atzinumu;</li>
            <li>tiešiem vai netiešiem zaudējumiem;</li>
            <li>neprecizitātēm vai nepilnībām ģenerētajā saturā.</li>
          </ul>
          <p className="mb-4">7.3. Lietotājs apzinās, ka mākslīgā intelekta ģenerēts saturs var saturēt kļūdas vai būt nepilnīgs.</p>
          <p className="mb-8">7.4. Pakalpojuma sniedzēja maksimālā atbildība, ja tāda iestājas, nepārsniedz konkrētajā abonēšanas periodā samaksāto maksu.</p>

          <h3 className="text-xl font-bold mb-4 font-serif">8. Aizliegtā izmantošana</h3>
          <p className="mb-2">8.1. Aizliegts izmantot Platformu:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>prettiesiskiem nolūkiem;</li>
            <li>trešo personu tiesību aizskaršanai;</li>
            <li>sistēmas drošības apdraudēšanai.</li>
          </ul>
          <p className="mb-8">8.2. Pakalpojuma sniedzējam ir tiesības apturēt vai dzēst lietotāja kontu, ja tiek konstatēti šo noteikumu pārkāpumi.</p>

          <h3 className="text-xl font-bold mb-4 font-serif">9. Intelektuālais īpašums</h3>
          <p className="mb-4">9.1. Platformas programmatūra, struktūra un dizains ir Pakalpojuma sniedzēja īpašums.</p>
          <p className="mb-4">9.2. Lietotājam nav tiesību kopēt, izplatīt vai komerciāli izmantot Platformas tehnoloģiskos risinājumus bez rakstiskas atļaujas.</p>
          <p className="mb-8">9.3. Lietotājam ir tiesības izmantot saņemto atzinumu savām vajadzībām.</p>

          <h3 className="text-xl font-bold mb-4 font-serif">10. Pakalpojuma pieejamība</h3>
          <p className="mb-4">10.1. Pakalpojuma sniedzējs negarantē nepārtrauktu Platformas darbību.</p>
          <p className="mb-8">10.2. Pakalpojuma sniedzējam ir tiesības veikt tehniskus uzlabojumus vai uzturēšanas darbus.</p>

          <h3 className="text-xl font-bold mb-4 font-serif">11. Noteikumu grozījumi</h3>
          <p className="mb-4">11.1. Pakalpojuma sniedzējs ir tiesīgs jebkurā laikā grozīt šos noteikumus.</p>
          <p className="mb-8">11.2. Grozījumi stājas spēkā ar to publicēšanas brīdi Platformā.</p>

          <h3 className="text-xl font-bold mb-4 font-serif">12. Piemērojamais likums un strīdu izskatīšana</h3>
          <p className="mb-4">12.1. Šiem noteikumiem piemērojami Latvijas Republikas normatīvie akti.</p>
          <p className="mb-8">12.2. Strīdi tiek risināti pārrunu ceļā. Ja vienošanās netiek panākta, strīds izskatāms Latvijas Republikas tiesā pēc Pakalpojuma sniedzēja dzīvesvietas piekritības, ja normatīvie akti nenosaka citādi.</p>

          <h3 className="text-xl font-bold mb-4 font-serif">13. Kontaktinformācija</h3>
          <p className="mb-4">Jautājumu gadījumā lietotājs var sazināties ar Pakalpojuma sniedzēju, izmantojot Platformā norādīto kontaktinformāciju.</p>
          <p className="mb-8 font-bold">Apstiprinot reģistrāciju vai izmantojot Platformu, lietotājs apliecina, ka ir iepazinies ar šiem Lietošanas noteikumiem un piekrīt tiem.</p>
        </div>
      </div>
    </section>
  );
}
