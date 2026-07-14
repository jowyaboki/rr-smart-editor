export type Locale = 'en' | 'fr' | 'ar';

export interface TranslationDictionary {
  appName: string;
  dashboard: string;
  templates: string;
  editor: string;
  ready: string;
  snapshots: string;
  saveNow: string;
  loading: string;
  allSaved: string;
  saving: string;
  saveFailed: string;
  changesPending: string;
  recentProjects: string;
  createProject: string;
  videoPreview: string;
}

export const LOCALES: Record<Locale, { direction: 'ltr' | 'rtl'; dictionary: TranslationDictionary }> = {
  en: {
    direction: 'ltr',
    dictionary: {
      appName: 'RR Smart Editor',
      dashboard: 'Dashboard',
      templates: 'Templates',
      editor: 'Editor Workspace',
      ready: 'Ready',
      snapshots: 'Snapshots History',
      saveNow: 'Save Now',
      loading: 'Loading...',
      allSaved: 'All changes saved',
      saving: 'Saving...',
      saveFailed: 'Save failed',
      changesPending: 'changes pending',
      recentProjects: 'Recent Projects',
      createProject: 'Create New Project',
      videoPreview: 'Video Preview',
    },
  },
  fr: {
    direction: 'ltr',
    dictionary: {
      appName: 'Editeur Intelligent RR',
      dashboard: 'Tableau de bord',
      templates: 'Modèles',
      editor: "Espace de travail de l'éditeur",
      ready: 'Prêt',
      snapshots: 'Historique des instantanés',
      saveNow: 'Enregistrer maintenant',
      loading: 'Chargement...',
      allSaved: 'Toutes les modifications ont été enregistrées',
      saving: 'Enregistrement en cours...',
      saveFailed: "L'enregistrement a échoué",
      changesPending: 'modifications en attente',
      recentProjects: 'Projets Récents',
      createProject: 'Créer un nouveau projet',
      videoPreview: 'Aperçu vidéo',
    },
  },
  ar: {
    direction: 'rtl',
    dictionary: {
      appName: 'محرر ر ر الذكي',
      dashboard: 'لوحة التحكم',
      templates: 'القوالب',
      editor: 'مساحة العمل',
      ready: 'جاهز',
      snapshots: 'سجل النسخ الاحتياطية',
      saveNow: 'احفظ الآن',
      loading: 'جاري التحميل...',
      allSaved: 'تم حفظ جميع التغييرات',
      saving: 'جاري الحفظ...',
      saveFailed: 'فشل الحفظ',
      changesPending: 'تغييرات معلقة',
      recentProjects: 'المشاريع الحديثة',
      createProject: 'إنشاء مشروع جديد',
      videoPreview: 'معاينة الفيديو',
    },
  },
};
