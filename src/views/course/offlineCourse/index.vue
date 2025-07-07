<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="课程名称" prop="courseName">
              <el-input v-model="queryParams.courseName" placeholder="请输入课程名称" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['course:offlineCourse:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['course:offlineCourse:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['course:offlineCourse:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['course:offlineCourse:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="offlineCourseList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="课程ID" align="center" prop="id" v-if="true" />
        <el-table-column label="课程名称" align="center" prop="courseName" />
        <el-table-column label="授课时间" align="center" prop="courseTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.courseTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="授课地点" align="center" prop="courseLocation" />
        <el-table-column label="指派学员" align="center" prop="studentCount" />
        <el-table-column label="签到人数" align="center" prop="attendanceCount" />
        <el-table-column label="讲师ID" align="center" prop="teacherId" />
        <el-table-column label="分类" align="center" prop="categoryId">
          <template #default="scope">
            <dict-tag :options="edu_type" :value="scope.row.categoryId"/>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['course:offlineCourse:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['course:offlineCourse:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改线下课程对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="offlineCourseFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="form.courseName" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="授课时间" prop="courseTime">
          <el-date-picker clearable
            v-model="form.courseTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择授课时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="授课地点" prop="courseLocation">
          <el-input v-model="form.courseLocation" placeholder="请输入授课地点" />
        </el-form-item>
        <el-form-item label="指派学员" prop="studentCount">
          <el-input v-model="form.studentCount" placeholder="请输入指派学员" />
        </el-form-item>
        <el-form-item label="签到人数" prop="attendanceCount">
          <el-input v-model="form.attendanceCount" placeholder="请输入签到人数" />
        </el-form-item>
        <el-form-item label="讲师ID" prop="teacherId">
          <el-input v-model="form.teacherId" placeholder="请输入讲师ID" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择分类">
            <el-option
                v-for="dict in edu_type"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
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

<script setup name="OfflineCourse" lang="ts">
import { listOfflineCourse, getOfflineCourse, delOfflineCourse, addOfflineCourse, updateOfflineCourse } from '@/api/course/offlineCourse';
import { OfflineCourseVO, OfflineCourseQuery, OfflineCourseForm } from '@/api/course/offlineCourse/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { edu_type } = toRefs<any>(proxy?.useDict('edu_type'));

const offlineCourseList = ref<OfflineCourseVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const offlineCourseFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: OfflineCourseForm = {
  id: undefined,
  courseName: undefined,
  courseTime: undefined,
  courseLocation: undefined,
  studentCount: undefined,
  attendanceCount: undefined,
  teacherId: undefined,
  categoryId: undefined
}
const data = reactive<PageData<OfflineCourseForm, OfflineCourseQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    courseName: undefined,
    params: {
    }
  },
  rules: {
    courseName: [
      { required: true, message: "课程名称不能为空", trigger: "blur" }
    ],
    courseTime: [
      { required: true, message: "授课时间不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询线下课程列表 */
const getList = async () => {
  loading.value = true;
  const res = await listOfflineCourse(queryParams.value);
  offlineCourseList.value = res.rows;
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
  offlineCourseFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: OfflineCourseVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加线下课程";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: OfflineCourseVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getOfflineCourse(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改线下课程";
}

/** 提交按钮 */
const submitForm = () => {
  offlineCourseFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateOfflineCourse(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addOfflineCourse(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: OfflineCourseVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除线下课程编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delOfflineCourse(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('course/offlineCourse/export', {
    ...queryParams.value
  }, `offlineCourse_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
