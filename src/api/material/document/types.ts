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
   * 文档路径
   */
  documentPath: string;

  /**
   * 文档大小
   */
  documentSize: string;

  /**
   * 创建时间
   */
  createTime: string;

  /**
   * 创建人
   */
  createBy: number;

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



