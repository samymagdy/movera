"use client";

import { useEffect, useRef, useState } from "react";
import type { ContentItem, Locale } from "@company/contracts";
import { directionFor, localeLabels } from "@company/contracts";
import { Arrow, ChevronDownIcon, CloseIcon, GlobeIcon, MenuIcon, SearchIcon, SparkIcon, SuiteIcon } from "./icons";
import { BrandLockup } from "./BrandLockup";

export type NewsTickerItem = { href: string; title: string };

type MenuLink = { label: string; href: string };
type MenuColumn = { title: string; description: string; icon: number; links: MenuLink[]; href?: string };
type MenuGroup = { title: string; description: string; columns: MenuColumn[] };

const nav = ["Home", "About", "Services", "Products", "Projects", "Careers", "News", "Innovation Hub", "Contact"] as const;
type NavItem = typeof nav[number];

export const navLabels: Record<Locale, Record<NavItem, string>> = {
  en: { Home: "Home", About: "About", Services: "Services", Products: "Products", Projects: "Projects", Careers: "Careers", News: "News", "Innovation Hub": "Innovation Hub", Contact: "Contact" },
  ar: { Home: "الرئيسية", About: "عن موفيرا", Services: "الخدمات", Products: "المنتجات", Projects: "المشاريع", Careers: "الوظائف", News: "الأخبار", "Innovation Hub": "مركز الابتكار", Contact: "تواصل معنا" },
  fr: { Home: "Accueil", About: "À propos", Services: "Services", Products: "Produits", Projects: "Projets", Careers: "Carrières", News: "Actualités", "Innovation Hub": "Hub d’innovation", Contact: "Contact" },
  nl: { Home: "Home", About: "Over MOVERA", Services: "Diensten", Products: "Producten", Projects: "Projecten", Careers: "Vacatures", News: "Nieuws", "Innovation Hub": "Innovatiehub", Contact: "Contact" },
};

const menuText: Record<string, Record<Locale, string>> = {
  "About MOVERA": { en: "About MOVERA", ar: "عن موفيرا", fr: "À propos de MOVERA", nl: "Over MOVERA" },
  "The people, principles, and places behind the work.": { en: "The people, principles, and places behind the work.", ar: "الأشخاص والمبادئ والأماكن التي تقف خلف هذا العمل.", fr: "Les personnes, les principes et les lieux derrière notre travail.", nl: "De mensen, principes en plaatsen achter ons werk." },
  "Our company": { en: "Our company", ar: "شركتنا", fr: "Notre entreprise", nl: "Ons bedrijf" },
  "Who we are and how we work.": { en: "Who we are and how we work.", ar: "من نحن وكيف نعمل.", fr: "Qui nous sommes et comment nous travaillons.", nl: "Wie we zijn en hoe we werken." },
  "Who We Are": { en: "Who We Are", ar: "من نحن", fr: "Qui sommes-nous", nl: "Wie we zijn" },
  History: { en: "History", ar: "تاريخنا", fr: "Notre histoire", nl: "Geschiedenis" },
  "Vision and Mission": { en: "Vision and Mission", ar: "الرؤية والرسالة", fr: "Vision et mission", nl: "Visie en missie" },
  "CEO Message": { en: "CEO Message", ar: "رسالة الرئيس التنفيذي", fr: "Message du PDG", nl: "Bericht van de CEO" },
  Leadership: { en: "Leadership", ar: "القيادة", fr: "Direction", nl: "Leiderschap" },
  "The team shaping the next decision.": { en: "The team shaping the next decision.", ar: "الفريق الذي يصنع القرار القادم.", fr: "L’équipe qui façonne la prochaine décision.", nl: "Het team dat de volgende beslissing vormgeeft." },
  "Leadership Team": { en: "Leadership Team", ar: "فريق القيادة", fr: "Équipe dirigeante", nl: "Leiderschapsteam" },
  "Clients and Certificates": { en: "Clients and Certificates", ar: "العملاء والشهادات", fr: "Clients et certifications", nl: "Klanten en certificaten" },
  "MOVERA global": { en: "MOVERA global", ar: "موفيرا العالمية", fr: "MOVERA à l’international", nl: "MOVERA wereldwijd" },
  "MOVERA Global": { en: "MOVERA Global", ar: "موفيرا العالمية", fr: "MOVERA Global", nl: "MOVERA wereldwijd" },
  "Local context, connected intelligence.": { en: "Local context, connected intelligence.", ar: "سياق محلي وذكاء متصل.", fr: "Un contexte local, une intelligence connectée.", nl: "Lokale context, verbonden intelligentie." },
  "Regional Hub A": { en: "Brussels & Capital Region", ar: "بروكسل ومنطقة العاصمة", fr: "Bruxelles et Région-Capitale", nl: "Brussel en het Hoofdstedelijk Gewest" },
  "Regional Hub B": { en: "Flanders Mobility Corridor", ar: "ممر التنقل في فلاندرز", fr: "Corridor mobilité en Flandre", nl: "Vlaamse mobiliteitscorridor" },
  "Regional Hub C": { en: "Wallonia Mobility Corridor", ar: "ممر التنقل في والونيا", fr: "Corridor mobilité en Wallonie", nl: "Waalse mobiliteitscorridor" },
  Services: { en: "Services", ar: "الخدمات", fr: "Services", nl: "Diensten" },
  "End-to-end intelligence for complex operations.": { en: "End-to-end intelligence for complex operations.", ar: "ذكاء متكامل للعمليات المعقدة.", fr: "Une intelligence de bout en bout pour les opérations complexes.", nl: "End-to-end intelligentie voor complexe operaties." },
  "Applied AI for inspection, mobility, and mission-critical operations.": { en: "Applied AI for inspection, mobility, and mission-critical operations.", ar: "ذكاء اصطناعي تطبيقي للفحص والتنقل والعمليات الحيوية.", fr: "IA appliquée à l’inspection, à la mobilité et aux opérations critiques.", nl: "Toegepaste AI voor inspectie, mobiliteit en bedrijfskritische operaties." },
  "AI & Data": { en: "AI & Data", ar: "الذكاء الاصطناعي والبيانات", fr: "IA et données", nl: "AI en data" },
  "AI-powered analytics, data platforms, and digital twins for smarter decisions.": { en: "AI-powered analytics, data platforms, and digital twins for smarter decisions.", ar: "تحليلات مدعومة بالذكاء الاصطناعي ومنصات بيانات وتوائم رقمية لقرارات أذكى.", fr: "Analyses IA, plateformes de données et jumeaux numériques pour de meilleures décisions.", nl: "AI-analyses, dataplatforms en digitale tweelingen voor slimmere beslissingen." },
  "Digital Products": { en: "Digital Products", ar: "حلول الذكاء الاصطناعي", fr: "Solutions IA", nl: "AI-oplossingen" },
  "Data Platforms": { en: "Data Platforms", ar: "منصات البيانات", fr: "Plateformes de données", nl: "Dataplatforms" },
  "Digital Twins": { en: "Digital Twins", ar: "التوائم الرقمية", fr: "Jumeaux numériques", nl: "Digitale tweelingen" },
  "Analytics & Insights": { en: "Analytics & Insights", ar: "التحليلات والرؤى", fr: "Analyses et insights", nl: "Analyses en inzichten" },
  "Enterprise Integration": { en: "Enterprise Integration", ar: "تكامل المؤسسات", fr: "Intégration d’entreprise", nl: "Enterprise-integratie" },
  "Operational Intelligence": { en: "Operational Intelligence", ar: "الذكاء التشغيلي", fr: "Intelligence operationnelle", nl: "Operationele intelligentie" },
  "Delivery Advisory": { en: "Delivery Advisory", ar: "الاستشارات الهندسية", fr: "Conseil en ingénierie", nl: "Delivery Advisory" },
  "Responsible Intelligence": { en: "Responsible Intelligence", ar: "الذكاء المسؤول", fr: "Intelligence responsable", nl: "Verantwoorde intelligentie" },
  "Integrated smart city systems for mobility, safety, environment, and urban operations.": { en: "Integrated systems for context, ownership, and better decisions.", ar: "أنظمة متكاملة للسياق والملكية وقرارات أفضل.", fr: "Des systèmes intégrés pour le contexte, la responsabilité et de meilleures décisions.", nl: "Geïntegreerde systemen voor context, eigenaarschap en betere besluiten." },
  "Operational systems": { en: "Operational systems", ar: "حلول التنقل", fr: "Solutions de mobilité", nl: "Mobiliteitsoplossingen" },
  "Smart Infrastructure": { en: "System Foundations", ar: "أسس الأنظمة", fr: "Fondations des systèmes", nl: "Systeemfundamenten" },
  "Environment Solutions": { en: "Responsible Systems", ar: "الأنظمة المسؤولة", fr: "Systèmes responsables", nl: "Verantwoorde systemen" },
  "Urban Operations": { en: "Operating Models", ar: "نماذج التشغيل", fr: "Modèles opérationnels", nl: "Operationele modellen" },
  "Public Safety": { en: "Decision Support", ar: "دعم القرار", fr: "Aide à la décision", nl: "Besluitondersteuning" },
  Products: { en: "Products", ar: "المنتجات", fr: "Produits", nl: "Producten" },
  "A modular intelligence stack for mission-critical teams.": { en: "A modular intelligence stack for mission-critical teams.", ar: "منظومة ذكاء معيارية للفرق العاملة في المهام الحيوية.", fr: "Une pile d’intelligence modulaire pour les équipes critiques.", nl: "Een modulaire intelligentielaag voor kritieke teams." },
  "AI Product Suite": { en: "AI Product Suite", ar: "مجموعة منتجات الذكاء الاصطناعي", fr: "Suite de produits IA", nl: "AI-productsuite" },
  "Perception, agents, data, and governance in one suite.": { en: "Perception, agents, data, and governance in one suite.", ar: "إدراك ووكلاء وبيانات وحوكمة في مجموعة واحدة.", fr: "Perception, agents, données et gouvernance dans une seule suite.", nl: "Perceptie, agents, data en governance in één suite." },
  "All Products": { en: "All Products", ar: "كل المنتجات", fr: "Tous les produits", nl: "Alle producten" },
  "Command Console": { en: "Command Console", ar: "منصة الفحص بالذكاء الاصطناعي", fr: "Plateforme d’inspection IA", nl: "AI-inspectieplatform" },
  "Insight Layer": { en: "Insight Layer", ar: "ذكاء التنقل", fr: "Intelligence mobilité", nl: "Mobiliteitsintelligentie" },
  "Intelligence layer": { en: "Intelligence layer", ar: "طبقة الذكاء", fr: "Couche d’intelligence", nl: "Intelligentielaag" },
  "Turn signals into decisions across the operation.": { en: "Turn signals into decisions across the operation.", ar: "حوّل الإشارات إلى قرارات عبر عملياتك.", fr: "Transformez les signaux en décisions dans toute l’opération.", nl: "Maak van signalen beslissingen voor de hele operatie." },
  "Vision AI": { en: "Vision AI", ar: "ذكاء الرؤية", fr: "IA visuelle", nl: "Vision AI" },
  "Data AI": { en: "Data AI", ar: "ذكاء البيانات", fr: "IA des données", nl: "Data AI" },
  "Predictive AI": { en: "Predictive AI", ar: "الذكاء التنبؤي", fr: "IA prédictive", nl: "Predictive AI" },
  "Control & reliability": { en: "Control & reliability", ar: "التحكم والموثوقية", fr: "Contrôle et fiabilité", nl: "Controle en betrouwbaarheid" },
  "Deploy trusted models with clear operational ownership.": { en: "Deploy trusted models with clear operational ownership.", ar: "انشر نماذج موثوقة مع مسؤولية تشغيلية واضحة.", fr: "Déployez des modèles fiables avec une responsabilité opérationnelle claire.", nl: "Implementeer betrouwbare modellen met duidelijk operationeel eigenaarschap." },
  "Workflow Studio": { en: "Workflow Studio", ar: "مجموعة موثوقية الأصول", fr: "Suite de fiabilité des actifs", nl: "Workflow Studio" },
  "Model Orchestration": { en: "Model Orchestration", ar: "تنسيق النماذج", fr: "Orchestration des modèles", nl: "Modelorkestratie" },
  "AI Governance": { en: "AI Governance", ar: "حوكمة الذكاء الاصطناعي", fr: "Gouvernance IA", nl: "AI-governance" },
  Projects: { en: "Projects", ar: "المشاريع", fr: "Projets", nl: "Projecten" },
  "Selected work across mobility, infrastructure, and smart cities.": { en: "Selected work across delivery, products, and responsible intelligence.", ar: "أعمال مختارة في التنفيذ والمنتجات والذكاء المسؤول.", fr: "Une sélection de projets en livraison, produits et intelligence responsable.", nl: "Geselecteerd werk rond levering, producten en verantwoorde intelligentie." },
  "Featured work": { en: "Featured work", ar: "أعمال مميزة", fr: "Projets phares", nl: "Uitgelicht werk" },
  "See how intelligence moves from signal to outcome.": { en: "See how intelligence moves from signal to outcome.", ar: "اكتشف كيف يتحول الذكاء من إشارة إلى نتيجة.", fr: "Découvrez comment l’intelligence devient un résultat concret.", nl: "Zie hoe intelligentie van signaal naar resultaat beweegt." },
  "All Projects": { en: "All Projects", ar: "كل المشاريع", fr: "Tous les projets", nl: "Alle projecten" },
  "Operations Signal Room": { en: "Operations Signal Room", ar: "فحص الطرق الذكي", fr: "Signal review routière intelligente", nl: "Slimme weginspectie" },
  Reliability: { en: "Reliability", ar: "الموثوقية", fr: "Fiabilité", nl: "Betrouwbaarheid" },
  "Operational confidence where it matters most.": { en: "Operational confidence where it matters most.", ar: "ثقة تشغيلية حيث تكون أهم ما يكون.", fr: "Une confiance opérationnelle là où elle compte le plus.", nl: "Operationeel vertrouwen waar het het meest telt." },
  "Predictive Asset Intelligence": { en: "Predictive Asset Intelligence", ar: "ذكاء الأصول التنبؤي", fr: "Intelligence prédictive des actifs", nl: "Voorspellende asset-intelligentie" },
  Infrastructure: { en: "Infrastructure", ar: "البنية التحتية", fr: "Infrastructures", nl: "Infrastructuur" },
  Operations: { en: "Operations", ar: "التنقل", fr: "Mobilité", nl: "Mobiliteit" },
  Careers: { en: "Careers", ar: "الوظائف", fr: "Carrières", nl: "Vacatures" },
  "Build the systems that help cities make better decisions.": { en: "Build the systems that help cities make better decisions.", ar: "ابنِ الأنظمة التي تساعد المدن على اتخاذ قرارات أفضل.", fr: "Construisez les systèmes qui aident les villes à mieux décider.", nl: "Bouw systemen die steden helpen betere beslissingen te nemen." },
  "Join MOVERA": { en: "Join MOVERA", ar: "انضم إلى موفيرا", fr: "Rejoignez MOVERA", nl: "Word lid van MOVERA" },
  "Bring curiosity, care, and craft to work that matters.": { en: "Bring curiosity, care, and craft to work that matters.", ar: "اجلب الفضول والعناية والمهارة إلى عمل يصنع الفرق.", fr: "Mettez curiosité, exigence et savoir-faire au service d’un travail utile.", nl: "Breng nieuwsgierigheid, zorg en vakmanschap naar werk dat ertoe doet." },
  "Open Roles": { en: "Open Roles", ar: "الوظائف المتاحة", fr: "Postes ouverts", nl: "Openstaande functies" },
  "Life at MOVERA": { en: "Life at MOVERA", ar: "الحياة في موفيرا", fr: "La vie chez MOVERA", nl: "Het leven bij MOVERA" },
  "Graduate Opportunities": { en: "Graduate Opportunities", ar: "فرص الخريجين", fr: "Opportunités pour diplômés", nl: "Kansen voor afgestudeerden" },
  "News & insights": { en: "News & insights", ar: "الأخبار والرؤى", fr: "Actualités et perspectives", nl: "Nieuws en inzichten" },
  "The latest signals from MOVERA and the world around us.": { en: "The latest signals from MOVERA and the world around us.", ar: "أحدث الإشارات من موفيرا والعالم من حولنا.", fr: "Les derniers signaux de MOVERA et du monde qui nous entoure.", nl: "De nieuwste signalen van MOVERA en de wereld om ons heen." },
  "Latest News": { en: "Latest News", ar: "أحدث الأخبار", fr: "Dernières actualités", nl: "Laatste nieuws" },
  "MOVERA announcements and platform updates.": { en: "MOVERA announcements and platform updates.", ar: "إعلانات الشركة وتحديثات المنصة.", fr: "Annonces de l’entreprise et mises à jour de la plateforme.", nl: "Bedrijfsmededelingen en platformupdates." },
  Newsroom: { en: "Newsroom", ar: "غرفة الأخبار", fr: "Salle de presse", nl: "Nieuwsroom" },
  "Signal review": { en: "Signal review", ar: "الفحص", fr: "Signal review", nl: "Inspectie" },
  "Practical update": { en: "Practical update", ar: "تحليلات الفحص", fr: "Analyses d’inspection", nl: "Inspectie-analytics" },
  Perspectives: { en: "Perspectives", ar: "رؤى", fr: "Perspectives", nl: "Perspectieven" },
  "Ideas for clearer, calmer decisions.": { en: "Ideas for clearer, calmer decisions.", ar: "أفكار لقرارات أوضح وأكثر هدوءاً.", fr: "Des idées pour des décisions plus claires et sereines.", nl: "Ideeën voor heldere, rustige beslissingen." },
  Blogs: { en: "Blogs", ar: "المدونات", fr: "Blogs", nl: "Blogs" },
  Insights: { en: "Insights", ar: "رؤى", fr: "Analyses", nl: "Inzichten" },
  "Innovation Hub": { en: "Innovation Hub", ar: "مركز الابتكار", fr: "Hub d’innovation", nl: "Innovatiehub" },
  "Explore the ideas and experiments shaping what comes next.": { en: "Explore the ideas and experiments shaping what comes next.", ar: "استكشف الأفكار والتجارب التي تشكل المستقبل.", fr: "Explorez les idées et expériences qui façonnent la suite.", nl: "Verken de ideeën en experimenten die de toekomst vormgeven." },
  "Explore innovation": { en: "Explore innovation", ar: "استكشف الابتكار", fr: "Explorer l’innovation", nl: "Innovatie ontdekken" },
  "Research, experiments, and applied intelligence.": { en: "Research, experiments, and applied intelligence.", ar: "أبحاث وتجارب وذكاء تطبيقي.", fr: "Recherche, expériences et intelligence appliquée.", nl: "Onderzoek, experimenten en toegepaste intelligentie." },
  "Labs & Experiments": { en: "Labs & Experiments", ar: "المختبرات والتجارب", fr: "Labs et expériences", nl: "Labs en experimenten" },
  "Partner with us": { en: "Partner with us", ar: "شاركنا", fr: "Devenir partenaire", nl: "Werk met ons samen" },
  "Start a conversation": { en: "Start a conversation", ar: "ابدأ محادثة", fr: "Entamer une conversation", nl: "Start een gesprek" },
  "Have a challenge worth exploring together?": { en: "Have a challenge worth exploring together?", ar: "هل لديك تحدٍ يستحق أن نستكشفه معاً؟", fr: "Un défi à explorer ensemble ?", nl: "Een uitdaging om samen te verkennen?" },
  "Contact MOVERA": { en: "Contact MOVERA", ar: "تواصل مع موفيرا", fr: "Contacter MOVERA", nl: "Contact met MOVERA" },
  "Request an enquiry": { en: "Request an enquiry", ar: "اطلب استفساراً", fr: "Demander une prise de contact", nl: "Een aanvraag indienen" },
};

const siteMenuText: Record<string, Record<Locale, string>> = {
  "Company & direction": { en: "Company & direction", ar: "الشركة والاتجاه", fr: "Entreprise et direction", nl: "Bedrijf en richting" },
  "How MOVERA is built and where it is going.": { en: "How MOVERA is built and where it is going.", ar: "كيف تُبنى موفيرا وإلى أين تتجه.", fr: "Comment MOVERA se construit et où elle va.", nl: "Hoe MOVERA wordt gebouwd en waar het naartoe gaat." },
  "Leadership note": { en: "Leadership note", ar: "رسالة القيادة", fr: "Message de la direction", nl: "Boodschap van het leiderschap" },
  "Leadership & assurance": { en: "Leadership & assurance", ar: "القيادة والضمان", fr: "Direction et assurance", nl: "Leiderschap en zekerheid" },
  "Clear responsibility, shared evidence and trusted delivery.": { en: "Clear responsibility, shared evidence and trusted delivery.", ar: "مسؤولية واضحة وأدلة مشتركة وتنفيذ موثوق.", fr: "Responsabilités claires, preuves partagées et réalisation fiable.", nl: "Duidelijke verantwoordelijkheid, gedeeld bewijs en betrouwbare realisatie." },
  "Partnership and assurance": { en: "Partnership and assurance", ar: "الشراكة والضمان", fr: "Partenariats et assurance", nl: "Partnerschap en zekerheid" },
  "Belgian context": { en: "Belgian context", ar: "السياق البلجيكي", fr: "Contexte belge", nl: "Belgische context" },
  "Three regions, one connected mobility language.": { en: "Three regions, one connected mobility language.", ar: "ثلاث مناطق ولغة تشغيلية مشتركة للتنقل.", fr: "Trois régions, un langage commun de la mobilité.", nl: "Drie regio’s, één gedeelde mobiliteitstaal." },
  "Brussels & Capital Region": { en: "Brussels & Capital Region", ar: "بروكسل ومنطقة العاصمة", fr: "Bruxelles et Région-Capitale", nl: "Brussel en het Hoofdstedelijk Gewest" },
  "Flanders Mobility Corridor": { en: "Flanders Mobility Corridor", ar: "ممر التنقل في فلاندرز", fr: "Corridor mobilité en Flandre", nl: "Vlaamse mobiliteitscorridor" },
  "Wallonia Mobility Corridor": { en: "Wallonia Mobility Corridor", ar: "ممر التنقل في والونيا", fr: "Corridor mobilité en Wallonie", nl: "Waalse mobiliteitscorridor" },
  "Vehicle intelligence": { en: "Vehicle intelligence", ar: "ذكاء المركبة", fr: "Intelligence véhicule", nl: "Voertuigintelligentie" },
  "Build autonomous behaviour people can test and understand.": { en: "Build autonomous behaviour people can test and understand.", ar: "نبني سلوكاً ذاتياً قابلاً للاختبار والفهم.", fr: "Construire un comportement autonome testable et compréhensible.", nl: "Bouw autonoom gedrag dat mensen kunnen testen en begrijpen." },
  "Autonomy Systems": { en: "Autonomy Systems", ar: "أنظمة القيادة الذاتية", fr: "Systèmes autonomes", nl: "Autonomiesystemen" },
  "Vehicle Experience": { en: "Vehicle Experience", ar: "تجربة المركبة", fr: "Expérience à bord", nl: "Voertuigervaring" },
  "Mobility operations": { en: "Mobility operations", ar: "عمليات التنقل", fr: "Opérations de mobilité", nl: "Mobiliteitsoperaties" },
  "Keep fleets, people and infrastructure moving together.": { en: "Keep fleets, people and infrastructure moving together.", ar: "نُبقي الأساطيل والأشخاص والبنية التحتية في حركة منسقة.", fr: "Faire avancer ensemble flottes, personnes et infrastructure.", nl: "Laat vloten, mensen en infrastructuur samen bewegen." },
  "Fleet Intelligence": { en: "Fleet Intelligence", ar: "ذكاء الأساطيل", fr: "Intelligence de flotte", nl: "Vlootintelligentie" },
  "Mobility Operations": { en: "Mobility Operations", ar: "عمليات التنقل", fr: "Opérations de mobilité", nl: "Mobiliteitsoperaties" },
  "MOVERA products": { en: "MOVERA products", ar: "منتجات موفيرا", fr: "Produits MOVERA", nl: "MOVERA-producten" },
  "Four foundations from perception to coordinated action.": { en: "Four foundations from perception to coordinated action.", ar: "أربعة أسس تمتد من الإدراك إلى الإجراء المنسق.", fr: "Quatre fondations de la perception à l’action coordonnée.", nl: "Vier fundamenten van perceptie tot gecoördineerde actie." },
  "Operations & orchestration": { en: "Operations & orchestration", ar: "العمليات والتنسيق", fr: "Opérations et orchestration", nl: "Operaties en orkestratie" },
  "One view for missions, exceptions and network movement.": { en: "One view for missions, exceptions and network movement.", ar: "صورة واحدة للمهام والاستثناءات وحركة الشبكة.", fr: "Une vue pour les missions, exceptions et mouvements du réseau.", nl: "Eén beeld voor opdrachten, uitzonderingen en netwerkbeweging." },
  "Perception & simulation": { en: "Perception & simulation", ar: "الإدراك والمحاكاة", fr: "Perception et simulation", nl: "Perceptie en simulatie" },
  "Understand the vehicle and rehearse what happens next.": { en: "Understand the vehicle and rehearse what happens next.", ar: "نفهم المركبة ونختبر ما سيحدث تالياً.", fr: "Comprendre le véhicule et répéter la suite.", nl: "Begrijp het voertuig en beproef wat volgt." },
  "Belgian programmes": { en: "Belgian programmes", ar: "برامج بلجيكية", fr: "Programmes belges", nl: "Belgische programma’s" },
  "Reference contexts for dense streets and working fleets.": { en: "Reference contexts for dense streets and working fleets.", ar: "سياقات مرجعية للشوارع الكثيفة والأساطيل العاملة.", fr: "Des contextes de référence pour rues denses et flottes actives.", nl: "Referentiecontexten voor drukke straten en actieve vloten." },
  "Brussels Urban Perception": { en: "Brussels Urban Perception", ar: "إدراك حضري في بروكسل", fr: "Perception urbaine à Bruxelles", nl: "Stedelijke perceptie in Brussel" },
  "Antwerp Fleet Flow": { en: "Antwerp Fleet Flow", ar: "تدفق الأسطول في أنتويرب", fr: "Flux de flotte à Anvers", nl: "Vlootdoorstroming in Antwerpen" },
  "Experience & corridors": { en: "Experience & corridors", ar: "التجربة والممرات", fr: "Expérience et corridors", nl: "Ervaring en corridors" },
  "Human confidence and connected public space.": { en: "Human confidence and connected public space.", ar: "ثقة الإنسان وفضاء عام متصل.", fr: "Confiance humaine et espace public connecté.", nl: "Menselijk vertrouwen en verbonden publieke ruimte." },
  "Connected Cockpit": { en: "Connected Cockpit", ar: "قمرة القيادة المتصلة", fr: "Cockpit connecté", nl: "Verbonden cockpit" },
  "Adaptive Mobility Corridor": { en: "Adaptive Mobility Corridor", ar: "ممر تنقل متكيّف", fr: "Corridor de mobilité adaptatif", nl: "Adaptieve mobiliteitscorridor" },
  "Work in Belgium": { en: "Work in Belgium", ar: "اعمل معنا في بلجيكا", fr: "Travailler en Belgique", nl: "Werken in België" },
  "Engineering, data and integration roles for real mobility.": { en: "Engineering, data and integration roles for real mobility.", ar: "وظائف في الهندسة والبيانات والتكامل من أجل تنقل واقعي.", fr: "Des rôles en ingénierie, data et intégration pour la mobilité réelle.", nl: "Rollen in engineering, data en integratie voor echte mobiliteit." },
  "Autonomy Systems Engineer": { en: "Autonomy Systems Engineer", ar: "مهندس أنظمة القيادة الذاتية", fr: "Ingénieur·e systèmes autonomes", nl: "Autonomy Systems Engineer" },
  "Mobility Data Engineer": { en: "Mobility Data Engineer", ar: "مهندس بيانات التنقل", fr: "Ingénieur·e data mobilité", nl: "Mobility Data Engineer" },
  "Systems Integration Lead": { en: "Systems Integration Lead", ar: "قائد تكامل الأنظمة", fr: "Responsable intégration systèmes", nl: "Lead Systeemintegratie" },
  "Company signals": { en: "Company signals", ar: "أخبار موفيرا", fr: "Actualités MOVERA", nl: "MOVERA-nieuws" },
  "News from MOVERA and the Belgian mobility context.": { en: "News from MOVERA and the Belgian mobility context.", ar: "أخبار موفيرا وسياق التنقل في بلجيكا.", fr: "Actualités MOVERA et contexte belge de la mobilité.", nl: "Nieuws van MOVERA en de Belgische mobiliteitscontext." },
  "Introducing MOVERA": { en: "Introducing MOVERA", ar: "هذه هي موفيرا", fr: "MOVERA entre en mouvement", nl: "MOVERA komt in beweging" },
  "Intelligence near movement": { en: "Intelligence near movement", ar: "الذكاء الأقرب إلى الحركة", fr: "L’intelligence au plus près du mouvement", nl: "Intelligentie dicht bij de beweging" },
  "A shared mobility language": { en: "A shared mobility language", ar: "لغة مشتركة للتنقل", fr: "Un langage commun de la mobilité", nl: "Een gedeelde mobiliteitstaal" },
  "Operator confidence, passenger trust and better decisions.": { en: "Operator confidence, passenger trust and better decisions.", ar: "ثقة المشغّل والراكب وقرارات أفضل.", fr: "Confiance des opérateurs, des passagers et meilleures décisions.", nl: "Operatorvertrouwen, passagiersvertrouwen en betere beslissingen." },
  "Operator confidence": { en: "Operator confidence", ar: "ثقة المشغّل", fr: "Confiance de l’opérateur", nl: "Operatorvertrouwen" },
  "Trust before boarding": { en: "Trust before boarding", ar: "الثقة قبل الصعود", fr: "La confiance avant l’embarquement", nl: "Vertrouwen vóór het instappen" },
  "Signals to decisions": { en: "Signals to decisions", ar: "من الإشارات إلى القرارات", fr: "Des signaux aux décisions", nl: "Van signalen naar beslissingen" },
  "Applied mobility research": { en: "Applied mobility research", ar: "بحوث تنقل تطبيقية", fr: "Recherche appliquée en mobilité", nl: "Toegepast mobiliteitsonderzoek" },
  "Experiments designed to become useful operational practice.": { en: "Experiments designed to become useful operational practice.", ar: "تجارب مصممة لتتحول إلى ممارسة تشغيلية مفيدة.", fr: "Des expériences conçues pour devenir des pratiques opérationnelles utiles.", nl: "Experimenten die bruikbare operationele praktijk moeten worden." },
  "Confidence Maps": { en: "Confidence Maps", ar: "خرائط الثقة", fr: "Cartes de confiance", nl: "Vertrouwenskaarten" },
  "Mobility Simulation Studio": { en: "Mobility Simulation Studio", ar: "استوديو محاكاة التنقل", fr: "Studio de simulation mobilité", nl: "Mobiliteitssimulatiestudio" },
  "Curb Intelligence": { en: "Curb Intelligence", ar: "ذكاء حافة الطريق", fr: "Intelligence du bord de voirie", nl: "Intelligente stoeprand" },
};

const menuLabel = (value: string, locale: Locale) => siteMenuText[value]?.[locale] || menuText[value]?.[locale] || value;

export const headerCopy: Record<Locale, { explore: string; enquiry: string; search: string; close: string; openMenu: string; closeMenu: string }> = {
  en: { explore: "Explore all", enquiry: "Enquiry", search: "Search", close: "Close", openMenu: "Open menu", closeMenu: "Close menu" },
  ar: { explore: "استكشف الكل", enquiry: "استفسار", search: "بحث", close: "إغلاق", openMenu: "فتح القائمة", closeMenu: "إغلاق القائمة" },
  fr: { explore: "Tout explorer", enquiry: "Demande", search: "Rechercher", close: "Fermer", openMenu: "Ouvrir le menu", closeMenu: "Fermer le menu" },
  nl: { explore: "Alles bekijken", enquiry: "Aanvraag", search: "Zoeken", close: "Sluit", openMenu: "Menu openen", closeMenu: "Menu sluiten" },
};

export const footerCopy: Record<Locale, { connect: string; about: string; global: string; who: string; leadership: string; partners: string; services: string; ai: string; advisory: string; implementation: string; products: string; suite: string; platforms: string; integrations: string; industries: string; mobility: string; infrastructure: string; energy: string; resources: string; insights: string; cases: string; newsroom: string; company: string; careers: string; contact: string; back: string; cookie: string; built: string }> = {
  en: { connect: "Connect", about: "About", global: "MOVERA Global", who: "Who We Are", leadership: "Leadership", partners: "Partners", services: "Services", ai: "Digital Products", advisory: "Advisory", implementation: "Implementation", products: "Products", suite: "AI Product Suite", platforms: "Platforms", integrations: "Integrations", industries: "Industries", mobility: "Operations", infrastructure: "Infrastructure", energy: "Energy", resources: "Resources", insights: "Insights", cases: "Case Studies", newsroom: "Newsroom", company: "MOVERA", careers: "Careers", contact: "Contact", back: "Back to top ↑", cookie: "Cookie preferences", built: "Built for the next decision." },
  ar: { connect: "تواصل", about: "عن موفيرا", global: "موفيرا العالمية", who: "من نحن", leadership: "القيادة", partners: "الشركاء", services: "الخدمات", ai: "حلول الذكاء الاصطناعي", advisory: "الاستشارات", implementation: "التنفيذ", products: "المنتجات", suite: "مجموعة منتجات الذكاء الاصطناعي", platforms: "المنصات", integrations: "التكاملات", industries: "القطاعات", mobility: "التنقل", infrastructure: "البنية التحتية", energy: "الطاقة", resources: "الموارد", insights: "الرؤى", cases: "دراسات الحالة", newsroom: "غرفة الأخبار", company: "الشركة", careers: "الوظائف", contact: "تواصل معنا", back: "العودة إلى الأعلى ↑", cookie: "تفضيلات ملفات الارتباط", built: "ذكاء مؤسسي للقرار القادم." },
  fr: { connect: "Contact", about: "À propos", global: "MOVERA à l’international", who: "Qui sommes-nous", leadership: "Direction", partners: "Partenaires", services: "Services", ai: "Solutions IA", advisory: "Conseil", implementation: "Mise en œuvre", products: "Produits", suite: "Suite de produits IA", platforms: "Plateformes", integrations: "Intégrations", industries: "Secteurs", mobility: "Mobilité", infrastructure: "Infrastructures", energy: "Énergie", resources: "Ressources", insights: "Analyses", cases: "Études de cas", newsroom: "Salle de presse", company: "Entreprise", careers: "Carrières", contact: "Contact", back: "Retour en haut ↑", cookie: "Préférences cookies", built: "Une intelligence pour la prochaine décision." },
  nl: { connect: "Verbinden", about: "Over MOVERA", global: "MOVERA wereldwijd", who: "Wie we zijn", leadership: "Leiderschap", partners: "Partners", services: "Diensten", ai: "AI-oplossingen", advisory: "Advies", implementation: "Implementatie", products: "Producten", suite: "AI-productsuite", platforms: "Platformen", integrations: "Integraties", industries: "Sectoren", mobility: "Mobiliteit", infrastructure: "Infrastructuur", energy: "Energie", resources: "Bronnen", insights: "Inzichten", cases: "Case studies", newsroom: "Nieuwsroom", company: "Bedrijf", careers: "Vacatures", contact: "Contact", back: "Terug naar boven ↑", cookie: "Cookievoorkeuren", built: "Intelligentie voor de volgende beslissing." },
};

const pathFor = (locale: Locale, path = "") => `/${locale}${path}`;
const primaryRoutes: Record<string, string> = {
  Home: "/",
  Projects: "/projects",
  News: "/news",
  Careers: "/careers",
  Contact: "/contact",
};

const siteMegaMenus: Record<string, MenuGroup> = {
  About: {
    title: "About MOVERA", description: "The people, principles, and places behind the work.", columns: [
      { title: "Company & direction", description: "How MOVERA is built and where it is going.", icon: 0, links: [{ label: "Who We Are", href: "/about/who-we-are" }, { label: "History", href: "/about/history" }, { label: "Vision and Mission", href: "/about/vision-mission" }, { label: "Leadership note", href: "/about/ceo-message" }] },
      { title: "Leadership & assurance", description: "Clear responsibility, shared evidence and trusted delivery.", icon: 1, links: [{ label: "Leadership", href: "/about/leadership" }, { label: "Partnership and assurance", href: "/about/clients-certificates" }] },
      { title: "Belgian context", description: "Three regions, one connected mobility language.", icon: 2, links: [{ label: "Brussels & Capital Region", href: "/regions/hub-a" }, { label: "Flanders Mobility Corridor", href: "/regions/hub-b" }, { label: "Wallonia Mobility Corridor", href: "/regions/hub-c" }] },
    ],
  },
  Services: {
    title: "Services", description: "End-to-end intelligence for complex operations.", columns: [
      { title: "Vehicle intelligence", description: "Build autonomous behaviour people can test and understand.", icon: 0, links: [{ label: "Autonomy Systems", href: "/services/autonomy-systems" }, { label: "Vehicle Experience", href: "/services/vehicle-experience" }] },
      { title: "Mobility operations", description: "Keep fleets, people and infrastructure moving together.", icon: 2, links: [{ label: "Fleet Intelligence", href: "/services/fleet-intelligence" }, { label: "Mobility Operations", href: "/services/mobility-operations" }] },
    ],
  },
  Products: {
    title: "MOVERA products", description: "Four foundations from perception to coordinated action.", columns: [
      { title: "Operations & orchestration", description: "One view for missions, exceptions and network movement.", icon: 0, links: [{ label: "MOVERA Command", href: "/products/movera-command" }, { label: "Motion OS", href: "/products/motion-os" }] },
      { title: "Perception & simulation", description: "Understand the vehicle and rehearse what happens next.", icon: 2, links: [{ label: "Perception Layer", href: "/products/perception-layer" }, { label: "Mobility Twin", href: "/products/mobility-twin" }] },
    ],
  },
  Projects: {
    title: "Projects", description: "Selected work across MOVERA’s service sectors.", columns: [
      { title: "Belgian programmes", description: "Reference contexts for dense streets and working fleets.", icon: 0, links: [{ label: "Brussels Urban Perception", href: "/projects/brussels-perception-pilot" }, { label: "Antwerp Fleet Flow", href: "/projects/antwerp-fleet-flow" }] },
      { title: "Experience & corridors", description: "Human confidence and connected public space.", icon: 2, links: [{ label: "Connected Cockpit", href: "/projects/connected-cockpit" }, { label: "Adaptive Mobility Corridor", href: "/projects/adaptive-mobility-corridor" }] },
    ],
  },
  Careers: {
    title: "Careers", description: "Build systems that help teams make better decisions.", columns: [
      { title: "Work in Belgium", description: "Engineering, data and integration roles for real mobility.", icon: 1, links: [{ label: "Autonomy Systems Engineer", href: "/careers/autonomy-systems-engineer" }, { label: "Mobility Data Engineer", href: "/careers/mobility-data-engineer" }, { label: "Systems Integration Lead", href: "/careers/systems-integration-lead" }] },
    ],
  },
  News: {
    title: "News & insights", description: "The latest signals from MOVERA and the world around us.", columns: [
      { title: "Company signals", description: "News from MOVERA and the Belgian mobility context.", icon: 3, links: [{ label: "Introducing MOVERA", href: "/news/introducing-movera" }, { label: "Intelligence near movement", href: "/news/edge-intelligence-near-movement" }, { label: "A shared mobility language", href: "/news/belgium-shared-mobility-language" }] },
      { title: "Perspectives", description: "Operator confidence, passenger trust and better decisions.", icon: 4, links: [{ label: "Operator confidence", href: "/blogs/designing-operator-confidence" }, { label: "Trust before boarding", href: "/blogs/trust-before-boarding" }, { label: "Signals to decisions", href: "/blogs/from-signals-to-decisions" }] },
    ],
  },
  "Innovation Hub": {
    title: "Innovation Hub", description: "Explore the ideas and experiments shaping what comes next.", columns: [
      { title: "Applied mobility research", description: "Experiments designed to become useful operational practice.", icon: 4, links: [{ label: "Confidence Maps", href: "/innovation-hub/confidence-maps" }, { label: "Mobility Simulation Studio", href: "/innovation-hub/mobility-simulation-studio" }, { label: "Curb Intelligence", href: "/innovation-hub/curb-intelligence" }] },
    ],
  },
};
const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

const resultPath = (locale: Locale, item: ContentItem) => item.type === "pages"
  ? pathFor(locale, `/about/${item.slug[locale]}`)
  : item.type === "jobs"
    ? pathFor(locale, `/careers/${item.slug[locale]}`)
    : item.type === "innovation"
      ? pathFor(locale, `/innovation-hub/${item.slug[locale]}`)
      : pathFor(locale, `/${item.type}/${item.slug[locale]}`);

const resultLabel = (locale: Locale, type: ContentItem["type"]) => ({
  news: { en: "News", ar: "الأخبار", fr: "Actualités", nl: "Nieuws" },
  blogs: { en: "Blog", ar: "مدونة", fr: "Blog", nl: "Blog" },
  projects: { en: "Project", ar: "مشروع", fr: "Projet", nl: "Project" },
  services: { en: "Service", ar: "خدمة", fr: "Service", nl: "Service" },
  products: { en: "Product", ar: "منتج", fr: "Produit", nl: "Product" },
  pages: { en: "About", ar: "عن موفيرا", fr: "À propos", nl: "Over MOVERA" },
  jobs: { en: "Career", ar: "وظيفة", fr: "Carrière", nl: "Vacature" },
  innovation: { en: "Innovation", ar: "ابتكار", fr: "Innovation", nl: "Innovatie" },
}[type][locale]);

function SearchPreview({ locale, query, results, status, inputRef, onQueryChange, onClose }: {
  locale: Locale;
  query: string;
  results: ContentItem[];
  status: "idle" | "loading" | "done" | "error";
  inputRef: React.RefObject<HTMLInputElement>;
  onQueryChange: (value: string) => void;
  onClose: () => void;
}) {
  const copy = {
    en: { label: "Search MOVERA", placeholder: "Search services, projects, news…", hint: "Start typing to search across MOVERA.", loading: "Searching…", noResults: "No matching content yet.", seeAll: "See all results", close: "Close search" },
    ar: { label: "ابحث في موفيرا", placeholder: "ابحث في الخدمات والمشاريع والأخبار…", hint: "ابدأ الكتابة للبحث في موفيرا.", loading: "جارٍ البحث…", noResults: "لا يوجد محتوى مطابق بعد.", seeAll: "عرض كل النتائج", close: "إغلاق البحث" },
    fr: { label: "Rechercher MOVERA", placeholder: "Rechercher services, projets, actualités…", hint: "Commencez à taper pour rechercher dans MOVERA.", loading: "Recherche…", noResults: "Aucun contenu correspondant.", seeAll: "Voir tous les résultats", close: "Fermer la recherche" },
    nl: { label: "Zoek MOVERA", placeholder: "Zoek services, projecten, nieuws…", hint: "Begin te typen om in MOVERA te zoeken.", loading: "Zoeken…", noResults: "Geen overeenkomende inhoud.", seeAll: "Alle resultaten bekijken", close: "Zoeken sluiten" },
  }[locale];
  const allResultsHref = pathFor(locale, `/search?q=${encodeURIComponent(query.trim())}`);

  return <div className="header-search-popover" role="dialog" aria-label={copy.label}>
    <form className="header-search-form" onSubmit={event => { event.preventDefault(); if (query.trim()) window.location.href = allResultsHref; }}>
      <SearchIcon />
      <input ref={inputRef} value={query} onChange={event => onQueryChange(event.target.value)} placeholder={copy.placeholder} aria-label={copy.label} />
      <button className="header-search-close" type="button" onClick={onClose} aria-label={copy.close}><CloseIcon /></button>
    </form>
    <div className="header-search-results" aria-live="polite">
      {!query.trim() && <p className="header-search-hint">{copy.hint}</p>}
      {query.trim() && status === "loading" && <p className="header-search-hint">{copy.loading}</p>}
      {query.trim() && status === "error" && <p className="header-search-empty">{copy.noResults}</p>}
      {query.trim() && status === "done" && results.slice(0, 5).map(item => <a className="header-search-result" key={`${item.type}-${item.id}`} href={resultPath(locale, item)} onClick={onClose}>
        <span><strong>{item.title[locale] || item.title.en}</strong><small>{item.summary[locale] || item.summary.en}</small></span>
        <em>{resultLabel(locale, item.type)}</em>
      </a>)}
      {query.trim() && status === "done" && results.length === 0 && <p className="header-search-empty">{copy.noResults}</p>}
    </div>
    {query.trim() && <a className="header-search-all" href={allResultsHref} onClick={onClose}>{copy.seeAll} <Arrow /></a>}
  </div>;
}

function MenuCard({ column, locale, close }: { column: MenuColumn; locale: Locale; close: () => void }) {
  return <div className="mega-column">
    <div className="mega-column-icon"><SuiteIcon kind={column.icon} /></div>
    {column.href ? <a className="mega-column-title" href={pathFor(locale, column.href)} onClick={close}>{menuLabel(column.title, locale)} <Arrow /></a> : <h3>{menuLabel(column.title, locale)}</h3>}
    <p>{menuLabel(column.description, locale)}</p>
    <div className="mega-links">{column.links.map(link => <a key={`${link.href}-${link.label}`} href={pathFor(locale, link.href)} onClick={close}>{menuLabel(link.label, locale)}<Arrow /></a>)}</div>
  </div>;
}

export function SiteHeader({ locale, setLocale, newsItems = [] }: { locale: Locale; setLocale: (locale: Locale) => void; newsItems?: NewsTickerItem[] }) {
  const ui = headerCopy[locale];
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);
  const [searchStatus, setSearchStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [remoteNewsItems, setRemoteNewsItems] = useState<NewsTickerItem[]>([]);
  const [remoteNewsLocale, setRemoteNewsLocale] = useState<Locale | null>(null);
  const shellRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const hasProvidedNews = newsItems.length > 0;
  const fallbackNewsItems = {
    en: [{ href: "/news", title: "Intelligence for the next decision" }, { href: "/blogs", title: "Read MOVERA’s latest perspectives" }],
    ar: [{ href: "/news", title: "ذكاء لقرارك القادم" }, { href: "/blogs", title: "اقرأ أحدث رؤى موفيرا" }],
    fr: [{ href: "/news", title: "L’intelligence pour la prochaine décision" }, { href: "/blogs", title: "Découvrez les dernières perspectives de MOVERA" }],
    nl: [{ href: "/news", title: "Intelligentie voor de volgende beslissing" }, { href: "/blogs", title: "Lees de nieuwste perspectieven van MOVERA" }],
  }[locale];
  // Keep the ticker empty while a page-only news request is hydrating. Rendering
  // fallback items first and replacing them with API items changes the track
  // width mid-animation, which creates a visible jump.
  const tickerItems = hasProvidedNews ? newsItems : remoteNewsLocale === locale ? remoteNewsItems : [];

  useEffect(() => {
    const closeOnOutside = (event: MouseEvent) => { if (shellRef.current && !shellRef.current.contains(event.target as Node)) { setOpenMenu(null); setLangOpen(false); setSearchOpen(false); } };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpenMenu(null); setLangOpen(false); setSearchOpen(false); } };
    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("mousedown", closeOnOutside); document.removeEventListener("keydown", closeOnEscape); };
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = directionFor(locale);
    try { if (!localStorage.getItem("company-locale")) localStorage.setItem("company-locale", locale); } catch { /* essential-only fallback */ }
  }, [locale]);

  useEffect(() => {
    if (hasProvidedNews) return;
    const controller = new AbortController();
    setRemoteNewsItems([]);
    setRemoteNewsLocale(null);
    fetch(`${API}/api/v1/content/news`, { signal: controller.signal })
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(payload => {
        const items = (payload.data || []).slice(0, 3).map((item: ContentItem) => ({ href: `/news/${item.slug[locale]}`, title: item.title[locale] || item.title.en }));
        setRemoteNewsItems(items.length > 0 ? items : fallbackNewsItems);
        setRemoteNewsLocale(locale);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setRemoteNewsItems(fallbackNewsItems);
          setRemoteNewsLocale(locale);
        }
      });
    return () => controller.abort();
  }, [hasProvidedNews, locale]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!searchOpen || !query) { setSearchResults([]); setSearchStatus("idle"); return; }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setSearchStatus("loading");
      fetch(`${API}/api/v1/search?q=${encodeURIComponent(query)}&locale=${locale}`, { signal: controller.signal })
        .then(response => response.ok ? response.json() : Promise.reject())
        .then(payload => { setSearchResults(payload.data || []); setSearchStatus("done"); })
        .catch(() => { if (!controller.signal.aborted) { setSearchResults([]); setSearchStatus("error"); } });
    }, 180);
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [locale, searchOpen, searchQuery]);

  const chooseLocale = (next: Locale) => { setLocale(next); setLangOpen(false); setSearchOpen(false); try { localStorage.setItem("company-locale", next); } catch { /* essential-only fallback */ } window.location.href = pathFor(next, window.location.pathname.replace(/^\/[^/]+/, "") || "/"); };
  const closeMenus = () => setOpenMenu(null);
  const toggleSearch = () => { setSearchOpen(value => !value); setOpenMenu(null); setLangOpen(false); };

  return <>
    <header className="site-header" ref={shellRef}>
      <a className="brand" href={pathFor(locale)} aria-label={locale === "ar" ? "موفيرا الرئيسية" : "MOVERA home"}><BrandLockup locale={locale} /></a>
      <nav className="desktop-nav" aria-label={locale === "ar" ? "التنقل الرئيسي" : locale === "fr" ? "Navigation principale" : locale === "nl" ? "Hoofdnavigatie" : "Primary navigation"}>{nav.map(item => siteMegaMenus[item] ? <div className={`nav-group ${openMenu === item ? "is-open" : ""}`} key={item}>
        <button className="nav-trigger" type="button" aria-haspopup="true" aria-expanded={openMenu === item} onClick={() => setOpenMenu(current => current === item ? null : item)}>{navLabels[locale][item]}<span className="nav-caret"><ChevronDownIcon /></span></button>
        {openMenu === item && <div className="mega-menu" role="region" aria-label={menuLabel(siteMegaMenus[item].title, locale)}><div className="mega-menu-heading"><div><span className="mega-menu-kicker">{menuLabel(siteMegaMenus[item].title, locale)}</span><p>{menuLabel(siteMegaMenus[item].description, locale)}</p></div><a href={pathFor(locale, item === "About" ? "/about" : item === "Services" ? "/services" : item === "Innovation Hub" ? "/innovation-hub" : `/${item.toLowerCase()}`)} onClick={closeMenus}>{ui.explore} <Arrow /></a></div><div className="mega-columns">{siteMegaMenus[item].columns.map(column => <MenuCard key={column.title} column={column} locale={locale} close={closeMenus} />)}</div></div>}
      </div> : <a key={item} href={pathFor(locale, primaryRoutes[item] || "/")}>{navLabels[locale][item]}</a>)}</nav>
      <div className="header-actions"><div className={`header-search ${searchOpen ? "is-open" : ""}`}><button className="icon-button search-button" type="button" onClick={toggleSearch} aria-label={ui.search} aria-expanded={searchOpen}><SearchIcon /></button>{searchOpen && <SearchPreview locale={locale} query={searchQuery} results={searchResults} status={searchStatus} inputRef={searchInputRef} onQueryChange={setSearchQuery} onClose={() => setSearchOpen(false)} />}</div><div className="lang-wrap"><button className="language-button" onClick={() => { setLangOpen(value => !value); setSearchOpen(false); }} aria-expanded={langOpen}><GlobeIcon /><span>{localeLabels[locale]}</span><span className="nav-caret"><ChevronDownIcon /></span></button>{langOpen && <div className="language-menu">{(Object.keys(localeLabels) as Locale[]).map(item => <button key={item} onClick={() => chooseLocale(item)} className={item === locale ? "selected" : ""}>{localeLabels[item]}</button>)}</div>}</div><a className="button button-primary compact" href={pathFor(locale, "/contact")}>{ui.enquiry} <Arrow /></a><button className="icon-button mobile-menu-button" onClick={() => setMenuOpen(true)} aria-label={ui.openMenu}><MenuIcon /></button></div>
    </header>
    <div className="news-bar"><div className="ticker-viewport"><div className={`ticker-track ${tickerItems.length > 0 ? "is-ready" : "is-loading"}`}>{[0, 1].map(copyIndex => <div className="ticker-set" key={`ticker-set-${copyIndex}`} aria-hidden={copyIndex === 1}>{tickerItems.map((item, index) => <a className="ticker-item" tabIndex={copyIndex === 1 ? -1 : undefined} key={`${item.href}-${copyIndex}-${index}`} href={pathFor(locale, item.href)}>{item.title} <span>·</span></a>)}</div>)}</div></div><a className="news-label" href={pathFor(locale, "/news")}><SparkIcon />{locale === "ar" ? "الأخبار" : locale === "fr" ? "Actualités" : locale === "nl" ? "Nieuws" : "News"}</a></div>
    {menuOpen && <div className="mobile-menu"><div className="mobile-menu-top"><a className="brand" href={pathFor(locale)}><BrandLockup locale={locale} /></a><button className="icon-button" onClick={() => setMenuOpen(false)} aria-label={ui.closeMenu}><CloseIcon /></button></div><nav>{nav.map(item => siteMegaMenus[item] ? <div className="mobile-nav-group" key={item}><strong>{navLabels[locale][item]}</strong>{siteMegaMenus[item].columns.flatMap(column => [{ label: column.title, href: column.href || "/" + item.toLowerCase() }, ...column.links]).map(link => <a key={`${item}-${link.href}-${link.label}`} href={pathFor(locale, link.href)} onClick={() => setMenuOpen(false)}>{menuLabel(link.label, locale)}<Arrow /></a>)}</div> : <a key={item} href={pathFor(locale, primaryRoutes[item] || "/")} onClick={() => setMenuOpen(false)}>{navLabels[locale][item]}<Arrow /></a>)}</nav><div className="mobile-languages">{(Object.keys(localeLabels) as Locale[]).map(item => <button key={item} onClick={() => { chooseLocale(item); setMenuOpen(false); }} className={item === locale ? "selected" : ""}>{localeLabels[item]}</button>)}</div></div>}
  </>;
}
