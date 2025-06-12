import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/users/user.service';
import { User } from '../../models/user';
import { CommonModule } from '@angular/common';
import { FormUserComponent } from '../form-user/form-user.component';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-user',
  imports: [CommonModule,RouterModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent implements OnInit{

  users : User[] = [];
  userToDelete: number | null = null;
  constructor(private service: UserService){

  }

  ngOnInit(): void {
    this.service.findAll().subscribe(users=>this.users = users);
   }

   
  confirmDelete(userId: number) {
    this.userToDelete = userId;
  }

  deleteUser() {
    if (this.userToDelete !== null) {
      this.service.deleteById(this.userToDelete).subscribe({
        next: () => {
          console.log(`User with ID ${this.userToDelete} deleted.`);
          this.users = this.users.filter(user => user.id !== this.userToDelete);
          this.userToDelete = null;
        },
        error: (error) => {
          console.error('Error deleting user: ', error);
        }
      });
    }
  }
  

  cancelDelete() {
    this.userToDelete = null;
  }

}
