export interface BankVO {
  /**
   * 题库ID
   */
  id: string | number;

  /**
   * 题库名称
   */
  bankName: string;

  /**
   * 单选题数量
   */
  singleChoiceCount: number;

  /**
   * 多选题数量
   */
  multipleChoiceCount: number;

  /**
   * 填空题数量
   */
  fillBlankCount: number;

  /**
   * 判断题数量
   */
  judgeCount: number;

  /**
   * 问答题数量
   */
  answerCount: number;

  /**
   * 题帽题数量
   */
  caseCount: number;

}

export interface BankForm extends BaseEntity {
  /**
   * 题库ID
   */
  id?: string | number;

  /**
   * 题库名称
   */
  bankName?: string;

  /**
   * 单选题数量
   */
  singleChoiceCount?: number;

  /**
   * 多选题数量
   */
  multipleChoiceCount?: number;

  /**
   * 填空题数量
   */
  fillBlankCount?: number;

  /**
   * 判断题数量
   */
  judgeCount?: number;

  /**
   * 问答题数量
   */
  answerCount?: number;

  /**
   * 题帽题数量
   */
  caseCount?: number;

}

export interface BankQuery extends PageQuery {

  /**
   * 题库名称
   */
  bankName?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



