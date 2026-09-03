import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const collapsed = ref(false);
  const currentBrand = ref({
    id: 'hongxiang',
    name: '佛山市宏祥家具实业有限公司',
    logo: '',
  });
  const credits = ref(18);
  const currentDate = ref('08/26');

  function toggleSidebar() {
    collapsed.value = !collapsed.value;
  }

  function setBrand(brand: typeof currentBrand.value) {
    currentBrand.value = brand;
  }

  return {
    collapsed,
    currentBrand,
    credits,
    currentDate,
    toggleSidebar,
    setBrand,
  };
});
