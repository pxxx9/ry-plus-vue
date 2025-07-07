export interface StudentInfoVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 头像URL
   */
  avatar: string;

  /**
   * 头像URLUrl
   */
  avatarUrl: string;
  /**
   * 学生姓名
   */
  name: string;

  /**
   * 登录账号
   */
  username: string;

  /**
   * 密码
   */
  password: string;

  /**
   * 部门
   */
  deptId: string | number;

}

export interface StudentInfoForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;

  /**
   * 头像URL
   */
  avatar?: string;

  /**
   * 学生姓名
   */
  name?: string;

  /**
   * 登录账号
   */
  username?: string;

  /**
   * 密码
   */
  password?: string;

  /**
   * 部门
   */
  deptId?: string | number;

}

export interface StudentInfoQuery extends PageQuery {

  /**
   * 学生姓名
   */
  name?: string;

  /**
   * 登录账号
   */
  username?: string;

  /**
   * 部门ID
   */
  deptId?: string | number;

    /**
     * 日期范围参数
     */
    params?: any;
}



