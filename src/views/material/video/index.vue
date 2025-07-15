<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="视频名称" prop="videoName">
              <el-input v-model="queryParams.videoName" placeholder="请输入视频名称" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['material:video:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['material:video:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['material:video:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['material:video:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="videoList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="主键ID" align="center" prop="id" v-if="false" />
        <el-table-column label="视频名称" align="center" prop="videoName" />
        <el-table-column label="视频路径" align="center" prop="videoPath">
          <template #default="scope">
            <video v-if="scope.row.videoPath" :src="scope.row.videoPath" controls style="width: 120px; height: 80px; object-fit: cover;" />
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="视频时长" align="center" prop="videoDuration" />
        <el-table-column label="分类" align="center" prop="categoryId">
          <template #default="scope">
            {{ categoryMap[scope.row.categoryId] || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['material:video:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['material:video:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改视频对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="videoFormRef" :model="form" :rules="rules" label-width="80px">
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
        <el-form-item label="视频名称" prop="videoName">
          <el-input v-model="form.videoName" placeholder="请输入视频名称" />
        </el-form-item>
        <el-form-item label="视频上传" prop="videoPath">
          <el-upload
            class="video-upload-drag"
            drag
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="uploadVideo"
            accept="video/*"
            style="width:100%"
            v-if="!form.videoFile"
          >
            <div style="text-align:center;padding:15px 0;">
              <el-icon style="font-size:38px;margin-bottom:12px;"><folder /></el-icon>
              <div style="font-size:18px;">选择视频文件</div>
            </div>
          </el-upload>
          <div v-else style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border:1px solid #eee;border-radius:6px;">
            <span>{{ form.videoFile.fileName }}</span>
            <el-button type="text" style="color: #ff4d4f" @click="removeFile">删除</el-button>
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

<script setup name="Video" lang="ts">
import { listVideo, getVideo, delVideo, addVideo, updateVideo } from '@/api/material/video/index';
import { VideoVO, VideoQuery, VideoForm } from '@/api/material/video/types';
import { listCategory } from '@/api/category/category/index';
import { uploadFile, delOss } from '@/api/system/oss/index';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const videoList = ref<VideoVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const videoFormRef = ref<ElFormInstance>();

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

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// VideoForm类型扩展，支持videoFile
interface VideoFileInfo {
  url: string;
  fileName: string;
  ossId: string;
}
interface VideoFormEx extends VideoForm {
  videoFile?: VideoFileInfo | null;
}

const initFormData: VideoFormEx = {
  id: undefined,
  videoName: undefined,
  videoPath: undefined,
  videoDuration: undefined,
  categoryId: undefined,
  videoFile: null
}
const data = reactive<PageData<VideoFormEx, VideoQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    videoName: undefined,
    categoryId: undefined,
    params: {}
  },
  rules: {
    videoName: [
      { required: true, message: "视频名称不能为空", trigger: "blur" }
    ],
    videoPath: [
      { required: true, message: "视频路径不能为空", trigger: "blur" }
    ],
    categoryId: [
      { required: true, message: "分类不能为空", trigger: "change" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询视频列表 */
const getList = async () => {
  loading.value = true;
  const res = await listVideo(queryParams.value);
  videoList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 工具：一维数组转树结构 */
function listToTree(list, parentId = 0) {
  return list
    .filter(item => item.parentId === parentId)
    .map(item => ({
      ...item,
      children: listToTree(list, item.categoryId)
    }));
}

/** 查询分类下拉列表（树结构） */
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

/** OSS上传视频，只允许视频类型，上传后自动获取视频时长 */
const beforeUpload = (file: File) => {
  const isVideo = file.type.startsWith('video/');
  if (!isVideo) {
    proxy?.$modal.msgError('只能上传视频文件');
    return false;
  }
  return true;
};
const uploadVideo = async (option: any) => {
  buttonLoading.value = true;
  try {
    const formData = new FormData();
    form.value && formData.append('file', option.file);
    const res = await uploadFile(formData);
    // 假设返回 { url, fileName, ossId }
    form.value.videoFile = res.data;
    form.value.videoPath = res.data.url;
    // 自动获取视频时长
    getVideoDuration(res.data.url);
    proxy?.$modal.msgSuccess('上传成功');
    option.onSuccess(res.data);
  } catch (e) {
    proxy?.$modal.msgError('上传失败');
    option.onError(e);
  } finally {
    buttonLoading.value = false;
  }
};

const removeFile = async () => {
  if (!form.value.videoFile) return;
  await delOss(form.value.videoFile.ossId);
  form.value.videoFile = null;
  form.value.videoPath = undefined;
  form.value.videoDuration = undefined;
  proxy?.$modal.msgSuccess('删除成功');
};

/** 自动获取视频时长 */
const getVideoDuration = (url: string) => {
  const video = document.createElement('video');
  video.src = url;
  video.preload = 'metadata';
  video.onloadedmetadata = function () {
    form.value.videoDuration = video.duration ? video.duration.toFixed(2) : '';
  };
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  videoFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: VideoVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = async () => {
  reset();
  await getCategoryOptions();
  dialog.visible = true;
  dialog.title = "添加视频";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: VideoVO) => {
  reset();
  await getCategoryOptions();
  const _id = row?.id || ids.value[0]
  const res = await getVideo(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改视频";
}

/** 提交按钮 */
const submitForm = () => {
  videoFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateVideo(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addVideo(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: VideoVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除视频编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delVideo(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('material/video/export', {
    ...queryParams.value
  }, `video_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getCategoryOptions();
  getList();
});
</script>
