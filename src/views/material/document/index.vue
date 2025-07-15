<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="文档名称" prop="documentName">
              <el-input v-model="queryParams.documentName" placeholder="请输入文档名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="分类" prop="categoryId">
              <el-tree-select
                v-model="queryParams.categoryId"
                :data="categoryOptions"
                :props="{ label: 'categoryName', value: 'categoryId', children: 'children' }"
                placeholder="请选择分类"
                check-strictly
                filterable
                clearable
                style="width: 180px"
              />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['material:document:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['material:document:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['material:document:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['material:document:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="documentList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="文档名称" align="center" prop="documentName" />
        <el-table-column label="文档大小" align="center" prop="size">
          <template #default="scope">
            <span v-if="scope.row.size">{{ formatSize(scope.row.size) }}</span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="分类" align="center" prop="categoryId">
          <template #default="scope">
            {{ categoryMap[scope.row.categoryId] || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="预览" placement="top">
              <el-button link type="primary" icon="View" @click="handlePreview(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="下载" placement="top">
              <el-button link type="primary" icon="Download" @click="handleDownload(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['material:document:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['material:document:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改文档对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="documentFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="文档名称" prop="documentName">
          <el-input v-model="form.documentName" placeholder="请输入文档名称" />
        </el-form-item>
        <el-form-item label="文档上传" prop="url">
          <el-upload
            class="doc-upload-drag"
            drag
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="uploadDocument"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
            style="width:100%"
            v-if="!form.docFile"
          >
            <div style="text-align:center;padding:15px 0;">
              <el-icon style="font-size:38px;margin-bottom:12px;"><folder /></el-icon>
              <div style="font-size:18px;">选择文档文件</div>
            </div>
          </el-upload>
          <div v-else style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border:1px solid #eee;border-radius:6px;">
            <span>{{ form.docFile.fileName }}</span>
            <el-button type="text" style="color: #ff4d4f" @click="removeDocFile">删除</el-button>
          </div>
        </el-form-item>
        <el-form-item label="文档大小" prop="size">
          <span v-if="form.size">{{ formatSize(form.size) }}</span>
          <span v-else>--</span>
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-tree-select
            v-model="form.categoryId"
            :data="categoryOptions"
            :props="{ label: 'categoryName', value: 'categoryId', children: 'children' }"
            placeholder="请选择分类"
            check-strictly
            filterable
            style="width: 100%"
          />
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

<script setup name="Document" lang="ts">
import { listDocument, getDocument, delDocument, addDocument, updateDocument } from '@/api/material/document';
import { DocumentVO, DocumentQuery, DocumentForm } from '@/api/material/document/types';
import { listCategory } from '@/api/category/category/index';
import { uploadFile, delOss } from '@/api/system/oss/index';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const documentList = ref<DocumentVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const documentFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

interface DocFileInfo {
  url: string;
  fileName: string;
  ossId: string;
}
interface DocumentFormEx extends DocumentForm {
  docFile?: DocFileInfo | null;
  ossId?: string | number;
}
const initFormData: DocumentFormEx = {
  id: undefined,
  documentName: undefined,
  url: undefined,
  size: undefined,
  categoryId: undefined,
  docFile: null
}
const data = reactive<PageData<DocumentFormEx, DocumentQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    documentName: undefined,
    categoryId: undefined,
    params: {}
  },
  rules: {
    documentName: [
      { required: true, message: "文档名称不能为空", trigger: "blur" }
    ],
  }
});
const { queryParams, form, rules } = toRefs(data);

const categoryOptions = ref<any[]>([]);
const categoryMap = ref<{ [key: string]: string }>({});
function listToTree(list, parentId = 0) {
  return list
    .filter(item => item.parentId === parentId)
    .map(item => ({
      ...item,
      children: listToTree(list, item.categoryId)
    }));
}
function buildCategoryMap(list: any[]) {
  const map: { [key: string]: string } = {};
  function traverse(arr: any[]) {
    arr.forEach(item => {
      map[item.categoryId] = item.categoryName;
      if (item.children && item.children.length) {
        traverse(item.children);
      }
    });
  }
  traverse(list);
  return map;
}
const getCategoryOptions = async () => {
  const res = await listCategory();
  let treeData = [];
  if (res.data && Array.isArray(res.data) && res.data.length > 0 && !res.data[0].children) {
    treeData = listToTree(res.data);
  } else {
    treeData = res.data || [];
  }
  categoryOptions.value = treeData;
  categoryMap.value = buildCategoryMap(treeData);
}

/** 查询文档列表 */
const getList = async () => {
  loading.value = true;
  const res = await listDocument(queryParams.value);
  documentList.value = res.rows;
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
  form.value = { ...initFormData };
  documentFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: DocumentVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = async () => {
  reset();
  await getCategoryOptions();
  dialog.visible = true;
  dialog.title = "添加文档";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: DocumentVO) => {
  reset();
  await getCategoryOptions();
  const _id = row?.id || ids.value[0]
  const res = await getDocument(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改文档";
}

/** 提交按钮 */
const submitForm = () => {
  documentFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      // 提交前移除id字段，只传ossId等
      const submitData = { ...form.value };
      delete submitData.id;
      if (form.value.id) {
        await updateDocument(submitData).finally(() =>  buttonLoading.value = false);
      } else {
        await addDocument(submitData).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: DocumentVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除文档编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delDocument(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('material/document/export', {
    ...queryParams.value
  }, `document_${new Date().getTime()}.xlsx`)
}

const beforeUpload = (file: File) => {
  // 可根据需要限制类型和大小
  return true;
};
const uploadDocument = async (option: any) => {
  buttonLoading.value = true;
  try {
    const formData = new FormData();
    form.value && formData.append('file', option.file);
    const res = await uploadFile(formData);
    form.value.docFile = res.data;
    form.value.url = res.data.url;
    form.value.size = option.file.size;
    form.value.ossId = res.data.ossId; // 只赋ossId，不赋id
    proxy?.$modal.msgSuccess('上传成功');
    option.onSuccess(res.data);
  } catch (e) {
    proxy?.$modal.msgError('上传失败');
    option.onError(e);
  } finally {
    buttonLoading.value = false;
  }
};
const removeDocFile = async () => {
  if (!form.value.docFile) return;
  await delOss(form.value.docFile.ossId);
  form.value.docFile = null;
  form.value.url = undefined;
  form.value.size = undefined;
  proxy?.$modal.msgSuccess('删除成功');
};

function formatSize(size: number) {
  if (size < 1024) return size + ' B';
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
  return (size / 1024 / 1024).toFixed(2) + ' MB';
}

function handlePreview(row: DocumentVO) {
  if (!row.url) {
    proxy?.$modal.msgWarning('无可预览的文档地址');
    return;
  }
  // 只对txt等文本文件特殊处理
  if (row.url.endsWith('.txt')) {
    fetch(row.url)
      .then(res => res.text())
      .then(text => {
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      });
  } else {
    window.open(row.url, '_blank');
  }
}

function handleDownload(row: DocumentVO) {
  if (row.ossId) {
    proxy?.$download.oss(row.ossId);
  } else if (row.id) {
    proxy?.$download.oss(row.id);
  } else {
    proxy?.$modal.msgWarning('无可下载的文档ID');
  }
}

onMounted(() => {
  getCategoryOptions();
  getList();
});
</script>
