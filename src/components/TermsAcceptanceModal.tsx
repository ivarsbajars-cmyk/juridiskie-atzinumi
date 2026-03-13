import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

export function TermsAcceptanceModal({ onAccept, language }: { onAccept: () => void, language: string }) {
  const [isChecked, setIsChecked] = useState(false);

  const t = {
    lv: {
      title: "Lietošanas noteikumi",
      description: "Pirms turpināt, lūdzu, iepazīstieties ar mūsu lietošanas noteikumiem un apstipriniet, ka tiem piekrītat.",
      agree: "Esmu izlasījis un piekrītu lietošanas noteikumiem",
      continue: "Turpināt",
      terms: "Lietošanas noteikumi",
    },
    en: {
      title: "Terms of Service",
      description: "Before continuing, please read our terms of service and confirm that you agree to them.",
      agree: "I have read and agree to the terms of service",
      continue: "Continue",
      terms: "Terms of Service",
    },
    ru: {
      title: "Условия использования",
      description: "Перед продолжением, пожалуйста, ознакомьтесь с нашими условиями использования и подтвердите свое согласие.",
      agree: "Я прочитал и согласен с условиями использования",
      continue: "Продолжить",
      terms: "Условия использования",
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-[#f6e09e] via-[#d4af37] to-[#b88a36] border border-white/20 p-8 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] rounded-2xl shadow-2xl"
      >
        <div className="mb-6">
          <h2 className="text-3xl font-serif text-black">{t[language as keyof typeof t].title}</h2>
          <p className="text-black/70 mt-2 text-sm font-medium">{t[language as keyof typeof t].description}</p>
        </div>
        
        <div className="bg-white/60 rounded-xl border border-black/10 p-6 overflow-y-auto flex-1 prose prose-sm prose-black max-w-none custom-scrollbar shadow-sm">
          <p className="text-xs text-black/60 mb-6 font-bold uppercase tracking-widest">Spēkā no: 2024. gada 1. janvāra</p>

          <h3 className="text-lg font-bold mb-3 font-serif text-black">1. Vispārīgie noteikumi</h3>
          <p className="mb-3 text-black/80">1.1. Šie Lietošanas noteikumi nosaka kārtību, kādā tiek izmantota juridisko atzinumu sagatavošanas tiešsaistes platforma (turpmāk – Platforma).</p>
          <p className="mb-3 text-black/80">1.2. Pakalpojuma sniedzējs ir Ivars Bajārs, fiziska persona (turpmāk – Pakalpojuma sniedzējs).</p>
          <p className="mb-3 text-black/80">1.3. Reģistrējoties Platformā un/vai izmantojot to, lietotājs apliecina, ka ir iepazinies ar šiem noteikumiem, tos saprot un piekrīt tiem pilnībā.</p>
          <p className="mb-6 text-black/80">1.4. Ja lietotājs nepiekrīt noteikumiem, Platformas izmantošana nav atļauta.</p>

          <h3 className="text-lg font-bold mb-3 font-serif text-black">2. Pakalpojuma būtība</h3>
          <p className="mb-3 text-black/80">2.1. Platformā juridiska rakstura atzinumus sniedz mākslīgā intelekta rīks, kas izstrādāts pēc jurista Ivana Bajāra definētas metodoloģijas un atbilžu sniegšanas kārtības.</p>
          <p className="mb-3 text-black/80">2.2. Sniegtie atzinumi tiek ģenerēti automatizēti bez individuālas cilvēka iesaistes katrā konkrētā jautājumā.</p>
          <p className="mb-3 text-black/80">2.3. Pakaljopums ir informatīvs raksturs un nav uzskatāms par juridisku konsultāciju, juridisku palīdzību vai advokāta pakalpojumu.</p>
          <p className="mb-6 text-black/80">2.4. Platformas sniegtā informācija neaizstāj individuālu konsultāciju ar kvalificētu juristu vai advokātu.</p>

          <h3 className="text-lg font-bold mb-3 font-serif text-black">3. Reģistrācija un lietotāja konts</h3>
          <p className="mb-3 text-black/80">3.1. Platformā var reģistrēties jebkura fiziska vai juridiska persona.</p>
          <p className="mb-2 text-black/80">3.2. Reģistrācijai nepieciešams norādīt:</p>
          <ul className="list-disc pl-6 mb-3 text-black/80">
            <li>fiziskai personai – vārdu, uzvārdu un e-pasta adresi;</li>
            <li>juridiskai personai – nosaukumu un e-pasta adresi.</li>
          </ul>
          <p className="mb-3 text-black/80">3.3. Lietotājs ir atbildīgs par sniegtās informācijas patiesumu.</p>
          <p className="mb-6 text-black/80">3.4. Lietotājs ir atbildīgs par piekļuves datu drošību un nedrīkst tos nodot trešajām personām.</p>

          <h3 className="text-lg font-bold mb-3 font-serif text-black">4. Abonēšana un norēķini</h3>
          <p className="mb-3 text-black/80">4.1. Platformas pakalpojumi tiek sniegti par abonēšanas maksu.</p>
          <p className="mb-3 text-black/80">4.2. Abonēšanas maksa, termiņš un apmaksas kārtība tiek norādīta Platformā pirms pakalpojuma iegādes.</p>
          <p className="mb-3 text-black/80">4.3. Abonements stājas spēkā pēc maksājuma saņemšanas.</p>
          <p className="mb-6 text-black/80">4.4. Ja pakalpojuma saņēmējs ir patērētājs, tam var būt piemērojamas normatīvajos aktos paredzētās atteikuma tiesības, izņemot gadījumus, kad pakalpojuma sniegšana ir uzsākta ar patērētāja piekrišanu.</p>

          <h3 className="text-lg font-bold mb-3 font-serif text-black">5. Lietotāja ievadītā informācija</h3>
          <p className="mb-3 text-black/80">5.1. Lietotājs var ievadīt jebkādu informāciju pēc saviem ieskatiem.</p>
          <p className="mb-3 text-black/80">5.2. Lietotājs ir pilnībā atbildīgs par ievadītās informācijas saturu un tiesiskumu.</p>
          <p className="mb-3 text-black/80">5.3. Lietotāja ievadītā informācija netiek pastāvīgi saglabāta un pēc apstrādes tiek dzēsta.</p>
          <p className="mb-6 text-black/80">5.4. Tiek saglabāts tikai ģenerētais atzinums, kas ir pieejams lietotājam un Platformas administratoram.</p>

          <h3 className="text-lg font-bold mb-3 font-serif text-black">6. Personas datu apstrāde</h3>
          <p className="mb-3 text-black/80">6.1. Personas datu apstrāde notiek saskaņā ar spēkā esošajiem normatīvajiem aktiem un atsevišķu Privātuma politiku.</p>
          <p className="mb-3 text-black/80">6.2. Reģistrācijas dati tiek apstrādāti pakalpojuma nodrošināšanas nolūkā.</p>
          <p className="mb-6 text-black/80">6.3. Platforma neveic lietotāja ievadītās juridiskās informācijas ilgtermiņa uzglabāšanu.</p>

          <h3 className="text-lg font-bold mb-3 font-serif text-black">7. Atbildības ierobežojums</h3>
          <p className="mb-3 text-black/80">7.1. Platformā sniegtā informācija ir tikai informatīva rakstura.</p>
          <p className="mb-2 text-black/80">7.2. Pakalpojuma sniedzējs neuzņemas atbildību par:</p>
          <ul className="list-disc pl-6 mb-3 text-black/80">
            <li>lietotāja pieņemtajiem lēmumiem, pamatojoties uz sniegto atzinumu;</li>
            <li>tiešiem vai netiešiem zaudējumiem;</li>
            <li>neprecizitātēm vai nepilnībām ģenerētajā saturā.</li>
          </ul>
          <p className="mb-3 text-black/80">7.3. Lietotājs apzinās, ka mākslīgā intelekta ģenerēts saturs var saturēt kļūdas vai būt nepilnīgs.</p>
          <p className="mb-6 text-black/80">7.4. Pakalpojuma sniedzēja maksimālā atbildība, ja tāda iestājas, nepārsniedz konkrētajā abonēšanas periodā samaksāto maksu.</p>

          <h3 className="text-lg font-bold mb-3 font-serif text-black">8. Aizliegtā izmantošana</h3>
          <p className="mb-2 text-black/80">8.1. Aizliegts izmantot Platformu:</p>
          <ul className="list-disc pl-6 mb-3 text-black/80">
            <li>prettiesiskiem nolūkiem;</li>
            <li>trešo personu tiesību aizskaršanai;</li>
            <li>sistēmas drošības apdraudēšanai.</li>
          </ul>
          <p className="mb-6 text-black/80">8.2. Pakalpojuma sniedzējam ir tiesības apturēt vai dzēst lietotāja kontu, ja tiek konstatēti šo noteikumu pārkāpumi.</p>

          <h3 className="text-lg font-bold mb-3 font-serif text-black">9. Intelektuālais īpašums</h3>
          <p className="mb-3 text-black/80">9.1. Platformas programmatūra, struktūra un dizains ir Pakalpojuma sniedzēja īpašums.</p>
          <p className="mb-3 text-black/80">9.2. Lietotājam nav tiesību kopēt, izplatīt vai komerciāli izmantot Platformas tehnoloģiskos risinājumus bez rakstiskas atļaujas.</p>
          <p className="mb-6 text-black/80">9.3. Lietotājam ir tiesības izmantot saņemto atzinumu savām vajadzībām.</p>

          <h3 className="text-lg font-bold mb-3 font-serif text-black">10. Pakalpojuma pieejamība</h3>
          <p className="mb-3 text-black/80">10.1. Pakalpojuma sniedzējs negarantē nepārtrauktu Platformas darbību.</p>
          <p className="mb-6 text-black/80">10.2. Pakalpojuma sniedzējam ir tiesības veikt tehniskus uzlabojumus vai uzturēšanas darbus.</p>

          <h3 className="text-lg font-bold mb-3 font-serif text-black">11. Noteikumu grozījumi</h3>
          <p className="mb-3 text-black/80">11.1. Pakalpojuma sniedzējs ir tiesīgs jebkurā laikā grozīt šos noteikumus.</p>
          <p className="mb-6 text-black/80">11.2. Grozījumi stājas spēkā ar to publicēšanas brīdi Platformā.</p>

          <h3 className="text-lg font-bold mb-3 font-serif text-black">12. Piemērojamais likums un strīdu izskatīšana</h3>
          <p className="mb-3 text-black/80">12.1. Šiem noteikumiem piemērojami Latvijas Republikas normatīvie akti.</p>
          <p className="mb-6 text-black/80">12.2. Strīdi tiek risināti pārrunu ceļā. Ja vienošanās netiek panākta, strīds izskatāms Latvijas Republikas tiesā pēc Pakalpojuma sniedzēja dzīvesvietas piekritības, ja normatīvie akti nenosaka citādi.</p>

          <h3 className="text-lg font-bold mb-3 font-serif text-black">13. Kontaktinformācija</h3>
          <p className="mb-3 text-black/80">Jautājumu gadījumā lietotājs var sazināties ar Pakalpojuma sniedzēju, izmantojot Platformā norādīto kontaktinformāciju.</p>
        </div>

        <div className="mt-6 pt-6 border-t border-black/10">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              className="hidden" 
              checked={isChecked} 
              onChange={(e) => setIsChecked(e.target.checked)} 
            />
            <div className={`w-6 h-6 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${isChecked ? 'bg-black border-black' : 'border-black/30 group-hover:border-black/50 bg-white/60 shadow-sm'}`}>
              {isChecked && <Check className="w-4 h-4 text-white" />}
            </div>
            <span className="text-sm font-bold text-black/80 select-none">
              {t[language as keyof typeof t].agree}
            </span>
          </label>
          
          <button 
            onClick={onAccept}
            disabled={!isChecked}
            className={`w-full mt-6 py-4 rounded-xl font-bold tracking-widest uppercase text-sm transition-all shadow-md ${isChecked ? 'bg-black text-white hover:bg-black/80' : 'bg-white/40 text-black/40 cursor-not-allowed border border-black/10'}`}
          >
            {t[language as keyof typeof t].continue}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
