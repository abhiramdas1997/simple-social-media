import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  users = [];
  posts = [];

  isLoading = false;

  constructor(
    private db:AngularFireDatabase,
    private toastr:ToastrService
  ) { 
    this.isLoading = true;
    
    //get all users
    db.object('/user')
    .valueChanges()
    .subscribe((obj) => {
      if(obj){
        this.users = Object.values(obj);
        this.isLoading = false;
      }else{
        toastr.error('no user found');
        this.users = [];
        this.isLoading = false;
      }
    });

    //grab all post
    db.object('/posts')
    .valueChanges()
    .subscribe((obj) => {
      if(obj){
        this.posts = Object.values(obj).sort((a,b) => b.date - a.date);
        this.isLoading = false;
      }else{
        toastr.error('no post to display');
        this.posts = [];
        this.isLoading = false;
      }
    });
  }

  ngOnInit(): void {
  }

}
