<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[7px]" >
        <!-- <el-card shadow="hover" class="h-[60px]">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" height="30px">
            <el-form-item label="用户组" prop="groupName" >
              <el-input v-model="queryParams.groupName" placeholder="请输入用户组名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card> -->
      </div>
    </transition>

    <el-card shadow="never" >
      <template #header >
        <el-row :gutter="10" class="mb8" style="height: 30px;">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['student:group:add']">新增用户组</el-button>
          </el-col>
          <!-- <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['student:group:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['student:group:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['student:group:export']">导出</el-button>
          </el-col> -->
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" height="30px" style="display: flex; justify-content: flex-end; margin-left: auto;">
            <el-form-item label="用户组" prop="groupName" >
              <el-input v-model="queryParams.groupName" placeholder="请输入用户组名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
          <!-- <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar> -->
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="groupList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!-- <el-table-column label="主键ID" align="center" prop="id" v-if="true" /> -->
        <el-table-column label="用户组名称" align="center" prop="groupName">
          <template #default="scope">
            <el-link type="primary" @click="handleShowGroupRel(scope.row.id)">{{ scope.row.groupName }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="创建人" align="center" prop="createByName" />
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['student:group:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['student:group:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改用户组对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="groupFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户组" prop="groupName">
          <el-input v-model="form.groupName" placeholder="请输入用户组名称" />
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

<script setup name="Group" lang="ts">
import { listGroup, getGroup, delGroup, addGroup, updateGroup } from '@/api/student/group';
import { GroupVO, GroupQuery, GroupForm } from '@/api/student/group/types';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { listUser } from '@/api/system/user';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const groupList = ref<GroupVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const groupFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const router = useRouter();

const userMap = ref<Record<string, string>>({});

const getAllUsers = async () => {
  const res = await listUser({ pageNum: 1, pageSize: 9999 });
  (res.rows || []).forEach(u => {
    userMap.value[u.userId] = u.nickName || u.userName;
  });
};

const initFormData: GroupForm = {
  id: undefined,
  groupName: undefined,
}
const data = reactive<PageData<GroupForm, GroupQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    groupName: undefined,
    params: {
    }
  },
  rules: {
    groupName: [
      { required: true, message: "用户组名称不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询用户组列表 */
const getList = async () => {
  loading.value = true;
  const res = await listGroup(queryParams.value);
  groupList.value = (res.rows || []).map(item => ({
    ...item,
    createByName: userMap.value[item.createBy] || item.createBy
  }));
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
  groupFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: GroupVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加用户组";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: GroupVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getGroup(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改用户组";
}

/** 提交按钮 */
const submitForm = () => {
  groupFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateGroup(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addGroup(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: GroupVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除用户组编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delGroup(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('student/group/export', {
    ...queryParams.value
  }, `group_${new Date().getTime()}.xlsx`)
}

const handleShowGroupRel = (groupId) => {
  router.push({ path: '/student/groupRel', query: { groupId } });
};

onMounted(async () => {
  await getAllUsers();
  await getList();
});
</script>
