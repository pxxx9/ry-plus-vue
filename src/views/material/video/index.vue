<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="视频名称" prop="videoName">
              <el-input v-model="queryParams.videoName" placeholder="请输入视频名称" clearable @keyup.enter="handleQuery" />
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
        <el-table-column label="主键ID" align="center" prop="id" v-if="true" />
        <el-table-column label="视频名称" align="center" prop="videoName" />
        <el-table-column label="视频路径" align="center" prop="videoPath">
          <template #default="scope">
            <video v-if="scope.row.videoPath && isVideo(scope.row.videoPath)" :src="scope.row.videoPath" controls style="max-width:120px;max-height:80px;" />
            <span v-else-if="scope.row.videoPath">{{ scope.row.videoPath }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="视频时长" align="center" prop="videoDuration" />
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建人" align="center" prop="createBy" />
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
        <el-form-item label="视频名称" prop="videoName">
          <el-input v-model="form.videoName" placeholder="请输入视频名称" />
        </el-form-item>
        <el-form-item label="视频路径" prop="videoPath">
          <file-upload
            v-model="form.videoPath"
            @success="onUploadSuccess"
            :limit="1"
            :file-size="100"
          />
          <el-link v-if="form.videoPath" :href="form.videoPath" target="_blank">{{ form.videoPath }}</el-link>
        </el-form-item>
        <el-form-item label="视频时长" prop="videoDuration">
          <el-input v-model="form.videoDuration" placeholder="请输入视频时长" />
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
import { listVideo, getVideo, delVideo, addVideo, updateVideo } from '@/api/material/video';
import { VideoVO, VideoQuery, VideoForm } from '@/api/material/video/types';
import { listOss, delOss } from '@/api/system/oss';
import { getToken } from '@/utils/auth';

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

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: VideoForm = {
  id: undefined,
  videoName: undefined,
  videoPath: undefined,
  videoDuration: undefined,
}
const data = reactive<PageData<VideoForm, VideoQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    videoName: undefined,
    params: {
    }
  },
  rules: {
    videoPath: [
      { required: true, message: "视频路径不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

const onUploadSuccess = (res: any) => {
  console.log('上传文件返回数据:', res);
  if (res && res.data && res.data.url) {
    console.log('上传文件返回的 url:', res.data.url);
    form.value.videoPath = res.data.url;
  }
};

/** 查询视频列表 */
const getList = async () => {
  loading.value = true;
  const res = await listVideo(queryParams.value);
  videoList.value = res.rows;
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
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加视频";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: VideoVO) => {
  reset();
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
  let videos: VideoVO[] = [];
  if (row) {
    videos = [row];
  } else {
    videos = videoList.value.filter(v => Array.isArray(_ids) ? _ids.includes(v.id) : v.id === _ids);
  }
  // 1. 先删除数据库中的视频信息
  await proxy?.$modal.confirm('是否确认删除视频编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delVideo(_ids);
  // 2. 再删除 OSS 文件（不影响主流程）
  for (const video of videos) {
    if (video.videoPath) {
      try {
        const ossRes = await listOss({ url: video.videoPath });
        if (ossRes.data && ossRes.data.length > 0) {
          const ossId = ossRes.data[0].ossId;
          await delOss(ossId);
        }
      } catch (e) {
        // 忽略OSS删除失败
      }
    }
  }
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('material/video/export', {
    ...queryParams.value
  }, `video_${new Date().getTime()}.xlsx`)
}

function isVideo(url: string) {
  return /\.(mp4|webm|ogg|mov|avi|wmv|flv)$/i.test(url);
}

onMounted(() => {
  getList();
});
</script>
