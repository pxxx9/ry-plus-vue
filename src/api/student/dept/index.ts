import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { DeptVO, DeptForm, DeptQuery } from '@/api/student/dept/types';

/**
 * 查询部门列表
 * @param query
 * @returns {*}
 */

export const listDept = (query?: DeptQuery): AxiosPromise<DeptVO[]> => {
  return request({
    url: '/student/dept/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询部门详细
 * @param deptId
 */
export const getDept = (deptId: string | number): AxiosPromise<DeptVO> => {
  return request({
    url: '/student/dept/' + deptId,
    method: 'get'
  });
};

/**
 * 新增部门
 * @param data
 */
export const addDept = (data: DeptForm) => {
  return request({
    url: '/student/dept',
    method: 'post',
    data: data
  });
};

/**
 * 修改部门
 * @param data
 */
export const updateDept = (data: DeptForm) => {
  return request({
    url: '/student/dept',
    method: 'put',
    data: data
  });
};

/**
 * 删除部门
 * @param deptId
 */
export const delDept = (deptId: string | number | Array<string | number>) => {
  return request({
    url: '/student/dept/' + deptId,
    method: 'delete'
  });
};
