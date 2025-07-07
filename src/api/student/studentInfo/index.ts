import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { StudentInfoVO, StudentInfoForm, StudentInfoQuery } from '@/api/student/studentInfo/types';

/**
 * 查询学生信息列表
 * @param query
 * @returns {*}
 */

export const listStudentInfo = (query?: StudentInfoQuery): AxiosPromise<StudentInfoVO[]> => {
  return request({
    url: '/student/studentInfo/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询学生信息详细
 * @param id
 */
export const getStudentInfo = (id: string | number): AxiosPromise<StudentInfoVO> => {
  return request({
    url: '/student/studentInfo/' + id,
    method: 'get'
  });
};

/**
 * 新增学生信息
 * @param data
 */
export const addStudentInfo = (data: StudentInfoForm) => {
  return request({
    url: '/student/studentInfo',
    method: 'post',
    data: data
  });
};

/**
 * 修改学生信息
 * @param data
 */
export const updateStudentInfo = (data: StudentInfoForm) => {
  return request({
    url: '/student/studentInfo',
    method: 'put',
    data: data
  });
};

/**
 * 删除学生信息
 * @param id
 */
export const delStudentInfo = (id: string | number | Array<string | number>) => {
  return request({
    url: '/student/studentInfo/' + id,
    method: 'delete'
  });
};
