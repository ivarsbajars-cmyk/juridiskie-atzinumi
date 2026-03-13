import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'motion/react';

export function DistanceContract({ language, onClose }: { language: string, onClose: () => void }) {
  const t = {
    lv: {
      title: "Distances līgums",
      close: "Aizvērt",
    },
    en: {
      title: "Distance Contract",
      close: "Close",
    },
    ru: {
      title: "Дистанционный договор",
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
          <h2 className="text-xl font-bold text-black mb-4">DISTANCES LĪGUMS</h2>
          <p className="italic mb-4">(abonēšanas pakalpojuma sniegšanai tiešsaistē)</p>
          <p className="font-bold mb-6">Spēkā no: 2026. gada 3. marta</p>
          
          <p className="mb-4">Šis Distances līgums (turpmāk – Līgums) tiek noslēgts starp:</p>
          
          <p className="mb-2"><strong>Pakalpojuma sniedzēju:</strong><br/>
          Ivars Bajārs (turpmāk – Pakalpojuma sniedzējs)</p>
          
          <p className="mb-2">un</p>
          
          <p className="mb-4"><strong>Klientu</strong> (fizisku vai juridisku personu), kas reģistrējas un iegādājas abonementu juridisko atzinumu tiešsaistes platformā (turpmāk – Platforma).</p>
          
          <p className="mb-6">Līgums tiek noslēgts attālināti, izmantojot tīmekļa vietni, bez pušu fiziskas klātbūtnes.</p>

          <h3 className="text-lg font-bold text-black mt-8 mb-4">1. Līguma priekšmets</h3>
          <p>1.1. Pakalpojuma sniedzējs nodrošina Klientam piekļuvi Platformai, kurā tiek sniegti automatizēti juridiska rakstura atzinumi.</p>
          <p>1.2. Atzinumi tiek ģenerēti, izmantojot mākslīgā intelekta rīku, bez individuālas juridiskas konsultācijas sniegšanas.</p>
          <p>1.3. Pakalpojums ir informatīva rakstura un nav uzskatāms par juridisko palīdzību.</p>

          <h3 className="text-lg font-bold text-black mt-8 mb-4">2. Līguma noslēgšanas kārtība</h3>
          <p>2.1. Līgums tiek uzskatīts par noslēgtu brīdī, kad:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Klients ir reģistrējies Platformā;</li>
            <li>ir iepazinies ar Līgumu un citiem noteikumiem;</li>
            <li>ir veicis abonēšanas maksājumu.</li>
          </ul>
          <p>2.2. Līgums tiek noslēgts elektroniskā formā.</p>

          <h3 className="text-lg font-bold text-black mt-8 mb-4">3. Abonēšana un samaksa</h3>
          <p>3.1. Pakalpojums tiek sniegts par abonēšanas maksu.</p>
          <p>3.2. Abonēšanas veidi, cenas un termiņi tiek norādīti Platformā.</p>
          <p>3.3. Maksājumi tiek veikti, izmantojot Platformā pieejamos maksājumu risinājumus.</p>
          <p>3.4. Abonements stājas spēkā pēc maksājuma apstiprinājuma saņemšanas.</p>
          <p>3.5. Ja abonements ir automātiski atjaunojams, Klients par to tiek informēts pirms maksājuma veikšanas.</p>

          <h3 className="text-lg font-bold text-black mt-8 mb-4">4. Pakalpojuma sniegšana</h3>
          <p>4.1. Piekļuve Platformai tiek nodrošināta elektroniski.</p>
          <p>4.2. Pakalpojuma sniedzējs negarantē nepārtrauktu Platformas darbību tehnisku iemeslu dēļ.</p>
          <p>4.3. Pakalpojuma sniedzējs ir tiesīgs veikt tehniskus uzlabojumus vai uzturēšanas darbus.</p>

          <h3 className="text-lg font-bold text-black mt-8 mb-4">5. Atteikuma tiesības (attiecas uz patērētājiem)</h3>
          <p>5.1. Ja Klients ir patērētājs normatīvo aktu izpratnē, viņam ir tiesības 14 (četrpadsmit) dienu laikā no Līguma noslēgšanas dienas atteikties no Līguma, nesniedzot pamatojumu.</p>
          <p>5.2. Lai izmantotu atteikuma tiesības, Klientam jānosūta rakstisks paziņojums uz Pakalpojuma sniedzēja e-pastu.</p>
          <p>5.3. Ja Pakalpojuma sniegšana ir uzsākta ar Klienta skaidru piekrišanu pirms atteikuma termiņa beigām un Klients ir apliecinājis, ka zaudē atteikuma tiesības pēc pilnīgas pakalpojuma sniegšanas uzsākšanas, atteikuma tiesības var netikt piemērotas saskaņā ar normatīvajiem aktiem.</p>
          <p>5.4. Ja atteikuma tiesības tiek izmantotas un pakalpojums jau daļēji sniegts, Pakalpojuma sniedzējs ir tiesīgs ieturēt samērīgu samaksu par faktiski sniegto pakalpojuma daļu.</p>

          <h3 className="text-lg font-bold text-black mt-8 mb-4">6. Līguma termiņš un izbeigšana</h3>
          <p>6.1. Līgums ir spēkā abonēšanas perioda laikā.</p>
          <p>6.2. Klients var pārtraukt abonementu, atceļot to Platformas iestatījumos.</p>
          <p>6.3. Pakalpojuma sniedzējs ir tiesīgs izbeigt Līgumu, ja Klients pārkāpj Līguma noteikumus.</p>

          <h3 className="text-lg font-bold text-black mt-8 mb-4">7. Atbildība</h3>
          <p>7.1. Pakalpojuma sniedzēja atbildība tiek ierobežota saskaņā ar Platformas Paplašināto atbildības atrunu.</p>
          <p>7.2. Pakalpojuma sniedzējs neatbild par zaudējumiem, kas radušies, izmantojot informatīva rakstura atzinumus.</p>

          <h3 className="text-lg font-bold text-black mt-8 mb-4">8. Personas dati</h3>
          <p>8.1. Personas datu apstrāde notiek saskaņā ar Privātuma politiku.</p>
          <p>8.2. Klienta ievadītā juridiskā informācija netiek pastāvīgi saglabāta, izņemot ģenerēto atzinumu.</p>

          <h3 className="text-lg font-bold text-black mt-8 mb-4">9. Strīdu izskatīšana</h3>
          <p>9.1. Strīdi vispirms tiek risināti pārrunu ceļā.</p>
          <p>9.2. Ja vienošanās netiek panākta, strīds izskatāms Latvijas Republikas tiesā saskaņā ar spēkā esošajiem normatīvajiem aktiem.</p>
          <p>9.3. Patērētājam ir tiesības vērsties Patērētāju tiesību aizsardzības centrā vai izmantot ES tiešsaistes strīdu izšķiršanas platformu, ja piemērojams.</p>

          <h3 className="text-lg font-bold text-black mt-8 mb-4">10. Noslēguma noteikumi</h3>
          <p>10.1. Šis Līgums ir saistošs no tā noslēgšanas brīža.</p>
          <p>10.2. Ja kāds no Līguma punktiem tiek atzīts par spēkā neesošu, pārējie noteikumi paliek spēkā.</p>
          <p>10.3. Klients, veicot abonēšanas maksājumu, apliecina, ka ir iepazinies ar šo Līgumu un piekrīt tā noteikumiem.</p>

          <div className="mt-8 pt-8 border-t border-black/10">
            <p className="font-bold">Pakalpojuma sniedzējs:</p>
            <p>Ivars Bajārs</p>
            <p>E-pasts: ivars.bajars@gmail.com</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
