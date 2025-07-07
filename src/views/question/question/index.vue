<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
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
        <el-table-column label="题目ID" align="center" prop="id" v-if="true" />
        <el-table-column label="题目内容" align="center" prop="questionContent" />
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
        <el-table-column label="正确答案" align="center" prop="correctAnswer" />
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
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="questionFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="题目内容">
          <editor v-model="form.questionContent" :min-height="192"/>
        </el-form-item>
        <el-form-item label="题型" prop="questionType">
          <el-select v-model="form.questionType" placeholder="请选择题型">
            <el-option
                v-for="dict in question_type"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="难度" prop="difficulty">
          <el-select v-model="form.difficulty" placeholder="请选择难度">
            <el-option
                v-for="dict in question_difficulty"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="正确答案" prop="correctAnswer">
          <el-input v-model="form.correctAnswer" placeholder="请输入正确答案" />
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

const initFormData: QuestionForm = {
  id: undefined,
  questionContent: undefined,
  questionType: undefined,
  difficulty: undefined,
  correctAnswer: undefined,
}
const data = reactive<PageData<QuestionForm, QuestionQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    questionContent: undefined,
    params: {
    }
  },
  rules: {
    questionContent: [
      { required: true, message: "题目内容不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询题库列表 */
const getList = async () => {
  loading.value = true;
  const res = await listQuestion(queryParams.value);
  questionList.value = res.rows;
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
  questionFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: QuestionVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加题库";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: QuestionVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getQuestion(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改题库";
}

/** 提交按钮 */
const submitForm = () => {
  questionFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateQuestion(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addQuestion(form.value).finally(() =>  buttonLoading.value = false);
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
    ...queryParams.value
  }, `question_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
