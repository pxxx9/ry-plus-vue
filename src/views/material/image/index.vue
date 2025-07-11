<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <!-- <el-form-item label="文件名" prop="fileName">
              <el-input v-model="queryParams.fileName" placeholder="请输入文件名" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <el-form-item label="原名" prop="originalName">
              <el-input v-model="queryParams.originalName" placeholder="请输入原名" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-upload
              :action="uploadFileUrl"
              :before-upload="handleBeforeUpload"
              :headers="headers"
              :data="{ type: 'image' }"
              :show-file-list="false"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/bmp,image/svg+xml"
              multiple
            >
              <el-button v-hasPermi="['system:oss:upload']" type="primary" plain icon="Upload">上传图片</el-button>
            </el-upload>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:oss:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">
              删除
            </el-button>
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>
      <div class="image-grid">
        <template v-for="item in ossList" :key="item.imageId">
          <div class="image-item">
            <el-checkbox
              class="image-checkbox"
              :value="item.imageId"
              v-model="ids"
              @change="handleSelectionChangeByCheckbox"
            ></el-checkbox>
            <ImagePreview
              v-if="checkFileSuffix(item.originalName)"
              :width="100"
              :height="100"
              :src="item.url || item.imageNameUrl"
              :preview-src-list="[item.url || item.imageNameUrl]"
            />
            <span v-else>{{ item.url || item.imageNameUrl }}</span>
            <div class="image-name">{{ item.originalName }}</div>
          </div>
        </template>
      </div>
    </el-card>
    <!-- 添加或修改OSS对象存储对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body>
      <el-form ref="ossFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="文件名">
          <fileUpload v-if="type === 0" v-model="form.file" />
          <imageUpload v-if="type === 1" v-model="form.file" />
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

<script setup name="Oss" lang="ts">
import { listImage, delImage } from '@/api/material/image';
import { globalHeaders } from '@/utils/request';
import { ImageVO } from '@/api/material/image/types';
// 1. 引入ImagePreview组件
import ImagePreview from '@/components/ImagePreview/index.vue';

const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const ossList = ref<ImageVO[]>([]);
const showTable = ref(true);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const type = ref(0);
const previewListResource = ref(true);
const dateRangeCreateTime = ref<[DateModelType, DateModelType]>(['', '']);
const uploadFileUrl = ref(import.meta.env.VITE_APP_BASE_API + '/material/image/upload');
const headers = ref(globalHeaders());

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// 默认排序
const defaultSort = ref({ prop: 'createTime', order: 'ascending' });

const ossFormRef = ref<ElFormInstance>();
const queryFormRef = ref<ElFormInstance>();

const initFormData = {
  file: undefined
};
const data = reactive<PageData<OssForm, OssQuery>>({
  form: { ...initFormData },
  // 查询参数
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    fileName: '',
    originalName: '',
    fileSuffix: '',
    createTime: '',
    service: '',
    orderByColumn: defaultSort.value.prop,
    isAsc: defaultSort.value.order
  },
  rules: {
    file: [{ required: true, message: '文件不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询OSS对象存储列表 */
const getList = async () => {
  loading.value = true;
  const response = await listImage(queryParams.value);
  ossList.value = response.rows;
  total.value = response.total;
  loading.value = false;
  showTable.value = true;
};
// 2. 添加checkFileSuffix方法
function checkFileSuffix(fileName: string) {
  const arr = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'];
  if (!fileName) return false;
  return arr.some(suffix => fileName.toLowerCase().endsWith(suffix));
}
/** 取消按钮 */
function cancel() {
  dialog.visible = false;
  reset();
}
/** 表单重置 */
function reset() {
  form.value = { ...initFormData };
  ossFormRef.value?.resetFields();
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}
/** 重置按钮操作 */
function resetQuery() {
  showTable.value = false;
  dateRangeCreateTime.value = ['', ''];
  queryFormRef.value?.resetFields();
  queryParams.value.orderByColumn = defaultSort.value.prop;
  queryParams.value.isAsc = defaultSort.value.order;
  handleQuery();
}
/** 选择条数  */
function handleSelectionChange(selection: ImageVO[]) {
  ids.value = selection.map((item) => item.imageId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** 选择条数  */
function handleSelectionChangeByCheckbox() {
  single.value = ids.value.length !== 1;
  multiple.value = !ids.value.length;
}
/** 设置列的排序为我们自定义的排序 */
const handleHeaderClass = ({ column }: any): any => {
  column.order = column.multiOrder;
};
/** 点击表头进行排序 */
const handleHeaderCLick = (column: any) => {
  if (column.sortable !== 'custom') {
    return;
  }
  switch (column.multiOrder) {
    case 'descending':
      column.multiOrder = 'ascending';
      break;
    case 'ascending':
      column.multiOrder = '';
      break;
    default:
      column.multiOrder = 'descending';
      break;
  }
  handleOrderChange(column.property, column.multiOrder);
};
const handleOrderChange = (prop: string, order: string) => {
  const orderByArr = queryParams.value.orderByColumn ? queryParams.value.orderByColumn.split(',') : [];
  const isAscArr = queryParams.value.isAsc ? queryParams.value.isAsc.split(',') : [];
  const propIndex = orderByArr.indexOf(prop);
  if (propIndex !== -1) {
    if (order) {
      //排序里已存在 只修改排序
      isAscArr[propIndex] = order;
    } else {
      //如果order为null 则删除排序字段和属性
      isAscArr.splice(propIndex, 1); //删除排序
      orderByArr.splice(propIndex, 1); //删除属性
    }
  } else {
    //排序里不存在则新增排序
    orderByArr.push(prop);
    isAscArr.push(order);
  }
  //合并排序
  queryParams.value.orderByColumn = orderByArr.join(',');
  queryParams.value.isAsc = isAscArr.join(',');
  getList();
};
/** 任务日志列表查询 */
const handleOssConfig = () => {
  router.push('/system/oss-config/index');
};
/** 文件按钮操作 */
const handleFile = () => {
  reset();
  type.value = 0;
  dialog.visible = true;
  dialog.title = '上传文件';
};
const imageTypes = [
  'image/png', 'image/jpeg', 'image/jpg', 'image/gif',
  'image/webp', 'image/bmp', 'image/svg+xml'
];

const handleBeforeUpload = (file: File) => {
  if (!imageTypes.includes(file.type)) {
    proxy?.$modal.msgError('请选择图片文件（png/jpg/jpeg/gif/webp/bmp/svg）');
    return false;
  }
  return true;
};
const handleUploadSuccess = () => {
  proxy?.$modal.msgSuccess('上传成功');
  getList();
};
const handleUploadError = () => {
  proxy?.$modal.msgError('上传失败');
};
/** 图片按钮操作 */
const handleImage = () => {
  // 触发文件选择
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = imageTypes.join(',');
  input.multiple = true;
  input.onchange = async (e: Event) => {
    const files = Array.from((e.target as HTMLInputElement).files ?? []);
    for (const file of files) {
      if (!imageTypes.includes(file.type)) {
        proxy?.$modal.msgError('请选择图片文件（png/jpg/jpeg/gif/webp/bmp/svg）');
        continue;
      }
      const formData = new FormData();
      formData.append('file', file as Blob);
      formData.append('type', 'image'); // 携带类型
      // 这里假设有uploadOssImage接口
      // await uploadOssImage(formData); // This line was removed as per the edit hint.
    }
    getList();
  };
  input.click();
};
/** 提交按钮 */
const submitForm = () => {
  dialog.visible = false;
  getList();
};
/** 下载按钮操作 */
const handleDownload = (row: ImageVO) => {
  window.open(import.meta.env.VITE_APP_BASE_API + '/material/image/download/' + row.imageId, '_blank');
};
/** 预览开关按钮  */
const handlePreviewListResource = async (preview: boolean) => {
  const text = preview ? '启用' : '停用';
  try {
    await proxy?.$modal.confirm('确认要"' + text + '""预览列表图片"配置吗?');
    await proxy?.updateConfigByKey('sys.oss.previewListResource', preview);
    await getList();
    proxy?.$modal.msgSuccess(text + '成功');
  } catch {
    return;
  }
};
/** 删除按钮操作 */
const handleDelete = async () => {
  if (!ids.value.length) {
    proxy?.$modal.msgWarning('请先选择要删除的图片');
    return;
  }
  await proxy?.$modal.confirm('是否确认删除选中的图片？');
  loading.value = true;
  await delImage(ids.value).finally(() => (loading.value = false));
  await getList();
  proxy?.$modal.msgSuccess('删除成功');
};

onMounted(() => {
  getList();
});
</script>

<style scoped>
.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}
.image-item {
  position: relative;
  width: 160px;
  text-align: center;
  cursor: pointer;
}
.image-checkbox {
  position: absolute;
  left: 4px;
  top: 4px;
  z-index: 2;
}
.image-thumb {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  background: #f5f5f5;
}
.image-name {
  margin-top: 8px;
  font-size: 14px;
  color: #333;
  word-break: break-all;
}
.image-delete-btn {
  margin-top: 6px;
  width: 80px;
}
</style>
