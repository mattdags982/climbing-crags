export declare type CommentType = {
  _id: string;
  title: string;
  comment: string;
  rating: number;
  path?: string;
  user?: string;
  comment_rating: number;
  id?: string;
  votes?: {
    [propName: string]: number;
  };
};

export declare type onClickType = (arg0: boolean) => any;
