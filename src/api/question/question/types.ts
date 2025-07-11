export interface QuestionVO {
  /**
   * 题目ID
   */
  id: string | number;

  /**
   * 题目内容
   */
  questionContent: string;

  /**
   * 题型
   */
  questionType: number;

  /**
   * 难度
   */
  difficulty: number;

  /**
   * 正确答案
   */
  correctAnswer: string;

  /**
   * 题库ID
   */
  bankId: string | number;
}

export interface QuestionForm extends BaseEntity {
  /**
   * 题目ID
   */
  id?: string | number;

  /**
   * 题目内容
   */
  questionContent?: string;

  /**
   * 题型
   */
  questionType?: number;

  /**
   * 难度
   */
  difficulty?: number;

  /**
   * 正确答案
   */
  correctAnswer?: string;

  /**
   * 题库ID
   */
  bankId?: string | number;
}

export interface QuestionQuery extends PageQuery {
  /**
   * 题目内容
   */
  questionContent?: string;

  /**
   * 题库ID
   */
  bankId?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;
}



