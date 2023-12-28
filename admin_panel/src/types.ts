export interface Profile {
  name: string;
  email: string;
  picture: string;
}

export interface User {
  id: number;
  username?: string;
  firstName: string;
  lastName?: string;
  city?: string;
}
