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
  title: string;

  /**
   * 试卷类型
   */
  combinationMode?: number;

  /**
   * 试题数
   */
  questionCount: number;

  /**
   * 总分
   */
  score: number;

  /**
   * 及格分
   */
  passScore: number;

  extra?: string;
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
  title?: string;

  /**
   * 试卷类型
   */
  combinationMode?: number;

  /**
   * 试题数
   */
  questionCount?: number;

  /**
   * 总分
   */
  score?: number;

  /**
   * 及格分
   */
  passScore?: number;

  extra?: string;
}

export interface PaperQuery extends PageQuery {

  /**
   * 试卷名称
   */
  title?: string;

    /**
     * 日期范围参数
     */
    params?: any;

  /**
   * 试卷类型
   */
  combinationMode?: number;
}



