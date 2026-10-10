import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { UpharmaService } from "../upharma.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./login.component.html",
})
export class LoginComponent implements OnInit {
  username = "";
  password = "";
  loading = false;
  errorText = "";

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly upharmaService: UpharmaService,
  ) {}

  ngOnInit(): void {
    if (this.upharmaService.isAuthenticated()) {
      void this.router.navigateByUrl("/dashboard");
    }
  }

  async submitLogin(): Promise<void> {
    if (!this.username.trim() || !this.password) {
      this.errorText = "Vui lòng nhập tài khoản/email và mật khẩu";
      return;
    }

    this.loading = true;
    this.errorText = "";

    try {
      await this.upharmaService.login({
        UserName: this.username.trim(),
        Password: this.password,
      });

      const returnUrl = this.route.snapshot.queryParamMap.get("returnUrl") || "/dashboard";
      await this.router.navigateByUrl(returnUrl);
    } catch (error) {
      this.errorText = error instanceof Error ? error.message : String(error);
    } finally {
      this.loading = false;
    }
  }
}

