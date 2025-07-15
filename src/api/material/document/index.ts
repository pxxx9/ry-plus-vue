import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { DocumentVO, DocumentForm, DocumentQuery } from '@/api/material/document/types';

/**
 * 查询文档列表
 * @param query
 * @returns {*}
 */

export const listDocument = (query?: DocumentQuery): AxiosPromise<DocumentVO[]> => {
  return request({
    url: '/material/document/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询文档详细
 * @param id
 */
export const getDocument = (id: string | number): AxiosPromise<DocumentVO> => {
  return request({
    url: '/material/document/' + id,
    method: 'get'
  });
};

/**
 * 新增文档
 * @param data
 */
export const addDocument = (data: DocumentForm) => {
  return request({
    url: '/material/document',
    method: 'post',
    data: data
  });
};

/**
 * 修改文档
 * @param data
 */
export const updateDocument = (data: DocumentForm) => {
  return request({
    url: '/material/document',
    method: 'put',
    data: data
  });
};

/**
 * 删除文档
 * @param id
 */
export const delDocument = (id: string | number | Array<string | number>) => {
  return request({
    url: '/material/document/' + id,
    method: 'delete'
  });
};
