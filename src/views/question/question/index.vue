<template>
  <div class="p-2">
    <!-- 返回题库按钮 -->
    <el-row class="mb-2">
      <el-col>
        <el-button type="primary" icon="Back" @click="goBackToBank">返回题库</el-button>
      </el-col>
    </el-row>
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="题目">
              <el-input v-model="queryParams.questionContent" placeholder="请输入题目" clearable />
            </el-form-item>
            <el-form-item label="难度">
              <el-select v-model="queryParams.difficulty" placeholder="请选择难度" clearable>
                <el-option label="简单" :value="1" />
                <el-option label="中等" :value="2" />
                <el-option label="复杂" :value="3" />
              </el-select>
            </el-form-item>
            <el-form-item label="题型">
              <el-select v-model="queryParams.questionType" placeholder="请选择题型" clearable>
                <el-option label="单选题" :value="1" />
                <el-option label="多选题" :value="2" />
                <el-option label="填空题" :value="3" />
                <el-option label="判断题" :value="4" />
                <el-option label="问答题" :value="5" />
                <el-option label="题帽题" :value="6" />
              </el-select>
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['question:question:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['question:question:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['question:question:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['question:question:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="questionList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="题目ID" align="center" prop="id" v-if="false" />
        <el-table-column label="题目内容" align="center" prop="questionContent">
          <template #default="scope">
            {{ getStem(scope.row.questionContent) }}
          </template>
        </el-table-column>
        <el-table-column label="题型" align="center" prop="questionType">
          <template #default="scope">
            <dict-tag :options="question_type" :value="scope.row.questionType"/>
          </template>
        </el-table-column>
        <el-table-column label="难度" align="center" prop="difficulty">
          <template #default="scope">
            <dict-tag :options="question_difficulty" :value="scope.row.difficulty"/>
          </template>
        </el-table-column>
        <!-- <el-table-column label="正确答案" align="center" prop="correctAnswer" /> -->
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['question:question:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['question:question:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改题库对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="700px" append-to-body :before-close="cancel">
      <!-- 新增时可选题型，编辑时只读 -->
      <el-tabs v-if="!isEdit" v-model="activeType" @tab-click="onTabChange">
        <el-tab-pane label="单选题" name="single"></el-tab-pane>
        <el-tab-pane label="多选题" name="multi"></el-tab-pane>
        <el-tab-pane label="填空题" name="blank"></el-tab-pane>
        <el-tab-pane label="判断题" name="judge"></el-tab-pane>
        <el-tab-pane label="问答题" name="qa"></el-tab-pane>
      </el-tabs>
      <el-form ref="questionFormRef" :model="form" label-width="80px">
        <el-row>
          <el-col :span="12">
            <!-- 题型只读显示在左上角 -->
            <el-form-item label="题型">
              <el-input :value="questionTypeText(form.questionType)" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <!-- 难度可编辑下拉 -->
            <el-form-item label="难度" required>
              <el-select v-model="form.difficulty" placeholder="请选择难度">
                <el-option label="简单" :value="1" />
                <el-option label="中等" :value="2" />
                <el-option label="复杂" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 题目内容 -->
        <el-form-item label="题目" required>
          <el-input v-model="form.questionContent" placeholder="请输入题目内容" />
        </el-form-item>
        <!-- 选项输入框，仅单选/多选/判断题显示 -->
        <template v-if="[1,2,4].includes(form.questionType)">
          <el-form-item label="选项" required>
            <div v-for="(option, idx) in options" :key="idx" style="display:flex;align-items:center;margin-bottom:8px;">
              <el-input v-model="option.text" :placeholder="`选项${String.fromCharCode(65+idx)}`" style="flex:1;" />
              <el-button icon="Delete" @click="removeOption(idx)" v-if="options.length > 2" circle size="small" />
              <el-button icon="Plus" @click="addOption" v-if="idx === options.length-1" circle size="small" />
            </div>
          </el-form-item>
        </template>
        <!-- 正确答案，按题型渲染 -->
        <template v-if="form.questionType === 1">
          <!-- 单选题 -->
          <el-form-item label="正确答案" required>
            <el-radio-group v-model="form.correctAnswer">
              <el-radio v-for="(option, idx) in options" :key="idx" :label="String.fromCharCode(65+idx)">
                {{ String.fromCharCode(65+idx) }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </template>
        <template v-else-if="form.questionType === 2">
          <!-- 多选题 -->
          <el-form-item label="正确答案" required>
            <el-checkbox-group v-model="multiAnswer">
              <el-checkbox v-for="(option, idx) in options" :key="idx" :label="String.fromCharCode(65+idx)">
                {{ String.fromCharCode(65+idx) }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </template>
        <template v-else-if="form.questionType === 3">
          <!-- 填空题 -->
          <el-form-item label="正确答案" required>
            <div v-for="(ans, idx) in blankAnswers" :key="idx" style="display:flex;align-items:center;margin-bottom:8px;">
              <el-input v-model="blankAnswers[idx]" placeholder="请输入答案" style="flex:1;" />
              <el-button @click="removeBlank(idx)" v-if="blankAnswers.length>1" size="small">删除空</el-button>
              <el-button @click="addBlank" v-if="idx===blankAnswers.length-1" size="small">添加空</el-button>
            </div>
          </el-form-item>
        </template>
        <template v-else-if="form.questionType === 4">
          <!-- 判断题 -->
          <el-form-item label="正确答案" required>
            <el-radio-group v-model="form.correctAnswer">
              <el-radio label="A">是</el-radio>
              <el-radio label="B">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </template>
        <template v-else-if="form.questionType === 5">
          <!-- 问答题 -->
          <el-form-item label="正确答案" required>
            <el-input v-model="form.correctAnswer" type="textarea" placeholder="请输入答案内容" />
          </el-form-item>
        </template>
        <!-- 通用：解析 -->
        <el-form-item label="解析">
          <el-input v-model="form.analysis" type="textarea" placeholder="请输入解析内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Question" lang="ts">
import { listQuestion, getQuestion, delQuestion, addQuestion, updateQuestion } from '@/api/question/question';
import { QuestionVO, QuestionQuery, QuestionForm } from '@/api/question/question/types';
import { ref, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();
const router = useRouter();
const bankId = computed(() => route.query.bankId ? route.query.bankId : undefined);

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { question_type, question_difficulty } = toRefs<any>(proxy?.useDict('question_type', 'question_difficulty'));

const questionList = ref<QuestionVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const questionFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const typeMap = {
  single: 1,
  multi: 2,
  blank: 3,
  judge: 4,
  qa: 5
};
const activeType = ref('single');
const form = reactive({
  id: undefined,
  questionContent: '',
  questionType: typeMap.single,
  difficulty: 1,
  correctAnswer: '',
  analysis: '',
  bankId: bankId.value
});
// 单/多选题选项
const options = ref([
  { text: '' },
  { text: '' },
  { text: '' },
  { text: '' }
]);
function addOption() {
  options.value.push({ text: '' });
}
function removeOption(idx: number) {
  options.value.splice(idx, 1);
}
// 多选题答案
const multiAnswer = ref<string[]>([]);
watch(multiAnswer, (val) => {
  form.correctAnswer = val.join(',');
});
// 填空题答案
const blankAnswers = ref<string[]>(['']);
function addBlank() {
  blankAnswers.value.push('');
}
function removeBlank(idx: number) {
  if (blankAnswers.value.length > 1) blankAnswers.value.splice(idx, 1);
}
const blankMatchType = ref(1); // 1:固定 2:任意
watch(blankAnswers, (val) => {
  form.correctAnswer = val.join('|');
});
// Tab切换时同步题型和清空答案
function onTabChange(tab: any) {
  form.questionType = typeMap[tab.props.name];
  form.correctAnswer = '';
  form.analysis = '';
  if(tab.props.name==='single'||tab.props.name==='multi') {
    options.value = [ {text:''},{text:''},{text:''},{text:''} ];
    multiAnswer.value = [];
  }
  if(tab.props.name==='multi') {
    multiAnswer.value = [];
  }
  if(tab.props.name==='blank') {
    blankAnswers.value = [''];
    blankMatchType.value = 1;
  }
}

// 重新定义queryParams
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  questionContent: undefined,
  difficulty: undefined,
  questionType: undefined,
  bankId: bankId.value,
  params: {}
});

watch(() => route.query.bankId, (val) => {
  console.log('route.query.bankId 变化:', val, typeof val);
  queryParams.bankId = val;
  getList();
});

/** 查询题库列表 */
const getList = async () => {
  loading.value = true;
  queryParams.bankId = bankId.value; // 保证每次查询都带上 bankId
  console.log('请求参数 bankId:', queryParams.bankId, typeof queryParams.bankId);
  const res = await listQuestion(queryParams);
  questionList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 取消按钮 */
const cancel = () => {
  resetForm();
  dialog.visible = false;
}

/** 表单重置 */
function resetForm() {
  form.questionContent = '';
  form.difficulty = 1;
  form.options = [
    { text: '' },
    { text: '' },
    { text: '' },
    { text: '' }
  ];
  form.correctAnswer = '';
  form.analysis = '';
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: QuestionVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

// 解析题干和选项
function parseQuestionContent(content: string, type: number) {
  if ([1, 2, 4].includes(type)) {
    const lines = content.split('\n');
    let stem = '';
    const opts: {text: string}[] = [];
    for (let line of lines) {
      const match = line.match(/^([A-D])\.\s*(.*)$/);
      if (match) {
        opts.push({ text: match[2] });
      } else if (line.trim() !== '') {
        stem += (stem ? '\n' : '') + line;
      }
    }
    return { stem, opts };
  }
  return { stem: content, opts: [] };
}

function getStem(content: string) {
  if (!content) return '';
  const lines = content.split('\n');
  let stem = '';
  for (let line of lines) {
    if (!/^[A-D]\.\s*/.test(line.trim())) {
      stem += (stem ? '\n' : '') + line;
    } else {
      break;
    }
  }
  return stem;
}

const isEdit = ref(false);

function questionTypeText(type: number) {
  switch(type) {
    case 1: return '单选题';
    case 2: return '多选题';
    case 3: return '填空题';
    case 4: return '判断题';
    case 5: return '问答题';
    case 6: return '题帽题';
    default: return '';
  }
}

/** 新增按钮操作 */
const handleAdd = () => {
  console.log('handleAdd 时 bankId:', bankId.value, typeof bankId.value);
  resetForm();
  dialog.visible = true;
  dialog.title = "添加题库";
  isEdit.value = false;
  activeType.value = 'single';
  form.questionType = typeMap.single;
  form.bankId = bankId.value;
};

/** 修改按钮操作 */
const handleUpdate = async (row?: QuestionVO) => {
  resetForm();
  isEdit.value = true;
  const _id = row?.id || ids.value[0];
  const res = await getQuestion(_id);
  Object.assign(form, res.data);
  form.bankId = bankId.value;
  // 解析题干和选项
  const { stem, opts } = parseQuestionContent(form.questionContent, form.questionType);
  form.questionContent = stem;
  if ([1, 2, 4].includes(form.questionType)) {
    options.value = opts.length ? opts : [ {text:''},{text:''},{text:''},{text:''} ];
  }
  // 解析正确答案
  if(form.questionType === 2) {
    multiAnswer.value = form.correctAnswer ? form.correctAnswer.split(',') : [];
  } else if(form.questionType === 3) {
    blankAnswers.value = form.correctAnswer ? form.correctAnswer.split('|') : [''];
  }
  dialog.visible = true;
  dialog.title = "修改题库";
};

/** 提交按钮 */
const submitForm = () => {
  questionFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.bankId = bankId.value;
      // 组装选项到题干
      let content = form.questionContent;
      if ([1, 2, 4].includes(form.questionType)) {
        options.value.forEach((opt, idx) => {
          if (opt.text.trim() !== '') {
            content += `\n${String.fromCharCode(65+idx)}. ${opt.text}`;
          }
        });
      }
      form.questionContent = content;
      // 组装答案
      if(form.questionType === 2) {
        form.correctAnswer = multiAnswer.value.join(',');
      }
      if(form.questionType === 3) {
        form.correctAnswer = blankAnswers.value.join('|');
      }
      if (form.id) {
        await updateQuestion(form).finally(() =>  buttonLoading.value = false);
      } else {
        await addQuestion(form).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: QuestionVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除题库编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delQuestion(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('question/question/export', {
    ...queryParams
  }, `question_${new Date().getTime()}.xlsx`)
}

function goBackToBank() {
  console.log('返回题库');
  router.push('/question/bank');
}

onMounted(() => {
  console.log('页面加载时 bankId:', bankId.value, typeof bankId.value);
  getList();
});
</script>
