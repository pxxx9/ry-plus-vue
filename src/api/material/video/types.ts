export interface VideoVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 视频名称
   */
  videoName: string | number;

  /**
   * 视频路径
   */
  videoPath: string | number;

  /**
   * 视频时长
   */
  videoDuration: string | number;

  /**
   * 分类
   */
  categoryId: string | number;

}

export interface VideoForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;

  /**
   * 视频名称
   */
  videoName?: string | number;

  /**
   * 视频路径
   */
  videoPath?: string | number;

  /**
   * 视频时长
   */
  videoDuration?: string | number;

  /**
   * 分类
   */
  categoryId?: string | number;

}

export interface VideoQuery extends PageQuery {

  /**
   * 视频名称
   */
  videoName?: string | number;

  /**
   * 分类
   */
  categoryId?: string | number;

    /**
     * 日期范围参数
     */
    params?: any;
}



