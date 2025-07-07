export interface TeacherVO {
  /**
   * 讲师ID
   */
  id: string | number;

  /**
   * 讲师姓名
   */
  name: string;

}

export interface TeacherForm extends BaseEntity {
  /**
   * 讲师ID
   */
  id?: string | number;

  /**
   * 讲师姓名
   */
  name?: string;

}

export interface TeacherQuery extends PageQuery {

  /**
   * 讲师姓名
   */
  name?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



