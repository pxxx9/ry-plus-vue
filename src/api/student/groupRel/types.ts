export interface GroupRelVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 用户组
   */
  groupId: string | number;

  /**
   * 学生
   */
  studentId: string | number;

  /**
   * 创建时间
   */
  createTime: string;

}

export interface GroupRelForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;

  /**
   * 用户组
   */
  groupId?: string | number;

  /**
   * 学生
   */
  studentId?: string | number;

  /**
   * 创建时间
   */
  createTime?: string;

}

export interface GroupRelQuery extends PageQuery {

  /**
   * 学生
   */
  studentId?: string | number;

  /**
   * 用户组
   */
  groupId?: string | number;

    /**
     * 日期范围参数
     */
    params?: any;
}



