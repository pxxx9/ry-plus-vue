import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { OnlineCourseVO, OnlineCourseForm, OnlineCourseQuery } from '@/api/course/onlineCourse/types';

/**
 * 查询线上课程列表
 * @param query
 * @returns {*}
 */

export const listOnlineCourse = (query?: OnlineCourseQuery): AxiosPromise<OnlineCourseVO[]> => {
  return request({
    url: '/course/onlineCourse/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询线上课程详细
 * @param id
 */
export const getOnlineCourse = (id: string | number): AxiosPromise<OnlineCourseVO> => {
  return request({
    url: '/course/onlineCourse/' + id,
    method: 'get'
  });
};

/**
 * 新增线上课程
 * @param data
 */
export const addOnlineCourse = (data: OnlineCourseForm) => {
  return request({
    url: '/course/onlineCourse',
    method: 'post',
    data: data
  });
};

/**
 * 修改线上课程
 * @param data
 */
export const updateOnlineCourse = (data: OnlineCourseForm) => {
  return request({
    url: '/course/onlineCourse',
    method: 'put',
    data: data
  });
};

/**
 * 删除线上课程
 * @param id
 */
export const delOnlineCourse = (id: string | number | Array<string | number>) => {
  return request({
    url: '/course/onlineCourse/' + id,
    method: 'delete'
  });
};
