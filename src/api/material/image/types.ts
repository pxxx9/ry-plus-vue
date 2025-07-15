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
   * URL地址
   */
  url: string;

  /**
   * 分类
   */
  categoryId: string | number;

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
   * URL地址
   */
  url?: string;

  /**
   * 分类
   */
  categoryId?: string | number;

}

export interface ImageQuery extends PageQuery {

  /**
   * 图片名称
   */
  imageName?: string;

  /**
   * 分类
   */
  categoryId?: string | number;

    /**
     * 日期范围参数
     */
    params?: any;
}



