import { useExtensionStore } from '../store/extensionStore';
import { extensionLifecycleService } from '../services';

export function useExtensionManager() {
  const store = useExtensionStore();

  const installExtension = async (payload: any) => {
    store.setLoading(true);
    try {
      await extensionLifecycleService.install(payload);
      store.toggleInstalled(payload.id);
    } catch (e: any) {
      console.error(e);
    } finally {
      store.setLoading(false);
    }
  };

  const uninstallExtension = (id: string) => {
    extensionLifecycleService.uninstall(id);
    store.toggleInstalled(id);
  };

  const toggleEnabled = (id: string, currentlyEnabled: boolean) => {
    if (currentlyEnabled) {
      extensionLifecycleService.disable(id);
    } else {
      extensionLifecycleService.enable(id);
    }
    store.toggleEnabled(id);
  };

  const filteredExtensions = store.extensions.filter((ext) => {
    const matchesQuery =
      ext.displayName.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
      ext.description.toLowerCase().includes(store.searchQuery.toLowerCase());
    const matchesCategory = store.categoryFilter === 'all' || ext.category === store.categoryFilter;
    return matchesQuery && matchesCategory;
  });

  return {
    extensions: filteredExtensions,
    searchQuery: store.searchQuery,
    categoryFilter: store.categoryFilter,
    loading: store.loading,
    setSearchQuery: store.setSearchQuery,
    setCategoryFilter: store.setCategoryFilter,
    installExtension,
    uninstallExtension,
    toggleEnabled,
  };
}
