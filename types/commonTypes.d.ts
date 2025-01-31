export declare type Route = {
  _id: string;
  grade_id: string;
  sector_id: string;
  crag_id: string;
  name: string;
  rating: string;
  id: string;
  sector: string;
  crag: string;
  images: [
    {
      src: string;
      id: string;
    }
  ];
  avgRating?: string;
  comments?: Object[];
};

export declare type Sector = {
  country: string;
  crag: string;
  crag_id: string;
  images: [
    [
      {
        src: string;
        id: string;
      }
    ]
  ];
  routes: [Route];
  sector: string;
  sector_id: string;
  _id: string;
};

export declare type Crag = {
  country: string;
  crag: string;
  images: [
    [
      {
        src: string;
        id: string;
      }
    ]
  ];
  routes: [Route];
  sectors: [Sector];
  _id: string;
};

export declare type Grade =
  | {
      id: string;
      fra_routes: string;
      usa_routes: string;
    }
  | string[]
  | null;
