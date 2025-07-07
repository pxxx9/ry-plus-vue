import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { TeacherVO, TeacherForm, TeacherQuery } from '@/api/teacher/teacher/types';

/**
 * 查询讲师列表
 * @param query
 * @returns {*}
 */

export const listTeacher = (query?: TeacherQuery): AxiosPromise<TeacherVO[]> => {
  return request({
    url: '/teacher/teacher/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询讲师详细
 * @param id
 */
export const getTeacher = (id: string | number): AxiosPromise<TeacherVO> => {
  return request({
    url: '/teacher/teacher/' + id,
    method: 'get'
  });
};

/**
 * 新增讲师
 * @param data
 */
export const addTeacher = (data: TeacherForm) => {
  return request({
    url: '/teacher/teacher',
    method: 'post',
    data: data
  });
};

/**
 * 修改讲师
 * @param data
 */
export const updateTeacher = (data: TeacherForm) => {
  return request({
    url: '/teacher/teacher',
    method: 'put',
    data: data
  });
};

/**
 * 删除讲师
 * @param id
 */
export const delTeacher = (id: string | number | Array<string | number>) => {
  return request({
    url: '/teacher/teacher/' + id,
    method: 'delete'
  });
};
