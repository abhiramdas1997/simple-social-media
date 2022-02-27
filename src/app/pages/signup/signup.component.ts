import { Component, OnInit } from '@angular/core';
//angular form
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
//services
import { AuthService } from 'src/app/services/auth.service';
//firebase
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFireDatabase } from '@angular/fire/compat/database';
//image resizer
import { readAndCompressImage } from 'browser-image-resizer';
import { imageConfig } from 'src/utils/config';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  picture:string = "https://asset-cdn.learnyst.com/assets/schools/2410/resources/images/logo_lco_4dsl6o.png";

  uploadPercent:number = null;

  constructor(
    private auth:AuthService,
    private router:Router,
    private db:AngularFireDatabase,
    private storage:AngularFireStorage,
    private toastr:ToastrService
  ) { }

  ngOnInit(): void {
  }

  onSubmit(f:NgForm){
    const {email,password,username,country,bio,name} = f.form.value;

    this.auth.signUp(email,password)
    .then((res) => {
      console.log(res);
      const {uid} = res.user;
      this.db.object(`/user/${uid}`)
      .set({
        id:uid,
        name:name,
        email:email,
        instaUserName:username,
        country:country,
        bio:bio,
        picture:this.picture
      })

    })
    .then(()=>{
      this.router.navigateByUrl('/');
      this.toastr.success("Signup Success");
    })
    .catch((err)=>{
      this.toastr.error("Sigup Failed");
      console.log(err);
    })
  }

  async uploadFile(event){
    const file = event.target.files[0];

    let resizedImage = await readAndCompressImage(file,imageConfig);

    const filepath = file.name; //rename the image with uuid
    const fileRef = this.storage.ref(filepath);

    const task = this.storage.upload(filepath,resizedImage);

    task.percentageChanges().subscribe((percentage) => {
      this.uploadPercent = percentage;
    });

    task.snapshotChanges()
    .pipe(
      finalize(()=>{
        fileRef.getDownloadURL().subscribe((url) => {
          this.picture = url;
          this.toastr.success('Image Uploaded Successfully');
        })
      })
    )
    .subscribe();
  }

}
