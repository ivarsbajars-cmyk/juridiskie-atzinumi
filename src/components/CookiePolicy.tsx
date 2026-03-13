import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

export function CookiePolicy({ onClose, language }: { onClose: () => void, language: string }) {
  const t = {
    lv: {
      title: "Sīkdatņu politika",
      close: "Aizvērt",
    },
    en: {
      title: "Cookie Policy",
      close: "Close",
    },
    ru: {
      title: "Политика использования файлов cookie",
      close: "Закрыть",
    }
  };

  return (
    <section className="pt-32 pb-24 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-3xl md:text-5xl text-black">{t[language as keyof typeof t].title}</h2>
          <button onClick={onClose} className="flex items-center gap-2 text-black/60 hover:text-black transition-colors text-sm font-bold tracking-widest uppercase">
            <X className="w-5 h-5" />
            {t[language as keyof typeof t].close}
          </button>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="gold-glass p-8 md:p-12 rounded-2xl shadow-sm prose prose-black max-w-none"
        >
          <p className="text-sm text-black/60 font-bold uppercase tracking-widest mb-8">Spēkā no: 2024. gada 1. janvāra</p>
          
          <p className="font-bold mb-6">Pārzinis: Ivars Bajārs (turpmāk – Pārzinis)</p>

          <h3 className="text-xl font-serif font-bold mt-8 mb-4">1. Vispārīgā informācija</h3>
          <p className="mb-4">1.1. Šī Sīkdatņu politika izskaidro, kā juridisko atzinumu tiešsaistes platforma (turpmāk – Platforma) izmanto sīkdatnes (cookies) un līdzīgas tehnoloģijas.</p>
          <p className="mb-4">1.2. Sīkdatnes ir nelielas teksta datnes, kas tiek saglabātas lietotāja ierīcē (datorā, planšetē, mobilajā tālrunī), apmeklējot tīmekļa vietni.</p>
          <p className="mb-4">1.3. Sīkdatņu izmantošana tiek veikta saskaņā ar piemērojamiem normatīvajiem aktiem, tostarp Vispārīgo datu aizsardzības regulu (GDPR) un elektronisko sakaru regulējumu.</p>

          <h3 className="text-xl font-serif font-bold mt-8 mb-4">2. Kādas sīkdatnes tiek izmantotas</h3>
          <p className="mb-4">Platformā var tikt izmantotas šādas sīkdatņu kategorijas:</p>
          
          <h4 className="text-lg font-bold mt-6 mb-2">2.1. Obligātās (tehniskās) sīkdatnes</h4>
          <p className="mb-2">Šīs sīkdatnes ir nepieciešamas Platformas darbības nodrošināšanai, piemēram:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>lietotāja autentifikācija;</li>
            <li>sesijas uzturēšana;</li>
            <li>drošības nodrošināšana;</li>
            <li>abonēšanas statusa pārbaude.</li>
          </ul>
          <p className="mb-4">Šīs sīkdatnes nevar tikt atspējotas, jo bez tām Platforma nevar pienācīgi darboties.</p>

          <h4 className="text-lg font-bold mt-6 mb-2">2.2. Funkcionālās sīkdatnes</h4>
          <p className="mb-2">Tās nodrošina papildu funkcionalitāti, piemēram:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>lietotāja izvēļu saglabāšanu;</li>
            <li>valodas iestatījumus;</li>
            <li>lietošanas ērtību uzlabošanu.</li>
          </ul>
          <p className="mb-4">Šīs sīkdatnes var tikt izmantotas tikai ar lietotāja piekrišanu, ja to paredz normatīvie akti.</p>

          <h4 className="text-lg font-bold mt-6 mb-2">2.3. Analītiskās sīkdatnes (ja tiek izmantotas)</h4>
          <p className="mb-2">Tās ļauj analizēt:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>vietnes apmeklējuma statistiku;</li>
            <li>lietotāju plūsmu;</li>
            <li>kļūdu identificēšanu un sistēmas uzlabošanu.</li>
          </ul>
          <p className="mb-4">Ja tiek izmantoti trešo personu analītikas rīki, informācija var tikt nodota attiecīgajam pakalpojuma sniedzējam.</p>
          <p className="mb-4">Analītiskās sīkdatnes tiek izmantotas tikai ar lietotāja piekrišanu.</p>

          <h3 className="text-xl font-serif font-bold mt-8 mb-4">3. Sīkdatņu glabāšanas termiņš</h3>
          <p className="mb-2">Sīkdatnes var būt:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Sesijas sīkdatnes</strong> – tiek dzēstas pēc pārlūkprogrammas aizvēršanas;</li>
            <li><strong>Pastāvīgās sīkdatnes</strong> – tiek saglabātas lietotāja ierīcē noteiktu laika periodu vai līdz to dzēšanai.</li>
          </ul>
          <p className="mb-4">Konkrētais glabāšanas termiņš ir atkarīgs no sīkdatnes veida un funkcijas.</p>

          <h3 className="text-xl font-serif font-bold mt-8 mb-4">4. Trešo personu sīkdatnes</h3>
          <p className="mb-4">4.1. Ja Platformā tiek izmantoti trešo personu pakalpojumi (piemēram, maksājumu risinājumi vai analītikas rīki), šie pakalpojumu sniedzēji var izmantot savas sīkdatnes.</p>
          <p className="mb-4">4.2. Par šo sīkdatņu izmantošanu atbild attiecīgais pakalpojumu sniedzējs saskaņā ar savu privātuma politiku.</p>

          <h3 className="text-xl font-serif font-bold mt-8 mb-4">5. Lietotāja piekrišana</h3>
          <p className="mb-4">5.1. Pirmo reizi apmeklējot Platformu, lietotājam tiek attēlots paziņojums par sīkdatņu izmantošanu.</p>
          <p className="mb-2">5.2. Lietotājs var:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>piekrist visām sīkdatnēm;</li>
            <li>noraidīt nebūtiskās sīkdatnes;</li>
            <li>pielāgot sīkdatņu iestatījumus.</li>
          </ul>
          <p className="mb-4">5.3. Lietotājs jebkurā laikā var mainīt savu izvēli Platformas iestatījumos.</p>

          <h3 className="text-xl font-serif font-bold mt-8 mb-4">6. Sīkdatņu pārvaldība pārlūkprogrammā</h3>
          <p className="mb-4">Lietotājs var kontrolēt un dzēst sīkdatnes savas pārlūkprogrammas iestatījumos. Tomēr jāņem vērā, ka, atspējojot obligātās sīkdatnes, Platformas darbība var tikt traucēta.</p>

          <h3 className="text-xl font-serif font-bold mt-8 mb-4">7. Izmaiņas Sīkdatņu politikā</h3>
          <p className="mb-4">Pārzinis ir tiesīgs jebkurā laikā veikt grozījumus šajā Sīkdatņu politikā. Aktuālā versija vienmēr ir pieejama Platformā.</p>

          <h3 className="text-xl font-serif font-bold mt-8 mb-4">8. Kontaktinformācija</h3>
          <p className="mb-2">Jautājumu gadījumā par sīkdatņu izmantošanu lūdzam sazināties:</p>
          <p className="mb-4">Ivars Bajārs<br />E-pasts: ivars.bajars@gmail.com</p>

          <p className="mt-8 italic text-black/80">Izmantojot Platformu un piekrītot sīkdatņu izmantošanai, lietotājs apliecina, ka ir iepazinies ar šo Sīkdatņu politiku.</p>
        </motion.div>
      </div>
    </section>
  );
}
