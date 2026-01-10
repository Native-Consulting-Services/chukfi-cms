interface User {
  ID: any;
  CreatedAt?: Date;
  UpdatedAt?: Date;
  DeletedAt?: any;
  Fullname: string;
  Email: string;
  Password: string;
  Permissions: number;
}


interface Post {
  ID: any;
  CreatedAt?: Date;
  UpdatedAt?: Date;
  DeletedAt?: any;
  Type: string;
  Body: string;
  Title: string;
  AuthorID?: string;
}


interface Api_key {
  ID: any;
  CreatedAt?: Date;
  UpdatedAt?: Date;
  DeletedAt?: any;
  Key: string;
  OwnerEmail: string;
  ExpiresAt: number;
}
