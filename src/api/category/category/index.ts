import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CategoryVO, CategoryForm, CategoryQuery } from '@/api/category/category/types';

/**
 * 查询通用分类列表
 * @param query
 * @returns {*}
 */

export const listCategory = (query?: CategoryQuery): AxiosPromise<CategoryVO[]> => {
  return request({
    url: '/category/category/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询通用分类详细
 * @param categoryId
 */
export const getCategory = (categoryId: string | number): AxiosPromise<CategoryVO> => {
  return request({
    url: '/category/category/' + categoryId,
    method: 'get'
  });
};

/**
 * 新增通用分类
 * @param data
 */
export const addCategory = (data: CategoryForm) => {
  return request({
    url: '/category/category',
    method: 'post',
    data: data
  });
};

/**
 * 修改通用分类
 * @param data
 */
export const updateCategory = (data: CategoryForm) => {
  return request({
    url: '/category/category',
    method: 'put',
    data: data
  });
};

/**
 * 删除通用分类
 * @param categoryId
 */
export const delCategory = (categoryId: string | number | Array<string | number>) => {
  return request({
    url: '/category/category/' + categoryId,
    method: 'delete'
  });
};
