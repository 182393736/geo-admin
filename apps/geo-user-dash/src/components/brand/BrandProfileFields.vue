<template>
  <div class="bp-edit-grid">
    <div class="bp-form-field">
      <label class="bp-form-label">所属行业</label>
      <input
        v-model="industryLocal"
        type="text"
        class="bp-form-input"
        placeholder="例如:家电 · 空调"
        @blur="saveIndustry"
      />
    </div>

    <div class="bp-form-field">
      <label class="bp-form-label">官网 / 主链接</label>
      <div class="bp-url-group">
        <select v-model="protocolLocal" class="bp-url-select" @change="saveWebsite">
          <option value="https://">https://</option>
          <option value="http://">http://</option>
        </select>
        <input
          v-model="urlPathLocal"
          type="text"
          class="bp-url-input"
          placeholder="example.com/path"
          @blur="saveWebsite"
        />
      </div>
    </div>

    <div class="bp-form-field bp-form-field--full">
      <label class="bp-form-label">品牌简介</label>
      <textarea
        v-model="descriptionLocal"
        class="bp-form-textarea"
        rows="4"
        placeholder="一段话描述品牌的背景与定位..."
        @blur="saveDescription"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { brandApi } from '@/api/modules/brand';
import { toast } from '@/lib/toast';

const props = defineProps<{
  industry: string;
  protocol: string;
  urlPath: string;
  description: string;
}>();

const emit = defineEmits<{
  'update:industry': [string];
  'update:protocol': [string];
  'update:urlPath': [string];
  'update:description': [string];
}>();

const industryLocal = ref(props.industry);
const protocolLocal = ref(props.protocol || 'https://');
const urlPathLocal = ref(props.urlPath);
const descriptionLocal = ref(props.description);

const savedIndustry = ref(props.industry.trim());
const savedWebsite = ref(joinWebsite(props.protocol, props.urlPath));
const savedDescription = ref(props.description.trim());

let saving = false;

watch(() => props.industry, v => {
  if (saving) return;
  industryLocal.value = v;
  savedIndustry.value = v.trim();
});
watch(() => props.protocol, v => {
  if (saving) return;
  protocolLocal.value = v || 'https://';
  savedWebsite.value = joinWebsite(protocolLocal.value, urlPathLocal.value);
});
watch(() => props.urlPath, v => {
  if (saving) return;
  urlPathLocal.value = v;
  savedWebsite.value = joinWebsite(protocolLocal.value, urlPathLocal.value);
});
watch(() => props.description, v => {
  if (saving) return;
  descriptionLocal.value = v;
  savedDescription.value = v.trim();
});

function joinWebsite(protocol: string, path: string) {
  const p = (path || '').trim();
  if (!p) return '';
  if (/^https?:\/\//i.test(p)) return p;
  return `${protocol || 'https://'}${p}`;
}

function splitIndustry(raw: string): string[] {
  return String(raw || '')
    .split(/[·•、,，|/]+/)
    .map(s => s.trim())
    .filter(Boolean);
}

function formatIndustry(list: string[]) {
  return list.join(' · ');
}

async function persist(patch: { industry?: string[]; website?: string; description?: string }) {
  saving = true;
  try {
    const data = await brandApi.patchIntro(patch);
    if (patch.industry) {
      const next = formatIndustry(data.industry || patch.industry);
      industryLocal.value = next;
      savedIndustry.value = next;
      emit('update:industry', next);
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'website')) {
      const website = data.website || '';
      savedWebsite.value = website;
      if (website.startsWith('http://')) {
        protocolLocal.value = 'http://';
        urlPathLocal.value = website.slice('http://'.length);
      } else if (website.startsWith('https://')) {
        protocolLocal.value = 'https://';
        urlPathLocal.value = website.slice('https://'.length);
      } else {
        urlPathLocal.value = website;
      }
      emit('update:protocol', protocolLocal.value);
      emit('update:urlPath', urlPathLocal.value);
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'description')) {
      const next = data.description || '';
      descriptionLocal.value = next;
      savedDescription.value = next.trim();
      emit('update:description', next);
    }
  } catch (e: any) {
    toast.error(e?.message || '保存失败');
  } finally {
    saving = false;
  }
}

async function saveIndustry() {
  const next = industryLocal.value.trim();
  emit('update:industry', industryLocal.value);
  if (next === savedIndustry.value) return;
  await persist({ industry: splitIndustry(next) });
}

async function saveWebsite() {
  emit('update:protocol', protocolLocal.value);
  emit('update:urlPath', urlPathLocal.value);
  const next = joinWebsite(protocolLocal.value, urlPathLocal.value);
  if (next === savedWebsite.value) return;
  await persist({ website: next });
}

async function saveDescription() {
  const next = descriptionLocal.value.trim();
  emit('update:description', descriptionLocal.value);
  if (next === savedDescription.value) return;
  await persist({ description: next });
}
</script>

<style lang="scss" scoped>
.bp-edit-grid {
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 16px;
  column-gap: 18px;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
}

.bp-form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;

  &--full {
    grid-column: 1 / -1;
  }
}

.bp-form-label {
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.025em;
  color: #2a2d36;
}

.bp-form-input {
  height: 38px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #e6e8ee;
  background: #fff;
  font-size: 13px;
  color: #0f1115;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: #6452ff;
    box-shadow: 0 0 0 3px #efecff;
  }
}

.bp-url-group {
  display: flex;
  height: 38px;
  border-radius: 8px;
  border: 1px solid #e6e8ee;
  background: #fff;
  overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus-within {
    border-color: #6452ff;
    box-shadow: 0 0 0 3px #efecff;
  }
}

.bp-url-select {
  flex-shrink: 0;
  height: 100%;
  padding: 0 10px;
  border: none;
  border-right: 1px solid #e6e8ee;
  background: #f5f6fa;
  font-size: 12.5px;
  font-weight: 600;
  color: #2a2d36;
  outline: none;
  cursor: pointer;
}

.bp-url-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0 12px;
  border: none;
  background: transparent;
  font-size: 13px;
  color: #0f1115;
  outline: none;

  &::placeholder {
    color: #9ca3af;
  }
}

.bp-form-textarea {
  width: 100%;
  min-height: 80px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #e6e8ee;
  background: #fff;
  font-size: 13px;
  line-height: 1.6;
  color: #0f1115;
  outline: none;
  resize: vertical;
  box-sizing: border-box;
  transition: border-color 0.15s, box-shadow 0.15s;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: #6452ff;
    box-shadow: 0 0 0 3px #efecff;
  }
}
</style>
