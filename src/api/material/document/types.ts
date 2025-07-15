export interface DocumentVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 文档名称
   */
  documentName: string;

  /**
   * URL地址
   */
  url: string;

  /**
   * 文档大小
   */
  size: string;

  /**
   * 分类
   */
  categoryId: string | number;

}

export interface DocumentForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;

  /**
   * 文档名称
   */
  documentName?: string;

  /**
   * URL地址
   */
  url?: string;

  /**
   * 文档大小
   */
  size?: string;

  /**
   * 分类
   */
  categoryId?: string | number;

}

export interface DocumentQuery extends PageQuery {

  /**
   * 文档名称
   */
  documentName?: string;

  /**
   * 分类
   */
  categoryId?: string | number;

    /**
     * 日期范围参数
     */
    params?: any;
}



