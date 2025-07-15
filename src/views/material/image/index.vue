<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="图片名称" prop="imageName">
              <el-input v-model="queryParams.imageName" placeholder="请输入图片名称" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['material:image:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['material:image:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['material:image:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['material:image:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="imageList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="主键ID" align="center" prop="id" v-if="false" />
        <el-table-column label="图片名称" align="center" prop="imageName" />
        <el-table-column label="图片展示" align="center" prop="url">
          <template #default="scope">
            <ImagePreview :src="scope.row.url" :width="100" :height="100" />
          </template>
        </el-table-column>
        <el-table-column label="分类" align="center" prop="categoryId">
          <template #default="scope">
            {{ categoryMap[scope.row.categoryId] || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['material:image:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['material:image:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改图片对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="imageFormRef" :model="form" :rules="rules" label-width="80px">
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
        <el-form-item label="图片名称" prop="imageName">
          <el-input v-model="form.imageName" placeholder="请输入图片名称" />
        </el-form-item>
        <el-form-item label="图片上传" prop="url">
          <el-upload
            class="image-upload-drag"
            drag
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="uploadImage"
            accept="image/*"
            style="width:100%"
            v-if="!form.imageFile"
          >
            <div style="text-align:center;padding:15px 0;">
              <el-icon style="font-size:38px;margin-bottom:12px;"><folder /></el-icon>
              <div style="font-size:18px;">选择图片文件</div>
            </div>
          </el-upload>
          <div v-else style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border:1px solid #eee;border-radius:6px;">
            <span>{{ form.imageFile.fileName }}</span>
            <el-button type="text" style="color: #ff4d4f" @click="removeImageFile">删除</el-button>
          </div>
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

<script setup name="Image" lang="ts">
import { listImage, getImage, delImage, addImage, updateImage } from '@/api/material/image';
import { ImageVO, ImageQuery, ImageForm } from '@/api/material/image/types';
import { uploadFile, delOss } from '@/api/system/oss/index';
import ImagePreview from '@/components/ImagePreview/index.vue';
import { listCategory } from '@/api/category/category/index';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const imageList = ref<ImageVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const imageFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

interface ImageFileInfo {
  url: string;
  fileName: string;
  ossId: string;
}
interface ImageFormEx extends ImageForm {
  imageFile?: ImageFileInfo | null;
}
const initFormData: ImageFormEx = {
  id: undefined,
  imageName: undefined,
  url: undefined,
  categoryId: undefined,
  imageFile: null
}
const data = reactive<PageData<ImageFormEx, ImageQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    imageName: undefined,
    categoryId: undefined,
    params: {}
  },
  rules: {
    imageName: [
      { required: true, message: "图片名称不能为空", trigger: "blur" }
    ],
  }
});
const { queryParams, form, rules } = toRefs(data);

const categoryOptions = ref<any[]>([]);
const categoryMap = ref<{ [key: string]: string }>({});
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

function listToTree(list, parentId = 0) {
  return list
    .filter(item => item.parentId === parentId)
    .map(item => ({
      ...item,
      children: listToTree(list, item.categoryId)
    }));
}

/** 查询图片列表 */
const getList = async () => {
  loading.value = true;
  const res = await listImage(queryParams.value);
  imageList.value = res.rows;
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
  imageFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: ImageVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = async () => {
  reset();
  await getCategoryOptions();
  dialog.visible = true;
  dialog.title = "添加图片";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: ImageVO) => {
  reset();
  await getCategoryOptions();
  const _id = row?.id || ids.value[0]
  const res = await getImage(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改图片";
}

/** 提交按钮 */
const submitForm = () => {
  imageFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateImage(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addImage(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: ImageVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除图片编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delImage(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('material/image/export', {
    ...queryParams.value
  }, `image_${new Date().getTime()}.xlsx`)
}

const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    proxy?.$modal.msgError('只能上传图片文件');
    return false;
  }
  return true;
};
const uploadImage = async (option: any) => {
  buttonLoading.value = true;
  try {
    const formData = new FormData();
    form.value && formData.append('file', option.file);
    const res = await uploadFile(formData);
    form.value.imageFile = res.data;
    form.value.url = res.data.url;
    proxy?.$modal.msgSuccess('上传成功');
    option.onSuccess(res.data);
  } catch (e) {
    proxy?.$modal.msgError('上传失败');
    option.onError(e);
  } finally {
    buttonLoading.value = false;
  }
};
const removeImageFile = async () => {
  if (!form.value.imageFile) return;
  await delOss(form.value.imageFile.ossId);
  form.value.imageFile = null;
  form.value.url = undefined;
  proxy?.$modal.msgSuccess('删除成功');
};

onMounted(() => {
  getCategoryOptions();
  getList();
});
</script>
