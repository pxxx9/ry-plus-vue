import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { VideoVO, VideoForm, VideoQuery } from '@/api/material/video/types';

/**
 * 查询视频列表
 * @param query
 * @returns { rows: VideoVO[], total: number }
 */
export const listVideo = async (query?: VideoQuery): Promise<{ rows: VideoVO[]; total: number }> => {
  const res = await request({
    url: '/material/video/list',
    method: 'get',
    params: query
  });
  // 兼容两种后端返回结构
  if (res.rows && res.total !== undefined) {
    return { rows: res.rows, total: res.total };
  } else if (res.data && res.data.rows && res.data.total !== undefined) {
    return { rows: res.data.rows, total: res.data.total };
  } else {
    return { rows: [], total: 0 };
  }
};

/**
 * 查询视频详细
 * @param id
 */
export const getVideo = (id: string | number): AxiosPromise<VideoVO> => {
  return request({
    url: '/material/video/' + id,
    method: 'get'
  });
};

/**
 * 新增视频
 * @param data
 */
export const addVideo = (data: VideoForm) => {
  return request({
    url: '/material/video',
    method: 'post',
    data: data
  });
};

/**
 * 修改视频
 * @param data
 */
export const updateVideo = (data: VideoForm) => {
  return request({
    url: '/material/video',
    method: 'put',
    data: data
  });
};

/**
 * 删除视频
 * @param id
 */
export const delVideo = (id: string | number | Array<string | number>) => {
  return request({
    url: '/material/video/' + id,
    method: 'delete'
  });
};
