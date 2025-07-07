export interface DeptVO {
  /**
   * 部门ID
   */
  deptId: string | number;

  /**
   * 父部门
   */
  parentId: string | number;

  /**
   * 祖级列表
   */
  ancestors: string;

  /**
   * 部门名称
   */
  deptName: string;

  /**
   * 显示顺序
   */
  orderNum: number;

    /**
     * 子对象
     */
    children: DeptVO[];
}

export interface DeptForm extends BaseEntity {
  /**
   * 部门ID
   */
  deptId?: string | number;

  /**
   * 父部门
   */
  parentId?: string | number;

  /**
   * 祖级列表
   */
  ancestors?: string;

  /**
   * 部门名称
   */
  deptName?: string;

  /**
   * 显示顺序
   */
  orderNum?: number;

}

export interface DeptQuery {

  /**
   * 部门名称
   */
  deptName?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



