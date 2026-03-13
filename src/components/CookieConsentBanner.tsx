import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function CookieConsentBanner({ language, onOpenCookiePolicy }: { language: string, onOpenCookiePolicy: () => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookieConsent', 'all');
    setIsVisible(false);
  };

  const handleDeclineAll = () => {
    localStorage.setItem('cookieConsent', 'necessary');
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookieConsent', 'custom');
    setIsVisible(false);
  };

  const t = {
    lv: {
      message: "Turpinot lietot šo platformu, jūs piekrītat mūsu Sīkdatņu politikai. Mēs izmantojam sīkdatnes, lai nodrošinātu platformas darbību un uzlabotu jūsu lietošanas pieredzi.",
      accept: "Piekrītu",
      decline: "Nepiekrītu",
      customize: "Pielāgot noteikumus",
      policyLink: "Lasīt Sīkdatņu politiku",
      customizeTitle: "Sīkdatņu iestatījumi",
      necessary: "Obligātās sīkdatnes (nepieciešamas platformas darbībai)",
      functional: "Funkcionālās sīkdatnes",
      analytics: "Analītiskās sīkdatnes",
      save: "Saglabāt izvēli",
    },
    en: {
      message: "By continuing to use this platform, you agree to our Cookie Policy. We use cookies to ensure the operation of the platform and improve your user experience.",
      accept: "Accept",
      decline: "Decline",
      customize: "Customize",
      policyLink: "Read Cookie Policy",
      customizeTitle: "Cookie Settings",
      necessary: "Necessary cookies (required for platform operation)",
      functional: "Functional cookies",
      analytics: "Analytical cookies",
      save: "Save preferences",
    },
    ru: {
      message: "Продолжая использовать эту платформу, вы соглашаетесь с нашей Политикой использования файлов cookie. Мы используем файлы cookie для обеспечения работы платформы и улучшения вашего пользовательского опыта.",
      accept: "Согласен",
      decline: "Не согласен",
      customize: "Настроить",
      policyLink: "Читать Политику",
      customizeTitle: "Настройки файлов cookie",
      necessary: "Обязательные файлы cookie (необходимы для работы платформы)",
      functional: "Функциональные файлы cookie",
      analytics: "Аналитические файлы cookie",
      save: "Сохранить выбор",
    }
  };

  const currentT = t[language as keyof typeof t];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:p-6 pointer-events-none"
        >
          <div className="max-w-5xl mx-auto gold-glass rounded-2xl shadow-2xl border border-black/10 overflow-hidden pointer-events-auto">
            {!showCustomize ? (
              <div className="p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <p className="text-black/80 text-sm md:text-base leading-relaxed">
                    {currentT.message}{' '}
                    <button onClick={onOpenCookiePolicy} className="underline hover:text-black font-bold transition-colors">
                      {currentT.policyLink}
                    </button>
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
                  <button
                    onClick={() => setShowCustomize(true)}
                    className="px-6 py-2.5 rounded-full border border-black/20 text-black hover:bg-black/5 transition-colors text-xs font-bold tracking-widest uppercase text-center"
                  >
                    {currentT.customize}
                  </button>
                  <button
                    onClick={handleDeclineAll}
                    className="px-6 py-2.5 rounded-full border border-black/20 text-black hover:bg-black/5 transition-colors text-xs font-bold tracking-widest uppercase text-center"
                  >
                    {currentT.decline}
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-6 py-2.5 rounded-full bg-black text-white hover:bg-black/80 transition-colors text-xs font-bold tracking-widest uppercase shadow-md text-center"
                  >
                    {currentT.accept}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 md:p-8">
                <h3 className="font-serif text-2xl mb-6 text-black">{currentT.customizeTitle}</h3>
                <div className="space-y-4 mb-8">
                  <label className="flex items-start gap-3 cursor-not-allowed opacity-70">
                    <input type="checkbox" checked disabled className="mt-1 accent-black w-4 h-4" />
                    <span className="text-sm font-medium text-black">{currentT.necessary}</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="mt-1 accent-black w-4 h-4" />
                    <span className="text-sm font-medium text-black">{currentT.functional}</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="mt-1 accent-black w-4 h-4" />
                    <span className="text-sm font-medium text-black">{currentT.analytics}</span>
                  </label>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleSavePreferences}
                    className="px-6 py-2.5 rounded-full bg-black text-white hover:bg-black/80 transition-colors text-xs font-bold tracking-widest uppercase shadow-md"
                  >
                    {currentT.save}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
