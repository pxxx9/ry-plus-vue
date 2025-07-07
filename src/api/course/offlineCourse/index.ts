import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { OfflineCourseVO, OfflineCourseForm, OfflineCourseQuery } from '@/api/course/offlineCourse/types';

/**
 * 查询线下课程列表
 * @param query
 * @returns {*}
 */

export const listOfflineCourse = (query?: OfflineCourseQuery): AxiosPromise<OfflineCourseVO[]> => {
  return request({
    url: '/course/offlineCourse/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询线下课程详细
 * @param id
 */
export const getOfflineCourse = (id: string | number): AxiosPromise<OfflineCourseVO> => {
  return request({
    url: '/course/offlineCourse/' + id,
    method: 'get'
  });
};

/**
 * 新增线下课程
 * @param data
 */
export const addOfflineCourse = (data: OfflineCourseForm) => {
  return request({
    url: '/course/offlineCourse',
    method: 'post',
    data: data
  });
};

/**
 * 修改线下课程
 * @param data
 */
export const updateOfflineCourse = (data: OfflineCourseForm) => {
  return request({
    url: '/course/offlineCourse',
    method: 'put',
    data: data
  });
};

/**
 * 删除线下课程
 * @param id
 */
export const delOfflineCourse = (id: string | number | Array<string | number>) => {
  return request({
    url: '/course/offlineCourse/' + id,
    method: 'delete'
  });
};
