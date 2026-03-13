/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { Scale, FileText, BookOpen, ChevronRight, Mail, Phone, Shield, ArrowRight, MapPin, X, Loader2, Download, Upload, File as FileIcon, Users, LogOut, BarChart, Calendar, ChevronDown, Menu, Calculator, Building2, Search } from 'lucide-react';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';
import { claudeGenerate } from './claudeApi';
import * as mammoth from 'mammoth';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { lv, enUS, ru } from 'date-fns/locale';
import { Chatbot } from './components/Chatbot';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { TermsAcceptanceModal } from './components/TermsAcceptanceModal';
import { CookiePolicy } from './components/CookiePolicy';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { Disclaimer } from './components/Disclaimer';
import { DistanceContract } from './components/DistanceContract';

registerLocale('lv', lv);
registerLocale('en', enUS);
registerLocale('ru', ru);

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    className={className}
  >
    {children}
  </motion.div>
);

const documentTypes = [
  { id: 'bridinajums', lv: 'Brīdinājums', en: 'Warning', ru: 'Предупреждение' },
  { id: 'pretenzija', lv: 'Pretenzija', en: 'Claim', ru: 'Претензия' },
  { id: 'iesniegums', lv: 'Iesniegums', en: 'Application', ru: 'Заявление' },
  { id: 'pilnvara', lv: 'Pilnvara', en: 'Power of Attorney', ru: 'Доверенность' },
  { id: 'ligums', lv: 'Līgums', en: 'Contract', ru: 'Договор' },
  { id: 'cits', lv: 'Cits dokuments', en: 'Other document', ru: 'Другой документ' }
];

const courtDocumentTypes = [
  { id: 'prasibas_pieteikums', lv: 'Prasības pieteikums', en: 'Statement of claim', ru: 'Исковое заявление' },
  { id: 'paskaidrojums', lv: 'Paskaidrojums par prasības pieteikumu', en: 'Explanation of the statement of claim', ru: 'Объяснение по исковому заявлению' },
  { id: 'pretprasiba', lv: 'Pretprasības pieteikums', en: 'Counterclaim', ru: 'Встречное исковое заявление' },
  { id: 'apelacija', lv: 'Apelācijas sūdzība', en: 'Appeal', ru: 'Апелляционная жалоба' },
  { id: 'kasacija', lv: 'Kasācijas sūdzība', en: 'Cassation appeal', ru: 'Кассационная жалоба' },
  { id: 'blakus_sudziba', lv: 'Blakus sūdzība', en: 'Ancillary complaint', ru: 'Частная жалоба' },
  { id: 'pieteikums_nodrosinasana', lv: 'Pieteikums par prasības nodrošināšanu', en: 'Application for securing a claim', ru: 'Заявление об обеспечении иска' },
  { id: 'pieteikums_pieradijumi', lv: 'Pieteikums par pierādījumu nodrošināšanu', en: 'Application for securing evidence', ru: 'Заявление об обеспечении доказательств' },
  { id: 'mierizligums', lv: 'Mierizlīgums', en: 'Settlement agreement', ru: 'Мировое соглашение' },
  { id: 'cits', lv: 'Cits dokuments', en: 'Other document', ru: 'Другой документ' }
];

const urActions = [
  { id: 'dibinasana', lv: 'Dibināšana', en: 'Incorporation', ru: 'Учреждение' },
  { id: 'izmainas', lv: 'Izmaiņas', en: 'Changes', ru: 'Изменения' },
  { id: 'likvidacija', lv: 'Likvidācija', en: 'Liquidation', ru: 'Ликвидация' },
  { id: 'cits', lv: 'Cita darbība', en: 'Other action', ru: 'Другое действие' }
];

interface ClarificationQuestion {
  text: string;
  options?: string[];
}

const parseClarificationQuestions = (text: string): ClarificationQuestion[] => {
  return text.split('\n').map(q => {
    const cleanText = q.replace(/^[-*0-9.]+\s*/, '').trim();
    if (!cleanText) return null;
    
    const match = cleanText.match(/^(.*?)\[(.*?)\]\.?$/);
    if (match) {
      return {
        text: match[1].trim(),
        options: match[2].split(',').map(o => o.trim())
      };
    }
    return { text: cleanText };
  }).filter(Boolean) as ClarificationQuestion[];
};

export default function App() {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showUsersAdmin, setShowUsersAdmin] = useState(false);
  const [showOpinionsAdmin, setShowOpinionsAdmin] = useState(false);
  const [showStatsAdmin, setShowStatsAdmin] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [showCookiePolicy, setShowCookiePolicy] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showDistanceContract, setShowDistanceContract] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [question, setQuestion] = useState('');
  const [isEDoc, setIsEDoc] = useState(false);
  const [date, setDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [generatedAnswer, setGeneratedAnswer] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isClarifying, setIsClarifying] = useState(false);
  const [clarificationQuestions, setClarificationQuestions] = useState('');
  const [clarificationAnswer, setClarificationAnswer] = useState('');
  const [clarificationQuestionsList, setClarificationQuestionsList] = useState<ClarificationQuestion[]>([]);
  const [clarificationAnswersList, setClarificationAnswersList] = useState<Record<number, string>>({});
  const [language, setLanguage] = useState<'lv' | 'en' | 'ru'>('lv');
  const [suggestedDocuments, setSuggestedDocuments] = useState<string[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<string>('');
  const [isCustomDocument, setIsCustomDocument] = useState(false);
  const [customDocumentName, setCustomDocumentName] = useState('');
  const [initialDocumentType, setInitialDocumentType] = useState<string>('');
  const [initialCustomDocumentName, setInitialCustomDocumentName] = useState<string>('');
  const [courtDocumentType, setCourtDocumentType] = useState<string>('');
  const [courtCustomDocumentName, setCourtCustomDocumentName] = useState<string>('');
  const [urAction, setUrAction] = useState<string>('');
  const [urActionCustom, setUrActionCustom] = useState<string>('');
  const [isGeneratingDocument, setIsGeneratingDocument] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<string>('');
  const [documentQuestions, setDocumentQuestions] = useState<string[]>([]);
  const [documentAnswers, setDocumentAnswers] = useState<Record<number, string>>({});
  const [documentConversationHistory, setDocumentConversationHistory] = useState<string>('');
  const [isGeneratingDocumentQuestions, setIsGeneratingDocumentQuestions] = useState(false);
  const [hasMultipleScenarios, setHasMultipleScenarios] = useState(false);
  const [isGeneratingRiskAnalysis, setIsGeneratingRiskAnalysis] = useState(false);
  const [generatedRiskAnalysis, setGeneratedRiskAnalysis] = useState<string>('');
  const [showRiskAnalysisModal, setShowRiskAnalysisModal] = useState(false);
  
  const t = {
    lv: {
      title: "JURIDISKAIS ATZINUMS",
      home: "Sākums",
      menu: "Izvēlne",
      services: "Pakalpojumi",
      about: "Par mums",
      contact: "Kontakti",
      users: "Lietotāji",
      opinions: "Sagatavotie dokumenti",
      stats: "Statistika",
      logout: "Iziet",
      login: "Ienākt",
      available: "Pieejams darbam",
      register: "Lūdzu reģistrēties",
      heroTitle1: "Skaidrība",
      heroTitle2: "sarežģītos juridiskos",
      heroTitle3: "jautājumos.",
      heroDesc: "Profesionāli juridiskie atzinumi un dokumentu sagatavošana jūsu sirdsmieram un drošiem lēmumiem. Mēs pārvēršam sarežģītu juridisko valodu skaidrā rīcības plānā.",
      chooseService: "Izvēlēties pakalpojumu",
      dateLabel: "Datums, uz kuru attiecas",
      dateFromLabel: "Datums no",
      dateToLabel: "Datums līdz",
      companyNameLabel: "Juridiskās personas nosaukums",
      companyNamePlaceholder: "Sāciet rakstīt uzņēmuma nosaukumu...",
      countryLabel: "Valsts, kuras normatīvie akti tiek piemēroti",
      countryLatvia: "Latvija",
      close: "Aizvērt",
      cancel: "Atcelt",
      return: "Atgriezties",
      privacy: "Privātuma politika",
      terms: "Lietošanas noteikumi",
      cookiePolicy: "Sīkdatņu politika",
      disclaimer: "Atbildības atruna",
      distanceContract: "Distances līgums",
      suggestedDocsTitle: "Ieteicamie procesuālie dokumenti",
      suggestedDocsDesc: "Pamatojoties uz atzinumu, mēs varam palīdzēt sagatavot šādus dokumentus:",
      otherDocument: "Cits dokuments",
      enterDocumentName: "Ievadiet dokumenta nosaukumu...",
      generateDocBtn: "Sagatavot dokumentu",
      generatingDoc: "Gatavo dokumentu...",
      generatedDocTitle: "Sagatavotais dokuments",
      downloadDocBtn: "Lejupielādēt dokumentu",
      docQuestionsTitle: "Precizējošie jautājumi dokumenta sagatavošanai",
      docAnswersPlaceholder: "Ievadiet atbildes uz jautājumiem šeit...",
      submitDocAnswersBtn: "Iesniegt atbildi",
      generatingDocQuestions: "Sagatavo jautājumus...",
      riskAnalysisTitle: "Risku analīze",
      riskAnalysisDesc: "Šajā situācijā ir iespējami vairāki alternatīvi scenāriji. Mēs varam sagatavot padziļinātu risku analīzi katram no tiem.",
      generateRiskBtn: "Sagatavot risku analīzi",
      generatingRisk: "Gatavo risku analīzi...",
      generatedRiskTitle: "Padziļināta risku analīze",
      downloadRiskBtn: "Lejupielādēt risku analīzi",
      viewRiskAnalysisBtn: "Skatīt risku analīzi",
    },
    en: {
      title: "LEGAL OPINION",
      home: "Home",
      menu: "Menu",
      services: "Services",
      about: "About Us",
      contact: "Contact",
      users: "Users",
      opinions: "Opinions",
      stats: "Statistics",
      logout: "Logout",
      login: "Login",
      available: "Available for new opinion",
      register: "Please register",
      heroTitle1: "Clarity in",
      heroTitle2: "complex legal",
      heroTitle3: "matters.",
      heroDesc: "Professional legal opinions and document preparation for your peace of mind and safe decisions. We turn complex legal language into a clear action plan.",
      chooseService: "Choose a service",
      dateLabel: "Date of reference",
      dateFromLabel: "Date from",
      dateToLabel: "Date to",
      companyNameLabel: "Legal entity name",
      companyNamePlaceholder: "Start typing company name...",
      countryLabel: "Country of applicable laws",
      countryLatvia: "Latvia",
      close: "Close",
      cancel: "Cancel",
      return: "Return",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      cookiePolicy: "Cookie Policy",
      disclaimer: "Disclaimer",
      distanceContract: "Distance Contract",
      suggestedDocsTitle: "Suggested procedural documents",
      suggestedDocsDesc: "Based on the opinion, we can help prepare the following documents:",
      otherDocument: "Other document",
      enterDocumentName: "Enter document name...",
      generateDocBtn: "Generate document",
      generatingDoc: "Generating document...",
      generatedDocTitle: "Generated document",
      downloadDocBtn: "Download document",
      docQuestionsTitle: "Clarifying questions for document preparation",
      docAnswersPlaceholder: "Enter your answers here...",
      submitDocAnswersBtn: "Submit answer",
      generatingDocQuestions: "Generating questions...",
      riskAnalysisTitle: "Risk Analysis",
      riskAnalysisDesc: "Multiple alternative scenarios are possible in this situation. We can prepare an in-depth risk analysis for each of them.",
      generateRiskBtn: "Generate risk analysis",
      generatingRisk: "Generating risk analysis...",
      generatedRiskTitle: "In-depth risk analysis",
      downloadRiskBtn: "Download risk analysis",
      viewRiskAnalysisBtn: "View risk analysis",
    },
    ru: {
      title: "ЮРИДИЧЕСКОЕ ЗАКЛЮЧЕНИЕ",
      home: "Главная",
      menu: "Меню",
      services: "Услуги",
      about: "О нас",
      contact: "Контакты",
      users: "Пользователи",
      opinions: "Заключения",
      stats: "Статистика",
      logout: "Выйти",
      login: "Войти",
      available: "Доступен для нового заключения",
      register: "Пожалуйста, зарегистрируйтесь",
      heroTitle1: "Ясность в",
      heroTitle2: "сложных юридических",
      heroTitle3: "вопросах.",
      heroDesc: "Профессиональные юридические заключения и подготовка документов для вашего спокойствия и безопасных решений. Мы превращаем сложный юридический язык в четкий план действий.",
      chooseService: "Выбрать услугу",
      dateLabel: "Дата, к которой относится",
      dateFromLabel: "Дата с",
      dateToLabel: "Дата по",
      companyNameLabel: "Название юридического лица",
      companyNamePlaceholder: "Начните вводить название компании...",
      countryLabel: "Страна применимого права",
      countryLatvia: "Латвия",
      close: "Закрыть",
      cancel: "Отмена",
      return: "Вернуться",
      privacy: "Политика конфиденциальности",
      terms: "Условия использования",
      cookiePolicy: "Политика использования файлов cookie",
      disclaimer: "Отказ от ответственности",
      distanceContract: "Дистанционный договор",
      suggestedDocsTitle: "Рекомендуемые процессуальные документы",
      suggestedDocsDesc: "На основании заключения мы можем помочь подготовить следующие документы:",
      otherDocument: "Другой документ",
      enterDocumentName: "Введите название документа...",
      generateDocBtn: "Подготовить документ",
      generatingDoc: "Подготовка документа...",
      generatedDocTitle: "Подготовленный документ",
      downloadDocBtn: "Скачать документ",
      docQuestionsTitle: "Уточняющие вопросы для подготовки документа",
      docAnswersPlaceholder: "Введите ответы на вопросы здесь...",
      submitDocAnswersBtn: "Отправить ответ",
      generatingDocQuestions: "Подготовка вопросов...",
      riskAnalysisTitle: "Анализ рисков",
      riskAnalysisDesc: "В данной ситуации возможны несколько альтернативных сценариев. Мы можем подготовить углубленный анализ рисков для каждого из них.",
      generateRiskBtn: "Подготовить анализ рисков",
      generatingRisk: "Подготовка анализа рисков...",
      generatedRiskTitle: "Углубленный анализ рисков",
      downloadRiskBtn: "Скачать анализ рисков",
      viewRiskAnalysisBtn: "Посмотреть анализ рисков",
    }
  };

  // Auth state
  const [user, setUser] = useState<{email: string, token: string, firstName?: string, lastName?: string} | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [loginError, setLoginError] = useState('');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [opinionsList, setOpinionsList] = useState<any[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAboutMenuOpen, setIsAboutMenuOpen] = useState(false);
  const [isServicesMenuOpen, setIsServicesMenuOpen] = useState(false);
  const [calculatorMode, setCalculatorMode] = useState<'manual' | 'files'>('manual');
  const [calcPrincipal, setCalcPrincipal] = useState('');
  const [calcDueDate, setCalcDueDate] = useState<Date | null>(null);
  const [calcInterestRate, setCalcInterestRate] = useState('');
  const [calcPenaltyRate, setCalcPenaltyRate] = useState('');
  const [companySuggestions, setCompanySuggestions] = useState<Array<{original: string, officialName: string, regNumber: string}>>([]);
  const [isSearchingCompanies, setIsSearchingCompanies] = useState(false);
  const [companyNameField, setCompanyNameField] = useState('');
  const [companySearchSuggestions, setCompanySearchSuggestions] = useState<Array<{officialName: string, regNumber: string}>>([]);
  const [isSearchingCompanyField, setIsSearchingCompanyField] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const companyDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
      
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target as Node)) {
        setShowCompanyDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);
  const [isStampModalOpen, setIsStampModalOpen] = useState(false);
  const [viewingOpinion, setViewingOpinion] = useState<any>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (question.length > 10) {
        checkForCompanies(question);
      } else {
        setCompanySuggestions([]);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [question]);

  const checkForCompanies = async (text: string) => {
    setIsSearchingCompanies(true);
    try {
      const responseText = await claudeGenerate(
        `Analizē šo tekstu un atrodi tajā minētos Latvijas uzņēmumu nosaukumus (SIA, AS, IK, ZS utt.).
Izmanto Google Search, lai atrastu to precīzus oficiālos nosaukumus un reģistrācijas numurus.
Ja uzņēmumi nav minēti, atgriez tukšu masīvu.
Teksts: "${text}"`,
        { webSearch: true, maxTokens: 4000 }
      );
      
      if (responseText) {
        const suggestions = JSON.parse(responseText);
        const validSuggestions = suggestions.filter((s: any) => 
          s.original && s.officialName && s.regNumber && text.includes(s.original)
        );
        setCompanySuggestions(validSuggestions);
      }
    } catch (error) {
      console.error("Error checking for companies:", error);
    } finally {
      setIsSearchingCompanies(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (companyNameField.length >= 3 && showCompanyDropdown) {
        searchCompanyField(companyNameField);
      } else {
        setCompanySearchSuggestions([]);
      }
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [companyNameField, showCompanyDropdown]);

  const searchCompanyField = async (text: string) => {
    setIsSearchingCompanyField(true);
    try {
      const responseText = await claudeGenerate(
        `Atrodi Latvijas uzņēmumus, kuru nosaukums ir līdzīgs "${text}".
Izmanto Google Search, lai atrastu to precīzus oficiālos nosaukumus un reģistrācijas numurus.
Atgriez līdz 5 variantiem. Ja neatrodi nevienu, atgriez tukšu masīvu.`,
        { webSearch: true, maxTokens: 4000 }
      );
      
      if (responseText) {
        const suggestions = JSON.parse(responseText);
        const validSuggestions = suggestions.filter((s: any) => 
          s.officialName && s.regNumber
        );
        setCompanySearchSuggestions(validSuggestions);
      }
    } catch (error) {
      console.error("Error searching companies:", error);
    } finally {
      setIsSearchingCompanyField(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleAcceptTerms = () => {
    setHasAcceptedTerms(true);
  };

  const isAdmin = user?.email?.toLowerCase() === 'ivars.bajars@gmail.com' || user?.email?.toLowerCase() === 'ivars.bajārs@gmail.com';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
      const body = isRegistering 
        ? { email: loginEmail, password: loginPassword, firstName: registerFirstName, lastName: registerLastName }
        : { email: loginEmail, password: loginPassword };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error('Servera kļūda (nevarēja nolasīt atbildi)');
      }

      if (!res.ok) throw new Error(data.error || 'Autentifikācijas kļūda');
      
      const userData = { email: data.user.email, token: data.token, firstName: data.user.firstName, lastName: data.user.lastName };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setIsLoginModalOpen(false);
      setLoginEmail('');
      setLoginPassword('');
      setRegisterFirstName('');
      setRegisterLastName('');
    } catch (err: any) {
      setLoginError(err.message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setShowUsersAdmin(false);
    setShowOpinionsAdmin(false);
    setShowStatsAdmin(false);
  };

  const fetchUsers = async () => {
    if (!user || !isAdmin) return;
    try {
const res = await fetch('https://juridiskie-atzinumi-api.onrender.com/api/users', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const fetchOpinions = async () => {
    if (!user) return;
    try {
      const res = await fetch('https://juridiskie-atzinumi-api.onrender.com/api/opinions', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${user.token}`,
    'Content-Type': 'application/json',
  }
});
      if (res.ok) {
        const data = await res.json();
        setOpinionsList(data);
      }
    } catch (err) {
      console.error('Failed to fetch opinions', err);
    }
  };

  useEffect(() => {
    if (showUsersAdmin && isAdmin) {
      fetchUsers();
    }
  }, [showUsersAdmin, isAdmin]);

  useEffect(() => {
    if ((showOpinionsAdmin || showStatsAdmin) && user) {
      fetchOpinions();
    }
  }, [showOpinionsAdmin, showStatsAdmin, user]);

  const userStats = useMemo(() => {
    if (!opinionsList) return [];
    const statsMap = new Map<string, any>();
    
    opinionsList.forEach(op => {
      const userKey = op.email;
      if (!statsMap.has(userKey)) {
        statsMap.set(userKey, {
          email: op.email,
          firstName: op.first_name,
          lastName: op.last_name,
          total: 0,
          byType: {},
          documents: {}
        });
      }
      const userStat = statsMap.get(userKey);
      userStat.total += 1;
      userStat.byType[op.service_type] = (userStat.byType[op.service_type] || 0) + 1;
      
      if (!userStat.documents[op.service_type]) {
        userStat.documents[op.service_type] = [];
      }
      userStat.documents[op.service_type].push(op);
    });
    
    return Array.from(statsMap.values()).sort((a: any, b: any) => b.total - a.total);
  }, [opinionsList]);

  const saveOpinion = async (serviceType: string, questionText: string, answer: string) => {
    if (!user) return;
    try {
      fetch('https://juridiskie-atzinumi-api.onrender.com/api/opinions'
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          serviceType,
          question: questionText,
          generatedAnswer: answer
        })
      });
    } catch (err) {
      console.error('Failed to save opinion', err);
    }
  };

  const openModal = (service: string) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    setSelectedService(service);
    setIsModalOpen(true);
    setQuestion('');
    setCompanyNameField('');
    setDate(new Date());
    setEndDate(null);
    setIsProcessing(false);
    setIsComplete(false);
    setGeneratedAnswer('');
    setAttachedFiles([]);
    setSuggestedDocuments([]);
    setSelectedDocument('');
    setIsGeneratingDocument(false);
    setGeneratedDocument('');
    setDocumentQuestions([]);
    setDocumentAnswers({});
    setIsGeneratingDocumentQuestions(false);
    setInitialDocumentType('');
    setInitialCustomDocumentName('');
    setCourtDocumentType('');
    setCourtCustomDocumentName('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]);
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  useEffect(() => {
    if (isComplete && selectedService !== 'Vienkāršots atzinums' && generatedAnswer && suggestedDocuments.length === 0 && !isGeneratingDocument && !generatedDocument && !hasMultipleScenarios && !generatedRiskAnalysis) {
      const fetchSuggestions = async () => {
        try {
          const promptLanguage = language === 'en' ? 'angļu' : language === 'ru' ? 'krievu' : 'latviešu';
          const prompt = `Analizē šo juridisko atzinumu. 
1. Ja situācija paredz tālākas procesuālas darbības (piemēram, prasības pieteikums, brīdinājums, līgums, iesniegums iestādei), uzskaiti šo dokumentu nosaukumus.
2. Novērtē, vai jautājuma analīze paredz vairākus alternatīvus scenārijus, kur būtu noderīga padziļināta risku analīze (true/false).

SVARĪGI: Ja atzinums ir "Padziļināts atzinums", tev OBLIGĀTI jāpiedāvā vismaz viens atbilstošs dokuments, ko klients varētu vēlēties sagatavot šajā situācijā (pat ja tas ir tikai vispārīgs iesniegums vai pretenzija).

Atgriez TIKAI derīgu JSON objektu šādā formātā:
{
  "suggestedDocuments": ["dokuments 1", "dokuments 2"],
  "hasMultipleScenarios": true
}
Dokumentu nosaukumiem jābūt ${promptLanguage} valodā. Ja dokumenti nav nepieciešami (un tas nav Padziļināts atzinums), atgriez tukšu masīvu []. Neiekļauj nekādu citu tekstu vai formatējumu.
Atzinums:
${generatedAnswer}`;

          const responseText = await claudeGenerate(
            prompt,
            { webSearch: false, maxTokens: 4000 }
          );

          const text = responseText || '{}';
          const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
          const result = JSON.parse(cleanText);
          
          if (result.suggestedDocuments && Array.isArray(result.suggestedDocuments) && result.suggestedDocuments.length > 0) {
            setSuggestedDocuments(result.suggestedDocuments);
          }
          if (result.hasMultipleScenarios === true) {
            setHasMultipleScenarios(true);
          }
        } catch (error) {
          console.error("Error fetching document suggestions:", error);
        }
      };
      fetchSuggestions();
    }
  }, [isComplete, selectedService, generatedAnswer]);

  const generateDocumentQuestions = async (history: string = '') => {
    const docToGenerate = isCustomDocument ? customDocumentName : selectedDocument;
    if (!docToGenerate) return;
    setIsGeneratingDocumentQuestions(true);
    try {
      const promptLanguage = language === 'en' ? 'angļu' : language === 'ru' ? 'krievu' : 'latviešu';
      const prompt = `Tu esi profesionāls jurists. Klients vēlas sagatavot šādu procesuālo dokumentu: "${docToGenerate}".
Pirms dokumenta sagatavošanas, lūdzu, noskaidro visu nepieciešamo informāciju (piemēram, vārds, uzvārds, personas kods, adrese, summa, datumi, utt.), kas nepieciešama dokumenta aizpildīšanai.
SVARĪGI: Ja klients norāda juridiskas personas nosaukumu, OBLIGĀTI izmanto meklēšanu (googleSearch), lai atrastu tās reģistrācijas numuru un juridisko adresi no Uzņēmumu reģistra (ur.gov.lv) vai citiem publiskiem reģistriem (firmas.lv, lursoft.lv). Neprasi šos datus klientam, ja vari tos atrast pats.
Sagatavo sarakstu ar visiem precizējošiem jautājumiem.
Jautājumus uzdod precīzi, bet vienkāršā ${promptLanguage} valodā, ar piemēriem.
Kad ir ierobežota variantu izvēle, tad dod klientam iespēju izvēlēties piemērotāko. Ja variantu ir daudz, tad paredzi iespēju, ka klients attiecīgo informāciju aizpilda pats.
Neatstāj laukus tukšus turpmākajā dokumentā, tāpēc noskaidro visu nepieciešamo tagad.

SVARĪGI: Atgriez atbildi TIKAI kā JSON masīvu ar jautājumiem. Piemērs:
["Kāds ir jūsu vārds un uzvārds?", "Kāds ir jūsu personas kods?", "Kāda ir prasījuma summa?"]
Ja tev jau ir visa nepieciešamā informācija, atgriez tukšu masīvu: []

Klienta situācija:
${question}

Juridiskais atzinums:
${generatedAnswer}

Līdzšinējā sarakste par dokumentu:
${history}`;

      const responseText = await claudeGenerate(
        prompt,
        { webSearch: true, maxTokens: 4000 }
      );

      const answerText = responseText || "[]";
      const questions = JSON.parse(answerText);
      
      if (!Array.isArray(questions) || questions.length === 0) {
        setDocumentQuestions([]);
        generateFinalProceduralDocument(history);
      } else {
        setDocumentQuestions(questions);
        setDocumentAnswers({});
      }
    } catch (error) {
      console.error("Error generating document questions:", error);
      setDocumentQuestions(["Radās kļūda, sagatavojot jautājumus."]);
    }
    setIsGeneratingDocumentQuestions(false);
  };

  const generateFinalProceduralDocument = async (history: string) => {
    const docToGenerate = isCustomDocument ? customDocumentName : selectedDocument;
    if (!docToGenerate) return;
    setIsGeneratingDocument(true);
    try {
      const promptLanguage = language === 'en' ? 'angļu' : language === 'ru' ? 'krievu' : 'latviešu';
      
      const isUR = selectedService === 'Dokumentu sagatavošana UR';
      const isCourt = selectedService === 'Dokumenti tiesai';
      
      let prompt = `Tu esi profesionāls jurists. Pamatojoties uz šo klienta situāciju, iepriekš sniegto juridisko atzinumu un klienta sniegtajām atbildēm uz precizējošiem jautājumiem, sagatavo pieprasīto procesuālo dokumentu: "${docToGenerate}".
Dokumentam jābūt ${promptLanguage} valodā.
Izmanto formālu, juridiski precīzu valodu.
Neiekļauj nekādus paskaidrojumus vai ievadvārdus, atgriez tikai pašu dokumenta tekstu.
Iekļauj klienta sniegto informāciju dokumentā. Ja kāda informācija joprojām trūkst, izmanto kvadrātiekavas, piemēram, [Vārds Uzvārds] vai [Summa].
SVARĪGI: Ja klients norāda juridiskas personas nosaukumu, OBLIGĀTI izmanto meklēšanu (googleSearch), lai atrastu tās reģistrācijas numuru un juridisko adresi no Uzņēmumu reģistra (ur.gov.lv) vai citiem publiskiem reģistriem (firmas.lv, lursoft.lv), un automātiski iekļauj šos rekvizītus dokumentā.

SVARĪGI DOKUMENTU NOFORMĒŠANAS NOTEIKUMI:
Visus sagatavotos dokumentus noformē STINGRI atbilstoši Tieslietu ministrijas "Dokumentu noformēšanas vadlīnijas" (https://www.tm.gov.lv/sites/tm/files/dokumentu20noformesanas20vadlinijas1_0.pdf) un MK noteikumiem Nr. 558 "Dokumentu izstrādāšanas un noformēšanas kārtība"${isCourt ? ' un Civilprocesa likuma prasībām' : ''}. Ievēro pareizu rekvizītu izvietojumu (dokumenta autors, adresāts, datums, dokumenta nosaukums, teksts, paraksts). SVARĪGI: Formatējot dokumentu, adresātu un iesniedzēju (sūtītāju) OBLIGĀTI raksti labajā dokumenta pusē (izmanto vismaz 15 atstarpes pirms katras rindas, lai nobīdītu tekstu pa labi). Dokumentiem jābūt vizuāli viegli uztveramiem un profesionāli noformētiem.
NEIZMANTO NEKĀDUS Markdown simbolus (zvaigznītes *, restītes #, pasvītrojumus _). Dokumentam jābūt kā absolūti tīram tekstam (plain text). Virsrakstus raksti ar LIELAJIEM BURTIEM.
${isUR ? 'SVARĪGI UR VEIDLAPĀM: Atrodi un iekļauj tiešo saiti uz atbilstošo veidlapu (docx/pdf) no www.ur.gov.lv. Pēc tam pilnībā aizpildi šo veidlapu ar klienta sniegto informāciju, maksimāli precīzi saglabājot tās oriģinālo struktūru, punktu numerāciju un laukus. Nodod klientam gatavu, aizpildītu rezultātu.' : ''}
${isEDoc ? 'SVARĪGI PARAKSTAM: Klients ir izvēlējies dokumentu parakstīt elektroniski. Dokumenta beigās fiziska paraksta atšifrējuma un vietas vietā OBLIGĀTI iekļauj tekstu "DOKUMENTS IR PARAKSTĪTS AR DROŠU ELEKTRONISKO PARAKSTU UN SATUR LAIKA ZĪMOGU".' : 'SVARĪGI PARAKSTAM: Klients ir izvēlējies dokumentu parakstīt pašrocīgi. Dokumenta beigās OBLIGĀTI paredzi vietu fiziskam parakstam, datumam un paraksta atšifrējumam.'}
Ja tiek gatavota "Pilnvara", OBLIGĀTI izmanto šādu sagatavi un aizpildi to ar klienta informāciju, saglabājot tās struktūru:
PILNVARA
Pilnvaras devējs:
[Vārds Uzvārds / Uzņēmuma nosaukums]
[Personas kods / Reģistrācijas Nr.]
[Adrese]
Pilnvarotā persona:
[Vārds Uzvārds]
[Personas kods]
[Adrese]
Ar šo es, augstāk norādītais pilnvaras devējs, pilnvaroju augstāk norādīto pilnvaroto personu manā vārdā un interesēs veikt šādas darbības:
1. Pārstāvēt mani valsts un pašvaldību iestādēs, kā arī citās institūcijās.
2. Iesniegt un saņemt dokumentus, iesniegumus, izziņas un citu informāciju.
3. Parakstīt nepieciešamos dokumentus saistībā ar šīs pilnvaras izpildi.
4. Veikt citas darbības, kas nepieciešamas pilnvarā noteikto uzdevumu izpildei.
[Pievieno papildu darbības, ja klients to ir norādījis]
Pilnvarotajai personai ir tiesības veikt visas nepieciešamās darbības, lai pienācīgi pārstāvētu pilnvaras devēja intereses, ciktāl tas nepieciešams šajā pilnvarā noteikto uzdevumu izpildei.
Pilnvaras izsniegšanas vieta: [Pilsēta]
Datums: [DD.MM.GGGG]
Pilnvaras devējs:
[Vārds Uzvārds]
Paraksts: __________________________
Pilnvarotā persona:
[Vārds Uzvārds]
Paraksts: __________________________
Piezīme: Ja nepieciešams, pilnvara var tikt apliecināta pie notāra saskaņā ar Latvijas Republikas normatīvajiem aktiem.

Ja tiek gatavots "Prasības pieteikums", OBLIGĀTI ievēro šādu struktūru:
1. Tiesas nosaukums un adrese (augšējā labajā stūrī vai centrēti).
2. Prasītāja, Pārstāvja un Atbildētāja rekvizīti (vārds/nosaukums, reģ.nr./p.k., adrese, e-pasts).
3. Dokumenta nosaukums: "PRASĪBAS PIETEIKUMS par [priekšmets]".
4. Sastādīšanas vieta un datums.
5. Sadaļa "1. KOPSAVILKUMS".
6. Sadaļa "2. FAKTISKO APSTĀKĻU IZKLĀSTS" (ar apakšpunktiem 2.1., 2.2. utt.).
7. Sadaļa "3. JURIDISKIE APSVĒRUMI UN FAKTISKO APSTĀKĻU NOVĒRTĒJUMS TIESĪBU NORMĀS" (ar apakšpunktiem 3.1., 3.2. utt.).
8. Sadaļa "4. PROCESUĀLIE JAUTĀJUMI" (t.sk. 4.1. Prasības summa un valsts nodeva, 4.2. Mediācija, 4.3. Kredītiestādes nosaukums un konta numurs).
9. Sadaļa "5. PRASĪJUMS" (sākas ar vārdu "Lūdzu:" un konkrētu prasījumu uzskaitījumu).
10. Paraksta daļa ("Ar cieņu, [Vārds Uzvārds]").
11. Pielikumu saraksts.

Klienta situācija:
${question}

Juridiskais atzinums:
${generatedAnswer}

Sarakste ar klientu (jautājumi un atbildes):
${history}`;
      const responseText = await claudeGenerate(
        prompt,
        { webSearch: false, maxTokens: 4000 }
      );

      const docText = responseText || "Neizdevās sagatavot dokumentu.";
      setGeneratedDocument(docText);
      await saveOpinion(`Dokuments: ${docToGenerate}`, question, docText);
    } catch (error) {
      console.error("Error generating document:", error);
      setGeneratedDocument("Radās kļūda, gatavojot dokumentu.");
    }
    setIsGeneratingDocument(false);
  };

  const handleDocumentClarificationSubmit = async () => {
    if (Object.keys(documentAnswers).length === 0) return;
    
    let newHistory = documentConversationHistory;
    documentQuestions.forEach((q, i) => {
      if (documentAnswers[i]) {
        newHistory += `\n\nJautājums: ${q}\nAtbilde: ${documentAnswers[i]}`;
      }
    });
    
    setDocumentConversationHistory(newHistory);
    setDocumentAnswers({});
    
    await generateDocumentQuestions(newHistory);
  };
  const downloadGeneratedDocument = async () => {
    const docToGenerate = isCustomDocument ? customDocumentName : selectedDocument;
    const doc = new Document({
      sections: [{
        properties: {},
        children: generatedDocument.split('\n').map(line => new Paragraph({ text: line }))
      }]
    });
    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docToGenerate.replace(/\s+/g, '_')}.docx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateRiskAnalysis = async () => {
    setIsGeneratingRiskAnalysis(true);
    try {
      const promptLanguage = language === 'en' ? 'angļu' : language === 'ru' ? 'krievu' : 'latviešu';
      const prompt = `Tu esi profesionāls jurists. Pamatojoties uz šo klienta situāciju un iepriekš sniegto juridisko atzinumu, sagatavo padziļinātu risku analīzi visiem iespējamajiem alternatīvajiem scenārijiem.
Analīzei jābūt ${promptLanguage} valodā.
Izmanto formālu, juridiski precīzu, bet viegli lasāmu un uztveramu valodu.
Strukturē analīzi, apskatot katru scenāriju atsevišķi, norādot tā plusus, mīnusus, iespējamos riskus un to iestāšanās varbūtību, kā arī ieteikumus risku mazināšanai.
Lūdzu, NEIZMANTO pārmērīgu formatēšanu (piemēram, izvairies no zvaigznītēm * treknrakstam vai slīprakstam). Tekstam jābūt vizuāli viegli uztveramam, tīram, profesionāli noformētam un atbilstošam dokumentu noformēšanas noteikumiem.

Klienta situācija:
${question}

Juridiskais atzinums:
${generatedAnswer}`;

      const responseText = await claudeGenerate(
        prompt,
        { webSearch: false, maxTokens: 4000 }
      );

      const riskText = responseText || "Neizdevās sagatavot risku analīzi.";
      setGeneratedRiskAnalysis(riskText);
      await saveOpinion('Risku analīze', question, riskText);
      setShowRiskAnalysisModal(true);
    } catch (error) {
      console.error("Error generating risk analysis:", error);
      setGeneratedRiskAnalysis("Radās kļūda, gatavojot risku analīzi.");
    }
    setIsGeneratingRiskAnalysis(false);
  };

  const downloadRiskAnalysis = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: generatedRiskAnalysis.split('\n').map(line => new Paragraph({ text: line }))
      }]
    });
    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Risku_analize.docx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateOpinion = async (currentQuestion: string) => {
    setIsProcessing(true);

    if (selectedService === 'Vienkāršots atzinums') {
      try {
        const promptLanguage = language === 'en' ? 'angļu' : language === 'ru' ? 'krievu' : 'latviešu';
        
        const prompt = `Tu esi jurists, kas sagatavo vienkāršotu juridisko atzinumu.
Raksti ${promptLanguage} valodā, profesionāli, skaidri un viegli lasāmi.
Izvairies no pārmērīgas formatēšanas (neizmanto zvaigznītes * treknrakstam vai slīprakstam, lai teksts būtu tīrs, profesionāls un viegli uztverams). Dokumentus noformē atbilstoši dokumentu noformēšanas noteikumiem.
Atzinumu balsti uz normatīvajiem aktiem (Satversme/ES tiesības/likumi/MK noteikumi u.c.).
Aizliegts: judikatūra, iestāžu prakse/vadlīnijas, mediju avoti, "parasti tiesas saka...", tiesību teorija.

SVARĪGI: Pirms gatavo atzinumu, izvērtē, vai tev ir pietiekami daudz informācijas. Ja trūkst būtisku faktu, lai sniegtu precīzu un kvalitatīvu atbildi, NEVEIDO atzinumu, bet gan uzdod visus nepieciešamos papildu jautājumus vienkāršā, klientam saprotamā valodā.
SVARĪGI: Ja klients norāda juridiskas personas nosaukumu, OBLIGĀTI izmanto meklēšanu (googleSearch), lai atrastu tās reģistrācijas numuru un juridisko adresi no Uzņēmumu reģistra (ur.gov.lv) vai citiem publiskiem reģistriem (firmas.lv, lursoft.lv), un automātiski iekļauj šos rekvizītus atzinumā.
Ja izvēlies uzdot jautājumus, OBLIGĀTI sāc savu atbildi TIEŠI ar vārdiem "JAUTĀJUMI KLIENTAM:" un uzskaiti visus nepieciešamos jautājumus, katru jaunā rindā, sākot ar "- ". Ja jautājumam ir tikai daži iespējamie atbilžu varianti, OBLIGĀTI norādi tos kvadrātiekavās aiz jautājuma, atdalītus ar komatu (piemēram: "- Vai vēlaties parakstīt elektroniski? [Jā, Nē]").
Ja informācijas pietiek, sagatavo atzinumu, izmantojot tieši šādu struktūru:

JURIDISKAIS ATZINUMS (Vienkāršots)
Normatīvie akti

1. FAKTI UN PIEŅĒMUMI
(Īsi apraksti klienta situāciju un pieņēmumus)

2. NORMATĪVAIS REGULĒJUMS
(Norādi spēkā esošos normatīvos aktus uz norādīto datumu, kas attiecas uz šo situāciju)

3. NORMU PIEMĒROŠANA UN ANALĪZE
(Analizē situāciju, piemērojot minētās normas, un sniedz atbildi uz klienta jautājumu)

4. SECINĀJUMI
(Īsi un konkrēti secinājumi un rekomendācijas)

Klienta jautājums: ${currentQuestion}
${companyNameField ? `Juridiskās personas nosaukums: ${companyNameField}` : ''}
Datums, uz kuru attiecas atzinums: ${date ? date.toLocaleDateString('lv-LV') : ''}${endDate ? ' - ' + endDate.toLocaleDateString('lv-LV') : ''} (Lūdzu, visur atzinumā atspoguļo šo datumu un citus datumus formātā DD.MM.YYYY, piemēram, 31.12.2023)`;

        const responseText = await claudeGenerate(
          prompt,
          { webSearch: true, maxTokens: 4000 }
        );

        const answer = responseText || "Neizdevās ģenerēt atbildi. Lūdzu, mēģiniet vēlreiz.";
        
        if (answer.startsWith("JAUTĀJUMI KLIENTAM:") || answer.startsWith("JAUTĀJUMS KLIENTAM:")) {
          const questionsText = answer.replace(/JAUTĀJUM[IS] KLIENTAM:/, "").trim();
          const questionsList = parseClarificationQuestions(questionsText);
          setClarificationQuestionsList(questionsList);
          setClarificationQuestions(questionsText);
          setIsClarifying(true);
          setIsProcessing(false);
          return;
        }

        setGeneratedAnswer(answer);
        if (responseText) {
          await saveOpinion(selectedService, currentQuestion, answer);
        }
      } catch (error: any) {
        console.error("Error generating opinion:", error);
        setGeneratedAnswer("Radās kļūda, sazinoties ar sistēmu. Lūdzu, mēģiniet vēlreiz vēlāk. Kļūda: " + (error.message || JSON.stringify(error)));
      }
    } else if (selectedService.startsWith('Dokumentu sagatavošana') || selectedService === 'Dokumenti tiesai') {
      try {
        const promptLanguage = language === 'en' ? 'angļu' : language === 'ru' ? 'krievu' : 'latviešu';
        
        const isUR = selectedService === 'Dokumentu sagatavošana UR';
        
        let docTypeName = '';
        if (isUR) {
          const actionObj = urActions.find(a => a.id === urAction);
          docTypeName = urAction === 'cits' ? urActionCustom : (actionObj ? actionObj.lv : 'Nezināma darbība');
        } else if (selectedService === 'Dokumenti tiesai') {
          const docTypeObj = courtDocumentTypes.find(d => d.id === courtDocumentType);
          docTypeName = courtDocumentType === 'cits' ? courtCustomDocumentName : (docTypeObj ? docTypeObj.lv : 'Nezināms dokuments');
        } else {
          const docTypeObj = documentTypes.find(d => d.id === initialDocumentType);
          docTypeName = initialDocumentType === 'cits' ? initialCustomDocumentName : (docTypeObj ? docTypeObj.lv : 'Nezināms dokuments');
        }
        
        let promptText = '';
        if (isUR) {
          promptText = `Tu esi pieredzējis jurists. Klients lūdz sagatavot dokumentus šādai darbībai LR Uzņēmumu reģistrā: "${docTypeName}".
Raksti ${promptLanguage} valodā, profesionāli, skaidri un atbilstoši juridiskajiem standartiem un LR Uzņēmumu reģistra prasībām.
Visus sagatavotos dokumentus noformē STINGRI atbilstoši Tieslietu ministrijas "Dokumentu noformēšanas vadlīnijas" (https://www.tm.gov.lv/sites/tm/files/dokumentu20noformesanas20vadlinijas1_0.pdf) un MK noteikumiem Nr. 558 "Dokumentu izstrādāšanas un noformēšanas kārtība". Ievēro pareizu rekvizītu izvietojumu. SVARĪGI: Formatējot dokumentu, adresātu un iesniedzēju (sūtītāju) OBLIGĀTI raksti labajā dokumenta pusē (izmanto vismaz 15 atstarpes pirms katras rindas). Dokumentiem jābūt vizuāli viegli uztveramiem un profesionāli noformētiem. NEIZMANTO NEKĀDUS Markdown simbolus (zvaigznītes *, restītes #, pasvītrojumus _). Dokumentam jābūt kā absolūti tīram tekstam (plain text). Virsrakstus raksti ar LIELAJIEM BURTIEM. Savukārt veidlapas - atrodi un iekļauj tiešo saiti uz atbilstošo veidlapu (docx/pdf) no www.ur.gov.lv, un pēc tam pilnībā aizpildi to ar klienta sniegto informāciju, maksimāli precīzi saglabājot tās oriģinālo struktūru, punktu numerāciju un laukus. Nodod klientam gatavu, aizpildītu rezultātu.
Visu informāciju, paraugus un norādījumus OBLIGĀTI meklē vietnē www.ur.gov.lv. 
ĪPAŠI SVARĪGI: Visus datus, ko atlasi no www.ur.gov.lv, OBLIGĀTI pārliecinies, vai tie ir aktuāli šodien! Pārbaudi valsts nodevu apmērus, rekvizītus, veidlapu paraugus un procedūras, izmantojot meklēšanu, lai apstiprinātu to aktualitāti.

Pirms dokumentu gatavošanas, izvērtē, vai tev ir pietiekami daudz informācijas. Ja trūkst būtisku faktu (piemēram, pušu rekvizīti, summas, datumi, pamatkapitāls utt.), NEVEIDO dokumentus, bet gan uzdod klientam visus nepieciešamos jautājumus, kas nepieciešami, lai sagatavotu attiecīgos dokumentus, vai prasi pievienot attiecīgos dokumentus. Jautājumus uzdod vienkāršā, klientam saprotamā valodā.
SVARĪGI: Ja klients norāda juridiskas personas nosaukumu, OBLIGĀTI izmanto meklēšanu (googleSearch), lai atrastu tās reģistrācijas numuru un juridisko adresi no Uzņēmumu reģistra (ur.gov.lv) vai citiem publiskiem reģistriem (firmas.lv, lursoft.lv), un automātiski iekļauj šos rekvizītus dokumentos. Neprasi šos datus klientam, ja vari tos atrast pats.
Ja izvēlies uzdot jautājumus, OBLIGĀTI sāc savu atbildi TIEŠI ar vārdiem "JAUTĀJUMI KLIENTAM:" un uzskaiti visus nepieciešamos jautājumus, katru jaunā rindā, sākot ar "- ". Ja jautājumam ir tikai daži iespējamie atbilžu varianti, OBLIGĀTI norādi tos kvadrātiekavās aiz jautājuma, atdalītus ar komatu (piemēram: "- Vai vēlaties parakstīt elektroniski? [Jā, Nē]").

Ja informācijas pietiek, sagatavo atbildi, izmantojot tieši šādu struktūru (kā pie atzinumu sagatavošanas):

JURIDISKAIS ATZINUMS UN DOKUMENTU PROJEKTI

1. FAKTI UN PIEŅĒMUMI
(Īsi apraksti klienta situāciju un pieņēmumus)

2. NORĀDĪJUMI UN PRASĪBAS (no www.ur.gov.lv)
(Apraksti, kādi dokumenti ir nepieciešami, kādas ir valsts nodevas un citi nosacījumi)

3. DOKUMENTU PROJEKTI
(Sagatavo nepieciešamo dokumentu tekstus, pilnībā gatavus parakstīšanai. Visus sagatavotos dokumentus noformē STINGRI atbilstoši Tieslietu ministrijas "Dokumentu noformēšanas vadlīnijas" (https://www.tm.gov.lv/sites/tm/files/dokumentu20noformesanas20vadlinijas1_0.pdf) un MK noteikumiem Nr. 558 "Dokumentu izstrādāšanas un noformēšanas kārtība". Ievēro pareizu rekvizītu izvietojumu. SVARĪGI: Formatējot dokumentu, adresātu un iesniedzēju (sūtītāju) OBLIGĀTI raksti labajā dokumenta pusē (izmanto vismaz 15 atstarpes pirms katras rindas). Dokumentiem jābūt vizuāli viegli uztveramiem un profesionāli noformētiem. NEIZMANTO NEKĀDUS Markdown simbolus (zvaigznītes *, restītes #, pasvītrojumus _). Dokumentam jābūt kā absolūti tīram tekstam (plain text). Virsrakstus raksti ar LIELAJIEM BURTIEM. Savukārt veidlapas - atrodi un iekļauj tiešo saiti uz atbilstošo veidlapu no www.ur.gov.lv, un pilnībā aizpildi to ar klienta sniegto informāciju, maksimāli precīzi saglabājot tās oriģinālo struktūru. Nodod klientam gatavu, aizpildītu rezultātu.
SVARĪGI: Katru dokumentu OBLIGĀTI atdali ar šādiem marķieriem, lai tos varētu automātiski izgūt un saglabāt ZIP arhīvā:
===DOKUMENTS SĀKAS===
Nosaukums: [Dokumenta nosaukums, piemēram, Pieteikums_KR4.docx]
Saturs:
[Dokumenta pilns teksts]
===DOKUMENTS BEIDZAS===
)

4. MAKSĀJUMI UN REKVIZĪTI
(Norādi visus nepieciešamos maksājumus, kas saistīti ar šo darbību (valsts nodeva, publikācija "Latvijas Vēstnesī" u.c.), iekļaujot precīzas summas, saņēmēja nosaukumu, reģistrācijas numuru, konta numuru un maksājuma mērķi)

5. SECINĀJUMI UN TĀLĀKĀS DARBĪBAS
(Sniedz klientam detalizētu informāciju vienkāršā, saprotamā valodā par to, kas tieši ir jāveic, lai pabeigtu attiecīgo procesu - kā un kur dokumenti jāparaksta, kur tie jāiesniedz, kā jāveic apmaksa un citi praktiski soļi)

SVARĪGI: Vienmēr gatavojot dokumentu, paredzi klientam iespēju to parakstīt elektroniski. Dokumenta noformējumā ievēro Elektronisko dokumentu likuma prasības: dokumenta beigās fiziska paraksta atšifrējuma un vietas vietā iekļauj tekstu "DOKUMENTS IR PARAKSTĪTS AR DROŠU ELEKTRONISKO PARAKSTU UN SATUR LAIKA ZĪMOGU" vai paredzi vietu gan fiziskam, gan elektroniskam parakstam.

Ievaddati par darbību:
Darbība: ${docTypeName}
Klienta pieprasījums / situācijas apraksts: ${currentQuestion}
${companyNameField ? `Juridiskās personas nosaukums: ${companyNameField}` : ''}
Datums: ${date ? date.toLocaleDateString('lv-LV') : ''}${endDate ? ' - ' + endDate.toLocaleDateString('lv-LV') : ''}
`;
        } else if (selectedService === 'Dokumenti tiesai') {
          promptText = `Tu esi pieredzējis jurists, kas specializējas tiesvedībās. Klients lūdz sagatavot šādu procesuālo dokumentu tiesai: "${docTypeName}".
Raksti ${promptLanguage} valodā, izmantojot formālu, juridiski precīzu valodu, ievērojot Civilprocesa likuma prasības.
Pirms dokumenta gatavošanas, izvērtē, vai tev ir pietiekami daudz informācijas. Ja trūkst būtisku faktu (piemēram, pušu rekvizīti, prasības summa, pamatoti pierādījumi, datumi utt.), NEVEIDO dokumentu, bet gan uzdod visus nepieciešamos papildu jautājumus vienkāršā, klientam saprotamā valodā.
SVARĪGI: Ja klients norāda juridiskas personas nosaukumu, OBLIGĀTI izmanto meklēšanu (googleSearch), lai atrastu tās reģistrācijas numuru un juridisko adresi no Uzņēmumu reģistra (ur.gov.lv) vai citiem publiskiem reģistriem (firmas.lv, lursoft.lv), un automātiski iekļauj šos rekvizītus dokumentos. Neprasi šos datus klientam, ja vari tos atrast pats.
Ja izvēlies uzdot jautājumus, OBLIGĀTI sāc savu atbildi TIEŠI ar vārdiem "JAUTĀJUMI KLIENTAM:" un uzskaiti visus nepieciešamos jautājumus, katru jaunā rindā, sākot ar "- ".

Ja informācijas pietiek, sagatavo dokumentu, izmantojot šādu struktūru:
1. Tiesas nosaukums un adrese (augšējā labajā stūrī).
2. Prasītāja un Atbildētāja (vai Pieteicēja) rekvizīti (vārds/nosaukums, p.k./reģ.nr., adrese).
3. Prasības summa un valsts nodeva (ja piemērojams).
4. Dokumenta nosaukums (centrēts, LIELAJIEM BURTIEM).
5. Faktu izklāsts un juridiskais pamatojums (atsauces uz likuma pantiem).
6. Prasījuma daļa ("Lūdzu tiesu:").
7. Pielikumu saraksts.
8. Datums un paraksts.

NEIZMANTO NEKĀDUS Markdown simbolus (zvaigznītes *, restītes #, pasvītrojumus _). Dokumentam jābūt kā absolūti tīram tekstam (plain text).

Ievaddati par dokumentu:
Dokumenta veids: ${docTypeName}
Klienta pieprasījums / situācijas apraksts: ${currentQuestion}
${companyNameField ? `Juridiskās personas nosaukums: ${companyNameField}` : ''}
Datums: ${date ? date.toLocaleDateString('lv-LV') : ''}${endDate ? ' - ' + endDate.toLocaleDateString('lv-LV') : ''}
`;
        } else {
          promptText = `Tu esi pieredzējis jurists. Klients lūdz sagatavot šādu juridisku dokumentu: "${docTypeName}".
Raksti ${promptLanguage} valodā, profesionāli, skaidri un atbilstoši juridiskajiem standartiem.
Pirms dokumenta gatavošanas, izvērtē, vai tev ir pietiekami daudz informācijas. Ja trūkst būtisku faktu (piemēram, pušu rekvizīti, summas, datumi, līguma priekšmets utt.), NEVEIDO dokumentu, bet gan uzdod visus nepieciešamos papildu jautājumus vienkāršā, klientam saprotamā valodā.
SVARĪGI: Mazāk svarīgos dokumentos (brīdinājums, iesniegums, pretenzija) nedefinē katras rindkopas vai sadaļas nosaukumu (piemēram, neraksti "Faktiskie apstākļi", "Juridiskais pamatojums"). Raksti visu vienlaidus tekstā, lai to ir vieglāk uztvert. Sākot katru rindkopu, OBLIGĀTI lieto atkāpi!
ĪPAŠI NORĀDĪJUMI: Ja tiek gatavots "Brīdinājums" vai "Pretenzija" par parāda apmaksu, OBLIGĀTI pārbaudi un, ja nepieciešams, jautā klientam par līgumiskajiem un/vai likumiskajiem nokavējuma procentiem un līgumsodu. Šai informācijai jābūt iekļautai dokumentā.
SVARĪGI DOKUMENTA NOFORMĒJUMAM: Visiem dokumentiem (Brīdinājums, Pretenzija, Iesniegums) OBLIGĀTI jāievēro šāds vizuālais izkārtojums (izmanto atstarpes, lai imitētu labo malu):
1. Adresāta bloks (dokumenta labajā pusē, izmantojot vismaz 40 atstarpes pirms katras rindas): Nosaukums/Vārds, Reģ.Nr./Personas kods, Adrese.
2. Iesniedzēja bloks (dokumenta labajā pusē zem adresāta, izmantojot vismaz 40 atstarpes pirms katras rindas): Iesniedzējs: Vārds Uzvārds/Nosaukums, Personas kods/Reģ.Nr., Adrese, Tālrunis, E-pasts.
3. Dokumenta nosaukums (centrēts, izmantojot atstarpes, LIELAJIEM BURTIEM, piemēram, IESNIEGUMS).
4. Dokumenta apakšvirsraksts (centrēts zem nosaukuma, slīpsvītrās, piemēram, / par ikgadējā apmaksātā atvaļinājuma piešķiršanu /).
5. Sastādīšanas vieta un datums (kreisajā malā, piemēram, Rīgā, 2026. gada 13. martā).
6. Dokumenta pamatteksts (kreisajā malā, katru rindkopu sākot ar 3-5 atstarpju atkāpi).
7. Pielikumi (kreisajā malā, piemēram, PIELIKUMI: Nav.).
8. Paraksta daļa (kreisajā malā, piemēram, Ar cieņu, [Vārds Uzvārds]).
9. Elektroniskā paraksta atzīme (centrēta dokumenta beigās, ja izvēlēts e-paraksts).

Ja tiek gatavots "Brīdinājums", ievēro augstāk minēto struktūru. Pamattekstā apraksti situāciju, nepieciešamos pasākumus un sekas. Ja trūkst informācijas, jautā klientam.
Ja tiek gatavots "Pretenzija", ievēro augstāk minēto struktūru. Pamattekstā apraksti faktiskos apstākļus, juridisko pamatojumu, zaudējumus, prasību un turpmāko rīcību. Ja trūkst informācijas, jautā klientam.
Ja tiek gatavots "Iesniegums", ievēro augstāk minēto struktūru. Pamattekstā apraksti faktiskos apstākļus, juridisko pamatojumu, lūgumu / prasījumu. Ja trūkst informācijas, jautā klientam.
Ja tiek gatavots "Prasības pieteikums", OBLIGĀTI ievēro šādu struktūru: 1. Tiesas nosaukums un adrese. 2. Prasītāja, Pārstāvja un Atbildētāja rekvizīti. 3. Dokumenta nosaukums: "PRASĪBAS PIETEIKUMS par [priekšmets]". 4. Sastādīšanas vieta un datums. 5. Sadaļa "1. KOPSAVILKUMS". 6. Sadaļa "2. FAKTISKO APSTĀKĻU IZKLĀSTS". 7. Sadaļa "3. JURIDISKIE APSVĒRUMI UN FAKTISKO APSTĀKĻU NOVĒRTĒJUMS TIESĪBU NORMĀS". 8. Sadaļa "4. PROCESUĀLIE JAUTĀJUMI" (t.sk. 4.1. Prasības summa un valsts nodeva, 4.2. Mediācija, 4.3. Kredītiestādes nosaukums un konta numurs). 9. Sadaļa "5. PRASĪJUMS" (sākas ar vārdu "Lūdzu:"). 10. Paraksta daļa. 11. Pielikumu saraksts. Ja trūkst informācijas šo sadaļu aizpildīšanai, jautā klientam.
Ja tiek gatavota "Pilnvara", OBLIGĀTI izmanto šādu sagatavi un aizpildi to ar klienta informāciju, saglabājot tās struktūru:
PILNVARA
Pilnvaras devējs:
[Vārds Uzvārds / Uzņēmuma nosaukums]
[Personas kods / Reģistrācijas Nr.]
[Adrese]
Pilnvarotā persona:
[Vārds Uzvārds]
[Personas kods]
[Adrese]
Ar šo es, augstāk norādītais pilnvaras devējs, pilnvaroju augstāk norādīto pilnvaroto personu manā vārdā un interesēs veikt šādas darbības:
1. Pārstāvēt mani valsts un pašvaldību iestādēs, kā arī citās institūcijās.
2. Iesniegt un saņemt dokumentus, iesniegumus, izziņas un citu informāciju.
3. Parakstīt nepieciešamos dokumentus saistībā ar šīs pilnvaras izpildi.
4. Veikt citas darbības, kas nepieciešamas pilnvarā noteikto uzdevumu izpildei.
[Pievieno papildu darbības, ja klients to ir norādījis]
Pilnvarotajai personai ir tiesības veikt visas nepieciešamās darbības, lai pienācīgi pārstāvētu pilnvaras devēja intereses, ciktāl tas nepieciešams šajā pilnvarā noteikto uzdevumu izpildei.
Pilnvaras izsniegšanas vieta: [Pilsēta]
Datums: [DD.MM.GGGG]
Pilnvaras devējs:
[Vārds Uzvārds]
Paraksts: __________________________
Pilnvarotā persona:
[Vārds Uzvārds]
Paraksts: __________________________
Piezīme: Ja nepieciešams, pilnvara var tikt apliecināta pie notāra saskaņā ar Latvijas Republikas normatīvajiem aktiem.
SVARĪGI: Ja klients norāda juridiskas personas nosaukumu, OBLIGĀTI izmanto meklēšanu (googleSearch), lai atrastu tās reģistrācijas numuru un juridisko adresi no Uzņēmumu reģistra (ur.gov.lv) vai citiem publiskiem reģistriem (firmas.lv, lursoft.lv), un automātiski iekļauj šos rekvizītus dokumentā. Neprasi šos datus klientam, ja vari tos atrast pats.
Ja izvēlies uzdot jautājumus, OBLIGĀTI sāc savu atbildi TIEŠI ar vārdiem "JAUTĀJUMI KLIENTAM:" un uzskaiti visus nepieciešamos jautājumus, katru jaunā rindā, sākot ar "- ". Ja jautājumam ir tikai daži iespējamie atbilžu varianti, OBLIGĀTI norādi tos kvadrātiekavās aiz jautājuma, atdalītus ar komatu (piemēram: "- Vai vēlaties parakstīt elektroniski? [Jā, Nē]").
Ja informācijas pietiek, sagatavo TIKAI pašu dokumenta tekstu, bez jebkādiem taviem komentāriem, ievadiem vai nobeigumiem. Dokumentam jābūt pilnībā gatavam parakstīšanai, noformētam STINGRI atbilstoši Tieslietu ministrijas "Dokumentu noformēšanas vadlīnijas" (https://www.tm.gov.lv/sites/tm/files/dokumentu20noformesanas20vadlinijas1_0.pdf) un MK noteikumiem Nr. 558 "Dokumentu izstrādāšanas un noformēšanas kārtība". Ievēro pareizu rekvizītu izvietojumu. SVARĪGI: Formatējot dokumentu, adresātu un iesniedzēju (sūtītāju) OBLIGĀTI raksti labajā dokumenta pusē (izmanto vismaz 15 atstarpes pirms katras rindas). Dokumentiem jābūt vizuāli viegli uztveramiem un profesionāli noformētiem. NEIZMANTO NEKĀDUS Markdown simbolus (zvaigznītes *, restītes #, pasvītrojumus _). Dokumentam jābūt kā absolūti tīram tekstam (plain text). Virsrakstus raksti ar LIELAJIEM BURTIEM.
${isEDoc ? 'SVARĪGI PARAKSTAM: Klients ir izvēlējies dokumentu parakstīt elektroniski. Dokumenta beigās fiziska paraksta atšifrējuma un vietas vietā OBLIGĀTI iekļauj tekstu "DOKUMENTS IR PARAKSTĪTS AR DROŠU ELEKTRONISKO PARAKSTU UN SATUR LAIKA ZĪMOGU".' : 'SVARĪGI PARAKSTAM: Klients ir izvēlējies dokumentu parakstīt pašrocīgi. Dokumenta beigās OBLIGĀTI paredzi vietu fiziskam parakstam, datumam un paraksta atšifrējumam.'}
Ievaddati par dokumentu:
Dokumenta veids: ${docTypeName}
Klienta pieprasījums / situācijas apraksts: ${currentQuestion}
${companyNameField ? `Juridiskās personas nosaukums: ${companyNameField}` : ''}
Datums: ${date ? date.toLocaleDateString('lv-LV') : ''}${endDate ? ' - ' + endDate.toLocaleDateString('lv-LV') : ''}
`;
        }

        const parts: any[] = [];

        for (const file of attachedFiles) {
          if (file.type === 'application/pdf') {
            const base64 = await fileToBase64(file);
            parts.push({
              inlineData: {
                data: base64,
                mimeType: 'application/pdf'
              }
            });
          } else if (file.name.endsWith('.docx')) {
            const arrayBuffer = await fileToArrayBuffer(file);
            const result = await mammoth.extractRawText({ arrayBuffer });
            promptText += `\n\n--- Pievienotais dokuments (${file.name}) ---\n${result.value}\n---`;
          }
        }

        parts.push({ text: promptText });
        const responseText = await claudeGenerate(
          { parts },
          { webSearch: false, maxTokens: 4000 }
        );

        const answer = responseText || "Neizdevās ģenerēt dokumentu. Lūdzu, mēģiniet vēlreiz.";
        
        if (answer.startsWith("JAUTĀJUMI KLIENTAM:") || answer.startsWith("JAUTĀJUMS KLIENTAM:")) {
          const questionsText = answer.replace(/JAUTĀJUM[IS] KLIENTAM:/, "").trim();
          const questionsList = parseClarificationQuestions(questionsText);
          setClarificationQuestionsList(questionsList);
          setClarificationQuestions(questionsText);
          setIsClarifying(true);
          setIsProcessing(false);
          return;
        }

        setGeneratedAnswer(answer);
        if (responseText) {
          await saveOpinion(selectedService, currentQuestion, answer);
        }
      } catch (error: any) {
        console.error("Error generating document:", error);
        setGeneratedAnswer("Radās kļūda, sazinoties ar sistēmu. Lūdzu, mēģiniet vēlreiz vēlāk. Kļūda: " + (error.message || JSON.stringify(error)));
      }
    } else if (selectedService === 'Padziļināts atzinums') {
      // Padziļināts atzinums - generate opinion using Gemini
      try {
        const promptLanguage = language === 'en' ? 'angļu' : language === 'ru' ? 'krievu' : 'latviešu';
        
        let promptText = `Tu esi Latvijas/ES tiesību jurists ar 15+ gadu pieredzi, kas raksta juridiskus atzinumus klientiem.
Raksti ${promptLanguage} valodā, profesionāli, skaidri un viegli lasāmi.
Izvairies no pārmērīgas formatēšanas (neizmanto zvaigznītes * treknrakstam vai slīprakstam, lai teksts būtu tīrs, profesionāls un viegli uztverams). Dokumentus noformē atbilstoši dokumentu noformēšanas noteikumiem.
Neiekļauj atzinumā lietas vai laukus, kas nav zināmi (piemēram, nezināmos faktus, neesošus dokumentus vai "TBD" atzīmes).

SVARĪGI: Pirms gatavo atzinumu, izvērtē, vai tev ir pietiekami daudz informācijas. Ja trūkst būtisku faktu, lai sniegtu precīzu un kvalitatīvu atbildi, NEVEIDO atzinumu, bet gan uzdod visus nepieciešamos papildu jautājumus vienkāršā, klientam saprotamā valodā.
SVARĪGI: Ja klients norāda juridiskas personas nosaukumu, OBLIGĀTI izmanto meklēšanu (googleSearch), lai atrastu tās reģistrācijas numuru un juridisko adresi no Uzņēmumu reģistra (ur.gov.lv) vai citiem publiskiem reģistriem (firmas.lv, lursoft.lv), un automātiski iekļauj šos rekvizītus atzinumā. Neprasi šos datus klientam, ja vari tos atrast pats.
Ja izvēlies uzdot jautājumus, OBLIGĀTI sāc savu atbildi TIEŠI ar vārdiem "JAUTĀJUMI KLIENTAM:" un uzskaiti visus nepieciešamos jautājumus, katru jaunā rindā, sākot ar "- ". Ja jautājumam ir tikai daži iespējamie atbilžu varianti, OBLIGĀTI norādi tos kvadrātiekavās aiz jautājuma, atdalītus ar komatu (piemēram: "- Vai vēlaties parakstīt elektroniski? [Jā, Nē]").
Ja informācijas pietiek, sagatavo atzinumu, stingri atdalot šādas sadaļas:

1. KOPSAVILKUMS (īsi un kodolīgi atbildi uz klienta uzdotajiem jautājumiem vai situācijas būtību).
2. ATZINUMA SNIEGŠANAI IZMANTOTO DOKUMENTU SARAKSTS (ja klients ir minējis vai pievienojis dokumentus, uzskaiti tos).
3. FAKTISKO APSTĀKĻU IZKLĀSTS (hronoloģiski un strukturēti apraksti situāciju, izmantojot numurētu sarakstu).
4. KLIENTA UZDOTO JAUTĀJUMU JURIDISKS IZVĒRTĒJUMS (detalizēta analīze, izmantojot apakšnodaļas, piemēram, 4.1., 4.2. utt. Analīzē iekļauj piemērojamās normas, tiesību teoriju un REĀLU, KONKRĒTU judikatūru ar atsaucēm uz lietu numuriem un datumiem, kā arī atbildīgo iestāžu atziņas un vadlīnijas).
5. SECINĀJUMI (skaidri un nepārprotami secinājumi par katru analizēto jautājumu).

SVARĪGI: Atzinuma beigās OBLIGĀTI pievieno šādu atrunu:
"Atzinumā iekļautie apsvērumi un izdarītie secinājumi ir tikai viedoklis, kas pamatots uz sniegtās informācijas, normatīvo tiesību aktu un juridiskās literatūras izpēti. Tas nesniedz nekādu apsolījumu vai garantiju par trešo personu tālāk veikto tiesību normu vai faktisko apstākļu interpretāciju un jebkādu lēmumu pieņemšanu valsts pārvaldes institūcijās, izmeklēšanas iestādēs, prokuratūrās un tiesās."

ĪPAŠI NORĀDĪJUMI PADZIĻINĀTAJAM ATZINUMAM:
Saglabā un nodrošini augstāko kvalitāti šādos trīs pīlāros:
1. Normatīvo aktu analīze: Detalizēti izvērtē un piemēro visus saistītos normatīvos aktus.
2. Judikatūras analīze: Padziļinātu nozīmi pievērs tiesnešu paustajām atziņām, OBLIGĀTI citē tās. Norādi konkrētu tiesu, lietas numuru, datumu un precīzi citē tiesas atziņu šajā lietā, kas ir relevanta klienta jautājumam.
3. Tiesību teorijas analīze: OBLIGĀTI iekļauj tiesību teorijas atziņas un analīzi atbilstoši aprakstītajai situācijai.
- Papildus atspoguļo un analizē atbildīgo iestāžu (piemēram, PTAC, VID, DVI, FKTK/Latvijas Banka u.c.) atziņas, skaidrojumus vai vadlīnijas.

Ievaddati par lietu:
Klienta jautājums: ${currentQuestion}
${companyNameField ? `Juridiskās personas nosaukums: ${companyNameField}` : ''}
Jurisdikcija: Latvija
Datums: ${date ? date.toLocaleDateString('lv-LV') : ''}${endDate ? ' - ' + endDate.toLocaleDateString('lv-LV') : ''} (Lūdzu, visur atzinumā atspoguļo šo datumu un citus datumus formātā DD.MM.YYYY, piemēram, 31.12.2023)

Sagatavo pilnu padziļināto juridisko atzinumu, sākot ar virsrakstu "JURIDISKAIS ATZINUMS", ievērojot augstāk minētos norādījumus.`;

        const parts: any[] = [];

        for (const file of attachedFiles) {
          if (file.type === 'application/pdf') {
            const base64 = await fileToBase64(file);
            parts.push({
              inlineData: {
                data: base64,
                mimeType: 'application/pdf'
              }
            });
          } else if (file.name.endsWith('.docx')) {
            const arrayBuffer = await fileToArrayBuffer(file);
            const result = await mammoth.extractRawText({ arrayBuffer });
            promptText += `\n\n--- Pievienotais dokuments (${file.name}) ---\n${result.value}\n---`;
          }
        }

        parts.push({ text: promptText });

        const responseText = await claudeGenerate(
          { parts },
          { webSearch: true, maxTokens: 4000 }
        );

        const answer = responseText || "Neizdevās ģenerēt atbildi. Lūdzu, mēģiniet vēlreiz.";
        
        if (answer.startsWith("JAUTĀJUMI KLIENTAM:") || answer.startsWith("JAUTĀJUMS KLIENTAM:")) {
          const questionsText = answer.replace(/JAUTĀJUM[IS] KLIENTAM:/, "").trim();
          const questionsList = parseClarificationQuestions(questionsText);
          setClarificationQuestionsList(questionsList);
          setClarificationQuestions(questionsText);
          setIsClarifying(true);
          setIsProcessing(false);
          return;
        }

        setGeneratedAnswer(answer);
        if (responseText) {
          await saveOpinion(selectedService, currentQuestion, answer);
        }
      } catch (error: any) {
        console.error("Error generating opinion:", error);
        setGeneratedAnswer("Radās kļūda, sazinoties ar sistēmu. Lūdzu, mēģiniet vēlreiz vēlāk. Kļūda: " + (error.message || JSON.stringify(error)));
      }
    } else if (selectedService === 'Parāda kalkulators') {
      try {
        const promptLanguage = language === 'en' ? 'angļu' : language === 'ru' ? 'krievu' : 'latviešu';
        
        let promptText = `Tu esi finanšu un juridiskais eksperts. Klients lūdz aprēķināt parāda summu, ieskaitot pamatparādu, nokavējuma procentus un līgumsodu.
Raksti ${promptLanguage} valodā, profesionāli, skaidri un viegli lasāmi. NEIZMANTO pārmērīgu formatēšanu (piemēram, izvairies no daudzām zvaigznītēm * treknrakstam vai slīprakstam), lai teksts būtu tīrs un profesionāls.

SVARĪGI: Pirms veic aprēķinu, izvērtē, vai tev ir pietiekami daudz informācijas. Ja trūkst būtisku faktu (piemēram, pamatparāda summa, apmaksas termiņš, procentu likme, līgumsoda apmērs), NEVEIC aprēķinu, bet gan uzdod visus nepieciešamos papildu jautājumus vienkāršā, klientam saprotamā valodā.
SVARĪGI: Ja klients norāda juridiskas personas nosaukumu, OBLIGĀTI izmanto meklēšanu (googleSearch), lai atrastu tās reģistrācijas numuru un juridisko adresi no Uzņēmumu reģistra (ur.gov.lv) vai citiem publiskiem reģistriem (firmas.lv, lursoft.lv), un automātiski iekļauj šos rekvizītus aprēķinā. Neprasi šos datus klientam, ja vari tos atrast pats.
Ja izvēlies uzdot jautājumus, OBLIGĀTI sāc savu atbildi TIEŠI ar vārdiem "JAUTĀJUMI KLIENTAM:" un uzskaiti visus nepieciešamos jautājumus, katru jaunā rindā, sākot ar "- ". Ja jautājumam ir tikai daži iespējamie atbilžu varianti, OBLIGĀTI norādi tos kvadrātiekavās aiz jautājuma, atdalītus ar komatu (piemēram: "- Vai vēlaties parakstīt elektroniski? [Jā, Nē]").
Ja informācijas pietiek, sagatavo detalizētu parāda aprēķinu, stingri atdalot šādas sadaļas:

1. Ievaddati (Pamatparāds, apmaksas termiņš, procentu likme, aprēķina datums)
2. Nokavējuma dienu skaits (Kā tas tika aprēķināts)
3. Nokavējuma procentu aprēķins (Formula un rezultāts)
4. Līgumsoda aprēķins (Ja piemērojams, formula un rezultāts. Ņem vērā Civillikuma ierobežojumus, ja tie ir piemērojami)
5. Kopējā parāda summa (Skaidri izdalot pamatparādu un blakusprasījumus)

Ievaddati par lietu:
${calculatorMode === 'manual' ? `
Pamatparāda summa: ${calcPrincipal} EUR
Apmaksas termiņš: ${calcDueDate ? calcDueDate.toLocaleDateString('lv-LV') : 'Nav norādīts'}
Nokavējuma procentu likme: ${calcInterestRate ? calcInterestRate + '%' : 'Nav norādīts'}
Līgumsoda likme: ${calcPenaltyRate ? calcPenaltyRate + '%' : 'Nav norādīts'}
` : ''}
Klienta jautājums / situācijas apraksts: ${currentQuestion || "Klients ir pievienojis failus aprēķina veikšanai."}
${companyNameField ? `Juridiskās personas nosaukums: ${companyNameField}` : ''}
Aprēķina datums: ${date ? date.toLocaleDateString('lv-LV') : ''}${endDate ? ' - ' + endDate.toLocaleDateString('lv-LV') : ''} (Lūdzu, visur atzinumā atspoguļo šo datumu un citus datumus formātā DD.MM.YYYY, piemēram, 31.12.2023)

Sagatavo pilnu parāda aprēķinu, sākot ar virsrakstu "PARĀDA APRĒĶINS", ievērojot augstāk minētos norādījumus.`;

        const parts: any[] = [];

        for (const file of attachedFiles) {
          if (file.type === 'application/pdf') {
            const base64 = await fileToBase64(file);
            parts.push({
              inlineData: {
                data: base64,
                mimeType: 'application/pdf'
              }
            });
          } else if (file.name.endsWith('.docx')) {
            const arrayBuffer = await fileToArrayBuffer(file);
            const result = await mammoth.extractRawText({ arrayBuffer });
            promptText += `\n\n--- Pievienotais dokuments (${file.name}) ---\n${result.value}\n---`;
          }
        }

        parts.push({ text: promptText });

        const responseText = await claudeGenerate(
          { parts },
          { webSearch: true, maxTokens: 4000 }
        );

        const answer = responseText || "Neizdevās ģenerēt atbildi. Lūdzu, mēģiniet vēlreiz.";
        
        if (answer.startsWith("JAUTĀJUMI KLIENTAM:") || answer.startsWith("JAUTĀJUMS KLIENTAM:")) {
          const questionsText = answer.replace(/JAUTĀJUM[IS] KLIENTAM:/, "").trim();
          const questionsList = parseClarificationQuestions(questionsText);
          setClarificationQuestionsList(questionsList);
          setClarificationQuestions(questionsText);
          setIsClarifying(true);
          setIsProcessing(false);
          return;
        }

        setGeneratedAnswer(answer);
        if (responseText) {
          await saveOpinion(selectedService, currentQuestion, answer);
        }
      } catch (error: any) {
        console.error("Error generating opinion:", error);
        setGeneratedAnswer("Radās kļūda, sazinoties ar sistēmu. Lūdzu, mēģiniet vēlreiz vēlāk. Kļūda: " + (error.message || JSON.stringify(error)));
      }
    }

    setIsProcessing(false);
    setIsComplete(true);
  };

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedService === 'Parāda kalkulators' && calculatorMode === 'files' && attachedFiles.length === 0 && !question.trim()) {
      alert("Lūdzu, pievienojiet failus vai aprakstiet situāciju.");
      return;
    }
    await generateOpinion(question);
  };

  const handleClarificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsClarifying(false);
    
    let updatedQuestion = question;
    if (clarificationQuestionsList.length > 0) {
      const answersText = clarificationQuestionsList.map((q, i) => `Jautājums: ${q.text}\nAtbilde: ${clarificationAnswersList[i] || 'Nav atbildes'}`).join('\n\n');
      updatedQuestion = `${question}\n\nPapildu informācija no klienta:\n${answersText}`;
    } else {
      updatedQuestion = `${question}\n\nPapildu informācija no klienta:\n${clarificationAnswer}`;
    }
    
    setQuestion(updatedQuestion);
    setClarificationAnswer('');
    setClarificationQuestionsList([]);
    setClarificationAnswersList({});
    
    await generateOpinion(updatedQuestion);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsClarifying(false);
    setClarificationQuestions('');
    setClarificationAnswer('');
    setClarificationQuestionsList([]);
    setClarificationAnswersList({});
    setIsComplete(false);
    setQuestion('');
    setCompanyNameField('');
    setDate(null);
    setEndDate(null);
    setAttachedFiles([]);
    setGeneratedAnswer('');
    setSuggestedDocuments([]);
    setSelectedDocument('');
    setIsGeneratingDocument(false);
    setGeneratedDocument('');
    setDocumentQuestions([]);
    setDocumentAnswers({});
    setIsGeneratingDocumentQuestions(false);
    setHasMultipleScenarios(false);
    setIsGeneratingRiskAnalysis(false);
    setGeneratedRiskAnalysis('');
    setInitialDocumentType('');
    setInitialCustomDocumentName('');
    setCourtDocumentType('');
    setCourtCustomDocumentName('');
    setUrAction('');
    setUrActionCustom('');
    setCalculatorMode('manual');
    setCalcPrincipal('');
    setCalcDueDate(null);
    setCalcInterestRate('');
    setCalcPenaltyRate('');
    setIsEDoc(false);
  };

  const downloadWord = async () => {
    let children: any[] = [];

    if (selectedService.startsWith('Dokumentu sagatavošana') || selectedService === 'Dokumenti tiesai') {
      children = generatedAnswer.split('\n').map(line => new Paragraph({ text: line }));
    } else {
      const isCalculator = selectedService === 'Parāda kalkulators';
      const isUR = selectedService === 'Dokumentu sagatavošana UR';
      
      let mainTitle = "JURIDISKAIS ATZINUMS";
      if (isCalculator) mainTitle = "PARĀDA APRĒĶINS";
      if (isUR) mainTitle = "JURIDISKAIS ATZINUMS UN DOKUMENTU PROJEKTI";

      let dateLabel = "atzinums";
      if (isCalculator) dateLabel = "aprēķins";
      if (isUR) dateLabel = "atzinums un dokumenti";

      let section1Title = "1. Jautājums / Situācijas apraksts:";
      if (isCalculator) section1Title = "1. Parāda apraksts / Situācija:";
      if (isUR) section1Title = "1. Klienta pieprasījums / Situācijas apraksts:";

      let section2Title = "2. Atzinums:";
      if (isCalculator) section2Title = "2. Aprēķins:";
      if (isUR) section2Title = "2. Atzinums un dokumentu projekti:";

      children = [
        new Paragraph({
          text: mainTitle,
          heading: HeadingLevel.HEADING_1,
          alignment: "center",
        }),
        new Paragraph({ text: "" }),
        new Paragraph({ text: `Pakalpojums: ${selectedService}` }),
        ...(companyNameField ? [new Paragraph({ text: `Uzņēmums: ${companyNameField}` })] : []),
        new Paragraph({ text: `Datums, uz kuru attiecas ${dateLabel}: ${date ? date.toLocaleDateString('lv-LV') : ''}${endDate ? ' - ' + endDate.toLocaleDateString('lv-LV') : ''}` }),
        new Paragraph({ text: `Sagatavots: ${new Date().toLocaleDateString('lv-LV')}` }),
        new Paragraph({ text: "" }),
        new Paragraph({
          text: section1Title,
          heading: HeadingLevel.HEADING_2,
        }),
        ...question.split('\n').map(line => new Paragraph({ text: line })),
        new Paragraph({ text: "" }),
        new Paragraph({
          text: section2Title,
          heading: HeadingLevel.HEADING_2,
        }),
        ...generatedAnswer.split('\n').map(line => new Paragraph({ text: line })),
        new Paragraph({ text: "" }),
        new Paragraph({ text: "" }),
        new Paragraph({
          text: "Šis dokuments ir ģenerēts automātiski un kalpo kā informatīvs materiāls.",
          alignment: "center",
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: isCalculator ? "Aprēķins ir ģenerēts automatizēti un sniegtais saturs ir informatīvs." : "Atbilde ir ģenerēta automatizēti un sniegtais saturs ir informatīvs.",
              italics: true,
            })
          ],
          alignment: "center",
        }),
      ];
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: children,
      }],
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    let docTypeName = 'Dokuments';
    if (selectedService === 'Dokumentu sagatavošana UR') {
      const actionObj = urActions.find(a => a.id === urAction);
      docTypeName = urAction === 'cits' ? urActionCustom : (actionObj ? actionObj.lv : 'Dokuments');
    } else if (selectedService === 'Dokumenti tiesai') {
      const docTypeObj = courtDocumentTypes.find(d => d.id === courtDocumentType);
      docTypeName = courtDocumentType === 'cits' ? courtCustomDocumentName : (docTypeObj ? docTypeObj.lv : 'Dokuments');
    } else {
      const docTypeObj = documentTypes.find(d => d.id === initialDocumentType);
      docTypeName = initialDocumentType === 'cits' ? initialCustomDocumentName : (docTypeObj ? docTypeObj.lv : 'Dokuments');
    }
    const fileName = (selectedService.startsWith('Dokumentu sagatavošana') || selectedService === 'Dokumenti tiesai') ? `${docTypeName.replace(/\s+/g, '_')}.docx` : "Juridiskais_Atzinums.docx";
    
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadZip = async () => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    const docRegex = /===DOKUMENTS SĀKAS===\nNosaukums:\s*(.*?)\nSaturs:\n([\s\S]*?)===DOKUMENTS BEIDZAS===/g;
    let match;
    let hasDocuments = false;

    while ((match = docRegex.exec(generatedAnswer)) !== null) {
      hasDocuments = true;
      const docName = match[1].trim() || 'Dokuments.docx';
      const docContent = match[2].trim();

      const doc = new Document({
        sections: [{
          properties: {},
          children: docContent.split('\n').map(line => new Paragraph({ text: line }))
        }]
      });

      const blob = await Packer.toBlob(doc);
      zip.file(docName.endsWith('.docx') ? docName : `${docName}.docx`, blob);
    }

    const mainText = generatedAnswer.replace(/===DOKUMENTS SĀKAS===[\s\S]*?===DOKUMENTS BEIDZAS===/g, '').trim();
    
    const mainDoc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "JURIDISKAIS ATZINUMS UN NORĀDĪJUMI",
            heading: HeadingLevel.HEADING_1,
            alignment: "center",
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: `Pakalpojums: ${selectedService}` }),
          ...(companyNameField ? [new Paragraph({ text: `Uzņēmums: ${companyNameField}` })] : []),
          new Paragraph({ text: `Datums: ${date ? date.toLocaleDateString('lv-LV') : ''}${endDate ? ' - ' + endDate.toLocaleDateString('lv-LV') : ''}` }),
          new Paragraph({ text: "" }),
          ...mainText.split('\n').map(line => new Paragraph({ text: line }))
        ]
      }]
    });

    const mainBlob = await Packer.toBlob(mainDoc);
    zip.file('Noradijumi_un_Atzinums.docx', mainBlob);

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = window.URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'UR_Dokumenti.zip';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div id="sakums" className="min-h-screen text-black font-sans selection:bg-black/20 selection:text-black">
      {!hasAcceptedTerms && (
        <TermsAcceptanceModal onAccept={handleAcceptTerms} language={language} />
      )}
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-black/10 gold-glass">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="#sakums" onClick={() => { setShowUsersAdmin(false); setShowOpinionsAdmin(false); setShowStatsAdmin(false); setShowPrivacyPolicy(false); setShowTermsOfService(false); setShowCookiePolicy(false); setShowDisclaimer(false); setShowDistanceContract(false); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Scale className="w-10 h-10 text-black" />
            </a>
            <a href="#sakums" onClick={() => { setShowUsersAdmin(false); setShowOpinionsAdmin(false); setShowStatsAdmin(false); setShowPrivacyPolicy(false); setShowTermsOfService(false); setShowCookiePolicy(false); setShowDisclaimer(false); setShowDistanceContract(false); setIsMobileMenuOpen(false); }} className="text-sm font-bold tracking-widest uppercase text-black/70 hover:text-black transition-colors">{t[language].home}</a>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 mr-2">
              <span className="text-lg" aria-hidden="true">
                {language === 'lv' ? '🇱🇻' : language === 'en' ? '🇬🇧' : '🇷🇺'}
              </span>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value as 'lv' | 'en' | 'ru')}
                className="bg-transparent border border-black/10 text-black/80 text-xs rounded-sm px-2 py-1 outline-none focus:border-black/30 uppercase tracking-widest cursor-pointer"
              >
                <option value="lv" className="gold-glass rounded-xl">LV</option>
                <option value="en" className="bg-white/40 rounded-xl">EN</option>
                <option value="ru" className="bg-white/40 rounded-xl">RU</option>
              </select>
            </div>
            {user ? (
              <button onClick={handleLogout} className="hidden md:flex items-center gap-2 bg-red-600 text-white px-5 py-2 rounded-full hover:bg-red-700 transition-all font-medium text-sm tracking-wide shadow-sm">
                <LogOut className="w-4 h-4" />
                {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email}
              </button>
            ) : (
              <button onClick={() => setIsLoginModalOpen(true)} className="hidden md:flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-full hover:bg-emerald-700 transition-all font-medium text-sm tracking-wide shadow-sm">
                {t[language].login}
              </button>
            )}
            <button ref={menuButtonRef} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-black/60 hover:text-black flex items-center gap-2 font-bold tracking-widest uppercase text-sm ml-2">
              <span className="hidden md:inline">{t[language].menu || 'Izvēlne'}</span>
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Menu Dropdown */}
        {isMobileMenuOpen && (
          <div ref={menuRef} className="absolute top-20 right-4 left-4 md:left-auto md:w-80 bg-white/95 backdrop-blur-xl border border-black/10 shadow-xl rounded-xl px-6 py-6 flex flex-col gap-4 text-sm tracking-widest uppercase text-black/60">
            {!showUsersAdmin && !showOpinionsAdmin && !showStatsAdmin && !showPrivacyPolicy && !showTermsOfService && !showCookiePolicy && !showDisclaimer && !showDistanceContract && (
              <>
                <div className="flex flex-col gap-2 py-2 border-b border-black/5">
                  <button onClick={() => setIsServicesMenuOpen(!isServicesMenuOpen)} className="flex items-center justify-between w-full text-left hover:text-black transition-colors pb-2">
                    {t[language].services}
                    <ChevronDown className={`w-4 h-4 transition-transform ${isServicesMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isServicesMenuOpen && (
                    <div className="flex flex-col gap-2">
                      <button onClick={() => { openModal('Vienkāršots atzinums'); setIsMobileMenuOpen(false); }} className="text-left hover:text-black transition-colors py-1 pl-4 border-l-2 border-black/10 text-black/60">Vienkāršots atzinums</button>
                      <button onClick={() => { openModal('Padziļināts atzinums'); setIsMobileMenuOpen(false); }} className="text-left hover:text-black transition-colors py-1 pl-4 border-l-2 border-black/10 text-black/60">Padziļināts atzinums</button>
                      <button onClick={() => { openModal('Dokumentu sagatavošana'); setIsMobileMenuOpen(false); }} className="text-left hover:text-black transition-colors py-1 pl-4 border-l-2 border-black/10 text-black/60">Dokumentu sagatavošana</button>
                      <button onClick={() => { openModal('Parāda kalkulators'); setIsMobileMenuOpen(false); }} className="text-left hover:text-black transition-colors py-1 pl-4 border-l-2 border-black/10 text-black/60">Parāda kalkulators</button>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 py-2 border-b border-black/5">
                  <button onClick={() => setIsAboutMenuOpen(!isAboutMenuOpen)} className="flex items-center justify-between w-full text-left hover:text-black transition-colors pb-2">
                    {t[language].about}
                    <ChevronDown className={`w-4 h-4 transition-transform ${isAboutMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isAboutMenuOpen && (
                    <div className="flex flex-col gap-2">
                      <button onClick={() => { setShowPrivacyPolicy(true); setShowTermsOfService(false); setShowCookiePolicy(false); setShowDisclaimer(false); setShowDistanceContract(false); setShowUsersAdmin(false); setShowOpinionsAdmin(false); setShowStatsAdmin(false); setIsMobileMenuOpen(false); }} className="text-left hover:text-black transition-colors py-1 pl-4 border-l-2 border-black/10 text-black/60">{t[language].privacy}</button>
                      <button onClick={() => { setShowTermsOfService(true); setShowPrivacyPolicy(false); setShowCookiePolicy(false); setShowDisclaimer(false); setShowDistanceContract(false); setShowUsersAdmin(false); setShowOpinionsAdmin(false); setShowStatsAdmin(false); setIsMobileMenuOpen(false); }} className="text-left hover:text-black transition-colors py-1 pl-4 border-l-2 border-black/10 text-black/60">{t[language].terms}</button>
                      <button onClick={() => { setShowCookiePolicy(true); setShowTermsOfService(false); setShowPrivacyPolicy(false); setShowDisclaimer(false); setShowDistanceContract(false); setShowUsersAdmin(false); setShowOpinionsAdmin(false); setShowStatsAdmin(false); setIsMobileMenuOpen(false); }} className="text-left hover:text-black transition-colors py-1 pl-4 border-l-2 border-black/10 text-black/60">{t[language].cookiePolicy}</button>
                      <button onClick={() => { setShowDisclaimer(true); setShowCookiePolicy(false); setShowTermsOfService(false); setShowPrivacyPolicy(false); setShowDistanceContract(false); setShowUsersAdmin(false); setShowOpinionsAdmin(false); setShowStatsAdmin(false); setIsMobileMenuOpen(false); }} className="text-left hover:text-black transition-colors py-1 pl-4 border-l-2 border-black/10 text-black/60">{t[language].disclaimer}</button>
                      <button onClick={() => { setShowDistanceContract(true); setShowDisclaimer(false); setShowCookiePolicy(false); setShowTermsOfService(false); setShowPrivacyPolicy(false); setShowUsersAdmin(false); setShowOpinionsAdmin(false); setShowStatsAdmin(false); setIsMobileMenuOpen(false); }} className="text-left hover:text-black transition-colors py-1 pl-4 border-l-2 border-black/10 text-black/60">{t[language].distanceContract}</button>
                    </div>
                  )}
                </div>
                <a href="#kontakti" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-black transition-colors py-2 border-b border-black/5">{t[language].contact}</a>
              </>
            )}
            {isAdmin && (
              <button onClick={() => { setShowUsersAdmin(!showUsersAdmin); setShowOpinionsAdmin(false); setShowStatsAdmin(false); setShowPrivacyPolicy(false); setShowDisclaimer(false); setShowDistanceContract(false); setIsMobileMenuOpen(false); }} className={`flex items-center gap-2 transition-colors py-2 border-b border-black/5 ${showUsersAdmin ? 'text-black' : 'hover:text-black'}`}>
                <Users className="w-4 h-4" />
                {t[language].users}
              </button>
            )}
            {isAdmin && (
              <button onClick={() => { setShowStatsAdmin(!showStatsAdmin); setShowUsersAdmin(false); setShowOpinionsAdmin(false); setShowPrivacyPolicy(false); setShowDisclaimer(false); setShowDistanceContract(false); setIsMobileMenuOpen(false); }} className={`flex items-center gap-2 transition-colors py-2 border-b border-black/5 ${showStatsAdmin ? 'text-black' : 'hover:text-black'}`}>
                <BarChart className="w-4 h-4" />
                {t[language].stats}
              </button>
            )}
            {user && (
              <button onClick={() => { setShowOpinionsAdmin(!showOpinionsAdmin); setShowUsersAdmin(false); setShowStatsAdmin(false); setShowPrivacyPolicy(false); setShowDisclaimer(false); setShowDistanceContract(false); setIsMobileMenuOpen(false); }} className={`flex items-center gap-2 transition-colors py-2 border-b border-black/5 ${showOpinionsAdmin ? 'text-black' : 'hover:text-black'}`}>
                <FileText className="w-4 h-4" />
                {t[language].opinions}
              </button>
            )}

            <div className="py-2 flex items-center gap-3 border-b border-black/5">
              <span className="text-xl" aria-hidden="true">
                {language === 'lv' ? '🇱🇻' : language === 'en' ? '🇬🇧' : '🇷🇺'}
              </span>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value as 'lv' | 'en' | 'ru')}
                className="bg-transparent border border-black/10 text-black/80 text-xs rounded-sm px-2 py-2 w-full outline-none focus:border-black/30 uppercase tracking-widest cursor-pointer"
              >
                <option value="lv" className="bg-white/40 rounded-xl">LV</option>
                <option value="en" className="bg-white/40 rounded-xl">EN</option>
                <option value="ru" className="bg-white/40 rounded-xl">RU</option>
              </select>
            </div>

            <div className="pt-2">
              {user ? (
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-3 rounded-xl hover:bg-red-700 transition-all font-medium text-sm tracking-wide shadow-sm w-full">
                  <LogOut className="w-4 h-4" />
                  {t[language].logout}
                </button>
              ) : (
                <button onClick={() => { setIsLoginModalOpen(true); setIsMobileMenuOpen(false); }} className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl hover:bg-emerald-700 transition-all font-medium text-sm tracking-wide shadow-sm w-full">
                  {t[language].login}
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {showTermsOfService ? (
        <TermsOfService onClose={() => setShowTermsOfService(false)} language={language} />
      ) : showPrivacyPolicy ? (
        <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} language={language} />
      ) : showCookiePolicy ? (
        <CookiePolicy onClose={() => setShowCookiePolicy(false)} language={language} />
      ) : showDisclaimer ? (
        <Disclaimer onClose={() => setShowDisclaimer(false)} language={language} />
      ) : showDistanceContract ? (
        <DistanceContract onClose={() => setShowDistanceContract(false)} language={language} />
      ) : showStatsAdmin && isAdmin ? (
        <section className="pt-32 pb-24 px-6 min-h-screen">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-3xl md:text-5xl text-black">{t[language].stats}</h2>
              <button onClick={() => setShowStatsAdmin(false)} className="flex items-center gap-2 text-black/60 hover:text-black transition-colors text-sm font-bold tracking-widest uppercase">
                <X className="w-5 h-5" />
                {t[language].close}
              </button>
            </div>
            <div className="gold-glass rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-black/80 whitespace-nowrap">
                  <thead className="gold-glass-light border-b border-black/10 text-xs uppercase tracking-widest text-black/50">
                    <tr>
                      <th className="px-6 py-4 font-bold">Lietotājs</th>
                      <th className="px-6 py-4 font-bold">Kopā</th>
                      <th className="px-6 py-4 font-bold">Sadalījums pa veidiem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userStats.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-black/50">Nav datu</td>
                      </tr>
                    ) : (
                      userStats.map((stat: any) => (
                        <tr key={stat.email} className="border-b border-black/5 hover:bg-white/60 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-black font-medium">{stat.firstName} {stat.lastName}</div>
                            <div className="text-xs text-black/50">{stat.email}</div>
                          </td>
                          <td className="px-6 py-4 text-black font-bold text-lg">{stat.total}</td>
                          <td className="px-6 py-4 whitespace-normal">
                            <div className="flex flex-col gap-4">
                              {Object.entries(stat.documents || {}).map(([type, docs]: [string, any]) => (
                                <div key={type} className="flex flex-col gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-black/80 text-xs bg-black/5 px-2 py-1 rounded-md font-bold">{type}</span>
                                    <span className="text-black/50 text-xs font-bold">({docs.length})</span>
                                  </div>
                                  <ul className="list-disc list-inside text-xs text-black/60 pl-2 space-y-1">
                                    {docs.map((doc: any, idx: number) => (
                                      <li key={idx} className="truncate max-w-[400px]" title={doc.question}>
                                        <span className="font-medium">{new Date(doc.created_at + 'Z').toLocaleDateString('lv-LV')}</span> - {doc.question}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      ) : showUsersAdmin && isAdmin ? (
        <section className="pt-32 pb-24 px-6 min-h-screen">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-3xl md:text-5xl text-black">Reģistrētie Lietotāji</h2>
              <button onClick={() => setShowUsersAdmin(false)} className="flex items-center gap-2 text-black/60 hover:text-black transition-colors text-sm font-bold tracking-widest uppercase">
                <X className="w-5 h-5" />
                {t[language].close}
              </button>
            </div>
            <div className="bg-white/40 backdrop-blur-xl border border-black/10 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-black/80 whitespace-nowrap">
                  <thead className="bg-white/60 border-b border-black/10 text-xs uppercase tracking-widest text-black/50">
                    <tr>
                      <th className="px-6 py-4 font-bold">ID</th>
                      <th className="px-6 py-4 font-bold">Vārds Uzvārds</th>
                      <th className="px-6 py-4 font-bold">E-pasts</th>
                      <th className="px-6 py-4 font-bold">Statuss</th>
                      <th className="px-6 py-4 font-bold">Pēdējā aktivitāte</th>
                      <th className="px-6 py-4 font-bold">Reģistrācijas datums</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-black/50">Nav reģistrētu lietotāju</td>
                      </tr>
                    ) : (
                      usersList.map((u) => (
                        <tr key={u.id} className="border-b border-black/5 hover:bg-white/60 transition-colors">
                          <td className="px-6 py-4 font-medium">{u.id}</td>
                          <td className="px-6 py-4 text-black font-medium">{u.first_name} {u.last_name}</td>
                          <td className="px-6 py-4 text-black">{u.email}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${u.is_active ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/20' : 'bg-red-500/15 text-red-600 border border-red-500/20'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                              {u.is_active ? 'Aktīvs' : 'Neaktīvs'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-black/60 font-medium">{u.last_login ? new Date(u.last_login + 'Z').toLocaleString('lv-LV') : '-'}</td>
                          <td className="px-6 py-4 text-black/60 font-medium">{new Date(u.created_at + 'Z').toLocaleString('lv-LV')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      ) : showOpinionsAdmin && user ? (
        <section className="pt-32 pb-24 px-6 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-3xl md:text-5xl text-black">{isAdmin ? 'Visi Sagatavotie Dokumenti' : 'Mani Sagatavotie Dokumenti'}</h2>
              <button onClick={() => setShowOpinionsAdmin(false)} className="flex items-center gap-2 text-black/60 hover:text-black transition-colors text-sm font-bold tracking-widest uppercase">
                <X className="w-5 h-5" />
                {t[language].close}
              </button>
            </div>
            <div className="bg-white/40 backdrop-blur-xl border border-black/10 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-black/80">
                  <thead className="bg-white/60 border-b border-black/10 text-xs uppercase tracking-widest text-black/50">
                    <tr>
                      <th className="px-6 py-4 font-bold whitespace-nowrap">Datums</th>
                      {isAdmin && <th className="px-6 py-4 font-bold whitespace-nowrap">Lietotājs</th>}
                      <th className="px-6 py-4 font-bold whitespace-nowrap">Pakalpojums</th>
                      <th className="px-6 py-4 font-bold">Jautājums</th>
                      <th className="px-6 py-4 font-bold">Darbība</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!Array.isArray(opinionsList) || opinionsList.length === 0 ? (
                      <tr>
                        <td colSpan={isAdmin ? 5 : 4} className="px-6 py-8 text-center text-black/50">Nav sagatavotu atzinumu</td>
                      </tr>
                    ) : (
                      opinionsList.map((o) => {
                        // Handle potential date parsing issues
                        let dateStr = '-';
                        try {
                          const d = new Date(o.created_at.replace(' ', 'T') + 'Z');
                          if (!isNaN(d.getTime())) {
                            dateStr = d.toLocaleString('lv-LV');
                          } else {
                            dateStr = o.created_at;
                          }
                        } catch (e) {
                          dateStr = o.created_at;
                        }
                        
                        return (
                        <tr key={o.id} className="border-b border-black/5 hover:bg-white/60 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap align-top font-medium text-black/60">{dateStr}</td>
                          {isAdmin && (
                            <td className="px-6 py-4 whitespace-nowrap align-top">
                              <div className="text-black font-medium">{o.first_name} {o.last_name}</div>
                              <div className="text-xs text-black/50">{o.email}</div>
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap align-top font-medium text-black">{o.service_type}</td>
                          <td className="px-6 py-4 align-top">
                            <div className="line-clamp-3 text-black/70 leading-relaxed" title={o.question}>
                              {o.question}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap align-top">
                            <button 
                              onClick={() => setViewingOpinion(o)}
                              className="text-xs uppercase tracking-widest font-bold text-black/60 hover:text-black transition-colors flex items-center gap-1 bg-black/5 hover:bg-black/10 px-3 py-1.5 rounded-md"
                            >
                              Skatīt <ChevronRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      )})
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Hero Section */}
          <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-6 overflow-hidden">
        
        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-3xl">
            <FadeIn>
              {user ? (
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/15 text-sm font-bold tracking-widest uppercase text-emerald-700 mb-8 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  {t[language].available}
                </div>
              ) : (
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/15 text-sm font-bold tracking-widest uppercase text-amber-700 mb-8 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                  {t[language].register}
                </div>
              )}
            </FadeIn>
            
            <FadeIn delay={0.1}>
              <h1 className="text-6xl md:text-8xl lg:text-9xl text-black font-bold leading-[0.9] tracking-tighter mb-6 relative z-20 flex flex-col gap-2 md:gap-4">
                <span className="font-display">{t[language].heroTitle1}</span>
                <span className="font-hand text-5xl sm:text-6xl md:text-8xl lg:text-[7.5rem] font-medium text-black/80 -rotate-2 transform origin-left leading-[0.8] py-2 whitespace-nowrap">{t[language].heroTitle2}</span>
                <span className="font-display">{t[language].heroTitle3}</span>
              </h1>
            </FadeIn>
            
            <FadeIn delay={0.2}>
              <p className="font-sans text-xl md:text-3xl text-black font-bold max-w-2xl mb-12 leading-tight tracking-tight">
                {t[language].heroDesc}
              </p>
            </FadeIn>
            
            <FadeIn delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#pakalpojumi" className="inline-flex items-center justify-center gap-2 gold-button px-8 py-4 rounded-full font-bold text-lg text-black hover:scale-105 transition-transform shadow-xl">
                  {t[language].chooseService}
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </FadeIn>
          </div>
          
          <div
            className="absolute -top-4 right-4 md:top-10 lg:top-16 md:right-10 lg:right-20 w-40 h-40 md:w-56 md:h-56 lg:w-64 lg:h-64 z-30 transform rotate-[6deg] hover:rotate-[2deg] hover:scale-105 transition-all cursor-pointer group"
            style={{ filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.15))' }}
            onClick={() => setIsStampModalOpen(true)}
          >
            <div className="w-full h-full text-center flex flex-col items-center justify-center sticky-note group-hover:brightness-105 transition-all">
              {/* Pin */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-red-500 shadow-md border-2 border-red-600 z-40 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white/50"></div>
              </div>
              
              {/* Torn top edge effect */}
              <div className="absolute top-0 left-0 w-full h-3 sticky-note-torn-edge"></div>
              
              <span className="text-3xl md:text-5xl lg:text-6xl leading-[0.9] font-hand font-medium text-black/80 mt-6 relative z-10">Turpmākā<br/>attīstības<br/>vīzija</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="pakalpojumi" className="py-24 md:py-32 px-6 border-t border-black/5 bg-transparent">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <h2 className="font-serif text-3xl md:text-5xl text-black mb-4">Mūsu Pakalpojumi</h2>
            <p className="text-black/60 max-w-2xl mb-16">Pielāgoti risinājumi atkarībā no jūsu situācijas sarežģītības un nepieciešamās detalizācijas pakāpes.</p>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {/* Service 1 */}
            <FadeIn delay={0.1}>
              <button 
                onClick={() => openModal('Vienkāršots atzinums')}
                className="w-full group relative p-8 md:p-12 gold-button h-full flex flex-col items-center justify-center text-center cursor-pointer"
              >
                <FileText className="w-20 h-20 text-black mb-6 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="font-sans text-2xl md:text-3xl text-black font-bold tracking-tight mb-4">Vienkāršots<br/>atzinums</h3>
                <p className="text-black/70 leading-relaxed text-sm font-medium max-w-[250px]">
                  Ātra un strukturēta atbilde uz jūsu juridisko jautājumu.
                </p>
              </button>
            </FadeIn>

            {/* Service 2 */}
            <FadeIn delay={0.2}>
              <button 
                onClick={() => openModal('Padziļināts atzinums')}
                className="w-full group relative p-8 md:p-12 gold-button h-full flex flex-col items-center justify-center text-center cursor-pointer"
              >
                <BookOpen className="w-20 h-20 text-black mb-6 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="font-sans text-2xl md:text-3xl text-black font-bold tracking-tight mb-4">Padziļināts<br/>atzinums</h3>
                <p className="text-black/70 leading-relaxed text-sm font-medium max-w-[250px]">
                  Visaptveroša un detalizēta tiesiskās situācijas analīze.
                </p>
              </button>
            </FadeIn>

            {/* Service 3 */}
            <FadeIn delay={0.3}>
              <button 
                onClick={() => openModal('Dokumentu sagatavošana')}
                className="w-full group relative p-8 md:p-12 gold-button h-full flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden"
              >
                <div className="absolute top-4 right-4 md:top-6 md:right-6 rotate-[15deg] border-2 border-red-600 text-red-600 text-xs md:text-sm font-black uppercase tracking-widest px-2 py-1 rounded opacity-90 pointer-events-none z-10 bg-white/80 backdrop-blur-sm shadow-sm">
                  Izstrādē
                </div>
                <FileIcon className="w-20 h-20 text-black mb-6 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="font-sans text-2xl md:text-3xl text-black font-bold tracking-tight mb-4">Dokumentu<br/>sagatavošana</h3>
                <p className="text-black/70 leading-relaxed text-sm font-medium max-w-[250px]">
                  Jebkāda veida juridisko dokumentu izstrāde atbilstoši jūsu vajadzībām.
                </p>
              </button>
            </FadeIn>

            {/* Service 4 */}
            <FadeIn delay={0.4}>
              <button 
                onClick={() => openModal('Dokumenti tiesai')}
                className="w-full group relative p-8 md:p-12 gold-button h-full flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden"
              >
                <div className="absolute top-4 right-4 md:top-6 md:right-6 rotate-[15deg] border-2 border-red-600 text-red-600 text-xs md:text-sm font-black uppercase tracking-widest px-2 py-1 rounded opacity-90 pointer-events-none z-10 bg-white/80 backdrop-blur-sm shadow-sm">
                  Izstrādē
                </div>
                <Scale className="w-20 h-20 text-black mb-6 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="font-sans text-2xl md:text-3xl text-black font-bold tracking-tight mb-4">Dokumenti<br/>tiesai</h3>
                <p className="text-black/70 leading-relaxed text-sm font-medium max-w-[250px]">
                  Prasības pieteikumi, paskaidrojumi, sūdzības un citi tiesvedības dokumenti.
                </p>
              </button>
            </FadeIn>

            {/* Service 5 */}
            <FadeIn delay={0.5}>
              <button 
                onClick={() => openModal('Parāda kalkulators')}
                className="w-full group relative p-8 md:p-12 gold-button h-full flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden"
              >
                <div className="absolute top-4 right-4 md:top-6 md:right-6 rotate-[15deg] border-2 border-red-600 text-red-600 text-xs md:text-sm font-black uppercase tracking-widest px-2 py-1 rounded opacity-90 pointer-events-none z-10 bg-white/80 backdrop-blur-sm shadow-sm">
                  Izstrādē
                </div>
                <Calculator className="w-20 h-20 text-black mb-6 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="font-sans text-2xl md:text-3xl text-black font-bold tracking-tight mb-4">Parāda<br/>kalkulators</h3>
                <p className="text-black/70 leading-relaxed text-sm font-medium max-w-[250px]">
                  Aprēķiniet parāda summu, ieskaitot nokavējuma procentus un līgumsodu.
                </p>
              </button>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section id="par-mums" className="py-24 px-6 border-t border-black/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <h2 className="mb-6">
                <a 
                  href="https://bajarslegal.lv" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block gold-button px-8 py-3 md:py-4 rounded-full font-serif text-3xl md:text-5xl text-black hover:scale-105 transition-transform shadow-md w-fit"
                >
                  Ivars Bajārs
                </a>
              </h2>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/10 bg-white/5 text-xs font-medium tracking-widest uppercase text-black/80 mb-6">
                Jurists, stratēģis un vadītājs
              </div>
              <p className="text-black/60 mb-8 leading-relaxed">
                Esmu jurists, stratēģis un vadītājs ar 15+ gadu pieredzi privātajā sektorā un valsts kapitālsabiedrībās. 
                Mana specializācija ir iekšējo normatīvo aktu un procedūru izstrāde, līgumu un iepirkumu dokumentācijas 
                tiesiskuma izvērtēšana, kā arī strīdu, tiesvedību un parādu administrēšanas vadība.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <Shield className="w-6 h-6 text-black/50 shrink-0" />
                  <div>
                    <h4 className="text-black font-medium mb-1">Valsts pārvalde un Iepirkumi</h4>
                    <p className="text-sm text-black/50">Ilglaicīga pieredze kā Juridiskās un iepirkumu daļas vadītājam (VSIA "LVĢMC"), nodrošinot atbilstību un korupcijas risku vadību.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Scale className="w-6 h-6 text-black/50 shrink-0" />
                  <div>
                    <h4 className="text-black font-medium mb-1">Tiesvedība un Strīdu risināšana</h4>
                    <p className="text-sm text-black/50">Iepriekš vadījis Tiesvedības daļu (SIA "Hiponia"), pārstāvot intereses tiesās un organizējot problemātisko prasījumu atgūšanu.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <BookOpen className="w-6 h-6 text-black/50 shrink-0" />
                  <div>
                    <h4 className="text-black font-medium mb-1">Mūsdienīga pieeja</h4>
                    <p className="text-sm text-black/50">Izmantoju jaunākos AI rīkus (ChatGPT, Gemini, NotebookLM) un DVS sistēmas, lai nodrošinātu maksimālu efektivitāti un precizitāti.</p>
                  </div>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.2} className="h-full">
              <div className="h-full flex flex-col justify-between p-8 md:p-12 rounded-3xl border border-black/10 bg-white/40">
                <div>
                  <div className="font-serif text-8xl md:text-9xl text-black mb-4 leading-none tracking-tighter">15<span className="text-black/40">+</span></div>
                  <div className="text-sm tracking-widest uppercase text-black/60 font-medium mb-12">Gadu pieredze jurisprudencē</div>
                </div>
                
                <div className="space-y-6 border-t border-black/10 pt-8">
                  <div className="flex justify-between items-start text-sm">
                    <span className="text-black/60">Izglītība</span>
                    <span className="text-black text-right font-medium">Tiesību zinātņu bakalaurs<br/><span className="text-xs text-black/50 font-normal">BA "Turība"</span></span>
                  </div>
                  <div className="flex justify-between items-start text-sm">
                    <span className="text-black/60">Valodas</span>
                    <span className="text-black text-right font-medium">Latviešu, Angļu, Krievu</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="kontakti" className="py-24 px-6 border-t border-black/5 bg-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="font-serif text-3xl md:text-5xl text-black mb-6">Kontakti</h2>
            <p className="text-black/60 mb-16 max-w-2xl mx-auto">
              Sazinieties ar mani, lai vienotos par atbilstošāko atzinuma veidu un pārrunātu jūsu situāciju.
            </p>
          </FadeIn>
          
          <FadeIn delay={0.1}>
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12 text-base text-black/60">
              <a href="mailto:ivars.bajars@gmail.com" className="flex items-center gap-3 hover:text-black transition-colors group">
                <div className="w-12 h-12 rounded-full border border-black/10 bg-white/40 rounded-xl flex items-center justify-center group-hover:border-slate-500 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <span>ivars.bajars@gmail.com</span>
              </a>
              <a href="tel:+37129421602" className="flex items-center gap-3 hover:text-black transition-colors group">
                <div className="w-12 h-12 rounded-full border border-black/10 bg-white/40 rounded-xl flex items-center justify-center group-hover:border-slate-500 transition-colors shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="whitespace-nowrap">+371 29421602</span>
              </a>
              <a href="https://bajarslegal.lv" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-black transition-colors group">
                <div className="w-12 h-12 rounded-full border border-black/10 bg-white/40 rounded-xl flex items-center justify-center group-hover:border-slate-500 transition-colors">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span>bajarslegal.lv</span>
              </a>
              <div className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-full border border-black/10 bg-white/40 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <span>Jaunmārupe, Mārupes novads</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-black/5 text-center text-xs text-slate-600">
        <p>&copy; {new Date().getFullYear()} Ivars Bajārs. Visas tiesības aizsargātas.</p>
      </footer>
        </>
      )}

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/40 backdrop-blur-xl border border-black/10 p-8 w-full max-w-md relative rounded-2xl shadow-2xl"
          >
            <button 
              onClick={() => setIsLoginModalOpen(false)} 
              className="absolute top-4 right-4 flex items-center gap-2 text-black/60 hover:text-black transition-colors z-10 text-sm font-bold tracking-widest uppercase bg-black/5 hover:bg-black/10 px-3 py-1.5 rounded-md"
            >
              <X className="w-5 h-5" />
              {t[language].close}
            </button>
            
            <h3 className="font-serif text-2xl text-black mb-6 mt-4">{isRegistering ? 'Reģistrēties' : 'Ienākt'}</h3>
            
            <form onSubmit={handleAuth} className="space-y-4">
              {isRegistering && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-black/50 font-bold">Vārds</label>
                    <input 
                      type="text" 
                      value={registerFirstName}
                      onChange={(e) => setRegisterFirstName(e.target.value)}
                      className="w-full gold-glass-light rounded-xl px-4 py-3 text-black focus:outline-none focus:border-black/30 transition-colors shadow-sm" 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-black/50 font-bold">Uzvārds</label>
                    <input 
                      type="text" 
                      value={registerLastName}
                      onChange={(e) => setRegisterLastName(e.target.value)}
                      className="w-full bg-white/60 rounded-xl border border-black/10 px-4 py-3 text-black focus:outline-none focus:border-black/30 transition-colors shadow-sm" 
                      required
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-black/50 font-bold">E-pasts</label>
                <input 
                  type="email" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-white/60 rounded-xl border border-black/10 px-4 py-3 text-black focus:outline-none focus:border-black/30 transition-colors shadow-sm" 
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-black/50 font-bold">Parole</label>
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-white/60 rounded-xl border border-black/10 px-4 py-3 text-black focus:outline-none focus:border-black/30 transition-colors shadow-sm" 
                  required
                />
              </div>
              
              {loginError && <p className="text-red-500 text-sm font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20">{loginError}</p>}
              
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setIsLoginModalOpen(false)} className="w-1/3 gold-glass-light text-black font-bold py-4 rounded-xl hover:bg-white transition-colors shadow-sm">
                  {t[language].cancel}
                </button>
                <button type="submit" className="w-2/3 gold-button font-bold py-4 rounded-xl shadow-md">
                  {isRegistering ? 'Reģistrēties' : 'Ienākt'}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center text-sm text-black/60 font-medium">
              {isRegistering ? 'Jau ir konts? ' : 'Nav konta? '}
              <button onClick={() => setIsRegistering(!isRegistering)} className="text-black hover:underline font-bold">
                {isRegistering ? 'Ienākt' : 'Reģistrēties'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-gradient-to-br from-[#f6e09e] via-[#d4af37] to-[#b88a36] border border-white/20 p-8 w-full relative transition-all duration-500 max-h-[90vh] flex flex-col rounded-2xl shadow-2xl ${isComplete || (isClarifying && clarificationQuestionsList.length > 0) ? 'max-w-4xl' : 'max-w-lg'}`}
          >
            <button 
              onClick={closeModal} 
              className="absolute top-4 right-4 flex items-center gap-2 text-black/60 hover:text-black transition-colors z-10 text-sm font-bold tracking-widest uppercase bg-white/20 hover:bg-white/40 px-3 py-1.5 rounded-md"
            >
              <X className="w-5 h-5" />
              {t[language].close}
            </button>
            
            {!isComplete && (
              <>
                <h3 className="font-serif text-2xl text-black mb-2 mt-4">{selectedService}</h3>
                <p className="text-sm text-black/60 mb-6 font-medium">
                  {isProcessing ? 'Paldies par sniegto informāciju!' : 'Aizpildiet informāciju, lai saņemtu atzinumu.'}
                </p>
              </>
            )}

            {!isProcessing && !isComplete && !isClarifying && (
              <form onSubmit={handleProcess} className="flex flex-col overflow-hidden">
                <div className="overflow-y-auto pr-2 custom-scrollbar space-y-4 max-h-[60vh]">
                  {selectedService === 'Dokumentu sagatavošana' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-black/50 font-bold">
                          {language === 'en' ? 'Select document type' : language === 'ru' ? 'Выберите тип документа' : 'Izvēlieties dokumenta veidu'}
                        </label>
                        <div className="relative">
                          <select
                            value={initialDocumentType}
                            onChange={(e) => {
                              setInitialDocumentType(e.target.value);
                            }}
                            className="w-full bg-white/60 rounded-xl border border-black/10 px-4 py-3 text-black focus:outline-none focus:border-black/30 transition-colors appearance-none shadow-sm"
                            required
                          >
                            <option value="" disabled>{language === 'en' ? 'Select...' : language === 'ru' ? 'Выберите...' : 'Izvēlieties...'}</option>
                            {documentTypes.map(doc => (
                              <option key={doc.id} value={doc.id}>{doc[language as keyof typeof doc]}</option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-black/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                      </div>
                      
                      {initialDocumentType === 'cits' && (
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest text-black/50 font-bold">
                            {t[language].enterDocumentName}
                          </label>
                          <input
                            type="text"
                            value={initialCustomDocumentName}
                            onChange={(e) => setInitialCustomDocumentName(e.target.value)}
                            className="w-full bg-white/60 rounded-xl border border-black/10 px-4 py-3 text-black focus:outline-none focus:border-black/30 transition-colors shadow-sm"
                            required
                          />
                        </div>
                      )}
                    </div>
                  )}
                  {selectedService === 'Dokumenti tiesai' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-black/50 font-bold">
                          {language === 'en' ? 'Select document type' : language === 'ru' ? 'Выберите тип документа' : 'Izvēlieties dokumenta veidu'}
                        </label>
                        <div className="relative">
                          <select
                            value={courtDocumentType}
                            onChange={(e) => {
                              setCourtDocumentType(e.target.value);
                            }}
                            className="w-full bg-white/60 rounded-xl border border-black/10 px-4 py-3 text-black focus:outline-none focus:border-black/30 transition-colors appearance-none shadow-sm"
                            required
                          >
                            <option value="" disabled>{language === 'en' ? 'Select...' : language === 'ru' ? 'Выберите...' : 'Izvēlieties...'}</option>
                            {courtDocumentTypes.map(doc => (
                              <option key={doc.id} value={doc.id}>{doc[language as keyof typeof doc]}</option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-black/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                      </div>
                      
                      {courtDocumentType === 'cits' && (
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest text-black/50 font-bold">
                            {t[language].enterDocumentName}
                          </label>
                          <input
                            type="text"
                            value={courtCustomDocumentName}
                            onChange={(e) => setCourtCustomDocumentName(e.target.value)}
                            className="w-full bg-white/60 rounded-xl border border-black/10 px-4 py-3 text-black focus:outline-none focus:border-black/30 transition-colors shadow-sm"
                            required
                          />
                        </div>
                      )}
                    </div>
                  )}
                  {selectedService === 'Dokumentu sagatavošana UR' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-black/50 font-bold">
                          {language === 'en' ? 'Select action to perform' : language === 'ru' ? 'Выберите действие' : 'Kādu darbību vēlaties veikt?'}
                        </label>
                        <div className="relative">
                          <select
                            value={urAction}
                            onChange={(e) => {
                              setUrAction(e.target.value);
                            }}
                            className="w-full bg-white/60 rounded-xl border border-black/10 px-4 py-3 text-black focus:outline-none focus:border-black/30 transition-colors appearance-none shadow-sm"
                            required
                          >
                            <option value="" disabled>{language === 'en' ? 'Select...' : language === 'ru' ? 'Выберите...' : 'Izvēlieties...'}</option>
                            {urActions.map(action => (
                              <option key={action.id} value={action.id}>{action[language as keyof typeof action]}</option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-black/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                      </div>
                      
                      {urAction === 'cits' && (
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest text-black/50 font-bold">
                            {language === 'en' ? 'Enter action' : language === 'ru' ? 'Введите действие' : 'Ievadiet darbību'}
                          </label>
                          <input
                            type="text"
                            value={urActionCustom}
                            onChange={(e) => setUrActionCustom(e.target.value)}
                            className="w-full bg-white/60 rounded-xl border border-black/10 px-4 py-3 text-black focus:outline-none focus:border-black/30 transition-colors shadow-sm"
                            required
                          />
                        </div>
                      )}
                    </div>
                  )}
                  {selectedService === 'Parāda kalkulators' && (
                    <div className="flex bg-black/5 p-1 rounded-xl mb-4">
                      <button
                        type="button"
                        onClick={() => setCalculatorMode('manual')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${calculatorMode === 'manual' ? 'bg-white text-black shadow-sm' : 'text-black/50 hover:text-black/80'}`}
                      >
                        Ievadīt datus manuāli
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalculatorMode('files')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${calculatorMode === 'files' ? 'bg-white text-black shadow-sm' : 'text-black/50 hover:text-black/80'}`}
                      >
                        Pievienot failus
                      </button>
                    </div>
                  )}
                  {selectedService === 'Parāda kalkulators' && calculatorMode === 'manual' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-black/50 font-bold">Pamatparāda summa (EUR)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={calcPrincipal}
                          onChange={(e) => setCalcPrincipal(e.target.value)}
                          placeholder="Piemēram, 1500.00"
                          className="w-full bg-white/60 rounded-xl border border-black/10 px-4 py-3 text-black focus:outline-none focus:border-black/30 transition-colors shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-black/50 font-bold">Apmaksas termiņš</label>
                        <div className="relative">
                          <DatePicker
                            selected={calcDueDate}
                            onChange={(d) => setCalcDueDate(d)}
                            locale={language === 'en' ? 'en' : language}
                            dateFormat="dd.MM.yyyy"
                            className="w-full bg-white/60 rounded-xl border border-black/10 pl-11 pr-4 py-3 text-black focus:outline-none focus:border-black/30 transition-colors placeholder:text-black/40 shadow-sm"
                            wrapperClassName="w-full"
                            placeholderText="Izvēlieties datumu"
                            required
                          />
                          <Calendar className="w-5 h-5 text-black/50 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-black/50 font-bold">Nokavējuma procentu likme (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={calcInterestRate}
                          onChange={(e) => setCalcInterestRate(e.target.value)}
                          placeholder="Piemēram, 6 (gadā) vai 0.1 (dienā)"
                          className="w-full bg-white/60 rounded-xl border border-black/10 px-4 py-3 text-black focus:outline-none focus:border-black/30 transition-colors shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-black/50 font-bold">Līgumsoda likme (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={calcPenaltyRate}
                          onChange={(e) => setCalcPenaltyRate(e.target.value)}
                          placeholder="Piemēram, 10 (kopā) vai 0.5 (dienā)"
                          className="w-full bg-white/60 rounded-xl border border-black/10 px-4 py-3 text-black focus:outline-none focus:border-black/30 transition-colors shadow-sm"
                        />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-black/50 font-bold">
                      {(selectedService.startsWith('Dokumentu sagatavošana') || selectedService === 'Dokumenti tiesai') ? 'Dokumenta apraksts / Situācija' : selectedService === 'Parāda kalkulators' ? (calculatorMode === 'files' ? 'Papildu informācija / Komentāri' : 'Parāda apraksts / Situācija') : 'Jautājums / Situācija'}
                    </label>
                    <textarea
                      required={calculatorMode !== 'files'}
                      value={question}
                      onChange={(e) => {
                        setQuestion(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                      rows={4}
                      placeholder={(selectedService.startsWith('Dokumentu sagatavošana') || selectedService === 'Dokumenti tiesai') ? "Aprakstiet, kādu dokumentu vēlaties sagatavot..." : selectedService === 'Parāda kalkulators' ? (calculatorMode === 'files' ? "Pievienojiet jebkādus papildu komentārus par pievienotajiem failiem (neobligāti)..." : "Aprakstiet parāda situāciju (summa, termiņš, procenti)...") : "Aprakstiet savu juridisko jautājumu..."}
                      className="w-full bg-white/60 rounded-xl border border-black/10 px-4 py-3 text-black focus:outline-none focus:border-black/30 transition-colors resize-none placeholder:text-black/40 shadow-sm overflow-hidden min-h-[100px]"
                    />
                    {companySuggestions.length > 0 && (
                      <div className="mt-2 p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                        <div className="flex items-center gap-2 mb-2 text-xs text-blue-800 font-medium uppercase tracking-wider">
                          <Search className="w-3 h-3" />
                          Atrasti uzņēmumu dati (noklikšķiniet, lai aizstātu tekstā)
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {companySuggestions.map((s, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                const newText = question.replace(s.original, `${s.officialName} (Reģ. nr. ${s.regNumber})`);
                                setQuestion(newText);
                                setCompanySuggestions(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="text-xs bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                              <span className="line-through opacity-60">{s.original}</span>
                              <ArrowRight className="w-3 h-3" />
                              <span className="font-semibold">{s.officialName}</span>
                              <span className="opacity-75">({s.regNumber})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {isSearchingCompanies && companySuggestions.length === 0 && question.length > 10 && (
                       <div className="mt-2 text-xs text-black/40 flex items-center gap-1.5 font-medium">
                         <Loader2 className="w-3 h-3 animate-spin" /> Pārbauda uzņēmumu nosaukumus...
                       </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex flex-col justify-end gap-2 relative" ref={companyDropdownRef}>
                      <label className="text-xs uppercase tracking-widest text-black/50 block font-bold" title={t[language].companyNameLabel}>{t[language].companyNameLabel}</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={companyNameField}
                          onChange={(e) => {
                            setCompanyNameField(e.target.value);
                            setShowCompanyDropdown(true);
                          }}
                          onFocus={() => {
                            if (companySearchSuggestions.length > 0) setShowCompanyDropdown(true);
                          }}
                          placeholder={t[language].companyNamePlaceholder}
                          className="w-full bg-white/60 rounded-xl border border-black/10 pl-11 pr-4 py-3 text-black focus:outline-none focus:border-black/30 transition-colors placeholder:text-black/40 shadow-sm"
                        />
                        <Search className="w-5 h-5 text-black/50 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        
                        {isSearchingCompanyField && companyNameField.length >= 3 && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Loader2 className="w-4 h-4 text-black/40 animate-spin" />
                          </div>
                        )}
                      </div>
                      
                      {showCompanyDropdown && companySearchSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-black/10 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                          {companySearchSuggestions.map((s, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className="w-full text-left px-4 py-3 hover:bg-black/5 border-b border-black/5 last:border-0 transition-colors"
                              onClick={() => {
                                setCompanyNameField(`${s.officialName} (Reģ. nr. ${s.regNumber})`);
                                setShowCompanyDropdown(false);
                              }}
                            >
                              <div className="font-medium text-black/80">{s.officialName}</div>
                              <div className="text-xs text-black/50">Reģ. nr. {s.regNumber}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-end gap-2">
                      <label className="text-xs uppercase tracking-widest text-black/50 block font-bold" title={t[language].dateFromLabel}>{t[language].dateFromLabel}</label>
                      <div className="relative">
                        <DatePicker
                          selected={date}
                          onChange={(d) => setDate(d)}
                          locale={language === 'en' ? 'en' : language}
                          dateFormat="dd.MM.yyyy"
                          className="w-full bg-white/60 rounded-xl border border-black/10 pl-11 pr-4 py-3 text-black focus:outline-none focus:border-black/30 transition-colors placeholder:text-black/40 shadow-sm"
                          wrapperClassName="w-full"
                          required
                        />
                        <Calendar className="w-5 h-5 text-black/50 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                    <div className="flex flex-col justify-end gap-2">
                      <label className="text-xs uppercase tracking-widest text-black/50 block font-bold" title={t[language].dateToLabel}>{t[language].dateToLabel}</label>
                      <div className="relative">
                        <DatePicker
                          selected={endDate}
                          onChange={(d) => setEndDate(d)}
                          locale={language === 'en' ? 'en' : language}
                          dateFormat="dd.MM.yyyy"
                          className="w-full bg-white/60 rounded-xl border border-black/10 pl-11 pr-4 py-3 text-black focus:outline-none focus:border-black/30 transition-colors placeholder:text-black/40 shadow-sm"
                          wrapperClassName="w-full"
                          placeholderText={language === 'en' ? 'Optional' : language === 'ru' ? 'Необязательно' : 'Neobligāti'}
                        />
                        <Calendar className="w-5 h-5 text-black/50 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                    <div className="flex flex-col justify-end gap-2">
                      <label className="text-xs uppercase tracking-widest text-black/50 block font-bold" title={t[language].countryLabel}>{t[language].countryLabel}</label>
                      <div className="relative">
                        <select
                          className="w-full bg-white/60 rounded-xl border border-black/10 px-4 py-3 text-black focus:outline-none focus:border-black/30 transition-colors appearance-none shadow-sm"
                          required
                          defaultValue="LV"
                        >
                          <option value="LV">{t[language].countryLatvia}</option>
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                          <svg className="w-4 h-4 text-black/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {(selectedService === 'Padziļināts atzinums' || selectedService.startsWith('Dokumentu sagatavošana') || selectedService === 'Dokumenti tiesai' || (selectedService === 'Parāda kalkulators' && calculatorMode === 'files')) && (
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-black/50 font-bold">Pievienot dokumentus (PDF, DOCX)</label>
                      <div className="relative">
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.docx"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-full bg-white/60 rounded-xl border border-black/10 border-dashed px-4 py-6 text-center hover:border-black/30 transition-colors flex flex-col items-center justify-center gap-2 shadow-sm">
                          <Upload className="w-6 h-6 text-black/50" />
                          <span className="text-sm text-black/60 font-medium">Noklikšķiniet vai ievelciet failus šeit</span>
                        </div>
                      </div>
                      
                      {attachedFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {attachedFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white/60 px-3 py-2 rounded-xl border border-black/10 shadow-sm">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <FileIcon className="w-4 h-4 text-black/60 shrink-0" />
                                <span className="text-sm text-black/80 truncate font-medium">{file.name}</span>
                              </div>
                              <button 
                                type="button" 
                                onClick={() => removeFile(idx)}
                                className="text-black/50 hover:text-red-500 transition-colors p-1 bg-black/5 hover:bg-red-500/10 rounded-md"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {(selectedService.startsWith('Dokumentu sagatavošana') || selectedService === 'Dokumenti tiesai') && (
                  <div className="mt-4 flex items-center gap-3 bg-white/60 p-4 rounded-xl border border-black/10 shadow-sm">
                    <input
                      type="checkbox"
                      id="edoc-checkbox"
                      checked={isEDoc}
                      onChange={(e) => setIsEDoc(e.target.checked)}
                      className="w-5 h-5 rounded border-black/20 text-black focus:ring-black"
                    />
                    <label htmlFor="edoc-checkbox" className="text-sm font-medium text-black/80 cursor-pointer select-none">
                      {language === 'en' ? 'Document will be signed with a secure electronic signature (eSignature)' : language === 'ru' ? 'Документ будет подписан надежной электронной подписью (eSignature)' : 'Dokuments tiks parakstīts ar drošu elektronisko parakstu (eParaksts)'}
                    </label>
                  </div>
                )}

                <div className="flex gap-4 mt-6 shrink-0 pt-4 border-t border-black/10">
                  <button type="button" onClick={closeModal} className="w-1/3 bg-white/60 border border-black/10 text-black font-bold py-4 rounded-xl hover:bg-white transition-colors shadow-sm">
                    {t[language].cancel}
                  </button>
                  <button type="submit" className="w-2/3 gold-button font-bold py-4 rounded-xl shadow-md">
                    {(selectedService.startsWith('Dokumentu sagatavošana') || selectedService === 'Dokumenti tiesai') ? 'Sagatavot dokumentu' : selectedService === 'Parāda kalkulators' ? 'Aprēķināt parādu' : 'Sagatavot atzinumu'}
                  </button>
                </div>
              </form>
            )}

            {isClarifying && (
              <form onSubmit={handleClarificationSubmit} className="space-y-4 flex flex-col h-full max-h-[70vh]">
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl mb-6 shadow-sm shrink-0">
                  <h4 className="text-amber-600 font-bold mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Nepieciešama papildu informācija
                  </h4>
                  {clarificationQuestionsList.length === 0 && (
                    <p className="text-sm text-amber-700/80 whitespace-pre-wrap font-medium mt-2">
                      {clarificationQuestions}
                    </p>
                  )}
                </div>
                
                <div className="overflow-y-auto custom-scrollbar pr-2 flex-1 space-y-4">
                  {clarificationQuestionsList.length > 0 ? (
                    <div className="border border-black/10 rounded-xl overflow-hidden bg-white/40">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-black/5 border-b border-black/10">
                            <th className="p-3 text-xs uppercase tracking-widest text-black/50 font-bold w-1/2 border-r border-black/10">Jautājums</th>
                            <th className="p-3 text-xs uppercase tracking-widest text-black/50 font-bold w-1/2">Atbilde</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clarificationQuestionsList.map((q, idx) => (
                            <tr key={idx} className="border-b border-black/10 last:border-0">
                              <td className="p-3 text-sm text-black/80 align-top border-r border-black/10 font-medium">{q.text}</td>
                              <td className="p-0 align-top">
                                {q.options && q.options.length > 0 ? (
                                  <div className="p-3 flex flex-col gap-2">
                                    {q.options.map((opt, optIdx) => (
                                      <label key={optIdx} className="flex items-start gap-2 cursor-pointer group">
                                        <div className="relative flex items-center justify-center mt-0.5">
                                          <input
                                            type="radio"
                                            name={`question-${idx}`}
                                            value={opt}
                                            checked={clarificationAnswersList[idx] === opt}
                                            onChange={(e) => setClarificationAnswersList({...clarificationAnswersList, [idx]: e.target.value})}
                                            className="peer appearance-none w-4 h-4 border border-black/30 rounded-full checked:border-black/80 checked:bg-black/80 transition-all cursor-pointer"
                                            required
                                          />
                                          <div className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"></div>
                                        </div>
                                        <span className="text-sm text-black/80 group-hover:text-black transition-colors">{opt}</span>
                                      </label>
                                    ))}
                                  </div>
                                ) : (
                                  <textarea
                                    required
                                    value={clarificationAnswersList[idx] || ''}
                                    onChange={(e) => {
                                      setClarificationAnswersList({...clarificationAnswersList, [idx]: e.target.value});
                                      e.target.style.height = 'auto';
                                      e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                    rows={2}
                                    placeholder="Ievadiet atbildi..."
                                    className="w-full h-full min-h-[60px] bg-transparent border-0 px-3 py-3 text-black focus:outline-none focus:bg-white/60 transition-colors resize-none placeholder:text-black/40"
                                  />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="space-y-2 mt-4">
                      <label className="text-xs uppercase tracking-widest text-black/50 font-bold">Jūsu atbilde</label>
                      <textarea
                        required
                        value={clarificationAnswer}
                        onChange={(e) => {
                          setClarificationAnswer(e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        rows={4}
                        placeholder="Lūdzu, atbildiet uz jautājumiem..."
                        className="w-full bg-white/60 rounded-xl border border-black/10 px-4 py-3 text-black focus:outline-none focus:border-black/30 transition-colors resize-none placeholder:text-black/40 shadow-sm min-h-[100px]"
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex gap-4 mt-6 shrink-0 pt-2 border-t border-black/5">
                  <button type="button" onClick={closeModal} className="w-1/3 bg-white/60 border border-black/10 text-black font-bold py-4 rounded-xl hover:bg-white transition-colors shadow-sm">
                    {t[language].cancel}
                  </button>
                  <button type="submit" className="w-2/3 gold-button font-bold py-4 rounded-xl shadow-md">
                    Iesniegt atbildi un turpināt
                  </button>
                </div>
              </form>
            )}

            {isProcessing && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-8 h-8 text-black animate-spin mb-4" />
                <p className="text-black/80 font-bold tracking-wide">Apstrādā pieprasījumu...</p>
                <p className="text-sm text-black/50 mt-2 font-medium">
                  {selectedService === 'Vienkāršots atzinums' 
                    ? 'Tiek analizēti normatīvie akti' 
                    : (selectedService.startsWith('Dokumentu sagatavošana') || selectedService === 'Dokumenti tiesai')
                    ? 'Tiek sagatavots dokuments'
                    : 'Tiek analizēta tiesu prakse, normatīvie akti un tiesību teorija'}
                </p>
              </div>
            )}

            {isComplete && (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex items-center gap-4 mb-6 shrink-0">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shadow-sm">
                    <FileText className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-xl text-black font-serif">
                      {(selectedService.startsWith('Dokumentu sagatavošana') || selectedService === 'Dokumenti tiesai') ? 'Dokuments ir sagatavots' : 'Atzinums ir sagatavots'}
                    </h4>
                    <p className="text-sm text-black/60 font-medium">
                      {(selectedService.startsWith('Dokumentu sagatavošana') || selectedService === 'Dokumenti tiesai') ? 'Jūsu dokuments ir pieejams zemāk.' : 'Jūsu atzinums ir pieejams zemāk.'}
                    </p>
                  </div>
                </div>
                
                <div className="flex-grow overflow-y-auto pr-2 mb-6 custom-scrollbar">
                  <div className="gold-glass-light text-black p-8 rounded-xl text-sm leading-relaxed font-serif shadow-sm">
                    <h1 className="text-2xl font-bold text-center mb-6 font-sans">
                      {(selectedService.startsWith('Dokumentu sagatavošana') || selectedService === 'Dokumenti tiesai') ? 'JURIDISKAIS DOKUMENTS' : 'JURIDISKAIS ATZINUMS'}
                    </h1>
                    <div className="mb-8 text-black/60 border-b border-black/10 pb-6 font-sans">
                      <p><strong>Pakalpojums:</strong> {selectedService}</p>
                      {companyNameField && <p><strong>Uzņēmums:</strong> {companyNameField}</p>}
                      <p><strong>Datums:</strong> {date ? date.toLocaleDateString('lv-LV') : ''}${endDate ? ' - ' + endDate.toLocaleDateString('lv-LV') : ''}</p>
                      <p><strong>Sagatavots:</strong> {new Date().toLocaleDateString('lv-LV')}</p>
                    </div>
                    
                    <h2 className="text-lg font-bold mb-3 font-sans">1. Jautājums / Situācijas apraksts:</h2>
                    <p className="mb-8 whitespace-pre-wrap">{question}</p>
                    
                    <h2 className="text-lg font-bold mb-3 font-sans">
                      {(selectedService.startsWith('Dokumentu sagatavošana') || selectedService === 'Dokumenti tiesai') ? '2. Dokuments:' : '2. Atzinums:'}
                    </h2>
                    <p className="whitespace-pre-wrap">{generatedAnswer}</p>
                    
                    {(suggestedDocuments.length > 0 || hasMultipleScenarios) && selectedService === 'Padziļināts atzinums' && (
                      <div className="mt-8 pt-6 border-t border-black/10 font-sans grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Procedural Documents Section */}
                        {suggestedDocuments.length > 0 && (
                          <div>
                            <h2 className="text-lg font-bold mb-3">{t[language].suggestedDocsTitle}</h2>
                            <p className="text-sm text-black/70 mb-4">{t[language].suggestedDocsDesc}</p>
                            
                            <div className="space-y-2 mb-4">
                              {suggestedDocuments.map((doc, idx) => (
                                <label key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-black/10 bg-white/40 cursor-pointer hover:bg-white/60 transition-colors">
                                  <input 
                                    type="radio" 
                                    name="procedural_doc" 
                                    value={doc} 
                                    checked={!isCustomDocument && selectedDocument === doc}
                                    onChange={(e) => {
                                      setIsCustomDocument(false);
                                      setSelectedDocument(e.target.value);
                                      setDocumentQuestions([]);
                                      setDocumentAnswers({});
                                      setGeneratedDocument('');
                                    }}
                                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                                  />
                                  <span className="text-sm font-medium text-black">{doc}</span>
                                </label>
                              ))}
                              
                              <label className="flex items-center gap-3 p-3 rounded-xl border border-black/10 bg-white/40 cursor-pointer hover:bg-white/60 transition-colors">
                                <input 
                                  type="radio" 
                                  name="procedural_doc" 
                                  value="custom" 
                                  checked={isCustomDocument}
                                  onChange={() => {
                                    setIsCustomDocument(true);
                                    setSelectedDocument('');
                                    setDocumentQuestions([]);
                                    setDocumentAnswers({});
                                    setGeneratedDocument('');
                                  }}
                                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                                />
                                <span className="text-sm font-medium text-black">{t[language].otherDocument}</span>
                              </label>
                              
                              {isCustomDocument && (
                                <div className="mt-2 pl-7">
                                  <input
                                    type="text"
                                    value={customDocumentName}
                                    onChange={(e) => setCustomDocumentName(e.target.value)}
                                    placeholder={t[language].enterDocumentName}
                                    className="w-full p-3 rounded-xl border border-black/10 bg-white/80 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                                  />
                                </div>
                              )}
                            </div>
                            
                            {!documentQuestions.length && !generatedDocument && (
                              <button 
                                onClick={() => generateDocumentQuestions()}
                                disabled={(isCustomDocument ? !customDocumentName.trim() : !selectedDocument) || isGeneratingDocumentQuestions}
                                className="w-full inline-flex items-center justify-center gap-2 gold-button px-6 py-3 rounded-xl font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isGeneratingDocumentQuestions ? (
                                  <><Loader2 className="w-4 h-4 animate-spin" /> {t[language].generatingDocQuestions}</>
                                ) : (
                                  <><FileText className="w-4 h-4" /> {t[language].generateDocBtn}</>
                                )}
                              </button>
                            )}

                            {documentQuestions.length > 0 && !generatedDocument && (
                              <div className="mt-6 p-6 bg-white/60 rounded-xl border border-black/10 shadow-sm">
                                <h3 className="text-md font-bold mb-4">{t[language].docQuestionsTitle}</h3>
                                <div className="mb-4">
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                      <thead>
                                        <tr className="border-b border-black/10">
                                          <th className="py-3 pr-4 font-semibold text-sm w-1/2">{language === 'en' ? 'Question' : language === 'ru' ? 'Вопрос' : 'Jautājums'}</th>
                                          <th className="py-3 pl-4 font-semibold text-sm w-1/2">{language === 'en' ? 'Answer' : language === 'ru' ? 'Ответ' : 'Atbilde'}</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {documentQuestions.map((q, i) => (
                                          <tr key={i} className="border-b border-black/5 last:border-0">
                                            <td className="py-4 pr-4 text-sm align-top">
                                              {q}
                                            </td>
                                            <td className="py-4 pl-4 align-top">
                                              <textarea
                                                value={documentAnswers[i] || ''}
                                                onChange={(e) => setDocumentAnswers({...documentAnswers, [i]: e.target.value})}
                                                placeholder={t[language].docAnswersPlaceholder}
                                                className="w-full p-3 rounded-xl border border-black/10 bg-white/80 focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-y min-h-[80px] text-sm"
                                              />
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                                <button 
                                  onClick={handleDocumentClarificationSubmit}
                                  disabled={isGeneratingDocumentQuestions || isGeneratingDocument || Object.keys(documentAnswers).length === 0}
                                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isGeneratingDocumentQuestions || isGeneratingDocument ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> {t[language].generatingDoc}</>
                                  ) : (
                                    <><FileText className="w-4 h-4" /> {t[language].submitDocAnswersBtn}</>
                                  )}
                                </button>
                              </div>
                            )}
                            
                            {generatedDocument && (
                              <div className="mt-6 p-6 bg-white/60 rounded-xl border border-black/10 shadow-sm">
                                <h3 className="text-md font-bold mb-4">{t[language].generatedDocTitle}: {isCustomDocument ? customDocumentName : selectedDocument}</h3>
                                <div className="max-h-60 overflow-y-auto custom-scrollbar pr-2 mb-4">
                                  <p className="whitespace-pre-wrap text-sm">{generatedDocument}</p>
                                </div>
                                <button 
                                  onClick={downloadGeneratedDocument}
                                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-emerald-700 transition-colors"
                                >
                                  <Download className="w-4 h-4" />
                                  {t[language].downloadDocBtn}
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Risk Analysis Section */}
                        {hasMultipleScenarios && (
                          <div>
                            <h2 className="text-lg font-bold mb-3">{t[language].riskAnalysisTitle}</h2>
                            <p className="text-sm text-black/70 mb-4">{t[language].riskAnalysisDesc}</p>
                            
                            {!generatedRiskAnalysis && (
                              <button 
                                onClick={generateRiskAnalysis}
                                disabled={isGeneratingRiskAnalysis}
                                className="w-full inline-flex items-center justify-center gap-2 gold-button px-6 py-3 rounded-xl font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isGeneratingRiskAnalysis ? (
                                  <><Loader2 className="w-4 h-4 animate-spin" /> {t[language].generatingRisk}</>
                                ) : (
                                  <><FileText className="w-4 h-4" /> {t[language].generateRiskBtn}</>
                                )}
                              </button>
                            )}
                            
                            {generatedRiskAnalysis && (
                              <button 
                                onClick={() => setShowRiskAnalysisModal(true)}
                                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-emerald-700 transition-colors"
                              >
                                <FileText className="w-4 h-4" />
                                {t[language].viewRiskAnalysisBtn}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-8 pt-6 border-t border-black/10 text-xs text-black/50 italic text-center font-sans">
                      Atbilde ir ģenerēta automatizēti un sniegtais saturs ir informatīvs.
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-4 shrink-0">
                  <button 
                    onClick={closeModal} 
                    className="w-1/3 bg-white/60 border border-black/10 text-black font-bold py-4 rounded-xl hover:bg-white transition-colors shadow-sm"
                  >
                    {t[language].return}
                  </button>
                  {selectedService === 'Dokumentu sagatavošana UR' ? (
                    <button 
                      onClick={downloadZip} 
                      className="w-2/3 inline-flex items-center justify-center gap-2 gold-button px-8 py-4 rounded-xl font-bold shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      Lejupielādēt ZIP arhīvu
                    </button>
                  ) : (
                    <button 
                      onClick={downloadWord} 
                      className="w-2/3 inline-flex items-center justify-center gap-2 gold-button px-8 py-4 rounded-xl font-bold shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      Lejupielādēt Word formātā
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
      {/* Admin Opinion View Modal */}
      {viewingOpinion && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setViewingOpinion(null)} />
          <div className="relative w-full max-w-4xl bg-white/40 backdrop-blur-xl border border-black/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-black/10 shrink-0 bg-white/60 rounded-t-2xl">
              <div>
                <h3 className="font-serif text-2xl text-black">{viewingOpinion.service_type}</h3>
                <p className="text-sm text-black/60 mt-1 font-medium">
                  Pieprasīja: <span className="text-black font-bold">{viewingOpinion.first_name} {viewingOpinion.last_name}</span> ({viewingOpinion.email}) • {
                    (() => {
                      try {
                        const d = new Date(viewingOpinion.created_at.replace(' ', 'T') + 'Z');
                        return !isNaN(d.getTime()) ? d.toLocaleString('lv-LV') : viewingOpinion.created_at;
                      } catch (e) {
                        return viewingOpinion.created_at;
                      }
                    })()
                  }
                </p>
              </div>
              <button onClick={() => setViewingOpinion(null)} className="flex items-center gap-2 p-2 text-black/60 hover:text-black transition-colors text-sm font-bold tracking-widest uppercase bg-black/5 hover:bg-black/10 rounded-md">
                <X className="w-5 h-5" />
                {t[language].close}
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-8 bg-white/20 rounded-b-2xl">
              <div>
                <h4 className="text-xs font-bold text-black/50 uppercase tracking-widest mb-3">Jautājums / Situācija</h4>
                <div className="bg-white/60 rounded-xl border border-black/10 p-6 shadow-sm">
                  <p className="text-black/80 whitespace-pre-wrap font-medium leading-relaxed">{viewingOpinion.question}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-bold text-black/50 uppercase tracking-widest mb-3">Sagatavotais Atzinums</h4>
                <div className="gold-glass-light rounded-xl p-8 shadow-sm">
                  <div className="text-black whitespace-pre-wrap font-serif leading-relaxed">
                    {viewingOpinion.generated_answer}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isStampModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIsStampModalOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-[#f6e09e] via-[#d4af37] to-[#b88a36] w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20 relative"
          >
            <div className="p-6 md:p-8 flex justify-between items-center border-b border-black/10 bg-white/20">
              <h3 className="text-2xl md:text-3xl font-bold text-black font-display">
                Tālākā rīcība un procesuālo dokumentu sagatavošana
              </h3>
              <button onClick={() => setIsStampModalOpen(false)} className="p-2 text-black/60 hover:text-black hover:bg-white/30 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar text-black/80 font-sans text-base md:text-lg leading-relaxed space-y-6 bg-transparent">
              <p className="text-black/90 font-medium">
                Mēs strādājam, lai nodrošinātu Jums ne tikai juridisku situācijas izvērtējumu, bet arī praktisku atbalstu turpmākajās darbībās. Juridisks atzinums ir būtisks pamats, tomēr daudzos gadījumos Jūsu tiesību efektīvai aizsardzībai vai interešu īstenošanai ir nepieciešama konkrētu procesuālo dokumentu sagatavošana un skaidrs rīcības plāns.
              </p>
              <p className="text-black/90 font-medium">
                Pamatojoties uz Jūsu jautājumu un sagatavoto juridisko analīzi, mēs piedāvāsim iespēju attīstīt attiecīgo jautājumu nākamajā līmenī — sagatavojot Jūsu situācijai atbilstošus dokumentus un strukturētu turpmākās rīcības stratēģiju.
              </p>
              
              <div className="gold-glass rounded-xl p-6 shadow-sm">
                <p className="font-bold text-black mb-3 text-sm uppercase tracking-widest">Tas var ietvert, piemēram:</p>
                <ul className="list-disc pl-6 space-y-2 text-black/90">
                  <li>iesnieguma sagatavošanu darba devējam, valsts iestādei vai citai institūcijai,</li>
                  <li>juridiski pamatotas pretenzijas sagatavošanu otrai pusei,</li>
                  <li>atbildes sagatavošanu uz saņemtu prasību vai paziņojumu,</li>
                  <li>prasības pieteikuma vai cita procesuālā dokumenta sagatavošanu iesniegšanai tiesā,</li>
                  <li>kā arī citu Jūsu konkrētajai situācijai atbilstošu dokumentu sagatavošanu.</li>
                </ul>
              </div>

              <div className="bg-white/40 backdrop-blur-md rounded-xl border border-white/30 p-6 shadow-sm">
                <p className="font-bold text-black mb-3 text-sm uppercase tracking-widest">Papildus dokumentu sagatavošanai mēs nodrošināsim arī strukturētu rīcības plānu, kas palīdz Jums saprast:</p>
                <ul className="list-disc pl-6 space-y-2 text-black/90">
                  <li>kādas darbības veicamas nākamajā posmā,</li>
                  <li>kādā secībā šīs darbības ieteicams veikt,</li>
                  <li>kādi ir iespējamie juridiskie riski un to novēršanas iespējas,</li>
                  <li>kā visefektīvāk aizsargāt Jūsu tiesības un intereses.</li>
                </ul>
              </div>

              <p className="text-black/90 font-medium">
                Mūsu mērķis ir nodrošināt, lai Jums būtu ne tikai teorētiska izpratne par Jūsu juridisko situāciju, bet arī praktiski izmantojami risinājumi, kas ļauj Jums rīkoties pārliecinoši, juridiski korekti un stratēģiski pamatoti.
              </p>
              
              <div className="gold-glass-light p-6 rounded-xl mt-8 shadow-md relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black/80"></div>
                <p className="font-bold text-black pl-2">
                  Ja vēlēsieties, mēs varam, balstoties uz jau sagatavoto juridisko analīzi, nekavējoties uzsāksim Jūsu situācijai atbilstošu procesuālo dokumentu sagatavošanu un individuāla rīcības plāna izstrādi.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Risk Analysis Modal */}
      {showRiskAnalysisModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#f5f5f0] w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-black/10"
          >
            <div className="p-6 sm:p-8 border-b border-black/10 flex justify-between items-center bg-white/50 shrink-0">
              <h2 className="text-2xl font-bold font-serif text-black">{t[language].generatedRiskTitle}</h2>
              <button 
                onClick={() => setShowRiskAnalysisModal(false)}
                className="p-2 hover:bg-black/5 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 bg-white/30">
              <div className="prose prose-sm sm:prose-base max-w-none prose-headings:font-serif prose-headings:text-black prose-p:text-black/80 prose-li:text-black/80">
                <div className="whitespace-pre-wrap font-sans leading-relaxed">{generatedRiskAnalysis}</div>
              </div>
            </div>

            <div className="p-6 sm:p-8 border-t border-black/10 flex gap-4 bg-white/50 shrink-0">
              <button 
                onClick={() => setShowRiskAnalysisModal(false)}
                className="w-1/3 bg-white/60 border border-black/10 text-black font-bold py-4 rounded-xl hover:bg-white transition-colors shadow-sm"
              >
                {t[language].close}
              </button>
              <button 
                onClick={downloadRiskAnalysis}
                className="w-2/3 inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                {t[language].downloadRiskBtn}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {hasAcceptedTerms && (
        <CookieConsentBanner 
          language={language} 
          onOpenCookiePolicy={() => {
            setShowCookiePolicy(true);
            setShowTermsOfService(false);
            setShowPrivacyPolicy(false);
            setShowDisclaimer(false);
            setShowDistanceContract(false);
            setShowUsersAdmin(false);
            setShowOpinionsAdmin(false);
            setShowStatsAdmin(false);
          }} 
        />
      )}

      <Chatbot language={language} />
    </div>
  );
}
