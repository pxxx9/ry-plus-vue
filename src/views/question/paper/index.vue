<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="试卷名称" prop="name">
              <el-input v-model="queryParams.name" placeholder="请输入试卷名称" clearable @keyup.enter="handleQuery" />
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
        <el-table-column label="试卷ID" align="center" prop="id" v-if="true" />
        <el-table-column label="试卷分类" align="center" prop="categoryId">
          <template #default="scope">
            <dict-tag :options="edu_type" :value="scope.row.categoryId"/>
          </template>
        </el-table-column>
        <el-table-column label="试卷名称" align="center" prop="name" />
        <el-table-column label="试卷类型" align="center" prop="type" />
        <el-table-column label="试题数" align="center" prop="questionCount" />
        <el-table-column label="总分" align="center" prop="totalScore" />
        <el-table-column label="及格分" align="center" prop="passScore" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['question:paper:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['question:paper:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改试卷对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="paperFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="试卷分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择试卷分类ID">
            <el-option
                v-for="dict in edu_type"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="试卷名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入试卷名称" />
        </el-form-item>
        <el-form-item label="试题数" prop="questionCount">
          <el-input v-model="form.questionCount" placeholder="请输入试题数" />
        </el-form-item>
        <el-form-item label="总分" prop="totalScore">
          <el-input v-model="form.totalScore" placeholder="请输入总分" />
        </el-form-item>
        <el-form-item label="及格分" prop="passScore">
          <el-input v-model="form.passScore" placeholder="请输入及格分" />
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

<script setup name="Paper" lang="ts">
import { listPaper, getPaper, delPaper, addPaper, updatePaper } from '@/api/question/paper';
import { PaperVO, PaperQuery, PaperForm } from '@/api/question/paper/types';

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

const initFormData: PaperForm = {
  id: undefined,
  categoryId: undefined,
  name: undefined,
  type: undefined,
  questionCount: undefined,
  totalScore: undefined,
  passScore: undefined,
}
const data = reactive<PageData<PaperForm, PaperQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    params: {
    }
  },
  rules: {
    name: [
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

onMounted(() => {
  getList();
});
</script>
