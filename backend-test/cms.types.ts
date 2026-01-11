export interface APIKeys {
  ID: string;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string;
  Key?: string;
  OwnerEmail?: string;
  ExpiresAt?: number;
}

export interface Post {
  ID: string;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string;
  Type?: string;
  Body?: string;
  Title?: string;
  AuthorID?: string;
}


export interface User {
  ID: string;
  CreatedAt?: Date;
  UpdatedAt?: Date;
  DeletedAt?: any;
  Fullname: string;
  Email: string;
  Password: string;
  Permissions: number;
}
