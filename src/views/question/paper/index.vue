<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="试卷名称" prop="title">
              <el-input v-model="queryParams.title" placeholder="请输入试卷名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['question:paper:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['question:paper:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['question:paper:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['question:paper:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="paperList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="试卷ID" align="center" prop="id" v-if="false" />
        <el-table-column label="试卷分类" align="center" prop="categoryId"> 
          <template #default="scope">
            <dict-tag :options="edu_type" :value="scope.row.categoryId"/>
          </template>
        </el-table-column>
        <el-table-column label="试卷名称" align="center" prop="title" />
        <el-table-column label="组卷方式" align="center" prop="combinationMode">
          <template #default="scope">
            {{ scope.row.combinationMode === 1 ? '固定试卷' : (scope.row.combinationMode === 2 ? '随机试卷' : scope.row.combinationMode) }}
          </template>
        </el-table-column>
        <el-table-column label="试题数" align="center">
          <template #default="scope">{{ getTotalNumber(scope.row) }}</template>
        </el-table-column>
        <!-- <el-table-column label="试题数" align="center" prop="questionCount" /> -->
        <el-table-column label="试卷总分" align="center" prop="score" />
        <el-table-column label="及格分数" align="center" prop="passScore" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['question:paper:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['question:paper:remove']"></el-button>
            </el-tooltip>
            <el-button type="primary" @click="handleCompose(scope.row)">组卷</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改试卷对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="400px" append-to-body>
      <el-form ref="paperFormRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="试卷分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择试卷分类">
            <el-option
                v-for="dict in edu_type"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="试卷名称" prop="title" required>
          <el-input v-model="form.title" placeholder="请填写试卷名称" />
        </el-form-item>
        <el-form-item label="组卷方式" prop="combinationMode" required>
          <el-radio-group v-model="form.combinationMode">
            <el-radio :label="1">固定试卷</el-radio>
            <el-radio :label="2">随机组卷</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="composeDialog.visible" title="组卷设置" width="80%">
      <div>
        <el-button type="danger" style="margin-bottom: 16px;" @click="addBankToCompose">+ 添加抽题库</el-button>
        <el-dialog v-model="showBankSelect" title="选择题库" width="600px">
          <el-table
            :data="bankSelectList"
            @selection-change="handleBankSelectChange"
            :row-key="row => String(row.id)"
            ref="bankSelectTable"
            height="400"
          >
            <el-table-column type="selection" width="80" />
            <el-table-column label="题库名称" prop="bankName" />
            <el-table-column label="单选题" prop="singleChoiceCount" />
            <el-table-column label="多选题" prop="multipleChoiceCount" />
            <el-table-column label="填空题" prop="fillBlankCount" />
            <el-table-column label="判断题" prop="judgeCount" />
            <el-table-column label="问答题" prop="answerCount" />
            <el-table-column label="题帽题" prop="caseCount" />
          </el-table>
          <template #footer>
            <el-button @click="showBankSelect = false">取消</el-button>
            <el-button type="primary" @click="addSelectedBanks">加入</el-button>
          </template>
        </el-dialog>
        <el-table :data="composeDialog.banks" style="margin-bottom: 24px;">
          <el-table-column label="题库名称" prop="bankName" />
          <el-table-column label="单选题" prop="singleChoiceCount" />
          <el-table-column label="多选题" prop="multipleChoiceCount" />
          <el-table-column label="填空题" prop="fillBlankCount" />
          <el-table-column label="判断题" prop="judgeCount" />
          <el-table-column label="问答题" prop="answerCount" />
          <el-table-column label="题帽题" prop="caseCount" />
          <el-table-column label="操作">
            <template #default="scope">
              <el-button type="danger" @click="removeBankFromCompose(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-divider />
        <div style="margin-bottom: 24px;">
          <el-row gutter="16" align="middle" style="margin-bottom: 16px;">
            <el-col :span="24">
              <span style="color: #f56c6c; margin-right: 4px;">*</span>
              单选题(共{{ totalSingleChoice }}题)：
              <el-input-number v-model="composeDialog.settings.single.count" :min="0" :max="totalSingleChoice" style="width: 120px; margin: 0 8px;" /> 题
              <el-input-number v-model="composeDialog.settings.single.score" :min="0" style="width: 120px; margin: 0 8px;" /> 分/题
              <span style="float: right; margin-right: 32px;">共{{ (composeDialog.settings.single.count || 0) * (composeDialog.settings.single.score || 0) }}分</span>
            </el-col>
          </el-row>
          <el-row gutter="16" align="middle" style="margin-bottom: 16px;">
            <el-col :span="24">
              <span style="color: #f56c6c; margin-right: 4px;">*</span>
              多选题(共{{ totalMultiChoice }}题)：
              <el-input-number v-model="composeDialog.settings.multi.count" :min="0" :max="totalMultiChoice" style="width: 120px; margin: 0 8px;" /> 题
              <el-input-number v-model="composeDialog.settings.multi.score" :min="0" style="width: 120px; margin: 0 8px;" /> 分/题
              <span style="color: #f56c6c; margin-left: 16px;">*漏选得：</span>
              <el-input-number v-model="composeDialog.settings.multi.partialScore" :min="0" style="width: 120px; margin: 0 8px;" /> 分
              <span style="float: right; margin-right: 32px;">共{{ (composeDialog.settings.multi.count || 0) * (composeDialog.settings.multi.score || 0) }}分</span>
            </el-col>
          </el-row>
          <el-row gutter="16" align="middle" style="margin-bottom: 16px;">
            <el-col :span="24">
              <span style="color: #f56c6c; margin-right: 4px;">*</span>
              填空题(共{{ totalBlank }}题)：
              <el-input-number v-model="composeDialog.settings.blank.count" :min="0" :max="totalBlank" style="width: 120px; margin: 0 8px;" /> 题
              <el-input-number v-model="composeDialog.settings.blank.score" :min="0" style="width: 120px; margin: 0 8px;" /> 分/题
              <span style="float: right; margin-right: 32px;">共{{ (composeDialog.settings.blank.count || 0) * (composeDialog.settings.blank.score || 0) }}分</span>
            </el-col>
          </el-row>
          <el-row gutter="16" align="middle" style="margin-bottom: 16px;">
            <el-col :span="24">
              <span style="color: #f56c6c; margin-right: 4px;">*</span>
              判断题(共{{ totalJudge }}题)：
              <el-input-number v-model="composeDialog.settings.judge.count" :min="0" :max="totalJudge" style="width: 120px; margin: 0 8px;" /> 题
              <el-input-number v-model="composeDialog.settings.judge.score" :min="0" style="width: 120px; margin: 0 8px;" /> 分/题
              <span style="float: right; margin-right: 32px;">共{{ (composeDialog.settings.judge.count || 0) * (composeDialog.settings.judge.score || 0) }}分</span>
            </el-col>
          </el-row>
          <el-row gutter="16" align="middle" style="margin-bottom: 16px;">
            <el-col :span="24">
              <span style="color: #f56c6c; margin-right: 4px;">*</span>
              问答题(共{{ totalAnswer }}题)：
              <el-input-number v-model="composeDialog.settings.answer.count" :min="0" :max="totalAnswer" style="width: 120px; margin: 0 8px;" /> 题
              <el-input-number v-model="composeDialog.settings.answer.score" :min="0" style="width: 120px; margin: 0 8px;" /> 分/题
              <span style="float: right; margin-right: 32px;">共{{ (composeDialog.settings.answer.count || 0) * (composeDialog.settings.answer.score || 0) }}分</span>
            </el-col>
          </el-row>
        </div>
        <el-row gutter="16" align="middle" style="margin-bottom: 16px;">
          <el-col :span="6">
            <span style="color: #f56c6c; margin-right: 4px;">*</span>及格分：
            <el-input-number v-model="composeDialog.passScore" :min="0" style="width: 100px; margin: 0 8px;" /> 分
          </el-col>
          <el-col :span="6" style="text-align: right;">
            总分：{{ totalScore }}
          </el-col>
        </el-row>
        <el-button type="primary" @click="saveCompose">保存试卷</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="Paper" lang="ts">
import { listPaper, getPaper, delPaper, addPaper, updatePaper } from '@/api/question/paper';
import { PaperVO, PaperQuery, PaperForm } from '@/api/question/paper/types';
import { ref, computed, reactive, watch, nextTick } from 'vue';
import { listBank } from '@/api/question/bank';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { edu_type } = toRefs<any>(proxy?.useDict('edu_type'));

const paperList = ref<PaperVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const paperFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// 修正 composeDialog.settings 类型，multi 增加 partialScore
interface ComposeSetting {
  count: number;
  score: number;
  partialScore?: number;
}
interface ComposeSettings {
  single: ComposeSetting;
  multi: ComposeSetting & { partialScore: number };
  blank: ComposeSetting;
  judge: ComposeSetting;
  answer: ComposeSetting;
  case: ComposeSetting;
}

const composeDialog = reactive<{
  visible: boolean;
  banks: any[];
  settings: ComposeSettings;
  passScore: number;
}>({
  visible: false,
  banks: [],
  settings: {
    single: { count: 0, score: 0 },
    multi: { count: 0, score: 0, partialScore: 0 },
    blank: { count: 0, score: 0 },
    judge: { count: 0, score: 0 },
    answer: { count: 0, score: 0 },
    case: { count: 0, score: 0 }
  },
  passScore: 0
});

const showBankSelect = ref(false);
const bankSelectList = ref([]);
const selectedBanks = ref([]);
const bankSelectTable = ref();

// 保证form结构有type字段
const initFormData: PaperForm = {
  id: undefined,
  categoryId: undefined,
  combinationMode: 1,
  questionCount: undefined,
  totalScore: undefined,
  passScore: undefined,
}
// 1. 查询参数、表单字段、el-input、el-table-column、form.value赋值等全部name改为title
// 2. 试卷名称相关的prop、v-model、字段名全部同步
const data = reactive<PageData<PaperForm, PaperQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: undefined,
    params: {
    }
  },
  rules: {
    title: [
      { required: true, message: "试卷名称不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询试卷列表 */
const getList = async () => {
  loading.value = true;
  const res = await listPaper(queryParams.value);
  paperList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  paperFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: PaperVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加试卷";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: PaperVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getPaper(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改试卷";
}

/** 提交按钮 */
const submitForm = () => {
  paperFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updatePaper(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addPaper(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: PaperVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除试卷编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delPaper(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('question/paper/export', {
    ...queryParams.value
  }, `paper_${new Date().getTime()}.xlsx`)
}

function resetComposeSettings() {
  const s = composeDialog.settings;
  Object.assign(s.single, { count: 0, score: 0 });
  Object.assign(s.multi, { count: 0, score: 0, partialScore: 0 });
  Object.assign(s.blank, { count: 0, score: 0 });
  Object.assign(s.judge, { count: 0, score: 0 });
  Object.assign(s.answer, { count: 0, score: 0 });
  Object.assign(s.case, { count: 0, score: 0 });
}

async function handleCompose(row) {
  // 1. 彻底重置组卷弹窗内容（不替换settings对象，使用resetComposeSettings）
  composeDialog.banks = [];
  composeDialog.passScore = 0;
  resetComposeSettings();

  // 2. 拉取试卷详情
  const res = await getPaper(row.id);
  Object.assign(form.value, res.data);

  // 3. 回显extra、题型设置、题库、及格分
  if (res.data.extra) {
    try {
      const extra = JSON.parse(res.data.extra);
      const rulesScore = extra.score;
      if (rulesScore) {
        // 只更新属性，不替换对象引用
        const typeMap = { 1: 'single', 2: 'multi', 3: 'blank', 4: 'judge', 5: 'answer' };
        Object.entries(typeMap).forEach(([typeNum, typeKey]) => {
          const s = rulesScore?.[typeNum] || {};
          Object.assign((composeDialog.settings as any)[typeKey], {
            count: Number(s.number ?? 0),
            score: Number(s.score ?? 0)
          });
          if (typeKey === 'multi') {
            (composeDialog.settings as any)[typeKey].partialScore = Number(s.missed_score ?? 0);
          }
        });
      } else {
        resetComposeSettings();
      }
      if (extra.bank_ids?.length) {
        const bankIdSet = [...new Set(extra.bank_ids)];
        // 优先用缓存
        let allBanks = bankSelectList.value && bankSelectList.value.length ? bankSelectList.value : (await listBank()).rows;
        bankSelectList.value = allBanks;
        composeDialog.banks = allBanks
          .filter(b => bankIdSet.includes(b.id))
          .map(b => ({
            id: b.id,
            bankName: b.bankName,
            singleChoiceCount: b.singleChoiceCount || 0,
            multipleChoiceCount: b.multipleChoiceCount || 0,
            fillBlankCount: b.fillBlankCount || 0,
            judgeCount: b.judgeCount || 0,
            answerCount: b.answerCount || 0,
            caseCount: b.caseCount || 0
          }));
      } else {
        composeDialog.banks = [];
      }
    } catch (e) {
      composeDialog.banks = [];
      resetComposeSettings();
    }
  } else {
    // 没有extra，直接重置
    resetComposeSettings();
    composeDialog.banks = [];
  }
  // 4. 自动计算总题数
  let questionCount = 0;
  Object.values(composeDialog.settings).forEach(setting => {
    questionCount += (setting as any).count || 0;
  });
  form.value.questionCount = questionCount;
  // 5. 回显及格分
  composeDialog.passScore = form.value.passScore;
  // 6. 打开弹窗（必须放在所有异步和赋值操作之后）
  composeDialog.visible = true;
}

function syncSelectedBanks() {
  const selectedIds = composeDialog.banks.map(b => String(b.id));
  nextTick(() => {
    bankSelectTable.value?.clearSelection();
    bankSelectList.value.forEach(row => {
      if (selectedIds.includes(String(row.id))) {
        bankSelectTable.value?.toggleRowSelection(row, true);
      }
    });
  });
}

function addBankToCompose() {
  showBankSelect.value = true;
  listBank().then(res => {
    bankSelectList.value = res.rows;
    nextTick(() => {
      syncSelectedBanks();
    });
  });
}

function handleBankSelectChange(selection) {
  selectedBanks.value = selection;
}

function addSelectedBanks() {
  composeDialog.banks = selectedBanks.value.map(bank => ({
    id: bank.id,
    bankName: bank.bankName,
    singleChoiceCount: bank.singleChoiceCount || 0,
    multipleChoiceCount: bank.multipleChoiceCount || 0,
    fillBlankCount: bank.fillBlankCount || 0,
    judgeCount: bank.judgeCount || 0,
    answerCount: bank.answerCount || 0,
    caseCount: bank.caseCount || 0,
    settings: {
      single: { count: 0, score: 0 },
      multi: { count: 0, score: 0 },
      blank: { count: 0, score: 0 },
      judge: { count: 0, score: 0 },
      answer: { count: 0, score: 0 },
      case: { count: 0, score: 0 }
    }
  }));
  showBankSelect.value = false;
}

function removeBankFromCompose(index) {
  composeDialog.banks.splice(index, 1);
  syncSelectedBanks();
}

const totalSingleChoice = computed(() =>
  composeDialog.banks.reduce((sum, bank) => sum + (bank.singleChoiceCount || 0), 0)
);
const totalMultiChoice = computed(() =>
  composeDialog.banks.reduce((sum, bank) => sum + (bank.multipleChoiceCount || 0), 0)
);
const totalBlank = computed(() =>
  composeDialog.banks.reduce((sum, bank) => sum + (bank.fillBlankCount || 0), 0)
);
const totalJudge = computed(() =>
  composeDialog.banks.reduce((sum, bank) => sum + (bank.judgeCount || 0), 0)
);
const totalAnswer = computed(() =>
  composeDialog.banks.reduce((sum, bank) => sum + (bank.answerCount || 0), 0)
);
const totalCase = computed(() =>
  composeDialog.banks.reduce((sum, bank) => sum + (bank.caseCount || 0), 0)
);

const totalScore = computed(() => {
  const s = composeDialog.settings;
  return (
    (s.single.count || 0) * (s.single.score || 0) +
    (s.multi.count || 0) * (s.multi.score || 0) +
    (s.blank.count || 0) * (s.blank.score || 0) +
    (s.judge.count || 0) * (s.judge.score || 0) +
    (s.answer.count || 0) * (s.answer.score || 0) +
    (s.case.count || 0) * (s.case.score || 0)
  );
});

function saveCompose() {
  const bankIds = [];
  const typeMap = { single: 1, multi: 2, blank: 3, judge: 4, answer: 5 };
  const banks = composeDialog.banks;
  let bankIdx = 0;
  // bank_ids 按抽题数量循环分配所有题库 id
  Object.keys(typeMap).forEach(typeKey => {
    const count = composeDialog.settings[typeKey].count || 0;
    for (let i = 0; i < count; i++) {
      if (banks.length > 0) {
        bankIds.push(banks[bankIdx % banks.length].id);
        bankIdx++;
      }
    }
  });
  // score 结构
  const score = {};
  let questionCount = 0;
  Object.entries(typeMap).forEach(([typeKey, typeNum]) => {
    const setting = composeDialog.settings[typeKey];
    score[typeNum] = {
      number: setting.count || 0,
      score: setting.score || 0
    };
    if (typeKey === 'multi') {
      score[typeNum].missed_score = setting.partialScore || 0;
    }
    questionCount += setting.count || 0;
  });
  // extra 精简结构
  const extra = JSON.stringify({
    score,
    bank_ids: bankIds
  });
  form.value.extra = extra;
  form.value.score = totalScore.value;
  form.value.questionCount = questionCount;
  form.value.passScore = composeDialog.passScore;
  form.value.combinationMode = 2; // 随机组卷
  if (form.value.id) {
    updatePaper(form.value).then(() => {
      proxy?.$modal.msgSuccess("操作成功");
      composeDialog.visible = false;
      getList();
    });
  } else {
    addPaper(form.value).then(() => {
      proxy?.$modal.msgSuccess("操作成功");
      composeDialog.visible = false;
      getList();
    });
  }
}

/**
 * 获取某试卷某题型的数量
 * @param row 当前试卷行
 * @param typeNum 题型编号 1-5
 */
function getTypeCount(row: any, typeNum: number): number {
  if (!row.extra) return 0;
  try {
    const extra = JSON.parse(row.extra);
    const rules = extra.d?.random_rules;
    if (rules?.score && rules.score[typeNum] && typeof rules.score[typeNum].number !== 'undefined') {
      return Number(rules.score[typeNum].number);
    }
  } catch (e) {}
  return 0;
}

// 新增方法：获取抽题总数
function getTotalNumber(row: any): number {
  if (!row.extra) return 0;
  try {
    const extra = JSON.parse(row.extra);
    if (extra.score) {
      return Object.values(extra.score).reduce((sum: number, s: any) => sum + (Number(s.number) || 0), 0);
    }
  } catch (e) {}
  return 0;
}

function autoSelectBanks() {
  if (!showBankSelect.value || !bankSelectList.value.length) return;
  let bankIds: (string|number)[] = [];
  try {
    if (form.value.extra) {
      const extra = JSON.parse(form.value.extra);
      if (Array.isArray(extra.bank_ids)) {
        bankIds = extra.bank_ids;
      }
    }
  } catch {}
  nextTick(() => {
    const selectedIds = bankIds.map(String);
    bankSelectList.value.forEach(row => {
      if (selectedIds.includes(String(row.id))) {
        bankSelectTable.value?.toggleRowSelection(row, true);
      }
    });
  });
}
watch([showBankSelect, () => bankSelectList.value], autoSelectBanks, { deep: true });

onMounted(() => {
  getList();
});
</script>
