export interface PaperVO {
  /**
   * 试卷ID
   */
  id: string | number;

  /**
   * 试卷分类ID
   */
  categoryId: string | number;

  /**
   * 试卷名称
   */
  name: string;

  /**
   * 试卷类型
   */
  type: number;

  /**
   * 试题数
   */
  questionCount: number;

  /**
   * 总分
   */
  totalScore: number;

  /**
   * 及格分
   */
  passScore: number;

}

export interface PaperForm extends BaseEntity {
  /**
   * 试卷ID
   */
  id?: string | number;

  /**
   * 试卷分类ID
   */
  categoryId?: string | number;

  /**
   * 试卷名称
   */
  name?: string;

  /**
   * 试卷类型
   */
  type?: number;

  /**
   * 试题数
   */
  questionCount?: number;

  /**
   * 总分
   */
  totalScore?: number;

  /**
   * 及格分
   */
  passScore?: number;

}

export interface PaperQuery extends PageQuery {

  /**
   * 试卷名称
   */
  name?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



