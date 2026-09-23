<template>
  <!-- 排名菜单 8 页：按真实站路由名渲染（对标 geo.timus.cn/dashboard/*） -->
  <MatrixPanel v-if="currentTab === 'Ranking'" />
  <CompetitorPanel v-else-if="currentTab === 'RankingCompetitor'" />
  <CitationPanel v-else-if="currentTab === 'RankingCitation'" />
  <SourcePrefPanel v-else-if="currentTab === 'RankingSourcePref'" />
  <SourceIntelPanel v-else-if="currentTab === 'RankingSourceIntel'" />
  <TopicManagementPanel v-else-if="currentTab === 'RankingQuestionMgmt'" />
  <MonitorRecognitionPanel v-else-if="currentTab === 'RankingRecognitionMgmt'" />
  <SnapshotPanel v-else-if="currentTab === 'RankingSnapshot'" />
  <MatrixPanel v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import MatrixPanel from './panels/Matrix.vue';
import CompetitorPanel from './panels/Competitor.vue';
import CitationPanel from './panels/Citation.vue';
import SourcePrefPanel from './panels/SourcePref.vue';
import SourceIntelPanel from './panels/SourceIntel.vue';
import TopicManagementPanel from './panels/TopicManagement.vue';
import MonitorRecognitionPanel from './panels/MonitorRecognition.vue';
import SnapshotPanel from './panels/Snapshot.vue';

const route = useRoute();
const currentTab = computed(() => route.name as string);
</script>
