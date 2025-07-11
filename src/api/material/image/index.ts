import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ImageVO, ImageForm, ImageQuery } from '@/api/material/image/types';

/**
 * 查询图片列表
 * @param query
 * @returns {*}
 */

export const listImage = (query?: ImageQuery): AxiosPromise<ImageVO[]> => {
  return request({
    url: '/material/image/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询图片详细
 * @param id
 */
export const getImage = (id: string | number): AxiosPromise<ImageVO> => {
  return request({
    url: '/material/image/' + id,
    method: 'get'
  });
};

/**
 * 新增图片
 * @param data
 */
export const addImage = (data: ImageForm) => {
  return request({
    url: '/material/image',
    method: 'post',
    data: data
  });
};

/**
 * 修改图片
 * @param data
 */
export const updateImage = (data: ImageForm) => {
  return request({
    url: '/material/image',
    method: 'put',
    data: data
  });
};

/**
 * 删除图片
 * @param imageIds 图片ID串
 */
export const delImage = (imageIds: string | number | Array<string | number>) => {
  let ids = Array.isArray(imageIds) ? imageIds.join(',') : imageIds;
  return request({
    url: '/material/image/' + ids,
    method: 'delete'
  });
};
