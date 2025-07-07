<template>
  <div class="p-2">
    <el-card shadow="never">
      <template #header>
        <div class="header-flex">
          <div class="group-title">
            <span v-if="currentGroupName">{{ currentGroupName }}</span>
            <span v-else>用户组</span>
          </div>
          <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
            <div v-show="showSearch" class="search-form-wrapper">
              <el-form ref="queryFormRef" :model="queryParams" :inline="true">
                <el-form-item label="学生">
                  <el-input
                    v-model="searchStudentName"
                    placeholder="请输入学生姓名"
                    clearable
                    @keyup.enter="handleQuery"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                  <el-button icon="Refresh" @click="resetQuery">重置</el-button>
                </el-form-item>
              </el-form>
            </div>
          </transition>
        </div>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="default" icon="ArrowLeft" @click="goBack">返回用户组</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['student:groupRel:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['student:groupRel:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['student:groupRel:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['student:groupRel:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="groupRelList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="学生" align="center" prop="studentName" />
        <el-table-column label="账号" align="center" prop="studentUsername" />
        <el-table-column label="所属部门" align="center" prop="studentDeptName" />
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['student:groupRel:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['student:groupRel:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改学生用户组关联对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="800px" append-to-body>
      <el-form ref="groupRelFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item v-if="form.id" label="用户组" prop="groupId">
          <el-select v-model="form.groupId" placeholder="请选择用户组" filterable clearable>
            <el-option v-for="item in groupOptions" :key="item.id" :label="item.groupName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!form.id" label="学生选择">
          <div class="student-selection-container">
            <el-input
              v-model="studentSearchKeyword"
              placeholder="搜索学生姓名"
              clearable
              @input="filterStudents"
              style="margin-bottom: 10px;"
            />
            <el-table
              :data="filteredStudentOptions"
              height="400"
              @selection-change="handleStudentSelectionChange"
              ref="studentTableRef"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column label="学生姓名" prop="name" />
              <el-table-column label="账号" prop="username" />
              <el-table-column label="所属部门" prop="deptName" />
            </el-table>
          </div>
        </el-form-item>
        <el-form-item v-if="form.id" label="学生" prop="studentId">
          <el-select v-model="form.studentId" placeholder="请选择学生" filterable clearable>
            <el-option v-for="item in studentOptions" :key="item.id" :label="item.name" :value="item.id" />
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

<script setup name="GroupRel" lang="ts">
import { listGroupRel, getGroupRel, delGroupRel, addGroupRel, updateGroupRel } from '@/api/student/groupRel';
import { listGroup } from '@/api/student/group';
import { listStudentInfo } from '@/api/student/studentInfo';
import { listDept } from '@/api/student/dept';
import { GroupRelVO, GroupRelQuery, GroupRelForm } from '@/api/student/groupRel/types';
import { ref, reactive, toRefs, onMounted, getCurrentInstance, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// 移除listUser导入，因为不再需要

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const groupRelList = ref<GroupRelVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const groupRelFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: GroupRelForm = {
  id: undefined,
  groupId: undefined,
  studentId: undefined,
  createTime: undefined,
}
const data = reactive<PageData<GroupRelForm, GroupRelQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    studentId: undefined,
    studentName: '',
    groupId: undefined,
    params: {}
  },
  rules: {}
});

const { queryParams, form, rules } = toRefs(data);

// 选项和映射表
const groupOptions = ref<any[]>([]);
const studentOptions = ref<any[]>([]);
const groupMap = ref<Record<string, string>>({});
const studentMap = ref<Record<string, any>>({});
const deptMap = ref<Record<string, string>>({});
const currentGroupName = ref('');
const studentSearchKeyword = ref('');
const filteredStudentOptions = ref<any[]>([]);
const selectedStudentIds = ref<Array<string | number>>([]);
const studentTableRef = ref();

const route = useRoute();
const router = useRouter();

const allGroupRelList = ref<GroupRelVO[]>([]);
const searchStudentName = ref('');

const getAllGroups = async () => {
  const res = await listGroup();
  groupOptions.value = res.rows || [];
  (res.rows || []).forEach(g => {
    groupMap.value[g.id] = g.groupName;
  });
  // 设置当前 groupName
  if (queryParams.value.groupId) {
    const group = (res.rows || []).find(g => g.id === queryParams.value.groupId);
    currentGroupName.value = group ? group.groupName : '';
  }
};

// 移除remoteStudentSearch函数，因为现在使用本地过滤

const getAllDepts = async () => {
  const res = await listDept();
  // 拍平成数组
  const flat = (arr, result = []) => {
    arr.forEach(item => {
      result.push(item);
      if (item.children && item.children.length) flat(item.children, result);
    });
    return result;
  };
  flat(res.data || []).forEach(d => {
    deptMap.value[d.deptId] = d.deptName;
  });
};

// 移除getAllUsers函数，因为不再需要userId映射

// 获取所有学生
const getAllStudents = async () => {
  const res = await listStudentInfo({ pageNum: 1, pageSize: 9999 });
  studentOptions.value = (res.rows || []).map(student => ({
    ...student,
    deptName: deptMap.value[student.deptId] || ''
  }));
  (res.rows || []).forEach(s => {
    studentMap.value[s.id] = s;
  });
  filteredStudentOptions.value = [...studentOptions.value];
};

// 过滤学生
const filterStudents = () => {
  if (!studentSearchKeyword.value) {
    filteredStudentOptions.value = [...studentOptions.value];
  } else {
    filteredStudentOptions.value = studentOptions.value.filter(student => 
      student.name?.includes(studentSearchKeyword.value) || 
      student.username?.includes(studentSearchKeyword.value)
    );
  }
};

// 处理学生选择变化
const handleStudentSelectionChange = (selection: any[]) => {
  selectedStudentIds.value = selection.map(item => item.id);
};

// 设置已选中的学生
const setSelectedStudents = async () => {
  if (!queryParams.value.groupId) return;
  
  // 获取当前组的所有学生关联
  const res = await listGroupRel({ groupId: queryParams.value.groupId, pageNum: 1, pageSize: 9999 });
  const currentGroupStudentIds = (res.rows || []).map(item => item.studentId);
  
  // 设置选中状态
  nextTick(() => {
    if (studentTableRef.value) {
      filteredStudentOptions.value.forEach(student => {
        if (currentGroupStudentIds.includes(student.id)) {
          studentTableRef.value.toggleRowSelection(student, true);
        }
      });
    }
  });
};

/** 查询学生用户组关联列表 */
const getList = async () => {
  loading.value = true;
  const res = await listGroupRel(queryParams.value);
  allGroupRelList.value = (res.rows || []).map(item => {
    const student = studentMap.value[item.studentId] || {};
    return {
      ...item,
      groupName: groupMap.value[item.groupId] || item.groupId,
      studentName: student.name || item.studentId,
      studentUsername: student.username || '',
      studentDeptName: deptMap.value[student.deptId] || ''
    }
  });
  groupRelList.value = allGroupRelList.value.slice();
  total.value = groupRelList.value.length;
  loading.value = false;
}

/** 取消按钮 */
const cancel = () => {
  reset();
  studentSearchKeyword.value = '';
  selectedStudentIds.value = [];
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  groupRelFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  if (searchStudentName.value) {
    groupRelList.value = allGroupRelList.value.filter(item => {
      const student = studentMap.value[item.studentId] || {};
      return student.name && student.name.includes(searchStudentName.value);
    });
    total.value = groupRelList.value.length;
  } else {
    groupRelList.value = allGroupRelList.value.slice();
    total.value = groupRelList.value.length;
  }
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  searchStudentName.value = '';
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: GroupRelVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = async () => {
  reset();
  // 添加时自动设置当前用户组ID
  form.value.groupId = queryParams.value.groupId;
  dialog.visible = true;
  dialog.title = "添加学生用户组关联";
  
  // 获取所有学生并设置已选中的学生
  await getAllStudents();
  await setSelectedStudents();
}

/** 修改按钮操作 */
const handleUpdate = async (row?: GroupRelVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getGroupRel(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改学生用户组关联";
}

/** 提交按钮 */
const submitForm = async () => {
  if (form.value.id) {
    // 编辑模式
    groupRelFormRef.value?.validate(async (valid: boolean) => {
      if (valid) {
        buttonLoading.value = true;
        await updateGroupRel(form.value).finally(() => buttonLoading.value = false);
        proxy?.$modal.msgSuccess("操作成功");
        dialog.visible = false;
        await getList();
      }
    });
  } else {
    // 添加模式 - 批量处理学生
    buttonLoading.value = true;
    try {
      // 获取当前组的所有学生关联
      const currentRes = await listGroupRel({ groupId: queryParams.value.groupId, pageNum: 1, pageSize: 9999 });
      const currentGroupStudentIds = (currentRes.rows || []).map(item => item.studentId);
      
      // 需要添加的学生ID
      const toAddStudentIds = selectedStudentIds.value.filter(id => !currentGroupStudentIds.includes(id));
      
      // 需要删除的学生ID
      const toDeleteStudentIds = currentGroupStudentIds.filter(id => !selectedStudentIds.value.includes(id));
      
      // 批量添加新学生
      for (const studentId of toAddStudentIds) {
        await addGroupRel({
          groupId: queryParams.value.groupId,
          studentId: studentId
        });
      }
      
      // 批量删除学生
      for (const studentId of toDeleteStudentIds) {
        const relationToDelete = (currentRes.rows || []).find(item => item.studentId === studentId);
        if (relationToDelete) {
          await delGroupRel(relationToDelete.id);
        }
      }
      
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    } catch (error) {
      proxy?.$modal.msgError("操作失败");
    } finally {
      buttonLoading.value = false;
    }
  }
}

/** 删除按钮操作 */
const handleDelete = async (row?: GroupRelVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除学生用户组关联编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delGroupRel(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('student/groupRel/export', {
    ...queryParams.value
  }, `groupRel_${new Date().getTime()}.xlsx`)
}

const goBack = () => {
  router.push('/student/group');
};

onMounted(async () => {
  // 从路由参数获取 groupId 并赋值
  if (route.query.groupId) {
    queryParams.value.groupId = Array.isArray(route.query.groupId) ? route.query.groupId[0] : route.query.groupId;
  }
  await getAllGroups();
  await getAllDepts();
  // 初始化时获取所有学生信息
  await getAllStudents();
  await getList();
});
</script>

<style scoped>
.header-flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.group-title {
  font-size: 18px;
  font-weight: bold;
}
.search-form-wrapper {
  /* 可根据需要微调宽度、间距 */
}
</style>
