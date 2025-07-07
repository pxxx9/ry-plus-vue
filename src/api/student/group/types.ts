export interface GroupVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 用户组名称
   */
  groupName: string;

  /**
   * 创建时间
   */
  createTime: string;

  /**
   * 创建人
   */
  createBy: number;

}

export interface GroupForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;

  /**
   * 用户组名称
   */
  groupName?: string;

}

export interface GroupQuery extends PageQuery {

  /**
   * 用户组名称
   */
  groupName?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



