export interface CategoryVO {
  /**
   * 分类ID
   */
  categoryId: string | number;

  /**
   * 父分类ID (0表示根节点)
   */
  parentId: string | number;

  /**
   * 祖级列表
   */
  categoryPath: string;

  /**
   * 分类名称
   */
  categoryName: string;

  /**
   * 排序号
   */
  sortOrder: number;

    /**
     * 子对象
     */
    children: CategoryVO[];
}

export interface CategoryForm extends BaseEntity {
  /**
   * 分类ID
   */
  categoryId?: string | number;

  /**
   * 父分类ID (0表示根节点)
   */
  parentId?: string | number;

  /**
   * 祖级列表
   */
  categoryPath?: string;

  /**
   * 分类名称
   */
  categoryName?: string;

  /**
   * 排序号
   */
  sortOrder?: number;

}

export interface CategoryQuery {

  /**
   * 分类名称
   */
  categoryName?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



