export interface OfflineCourseVO {
  /**
   * 课程ID
   */
  id: string | number;

  /**
   * 课程名称
   */
  courseName: string;

  /**
   * 授课时间
   */
  courseTime: string;

  /**
   * 授课地点
   */
  courseLocation: string;

  /**
   * 指派学员
   */
  studentCount: number;

  /**
   * 签到人数
   */
  attendanceCount: number;

  /**
   * 讲师ID
   */
  teacherId: string | number;

  /**
   * 分类
   */
  categoryId: string | number;

}

export interface OfflineCourseForm extends BaseEntity {
  /**
   * 课程ID
   */
  id?: string | number;

  /**
   * 课程名称
   */
  courseName?: string;

  /**
   * 授课时间
   */
  courseTime?: string;

  /**
   * 授课地点
   */
  courseLocation?: string;

  /**
   * 指派学员
   */
  studentCount?: number;

  /**
   * 签到人数
   */
  attendanceCount?: number;

  /**
   * 讲师ID
   */
  teacherId?: string | number;

  /**
   * 分类
   */
  categoryId?: string | number;

}

export interface OfflineCourseQuery extends PageQuery {

  /**
   * 课程名称
   */
  courseName?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



