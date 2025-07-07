<template>
  <div class="p-2">
    <el-row :gutter="20">
      <!-- 左侧部门列表 -->
      <el-col :span="6">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>部门列表</span>
            </div>
          </template>
          <el-tree
            ref="deptTreeRef"
            :data="deptTreeData"
            :props="{ label: 'deptName', children: 'children' }"
            node-key="deptId"
            :default-expand-all="true"
            :highlight-current="true"
            @node-click="handleDeptSelect"
            :default-expanded-keys="['all']"
          >
            <template #default="{ node, data }">
              <span class="custom-tree-node">
                <span>{{ node.label }}</span>
                <span class="student-count" v-if="data.studentCount">({{ data.studentCount }})</span>
              </span>
            </template>
          </el-tree>
        </el-card>
      </el-col>

      <!-- 右侧学生信息 -->
      <el-col :span="18">
        <el-card shadow="never">
          <template #header>
            <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
              <div v-show="showSearch" class="mb-[10px]">
                <el-form ref="queryFormRef" :model="queryParams" :inline="true">
                  <el-form-item label="学生姓名" prop="name">
                    <el-input v-model="queryParams.name" placeholder="请输入学生姓名" clearable @keyup.enter="handleQuery" />
                  </el-form-item>
                  <el-form-item label="登录账号" prop="username">
                    <el-input v-model="queryParams.username" placeholder="请输入登录账号" clearable @keyup.enter="handleQuery" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                    <el-button icon="Refresh" @click="resetQuery">重置</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </transition>
            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['student:studentInfo:add']">新增</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['student:studentInfo:edit']">修改</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['student:studentInfo:remove']">删除</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['student:studentInfo:export']">导出</el-button>
              </el-col>
              <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
            </el-row>
          </template>

          <el-table 
            v-loading="loading" 
            border 
            :data="studentInfoList" 
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="主键ID" align="center" prop="id" v-if="false" />
            <el-table-column label="头像URL" align="center" prop="avatarUrl" width="100">
              <template #default="scope">
                <image-preview :src="scope.row.avatarUrl" :width="50" :height="50"/>
              </template>
            </el-table-column>
            <el-table-column label="学生姓名" align="center" prop="name" />
            <el-table-column label="登录账号" align="center" prop="username" />
            <el-table-column label="密码" align="center" prop="password" v-if="false" />
            <el-table-column label="部门" align="center" prop="deptName" />
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
              <template #default="scope">
                <el-tooltip content="修改" placement="top">
                  <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['student:studentInfo:edit']"></el-button>
                </el-tooltip>
                <el-tooltip content="删除" placement="top">
                  <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['student:studentInfo:remove']"></el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>

          <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
        </el-card>
      </el-col>
    </el-row>
    <!-- 添加或修改学生信息对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="studentInfoFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="头像URL" prop="avatar">
          <image-upload v-model="form.avatar"/>
        </el-form-item>
        <el-form-item label="学生姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入学生姓名" />
        </el-form-item>
        <el-form-item label="部门" prop="deptId">
          <el-tree-select
            v-model="form.deptId"
            :data="deptOptions"
            :props="{ value: 'deptId', label: 'deptName', children: 'children' }"
            value-key="deptId"
            placeholder="请选择部门"
            check-strictly
            clearable
          />
        </el-form-item>
        <el-form-item label="登录账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入登录账号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" placeholder="请输入密码" />
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

<script setup name="StudentInfo" lang="ts">
import { listStudentInfo, getStudentInfo, delStudentInfo, addStudentInfo, updateStudentInfo } from '@/api/student/studentInfo';
import { StudentInfoVO, StudentInfoQuery, StudentInfoForm } from '@/api/student/studentInfo/types';
import { listDept } from '@/api/student/dept';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const studentInfoList = ref<StudentInfoVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const selectedDeptId = ref<string | number>('');
const deptTreeData = ref<any[]>([]);

const queryFormRef = ref<ElFormInstance>();
const studentInfoFormRef = ref<ElFormInstance>();
const deptTreeRef = ref<ElTreeInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const deptOptions = ref<any[]>([]);
const deptMap = ref<Record<string, string>>({});
const allStudents = ref<StudentInfoVO[]>([]);

function handleTree(data: any[], id: string, parentId: string, children: string = 'children') {
  const result: any[] = [];
  const map = new Map();
  data.forEach(item => map.set(item[id], { ...item, [children]: [] }));
  data.forEach(item => {
    const parent = map.get(item[parentId]);
    if (parent) {
      parent[children].push(map.get(item[id]));
    } else {
      result.push(map.get(item[id]));
    }
  });
  return result;
}

const getDeptOptions = async () => {
  const res = await listDept();
  deptOptions.value = handleTree(res.data, 'deptId', 'parentId');
};

const getDeptMap = async () => {
  const res = await listDept();
  const flat = (arr, result = []) => {
    arr.forEach(item => {
      result.push(item);
      if (item.children && item.children.length) flat(item.children, result);
    });
    return result;
  };
  const allDepts = flat(res.data || []);
  deptMap.value = {};
  allDepts.forEach(d => {
    deptMap.value[d.deptId] = d.deptName;
  });
};

const initFormData: StudentInfoForm = {
  id: undefined,
  avatar: undefined,
  name: undefined,
  username: undefined,
  password: undefined,
  deptId: undefined,
}
const data = reactive<PageData<StudentInfoForm, StudentInfoQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    username: undefined,
    deptId: undefined,
    params: {
    }
  },
  rules: {
    name: [
      { required: true, message: "学生姓名不能为空", trigger: "blur" }
    ],
    username: [
      { required: true, message: "登录账号不能为空", trigger: "blur" }
    ],
    password: [
      { required: true, message: "密码不能为空", trigger: "blur" }
    ],
    deptId: [
      { required: true, message: "部门不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询学生信息列表 */
const getList = async () => {
  loading.value = true;
  console.log('发送查询请求，参数:', queryParams.value);
  const res = await listStudentInfo(queryParams.value);
  console.log('查询结果:', res);
  studentInfoList.value = res.rows;
  total.value = res.total;
  
  // 为每个学生添加部门名称
  studentInfoList.value.forEach(item => {
    (item as any).deptName = deptMap.value[item.deptId] || '';
  });
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
  studentInfoFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: StudentInfoVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 查询学生信息列表（仅初始化时调用一次） */
const getAllStudents = async () => {
  loading.value = true;
  const res = await listStudentInfo({ pageNum: 1, pageSize: 9999 });
  allStudents.value = res.rows;
  // 为每个学生添加部门名称
  allStudents.value.forEach(item => {
    (item as any).deptName = deptMap.value[item.deptId] || '';
  });
  loading.value = false;
}

/** 递归获取所有子部门ID（包含自身） */
function getAllDeptIds(tree, targetId) {
  let result = [];
  function dfs(nodes) {
    for (const node of nodes) {
      if (node.deptId === targetId) {
        collectIds(node);
        break;
      } else if (node.children && node.children.length) {
        dfs(node.children);
      }
    }
  }
  function collectIds(node) {
    result.push(node.deptId);
    if (node.children && node.children.length) {
      node.children.forEach(collectIds);
    }
  }
  dfs(deptTreeData.value);
  return result;
}

/** 部门选择处理（前端筛选） */
const handleDeptSelect = (data) => {
  selectedDeptId.value = data.deptId;
  if (data.deptId === 'all') {
    studentInfoList.value = allStudents.value;
  } else {
    const deptIds = getAllDeptIds(deptTreeData.value, data.deptId);
    studentInfoList.value = allStudents.value.filter(item => deptIds.includes(item.deptId));
  }
}

/** 构建部门树数据 */
const buildDeptTreeData = async () => {
  const res = await listDept();
  const deptTree = handleTree(res.data, 'deptId', 'parentId');

  // 获取所有学生数据来计算每个部门的学生数量
  const allStudentsRes = await listStudentInfo({ pageNum: 1, pageSize: 9999 });
  const allStudentsArr = allStudentsRes.rows;
  const deptStudentCount: Record<string, number> = {};

  // 先统计每个部门自身的学生数量
  allStudentsArr.forEach(student => {
    const deptId = student.deptId;
    deptStudentCount[deptId] = (deptStudentCount[deptId] || 0) + 1;
  });

  // 递归统计每个部门及其所有子部门的学生总数
  function sumStudentCount(node) {
    let sum = deptStudentCount[node.deptId] || 0;
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        sum += sumStudentCount(child);
      });
    }
    node.studentCount = sum;
    return sum;
  }
  deptTree.forEach(sumStudentCount);

  // 添加"全部"选项
  const allOption = {
    deptId: 'all',
    deptName: '全部学生',
    studentCount: allStudentsArr.length,
    children: []
  };

  deptTreeData.value = [allOption, ...deptTree];
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加学生信息";
  getDeptOptions();
}

/** 修改按钮操作 */
const handleUpdate = async (row?: StudentInfoVO) => {
  reset();
  await getDeptOptions();
  const _id = row?.id || ids.value[0]
  const res = await getStudentInfo(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改学生信息";
}

/** 提交按钮 */
const submitForm = () => {
  studentInfoFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateStudentInfo(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addStudentInfo(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: StudentInfoVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除学生信息编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delStudentInfo(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('student/studentInfo/export', {
    ...queryParams.value
  }, `studentInfo_${new Date().getTime()}.xlsx`)
}

onMounted(async () => {
  await getDeptMap();
  await buildDeptTreeData();
  await getAllStudents();
  // 默认选中"全部"选项
  selectedDeptId.value = 'all';
  studentInfoList.value = allStudents.value;
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.student-count {
  color: #909399;
  font-size: 12px;
  margin-left: 8px;
}
</style>
