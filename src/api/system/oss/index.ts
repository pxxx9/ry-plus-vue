import request from '@/utils/request';
import { OssQuery, OssVO } from './types';
import { AxiosPromise } from 'axios';

// 查询OSS对象存储列表
export function listOss(query: OssQuery): AxiosPromise<OssVO[]> {
  return request({
    url: '/resource/oss/list',
    method: 'get',
    params: query
  });
}

// 查询OSS对象基于id串
export function listByIds(ossId: string | number): AxiosPromise<OssVO[]> {
  return request({
    url: '/resource/oss/listByIds/' + ossId,
    method: 'get'
  });
}

// 删除OSS对象存储
export function delOss(ossId: string | number | Array<string | number>) {
  return request({
    url: '/resource/oss/' + ossId,
    method: 'delete'
  });
}

// 上传文件到OSS
export function uploadFile(formData: FormData) {
  return request({
    url: '/resource/oss/upload',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}
