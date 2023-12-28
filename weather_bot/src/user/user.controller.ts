import { Controller } from '@nestjs/common';
import { Get, Delete, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  getUsers() {
    return this.userService.getAllUsers();
  }

  @Delete('/:id')
  deleteUser(@Param('id') id: any) {
    // convert id to number
    return this.userService.deleteUser(parseInt(id));
  }
}
