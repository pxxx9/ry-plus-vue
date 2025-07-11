import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { DocumentVO } from '@/api/material/document/types';

/**
 * 查询文档列表
 */
export const listDocument = (query?: any): AxiosPromise<any> => {
  return request({
    url: '/material/document/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询文档基于ID串
 */
export const listDocumentByIds = (documentIds: Array<string|number>): AxiosPromise<DocumentVO[]> => {
  return request({
    url: '/material/document/listByIds/' + documentIds.join(','),
    method: 'get'
  });
};

/**
 * 上传文档
 */
export const uploadDocument = (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  return request({
    url: '/material/document/upload',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

/**
 * 下载文档
 */
export const downloadDocument = (documentId: string|number) => {
  window.open('/material/document/download/' + documentId, '_blank');
};

/**
 * 删除文档
 */
export const delDocument = (documentIds: Array<string|number>) => {
  return request({
    url: '/material/document/' + documentIds.join(','),
    method: 'delete'
  });
};
