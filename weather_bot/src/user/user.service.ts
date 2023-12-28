import { Injectable, Inject } from '@nestjs/common';
import { Db } from 'mongodb';
import { User } from './user.interface';

@Injectable()
export class UserService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private db: Db,
  ) {}

  async createUser(user: User): Promise<any> {
    try {
      const response = await this.db.collection('users').insertOne(user);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(id: number): Promise<any> {
    try {
      const response = await this.db.collection('users').deleteOne({ id: id });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(id: number, user: any): Promise<any> {
    try {
      const response = await this.db
        .collection('users')
        .updateOne({ id: id }, { $set: user });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async isUserExist(id: number): Promise<any> {
    try {
      const response =
        (await this.db
          .collection('users')
          .countDocuments({ id: id }, { limit: 1 })) > 0;
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getAllUsers(): Promise<any> {
    try {
      const response = await this.db.collection('users').find().toArray();
      return response;
    } catch (error) {
      throw error;
    }
  }
}
