export interface ImageVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 图片名称
   */
  imageName: string;

  /**
   * 图片路径
   */
  imagePath: string;

  /**
   * 图片路径Url
   */
  imagePathUrl: string;
  /**
   * 创建时间
   */
  createTime: string;

  /**
   * 创建人
   */
  createBy: number;

}

export interface ImageForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;

  /**
   * 图片名称
   */
  imageName?: string;

  /**
   * 图片路径
   */
  imagePath?: string;

}

export interface ImageQuery extends PageQuery {

  /**
   * 图片名称
   */
  imageName?: string;

  /**
   * 图片路径
   */
  imagePath?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



