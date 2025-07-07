import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { GroupVO, GroupForm, GroupQuery } from '@/api/student/group/types';

/**
 * 查询用户组列表
 * @param query
 * @returns {*}
 */

export const listGroup = (query?: GroupQuery): AxiosPromise<GroupVO[]> => {
  return request({
    url: '/student/group/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询用户组详细
 * @param id
 */
export const getGroup = (id: string | number): AxiosPromise<GroupVO> => {
  return request({
    url: '/student/group/' + id,
    method: 'get'
  });
};

/**
 * 新增用户组
 * @param data
 */
export const addGroup = (data: GroupForm) => {
  return request({
    url: '/student/group',
    method: 'post',
    data: data
  });
};

/**
 * 修改用户组
 * @param data
 */
export const updateGroup = (data: GroupForm) => {
  return request({
    url: '/student/group',
    method: 'put',
    data: data
  });
};

/**
 * 删除用户组
 * @param id
 */
export const delGroup = (id: string | number | Array<string | number>) => {
  return request({
    url: '/student/group/' + id,
    method: 'delete'
  });
};
