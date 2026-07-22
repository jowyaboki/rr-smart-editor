import { useTemplateStore } from '../store/templateStore';
import { templateRuntimeService } from '../services';

export function useTemplateManager() {
  const store = useTemplateStore();

  const installTemplate = async (template: any) => {
    store.setLoading(true);
    try {
      await templateRuntimeService.install(template);
      store.toggleInstalled(template.metadata.id);
    } catch (e: any) {
      console.error(e);
    } finally {
      store.setLoading(false);
    }
  };

  const executeInstantiation = (template: any) => {
    return templateRuntimeService.instantiate(template, store.parameterValues);
  };

  const filteredTemplates = store.templates.filter((tpl) => {
    const matchesQuery =
      tpl.displayName.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(store.searchQuery.toLowerCase());
    const matchesCategory = store.categoryFilter === 'all' || tpl.category === store.categoryFilter;
    return matchesQuery && matchesCategory;
  });

  return {
    templates: filteredTemplates,
    searchQuery: store.searchQuery,
    categoryFilter: store.categoryFilter,
    loading: store.loading,
    setSearchQuery: store.setSearchQuery,
    setCategoryFilter: store.setCategoryFilter,
    toggleFavorite: store.toggleFavorite,
    installTemplate,
    executeInstantiation,
  };
}
