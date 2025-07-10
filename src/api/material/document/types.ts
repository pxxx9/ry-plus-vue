export interface DocumentVO {
  /**
   * 对象存储主键
   */
  documentId: string | number;

  /**
   * 文件名
   */
  documentName: string;

  /**
   * 原名
   */
  originalName: string;

  /**
   * 文件后缀名
   */
  documentSuffix: string;

  /**
   * URL地址
   */
  url: string;
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
   * 文档路径
   */
  documentPath?: string;

  /**
   * 文档大小
   */
  documentSize?: string;

}

export interface DocumentQuery extends PageQuery {

  /**
   * 文档名称
   */
  documentName?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



