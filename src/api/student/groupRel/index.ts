import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { GroupRelVO, GroupRelForm, GroupRelQuery } from '@/api/student/groupRel/types';

/**
 * 查询学生用户组关联列表
 * @param query
 * @returns {*}
 */

export const listGroupRel = (query?: GroupRelQuery): AxiosPromise<GroupRelVO[]> => {
  return request({
    url: '/student/groupRel/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询学生用户组关联详细
 * @param id
 */
export const getGroupRel = (id: string | number): AxiosPromise<GroupRelVO> => {
  return request({
    url: '/student/groupRel/' + id,
    method: 'get'
  });
};

/**
 * 新增学生用户组关联
 * @param data
 */
export const addGroupRel = (data: GroupRelForm) => {
  return request({
    url: '/student/groupRel',
    method: 'post',
    data: data
  });
};

/**
 * 修改学生用户组关联
 * @param data
 */
export const updateGroupRel = (data: GroupRelForm) => {
  return request({
    url: '/student/groupRel',
    method: 'put',
    data: data
  });
};

/**
 * 删除学生用户组关联
 * @param id
 */
export const delGroupRel = (id: string | number | Array<string | number>) => {
  return request({
    url: '/student/groupRel/' + id,
    method: 'delete'
  });
};
