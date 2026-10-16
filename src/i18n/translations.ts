/**
 * DJARA — Système de traductions centralisé
 *
 * Toutes les chaînes de l'interface sont définies ici.
 * Aucun texte UI ne doit être codé en dur dans les composants.
 *
 * Structure :
 *   translations.<namespace>.<clé>.<lang>
 *
 * Langues supportées : 'fr' (français) | 'ar' (arabe)
 * RTL : géré automatiquement via le hook useTranslation.
 *
 * Pour ajouter une langue :
 *   1. Ajouter le code langue à type Lang
 *   2. Compléter chaque entrée avec la nouvelle traduction
 *   3. Mettre à jour RTL_LANGS si nécessaire
 */

export type Lang = 'fr' | 'ar'

export const RTL_LANGS: Lang[] = ['ar']

export function isRTL(lang: Lang): boolean {
  return RTL_LANGS.includes(lang)
}

/** Type d'une entrée bilingue */
type Bilingual = Record<Lang, string>

function t(fr: string, ar: string): Bilingual {
  return { fr, ar }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMUN — éléments partagés entre plusieurs pages
// ─────────────────────────────────────────────────────────────────────────────
export const common = {
  app: {
    nom: t('DJARA', 'جارة'),
    tagline: t('Le talent des femmes, tout près de vous', 'موهبة المرأة، بالقرب منك'),
    copyright: t('© 2024 DJARA — Sécurisé & confidentiel', '© 2024 جارة — آمن وسري'),
  },
  langue: {
    fr: t('FR', 'FR'),
    ar: t('AR', 'AR'),
  },
  actions: {
    enregistrer: t('Enregistrer', 'حفظ'),
    annuler: t('Annuler', 'إلغاء'),
    confirmer: t('Confirmer', 'تأكيد'),
    retour: t('Retour', 'رجوع'),
    continuer: t('Continuer', 'متابعة'),
    fermer: t('Fermer', 'إغلاق'),
    modifier: t('Modifier', 'تعديل'),
    supprimer: t('Supprimer', 'حذف'),
    envoyer: t('Envoyer', 'إرسال'),
    charger: t('Chargement…', '...جاري التحميل'),
    voir: t('Voir', 'عرض'),
    voirTout: t('Voir tout', 'عرض الكل'),
    rechercher: t('Rechercher', 'بحث'),
    filtrer: t('Filtrer', 'تصفية'),
    partager: t('Partager', 'مشاركة'),
    signaler: t('Signaler', 'إبلاغ'),
    bloquer: t('Bloquer', 'حظر'),
    contacter: t('Contacter', 'تواصل'),
  },
  erreurs: {
    general: t('Une erreur est survenue. Veuillez réessayer.', 'حدث خطأ. يرجى المحاولة مرة أخرى.'),
    reseau: t('Problème de connexion. Vérifiez votre réseau.', 'مشكلة في الاتصال. تحقق من شبكتك.'),
    nonAutorise: t('Action non autorisée.', 'إجراء غير مصرح به.'),
    nonTrouve: t('Ressource introuvable.', 'المورد غير موجود.'),
  },
  champs: {
    prenom: t('Prénom', 'الاسم'),
    nom: t('Nom', 'اللقب'),
    email: t('Adresse e-mail', 'عنوان البريد الإلكتروني'),
    emailPlaceholder: t('votre@email.com', 'بريدك@example.com'),
    telephone: t('Numéro de téléphone', 'رقم الهاتف'),
    telephonePlaceholder: t('0770 000 000', '0770 000 000'),
    motDePasse: t('Mot de passe', 'كلمة المرور'),
    motDePassePlaceholder: t('Au moins 8 caractères', '8 أحرف على الأقل'),
    wilaya: t('Wilaya', 'الولاية'),
    commune: t('Commune', 'البلدية'),
    description: t('Description', 'وصف'),
    categorie: t('Catégorie', 'الفئة'),
    prix: t('Prix', 'السعر'),
    disponibilite: t('Disponibilité', 'التوفر'),
    message: t('Message', 'رسالة'),
  },
  statuts: {
    actif: t('Actif', 'نشط'),
    inactif: t('Inactif', 'غير نشط'),
    verifie: t('Vérifié', 'موثق'),
    nonVerifie: t('Non vérifié', 'غير موثق'),
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────
export const nav = {
  accueil: t('Accueil', 'الرئيسية'),
  rechercher: t('Rechercher', 'بحث'),
  publier: t('Publier', 'نشر'),
  messages: t('Messages', 'رسائل'),
  monProfil: t('Mon profil', 'ملفي'),
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE D'ACCUEIL
// ─────────────────────────────────────────────────────────────────────────────
export const accueil = {
  bienvenue: t('Bonjour', 'مرحباً'),
  recherchePlaceholder: t('Coiffure, couture, cours…', 'تصفيف شعر، خياطة، دروس...'),
  categoriesPopulaires: t('Catégories populaires', 'الفئات الشائعة'),
  presProximite: t('Près de vous', 'قريبات منك'),
  nouvellesAnnonces: t('Nouvelles annonces', 'إعلانات جديدة'),
  profVérifiés: t('Profils vérifiés', 'ملفات موثقة'),
  voirPlus: t('Voir plus', 'عرض المزيد'),
  aucunResultat: t('Aucun résultat dans votre zone', 'لا توجد نتائج في منطقتك'),
  elargirRecherche: t('Élargir la recherche', 'توسيع البحث'),
  selectionnerWilaya: t('Sélectionner votre wilaya', 'اختاري ولايتك'),
  toutesLesWilayas: t('Toutes les wilayas', 'جميع الولايات'),
}

// ─────────────────────────────────────────────────────────────────────────────
// CATÉGORIES
// ─────────────────────────────────────────────────────────────────────────────
export const categories = {
  maison: t('Maison & quotidien', 'المنزل واليومي'),
  beaute: t('Beauté & bien-être', 'الجمال والعافية'),
  education: t('Éducation & transmission', 'التعليم والتدريب'),
  creation: t('Création & artisanat', 'الإبداع والحرف'),
  digital: t('Digital & entrepreneuriat', 'الرقمي وريادة الأعمال'),
  evenements: t('Événements', 'الفعاليات'),
  sousCategories: {
    cuisineTraditionnelle: t('Cuisine traditionnelle', 'الطبخ التقليدي'),
    gateaux: t('Préparation de gâteaux', 'صنع الحلويات'),
    couture: t('Couture', 'الخياطة'),
    repassage: t('Repassage', 'الكي'),
    organisation: t('Organisation du domicile', 'تنظيم المنزل'),
    menage: t('Aide ménagère', 'المساعدة المنزلية'),
    coiffure: t('Coiffure féminine', 'تصفيف الشعر النسائي'),
    maquillage: t('Maquillage', 'المكياج'),
    soins: t('Soins esthétiques', 'العناية الجمالية'),
    henne: t('Henné', 'الحناء'),
    ongles: t('Onglerie', 'العناية بالأظافر'),
    soutienScolaire: t('Soutien scolaire', 'الدعم المدرسي'),
    coursLangues: t('Cours de langues', 'دروس اللغات'),
    informatique: t('Initiation informatique', 'تعلم الإعلام الآلي'),
    devoirs: t('Accompagnement aux devoirs', 'مساعدة في الواجبات'),
    formationArtisanale: t('Formation artisanale', 'تدريب حرفي'),
    broderie: t('Broderie', 'التطريز'),
    coutureTraditionnelle: t('Couture traditionnelle', 'الخياطة التقليدية'),
    vetements: t('Création de vêtements', 'صنع الملابس'),
    decoration: t('Décoration', 'الديكور'),
    artisanat: t('Artisanat local', 'الحرف المحلية'),
    communityManagement: t('Community management', 'إدارة المجتمعات'),
    graphisme: t('Création graphique', 'التصميم الجرافيكي'),
    assistanceAdmin: t('Assistance administrative', 'مساعدة إدارية'),
    siteInternet: t('Création de sites internet', 'إنشاء مواقع الإنترنت'),
    photographie: t('Photographie', 'التصوير'),
    montageVideo: t('Montage vidéo', 'مونتاج الفيديو'),
    fetes: t('Organisation de fêtes', 'تنظيم الحفلات'),
    patisserie: t('Pâtisserie événementielle', 'حلويات المناسبات'),
    ceremonies: t('Préparation de cérémonies', 'تحضير المناسبات'),
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTHENTIFICATION
// ─────────────────────────────────────────────────────────────────────────────
export const auth = {
  connexion: {
    titre: t('Connexion', 'تسجيل الدخول'),
    sousTitre: t('Bon retour sur DJARA', 'مرحباً بعودتك إلى جارة'),
    bouton: t('Se connecter', 'تسجيل الدخول'),
    enCours: t('Connexion…', '...جاري الدخول'),
    pasDeCompte: t("Pas encore de compte ?", 'ليس لديك حساب؟'),
    sInscrire: t("S'inscrire", 'إنشاء حساب'),
    mdpOublie: t('Mot de passe oublié ?', 'نسيت كلمة المرور؟'),
    erreurCredentiels: t('Email ou mot de passe incorrect.', 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'),
    erreurCompteInactif: t('Votre compte est désactivé. Contactez le support.', 'حسابك معطل. تواصلي مع الدعم.'),
  },
  inscription: {
    titre: t("Rejoindre DJARA", 'انضمي إلى جارة'),
    sousTitre: t('Créez votre compte gratuitement', 'أنشئي حسابك مجاناً'),
    bouton: t("S'inscrire", 'إنشاء حساب'),
    enCours: t('Création du compte…', '...جاري إنشاء الحساب'),
    dejaCCompte: t('Déjà un compte ?', 'لديك حساب؟'),
    seConnecter: t('Se connecter', 'تسجيل الدخول'),
    cgu: t("J'accepte les conditions d'utilisation", 'أوافق على شروط الاستخدام'),
    erreurExistant: t('Un compte existe déjà avec cet email.', 'يوجد حساب مسجل بهذا البريد.'),
    erreurTelephone: t('Numéro de téléphone invalide.', 'رقم الهاتف غير صحيح.'),
  },
  motDePasse: {
    oublie: {
      titre: t('Mot de passe oublié', 'نسيت كلمة المرور'),
      sousTitre: t("Saisissez votre e-mail. Nous vous enverrons un lien pour réinitialiser votre mot de passe.", 'أدخلي بريدك الإلكتروني. سنرسل لك رابط إعادة التعيين.'),
      envoyer: t('Envoyer le lien', 'إرسال الرابط'),
      enCours: t('Envoi…', '...جاري الإرسال'),
      envoye: t('E-mail envoyé !', '!تم إرسال البريد الإلكتروني'),
      confirmation: t("Si un compte existe avec cette adresse, vous recevrez un lien dans quelques minutes.", 'إذا كان يوجد حساب بهذا العنوان، ستتلقين رابط خلال دقائق.'),
      verifierSpam: t('Pensez à vérifier vos spams.', 'تحققي من مجلد الرسائل غير المرغوب فيها.'),
      renvoyer: t('Renvoyer le lien', 'إعادة إرسال الرابط'),
      renvoyerNote: t("Vous n'avez pas reçu l'e-mail ?", 'لم تتلقي البريد الإلكتروني؟'),
      retour: t('Retour à la connexion', 'العودة إلى تسجيل الدخول'),
      erreurEmail: t('Veuillez saisir une adresse e-mail valide.', 'يرجى إدخال عنوان بريد إلكتروني صحيح.'),
    },
    reinitialiser: {
      titre: t('Nouveau mot de passe', 'كلمة مرور جديدة'),
      sousTitre: t('Choisissez un mot de passe sécurisé.', 'اختاري كلمة مرور آمنة.'),
      nouveau: t('Nouveau mot de passe', 'كلمة المرور الجديدة'),
      confirmer: t('Confirmer', 'تأكيد'),
      enregistrer: t('Enregistrer', 'حفظ'),
      enCours: t('Enregistrement…', '...جاري الحفظ'),
      succes: t('Mot de passe mis à jour !', '!تم تحديث كلمة المرور'),
      succesDetail: t('Vous pouvez maintenant vous connecter.', 'يمكنك الآن تسجيل الدخول.'),
      allerConnexion: t('Se connecter', 'تسجيل الدخول'),
      lienExpire: t('Lien invalide ou expiré', 'رابط غير صالح أو منتهي الصلاحية'),
      lienExpireDetail: t('Ce lien a expiré. Veuillez en demander un nouveau.', 'انتهت صلاحية الرابط. يرجى طلب رابط جديد.'),
      demanderLien: t('Demander un nouveau lien', 'طلب رابط جديد'),
      erreurCourt: t('Le mot de passe doit contenir au moins 8 caractères.', 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل.'),
      erreurCorrespondance: t('Les mots de passe ne correspondent pas.', 'كلمتا المرور غير متطابقتين.'),
    },
    criteres: {
      min8: t('8 caractères minimum', '8 أحرف على الأقل'),
      majuscule: t('Une majuscule', 'حرف كبير واحد'),
      chiffre: t('Un chiffre', 'رقم واحد'),
      fort: t('Fort', 'قوي'),
      moyen: t('Moyen', 'متوسط'),
      faible: t('Faible', 'ضعيف'),
    },
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFIL
// ─────────────────────────────────────────────────────────────────────────────
export const profil = {
  prestataire: {
    titre: t('Profil prestataire', 'ملف مقدمة الخدمة'),
    presentation: t('Présentation', 'نبذة تعريفية'),
    services: t('Services proposés', 'الخدمات المقدمة'),
    galerie: t('Galerie', 'معرض الأعمال'),
    avis: t('Avis', 'التقييمات'),
    disponibilite: t('Disponibilité', 'التوفر'),
    tarifDepuis: t('À partir de', 'ابتداءً من'),
    tarifDa: t('DA', 'دج'),
    contact: t('Contacter', 'تواصل'),
    demanderPrestation: t('Demander une prestation', 'طلب خدمة'),
    prendrRdv: t('Prendre RDV', 'حجز موعد'),
    badges: {
      niveau1: t('Téléphone vérifié', 'هاتف موثق'),
      niveau2: t('Identité vérifiée', 'هوية موثقة'),
      niveau3: t('Qualifications vérifiées', 'مؤهلات موثقة'),
      niveau4: t('Profil approuvé', 'ملف معتمد'),
    },
    aucunService: t('Aucun service publié', 'لا توجد خدمات منشورة'),
  },
  client: {
    titre: t('Mon profil', 'ملفي الشخصي'),
    modifier: t('Modifier le profil', 'تعديل الملف'),
    mesReservations: t('Mes réservations', 'حجوزاتي'),
    mesServices: t('Mes services', 'خدماتي'),
    mesFavoris: t('Mes favoris', 'المفضلة'),
    parametres: t('Paramètres', 'الإعدادات'),
    deconnexion: t('Se déconnecter', 'تسجيل الخروج'),
    supprimerCompte: t('Supprimer mon compte', 'حذف حسابي'),
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// RÉSERVATIONS
// ─────────────────────────────────────────────────────────────────────────────
export const reservations = {
  titre: t('Mes réservations', 'حجوزاتي'),
  modeClient: t('En tant que cliente', 'كعميلة'),
  modePrestataire: t('En tant que prestataire', 'كمقدمة خدمة'),
  aucune: t('Aucune réservation', 'لا توجد حجوزات'),
  aucuneDetail: t('Vos réservations apparaîtront ici.', 'ستظهر حجوزاتك هنا.'),
  statuts: {
    pending: t('En attente', 'في الانتظار'),
    accepted: t('Acceptée', 'مقبولة'),
    refused: t('Refusée', 'مرفوضة'),
    cancelled: t('Annulée', 'ملغاة'),
    completed: t('Terminée', 'منجزة'),
    disputed: t('Litige', 'نزاع'),
  },
  actions: {
    accepter: t('Accepter', 'قبول'),
    refuser: t('Refuser', 'رفض'),
    annuler: t('Annuler', 'إلغاء'),
    marquerTerminee: t('Marquer comme terminée', 'وضع علامة كمنجزة'),
    signalerLitige: t('Signaler un litige', 'الإبلاغ عن نزاع'),
    laisserAvis: t('Laisser un avis', 'إضافة تقييم'),
    contacter: t('Contacter', 'تواصل'),
  },
  confirmation: {
    titre: t('Confirmer l\'action', 'تأكيد الإجراء'),
    texteAccepter: t('Voulez-vous accepter cette réservation ?', 'هل تريدين قبول هذا الحجز؟'),
    texteRefuser: t('Voulez-vous refuser cette réservation ?', 'هل تريدين رفض هذا الحجز؟'),
    texteAnnuler: t('Voulez-vous annuler cette réservation ?', 'هل تريدين إلغاء هذا الحجز؟'),
    texteTerminer: t('Marquer cette prestation comme terminée ?', 'تحديد هذه الخدمة كمنجزة؟'),
    texteDispoter: t('Signaler un litige pour cette réservation ?', 'الإبلاغ عن نزاع لهذا الحجز؟'),
  },
  avis: {
    titre: t('Votre avis', 'تقييمك'),
    sousTitre: t('Comment s\'est passée la prestation ?', 'كيف كانت الخدمة؟'),
    qualite: t('Qualité de la prestation', 'جودة الخدمة'),
    ponctualite: t('Ponctualité', 'الالتزام بالمواعيد'),
    communication: t('Communication', 'التواصل'),
    recommendation: t('Recommandation', 'التوصية'),
    commentaire: t('Commentaire (optionnel)', 'تعليق (اختياري)'),
    commentairePlaceholder: t('Partagez votre expérience…', 'شاركي تجربتك...'),
    publier: t('Publier l\'avis', 'نشر التقييم'),
    succes: t('Avis publié !', '!تم نشر التقييم'),
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────────────────────────────────────────
export const messages = {
  titre: t('Messages', 'الرسائل'),
  aucun: t('Aucun message', 'لا توجد رسائل'),
  aucunDetail: t('Vos conversations apparaîtront ici.', 'ستظهر محادثاتك هنا.'),
  ecrireMessage: t('Écrire un message…', '...اكتبي رسالة'),
  envoyer: t('Envoyer', 'إرسال'),
  nouveau: t('Nouveau message', 'رسالة جديدة'),
  demandeDevis: t('Demande de devis', 'طلب عرض سعر'),
  propositionRdv: t('Proposition de rendez-vous', 'اقتراح موعد'),
  photoEnvoyee: t('Photo envoyée', 'تم إرسال صورة'),
  bloquer: t('Bloquer', 'حظر'),
  signaler: t('Signaler', 'إبلاغ'),
  confirmerBlocage: t('Confirmer le blocage', 'تأكيد الحظر'),
  texteBlocage: t('Vous ne verrez plus les messages de cette utilisatrice.', 'لن ترى رسائل هذه المستخدمة بعد الآن.'),
}

// ─────────────────────────────────────────────────────────────────────────────
// RECHERCHE
// ─────────────────────────────────────────────────────────────────────────────
export const recherche = {
  titre: t('Rechercher', 'بحث'),
  placeholder: t('Rechercher un service…', '...ابحثي عن خدمة'),
  filtres: {
    titre: t('Filtres', 'الفلاتر'),
    distance: t('Distance', 'المسافة'),
    prix: t('Prix', 'السعر'),
    disponibilite: t('Disponibilité', 'التوفر'),
    note: t('Note minimale', 'الحد الأدنى للتقييم'),
    verifiees: t('Profils vérifiés seulement', 'الملفات الموثقة فقط'),
  },
  rayons: {
    '1km': t('1 km', '1 كم'),
    '3km': t('3 km', '3 كم'),
    '5km': t('5 km', '5 كم'),
    '10km': t('10 km', '10 كم'),
    '25km': t('25 km', '25 كم'),
    '50km': t('50 km', '50 كم'),
    national: t('National (à distance)', 'وطني (عن بُعد)'),
  },
  affichage: {
    liste: t('Liste', 'قائمة'),
    carte: t('Carte', 'خريطة'),
  },
  aucunResultat: t('Aucun résultat', 'لا توجد نتائج'),
  aucunResultatDetail: t('Essayez d\'élargir votre recherche ou de changer de catégorie.', 'حاولي توسيع البحث أو تغيير الفئة.'),
  resultats: t('résultat(s)', 'نتيجة'),
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLICATION / SERVICES
// ─────────────────────────────────────────────────────────────────────────────
export const publier = {
  titre: t('Publier un service', 'نشر خدمة'),
  titrePlaceholder: t('Ex : Cours de couture traditionnelle', 'مثال: دروس خياطة تقليدية'),
  description: t('Description', 'الوصف'),
  descriptionPlaceholder: t('Décrivez votre service, votre expérience, ce qui vous distingue…', 'صفي خدمتك وتجربتك وما يميزك...'),
  tarif: t('Tarif (DA)', 'السعر (دج)'),
  tarifPlaceholder: t('Ex : 1500', 'مثال: 1500'),
  disponibilites: t('Disponibilités', 'أوقات التوفر'),
  photos: t('Photos de réalisation', 'صور الإنجازات'),
  publier: t('Publier', 'نشر'),
  enregistrer: t('Enregistrer comme brouillon', 'حفظ كمسودة'),
  modifier: t('Modifier le service', 'تعديل الخدمة'),
  supprimer: t('Supprimer', 'حذف'),
  succes: t('Service publié !', '!تم نشر الخدمة'),
  erreurTitre: t('Le titre est requis.', 'العنوان مطلوب.'),
  erreurCategorie: t('Veuillez choisir une catégorie.', 'يرجى اختيار فئة.'),
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGNALEMENT
// ─────────────────────────────────────────────────────────────────────────────
export const signalement = {
  titre: t('Signaler ce profil', 'الإبلاغ عن هذا الملف'),
  sousTitre: t('Aidez-nous à maintenir une communauté sûre.', 'ساعدينا في الحفاظ على مجتمع آمن.'),
  raisons: {
    fake: t('Profil faux ou frauduleux', 'ملف مزيف أو احتيالي'),
    harcelement: t('Harcèlement ou comportement abusif', 'تحرش أو سلوك مسيء'),
    spam: t('Spam ou contenu trompeur', 'رسائل مزعجة أو محتوى مضلل'),
    contenuInapproprie: t('Contenu inapproprié', 'محتوى غير لائق'),
    autre: t('Autre', 'أخرى'),
  },
  details: t('Détails supplémentaires (optionnel)', 'تفاصيل إضافية (اختياري)'),
  detailsPlaceholder: t('Décrivez le problème…', 'صفي المشكلة...'),
  envoyer: t('Envoyer le signalement', 'إرسال البلاغ'),
  succes: t('Signalement envoyé. Merci.', 'تم إرسال البلاغ. شكراً لك.'),
  confirmerBlocage: t('Bloquer aussi cette utilisatrice ?', 'هل تريدين حظر هذه المستخدمة أيضاً؟'),
}

// ─────────────────────────────────────────────────────────────────────────────
// FAVORIS
// ─────────────────────────────────────────────────────────────────────────────
export const favoris = {
  titre: t('Mes favoris', 'المفضلة'),
  aucun: t('Aucun favori', 'لا توجد مفضلة'),
  aucunDetail: t('Enregistrez des prestataires pour les retrouver facilement.', 'احفظي مقدمات الخدمات للرجوع إليهن بسهولة.'),
  ajouter: t('Enregistrer', 'حفظ'),
  retirer: t('Retirer des favoris', 'إزالة من المفضلة'),
  enregistre: t('Enregistré !', '!تم الحفظ'),
}

// ─────────────────────────────────────────────────────────────────────────────
// RÉSERVATION — MODAL DE DEMANDE
// ─────────────────────────────────────────────────────────────────────────────
export const demandeReservation = {
  titre: t('Demander une prestation', 'طلب خدمة'),
  service: t('Service', 'الخدمة'),
  choisirService: t('Choisir un service…', '...اختاري خدمة'),
  dateHeure: t('Date et heure souhaitées', 'التاريخ والوقت المطلوبان'),
  message: t('Message (optionnel)', 'رسالة (اختياري)'),
  messagePlaceholder: t('Précisez votre demande, votre adresse, etc.', 'حددي طلبك وعنوانك، إلخ.'),
  envoyer: t('Envoyer la demande', 'إرسال الطلب'),
  succes: t('Demande envoyée !', '!تم إرسال الطلب'),
  succesDetail: t('La prestataire vous répondra bientôt.', 'ستردّ عليك مقدمة الخدمة قريباً.'),
  erreurService: t('Veuillez choisir un service.', 'يرجى اختيار خدمة.'),
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT GLOBAL
// ─────────────────────────────────────────────────────────────────────────────
export const translations = {
  common,
  nav,
  accueil,
  categories,
  auth,
  profil,
  reservations,
  messages,
  recherche,
  publier,
  signalement,
  favoris,
  demandeReservation,
}

export type Translations = typeof translations
