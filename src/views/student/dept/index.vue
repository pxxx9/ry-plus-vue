<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="部门名称" prop="deptName">
              <el-input v-model="queryParams.deptName" placeholder="请输入部门名称" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd()" v-hasPermi="['student:dept:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="Sort" @click="handleToggleExpandAll">展开/折叠</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>
      <el-table
        ref="deptTableRef"
        v-loading="loading"
        :data="deptList"
        row-key="deptId"
        border
        :default-expand-all="isExpandAll"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column label="部门名称" align="center" prop="deptName" width="180" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['student:dept:edit']" />
            </el-tooltip>
            <el-tooltip content="新增" placement="top">
              <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['student:dept:add']" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['student:dept:remove']" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加或修改部门对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="deptFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="父部门" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="deptOptions"
            :props="{ value: 'deptId', label: 'deptName', children: 'children' }"
            value-key="deptId"
            placeholder="请选择父部门"
            check-strictly
          />
        </el-form-item>
        <el-form-item label="部门名称" prop="deptName">
          <el-input v-model="form.deptName" placeholder="请输入部门名称" />
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

<script setup name="Dept" lang="ts">
import { listDept, getDept, delDept, addDept, updateDept } from "@/api/student/dept";
import { DeptVO, DeptQuery, DeptForm } from '@/api/student/dept/types';

type DeptOption = {
  deptId: number;
  deptName: string;
  children?: DeptOption[];
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;;


const deptList = ref<DeptVO[]>([]);
const deptOptions = ref<DeptOption[]>([]);
const buttonLoading = ref(false);
const showSearch = ref(true);
const isExpandAll = ref(true);
const loading = ref(false);

const queryFormRef = ref<ElFormInstance>();
const deptFormRef = ref<ElFormInstance>();
const deptTableRef = ref<ElTableInstance>()

const dialog = reactive<DialogOption>({
    visible: false,
    title: ''
});


const initFormData: DeptForm = {
    deptId: undefined,
    parentId: undefined,
    ancestors: undefined,
    deptName: undefined,
    orderNum: undefined,
}

const data = reactive<PageData<DeptForm, DeptQuery>>({
  form: {...initFormData},
  queryParams: {
    deptName: undefined,
    params: {
    }
  },
  rules: {
    deptName: [
      { required: true, message: "部门名称不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询部门列表 */
const getList = async () => {
  loading.value = true;
  const res = await listDept(queryParams.value);
  const data = proxy?.handleTree<DeptVO>(res.data, "deptId", "parentId");
  if (data) {
    deptList.value = data;
    loading.value = false;
  }
}

/** 查询部门下拉树结构 */
const getTreeselect = async () => {
  const res = await listDept();
  deptOptions.value = [];
  const data: DeptOption = { deptId: 0, deptName: '顶级节点', children: [] };
  data.children = proxy?.handleTree<DeptOption>(res.data, "deptId", "parentId");
  deptOptions.value.push(data);
}

// 取消按钮
const cancel = () => {
  reset();
  dialog.visible = false;
}

// 表单重置
const reset = () => {
  form.value = {...initFormData}
  deptFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 新增按钮操作 */
const handleAdd = (row?: DeptVO) => {
  reset();
  getTreeselect();
  if (row != null && row.deptId) {
    form.value.parentId = row.deptId;
  } else {
    form.value.parentId = 0;
  }
  dialog.visible = true;
  dialog.title = "添加部门";
}

/** 展开/折叠操作 */
const handleToggleExpandAll = () => {
  isExpandAll.value = !isExpandAll.value;
  toggleExpandAll(deptList.value, isExpandAll.value)
}

/** 展开/折叠操作 */
const toggleExpandAll = (data: DeptVO[], status: boolean) => {
  data.forEach((item) => {
    deptTableRef.value?.toggleRowExpansion(item, status)
    if (item.children && item.children.length > 0) toggleExpandAll(item.children, status)
  })
}

/** 修改按钮操作 */
const handleUpdate = async (row: DeptVO) => {
  reset();
  await getTreeselect();
  if (row != null) {
    form.value.parentId = row.parentId;
  }
  const res = await getDept(row.deptId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改部门";
}

/** 提交按钮 */
const submitForm = () => {
  deptFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.deptId) {
        await updateDept(form.value).finally(() => buttonLoading.value = false);
      } else {
        await addDept(form.value).finally(() => buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row: DeptVO) => {
  await proxy?.$modal.confirm('是否确认删除部门编号为"' + row.deptId + '"的数据项？');
  loading.value = true;
  await delDept(row.deptId).finally(() => loading.value = false);
  await getList();
  proxy?.$modal.msgSuccess("删除成功");
}

onMounted(() => {
  getList();
});
</script>
