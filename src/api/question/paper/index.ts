import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { PaperVO, PaperForm, PaperQuery } from '@/api/question/paper/types';

/**
 * 查询试卷列表
 * @param query
 * @returns {*}
 */

export const listPaper = (query?: PaperQuery): AxiosPromise<PaperVO[]> => {
  return request({
    url: '/question/paper/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询试卷详细
 * @param id
 */
export const getPaper = (id: string | number): AxiosPromise<PaperVO> => {
  return request({
    url: '/question/paper/' + id,
    method: 'get'
  });
};

/**
 * 新增试卷
 * @param data
 */
export const addPaper = (data: PaperForm) => {
  return request({
    url: '/question/paper',
    method: 'post',
    data: data
  });
};

/**
 * 修改试卷
 * @param data
 */
export const updatePaper = (data: PaperForm) => {
  return request({
    url: '/question/paper',
    method: 'put',
    data: data
  });
};

/**
 * 删除试卷
 * @param id
 */
export const delPaper = (id: string | number | Array<string | number>) => {
  return request({
    url: '/question/paper/' + id,
    method: 'delete'
  });
};
