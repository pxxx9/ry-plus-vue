export interface OnlineCourseVO {
  /**
   * 课程ID
   */
  id: string | number;

  /**
   * 课程名称
   */
  courseName: string;

  /**
   * 分类
   */
  categoryId: string | number;

  /**
   * 课程类型
   */
  courseType: string;

  /**
   * 学员人数
   */
  studentCount: number;

  /**
   * 讲师
   */
  teacherId: string | number;

}

export interface OnlineCourseForm extends BaseEntity {
  /**
   * 课程ID
   */
  id?: string | number;

  /**
   * 课程名称
   */
  courseName?: string;

  /**
   * 分类
   */
  categoryId?: string | number;

  /**
   * 课程类型
   */
  courseType?: string;

  /**
   * 学员人数
   */
  studentCount?: number;

  /**
   * 讲师
   */
  teacherId?: string | number;

}

export interface OnlineCourseQuery extends PageQuery {

  /**
   * 课程名称
   */
  courseName?: string;

  /**
   * 分类
   */
  categoryId?: string | number;

  /**
   * 课程类型
   */
  courseType?: string;

  /**
   * 学员人数
   */
  studentCount?: number;

  /**
   * 讲师
   */
  teacherId?: string | number;

    /**
     * 日期范围参数
     */
    params?: any;
}



