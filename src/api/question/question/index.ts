import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { QuestionVO, QuestionForm, QuestionQuery } from '@/api/question/question/types';

/**
 * 查询题库列表
 * @param query
 * @returns {*}
 */

export const listQuestion = (query?: QuestionQuery): AxiosPromise<QuestionVO[]> => {
  return request({
    url: '/question/question/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询题库详细
 * @param id
 */
export const getQuestion = (id: string | number): AxiosPromise<QuestionVO> => {
  return request({
    url: '/question/question/' + id,
    method: 'get'
  });
};

/**
 * 新增题库
 * @param data
 */
export const addQuestion = (data: QuestionForm) => {
  return request({
    url: '/question/question',
    method: 'post',
    data: data
  });
};

/**
 * 修改题库
 * @param data
 */
export const updateQuestion = (data: QuestionForm) => {
  return request({
    url: '/question/question',
    method: 'put',
    data: data
  });
};

/**
 * 删除题库
 * @param id
 */
export const delQuestion = (id: string | number | Array<string | number>) => {
  return request({
    url: '/question/question/' + id,
    method: 'delete'
  });
};
