import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'motion/react';

export function Disclaimer({ language, onClose }: { language: string, onClose: () => void }) {
  const t = {
    lv: {
      title: "Atbildības atruna",
      close: "Aizvērt",
    },
    en: {
      title: "Disclaimer",
      close: "Close",
    },
    ru: {
      title: "Отказ от ответственности",
      close: "Закрыть",
    }
  };

  const currentT = t[language as keyof typeof t];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-black/10 overflow-hidden"
      >
        <div className="p-6 md:p-8 border-b border-black/10 flex justify-between items-center gold-glass">
          <h1 className="text-2xl md:text-3xl font-serif text-black">{currentT.title}</h1>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-full transition-colors"
            title={currentT.close}
          >
            <X className="w-6 h-6 text-black" />
          </button>
        </div>
        
        <div className="p-6 md:p-8 prose prose-slate max-w-none text-black/80">
          <h2 className="text-xl font-bold text-black mb-4">ATBILDĪBAS ATRUNA</h2>
          <p className="italic mb-4">(augstāka riska aizsardzības versija komerciālai juridiska satura platformai)</p>
          <p className="font-bold mb-6">Spēkā no: 2026. gada 3. marta</p>
          
          <p className="mb-6">
            Šī paplašinātā atbildības atruna attiecas uz juridisko atzinumu tiešsaistes platformu (turpmāk – Platforma), kuras pakalpojumu sniedz Ivars Bajārs (turpmāk – Pakalpojuma sniedzējs).
          </p>

          <h3 className="text-lg font-bold text-black mt-8 mb-4">1. Pakalpojuma būtība un statuss</h3>
          <p>1.1. Platformā sniegtie juridiska rakstura atzinumi tiek ģenerēti automatizēti, izmantojot mākslīgā intelekta rīku, kas izstrādāts pēc jurista definētas metodoloģijas.</p>
          <p>1.2. Platforma nav advokātu birojs un nesniedz juridisko palīdzību normatīvo aktu izpratnē.</p>
          <p>1.3. Platformā sniegtais saturs:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>nav juridiska konsultācija;</li>
            <li>nav juridiska palīdzība;</li>
            <li>nav advokāta atzinums;</li>
            <li>nav juridiski saistošs dokuments;</li>
            <li>nerada starp lietotāju un Pakalpojuma sniedzēju klienta–jurista attiecības.</li>
          </ul>
          <p>1.4. Abonēšanas maksas samaksa pati par sevi nerada profesionālu juridisko pakalpojumu līgumu.</p>

          <h3 className="text-lg font-bold text-black mt-8 mb-4">2. Automatizēta satura raksturs</h3>
          <p>2.1. Atzinumi tiek sagatavoti bez individuālas cilvēka iesaistes konkrētajā lietā.</p>
          <p>2.2. Mākslīgā intelekta sistēma darbojas, pamatojoties uz algoritmiskiem modeļiem un datu analīzi, un:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>nevar pilnībā izvērtēt visus faktiskos apstākļus;</li>
            <li>nevar aizstāt individuālu juridisku analīzi;</li>
            <li>var neidentificēt būtiskus juridiskus riskus;</li>
            <li>var balstīties uz nepilnīgu vai neprecīzu lietotāja sniegto informāciju.</li>
          </ul>
          <p>2.3. Platforma negarantē, ka sniegtais atzinums:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>ir pilnīgs;</li>
            <li>ir aktuāls attiecībā uz jaunākajiem normatīvo aktu grozījumiem;</li>
            <li>ir piemērojams konkrētai jurisdikcijai ārpus Latvijas;</li>
            <li>nodrošinās lietotājam vēlamo rezultātu.</li>
          </ul>

          <h3 className="text-lg font-bold text-black mt-8 mb-4">3. Profesionālās atbildības izslēgšana</h3>
          <p>3.1. Platformas izmantošana nerada:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>juridiskās palīdzības līgumu;</li>
            <li>pilnvarojuma attiecības;</li>
            <li>pārstāvības tiesības;</li>
            <li>fiduciāras (uzticības) attiecības.</li>
          </ul>
          <p>3.2. Pakalpojuma sniedzējs nesniedz individuālu lietu izvērtējumu un nepārbauda lietotāja ievadīto faktu patiesumu.</p>
          <p>3.3. Platforma nav paredzēta izmantošanai kā vienīgais pamats:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>tiesvedības uzsākšanai;</li>
            <li>līgumu slēgšanai;</li>
            <li>finanšu vai komerciālu lēmumu pieņemšanai;</li>
            <li>procesuālu termiņu ievērošanai;</li>
            <li>juridisku dokumentu iesniegšanai valsts iestādēs.</li>
          </ul>

          <h3 className="text-lg font-bold text-black mt-8 mb-4">4. Lietotāja atbildība</h3>
          <p>4.1. Lietotājs pilnībā uzņemas atbildību par:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>ievadītās informācijas precizitāti;</li>
            <li>atzinuma interpretāciju;</li>
            <li>pieņemtajiem lēmumiem;</li>
            <li>atzinuma izmantošanas sekām.</li>
          </ul>
          <p>4.2. Pirms būtisku juridisku, finanšu vai komerciālu lēmumu pieņemšanas lietotājam ir pienākums konsultēties ar kvalificētu juristu vai zvērinātu advokātu.</p>

          <h3 className="text-lg font-bold text-black mt-8 mb-4">5. Atbildības ierobežojums</h3>
          <p>5.1. Ciktāl to pieļauj piemērojamie normatīvie akti, Pakalpojuma sniedzējs neuzņemas atbildību par:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>tiešiem zaudējumiem;</li>
            <li>netiešiem zaudējumiem;</li>
            <li>negūtu peļņu;</li>
            <li>komercdarbības pārtraukumu;</li>
            <li>reputācijas kaitējumu;</li>
            <li>trešo personu prasījumiem;</li>
            <li>administratīvām vai krimināltiesiskām sekām.</li>
          </ul>
          <p>5.2. Pakalpojuma sniedzēja kopējā maksimālā atbildība jebkādu prasījumu gadījumā, neatkarīgi no prasījuma pamata (līgums, delikts, nolaidība vai citādi), nepārsniedz summu, ko lietotājs samaksājis par abonēšanu pēdējo 3 (trīs) mēnešu laikā pirms prasījuma rašanās.</p>
          <p>5.3. Pakalpojuma sniedzējs neatbild par nepārvaramas varas (force majeure) apstākļiem, tostarp, bet ne tikai:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>tehniskiem traucējumiem;</li>
            <li>sakaru pārtraukumiem;</li>
            <li>kiberuzbrukumiem;</li>
            <li>trešo personu pakalpojumu darbības traucējumiem.</li>
          </ul>

          <h3 className="text-lg font-bold text-black mt-8 mb-4">6. Jurisdikcijas ierobežojums</h3>
          <p>6.1. Platformā sniegtie atzinumi primāri balstīti uz Latvijas tiesību sistēmu, ja vien nav skaidri norādīts citādi.</p>
          <p>6.2. Pakalpojuma sniedzējs neuzņemas atbildību par atzinuma piemērošanu citās jurisdikcijās.</p>

          <h3 className="text-lg font-bold text-black mt-8 mb-4">7. Trešo personu prasījumi (atlīdzināšanas klauzula)</h3>
          <p>7.1. Lietotājs apņemas atlīdzināt un aizsargāt Pakalpojuma sniedzēju pret jebkādiem trešo personu prasījumiem, zaudējumiem vai izdevumiem, kas radušies:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>lietotāja darbību rezultātā;</li>
            <li>atzinuma izmantošanas rezultātā;</li>
            <li>šo noteikumu pārkāpuma gadījumā.</li>
          </ul>

          <h3 className="text-lg font-bold text-black mt-8 mb-4">8. Riska apzināšanās</h3>
          <p>Izmantojot Platformu, lietotājs apliecina, ka:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>saprot, ka Platforma darbojas automatizēti;</li>
            <li>apzinās juridiskos riskus;</li>
            <li>pieņem, ka atzinums ir tikai informatīvs palīgrīks;</li>
            <li>nepaļausies uz to kā uz vienīgo juridiskā lēmuma pamatu.</li>
          </ul>

          <h3 className="text-lg font-bold text-black mt-8 mb-4">9. Atrunas prioritāte</h3>
          <p>Ja pastāv pretruna starp šo paplašināto atbildības atrunu un citiem Platformas dokumentiem, prioritāte ir šai atrunai attiecībā uz atbildības ierobežojumu jautājumiem.</p>
        </div>
      </motion.div>
    </div>
  );
}
