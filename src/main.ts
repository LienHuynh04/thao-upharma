import { bootstrapApplication } from "@angular/platform-browser";
import { PreloadAllModules, provideRouter, Routes, withHashLocation, withPreloading } from "@angular/router";
import { authGuard } from "./app/auth.guard";
import { LayoutComponent } from "./app/layout/layout.component";
import { LoginComponent } from "./app/login/login.component";
import { RootComponent } from "./app/root.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "dashboard",
    pathMatch: "full",
  },
  {
    path: "login",
    component: LoginComponent,
    title: "UPHARMA - Đăng nhập",
  },
  {
    path: "",
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: "dashboard",
        loadComponent: () => import("./app/dashboard/dashboard.component").then((m) => m.DashboardComponent),
        title: "UPHARMA - Bảng điều khiển",
      },
      {
        path: "nha-thuoc",
        loadComponent: () => import("./app/nha-thuoc/nha-thuoc.component").then((m) => m.NhaThuocComponent),
        title: "UPHARMA - Nhà Thuốc",
      },
      {
        path: "nhan-su",
        loadComponent: () => import("./app/nhan-su/nhan-su.component").then((m) => m.NhanSuComponent),
        title: "UPHARMA - Nhân Sự",
      },
      {
        path: "okr",
        loadComponent: () => import("./app/placeholder-pages/placeholder-pages.component").then((m) => m.OkrComponent),
        title: "UPHARMA - OKR",
      },
      {
        path: "khuyen-mai",
        loadComponent: () => import("./app/khuyen-mai/khuyen-mai.component").then((m) => m.KhuyenMaiComponent),
        title: "UPHARMA - Khuyến Mãi",
      },
      {
        path: "bao-cao-nv",
        loadComponent: () => import("./app/placeholder-pages/placeholder-pages.component").then((m) => m.BaoCaoNvComponent),
        title: "UPHARMA - Báo Cáo NV",
      },
      {
        path: "bao-cao",
        loadComponent: () => import("./app/placeholder-pages/placeholder-pages.component").then((m) => m.BaoCaoComponent),
        title: "UPHARMA - Báo Cáo",
      },
      {
        path: "chi-tieu",
        loadComponent: () => import("./app/placeholder-pages/placeholder-pages.component").then((m) => m.ChiTieuComponent),
        title: "UPHARMA - Chỉ Tiêu",
      },
      {
        path: "hieu-suat",
        loadComponent: () => import("./app/placeholder-pages/placeholder-pages.component").then((m) => m.HieuSuatComponent),
        title: "UPHARMA - Hiệu Suất",
      },
      {
        path: "khach-hang",
        loadComponent: () => import("./app/placeholder-pages/placeholder-pages.component").then((m) => m.KhachHangComponent),
        title: "UPHARMA - Khách Hàng",
      },
      {
        path: "nhap-doanh-so",
        loadComponent: () => import("./app/nhap-doanh-so/nhap-doanh-so.component").then((m) => m.NhapDoanhSoComponent),
        title: "UPHARMA - Nhập Doanh Số",
      },
      {
        path: "hang-hoa",
        loadComponent: () => import("./app/placeholder-pages/placeholder-pages.component").then((m) => m.HangHoaComponent),
        title: "UPHARMA - Hàng Hoá",
      },
      {
        path: "wrong-fefo",
        loadComponent: () => import("./app/placeholder-pages/placeholder-pages.component").then((m) => m.WrongFefoComponent),
        title: "UPHARMA - Wrong FEFO",
      },
      {
        path: "hang-khong-co",
        loadComponent: () => import("./app/placeholder-pages/placeholder-pages.component").then((m) => m.HangKhongCoComponent),
        title: "UPHARMA - Hàng Không Có",
      },
      {
        path: "danh-gia-ai",
        loadComponent: () => import("./app/placeholder-pages/placeholder-pages.component").then((m) => m.DanhGiaAiComponent),
        title: "UPHARMA - Đánh Giá AI",
      },
      {
        path: "cham-kpi",
        loadComponent: () => import("./app/placeholder-pages/placeholder-pages.component").then((m) => m.ChamKpiComponent),
        title: "UPHARMA - Chấm KPI",
      },
      {
        path: "cong-viec-thong-minh",
        loadComponent: () => import("./app/placeholder-pages/placeholder-pages.component").then((m) => m.CongViecThongMinhComponent),
        title: "UPHARMA - Công Việc Thông Minh",
      },
      {
        path: "check",
        loadComponent: () => import("./app/placeholder-pages/placeholder-pages.component").then((m) => m.CheckComponent),
        title: "UPHARMA - Check",
      },
      {
        path: "xuat-bao-cao",
        loadComponent: () => import("./app/report-config/report-config.component").then((m) => m.ReportConfigComponent),
        title: "UPHARMA - Báo cáo vận hành",
      },
      {
        path: "ton-kho",
        loadComponent: () => import("./app/inventory-new/inventory-new.component").then((m) => m.InventoryNewComponent),
        title: "UPHARMA - Tồn kho",
      },
      {
        path: "fefo",
        loadComponent: () => import("./app/fefo/fefo.component").then((m) => m.FefoComponent),
        title: "UPHARMA - Kiểm tra FEFO",
      },
      {
        path: "ton-kho-new",
        redirectTo: "ton-kho",
        pathMatch: "full",
      },
      {
        path: "check-inventory-test",
        loadComponent: () => import("./app/check-inventory-test/check-inventory-test.component").then((m) => m.CheckInventoryTestComponent),
        title: "UPHARMA - Test Kiểm kho",
      },
      {
        path: "inventory-system-test",
        loadComponent: () => import("./app/inventory-system-test/inventory-system-test.component").then((m) => m.InventorySystemTestComponent),
        title: "UPHARMA - Test Hệ thống tồn kho",
      },
      {
        path: "inventory-expiration-test",
        loadComponent: () => import("./app/inventory-expiration-test/inventory-expiration-test.component").then((m) => m.InventoryExpirationTestComponent),
        title: "UPHARMA - Test Hạn dùng",
      },
      {
        path: "lay-bao-cao-don-hang",
        loadComponent: () => import("./app/sales-invoice-report/sales-invoice-report.component").then((m) => m.SalesInvoiceReportComponent),
        title: "UPHARMA - Báo cáo đơn hàng",
      },
      {
        path: "out-of-stock",
        loadComponent: () => import("./app/out-of-stock/out-of-stock.component").then((m) => m.OutOfStockComponent),
        title: "UPHARMA - Hàng đã hết",
      },
      {
        path: "hang-da-het",
        loadComponent: () => import("./app/out-of-stock/out-of-stock.component").then((m) => m.OutOfStockComponent),
        title: "UPHARMA - Hàng đã hết",
      },
      {
        path: "ton-kho-toan-quoc",
        loadComponent: () => import("./app/national-stock/national-stock.component").then((m) => m.NationalStockComponent),
        title: "UPHARMA - Tồn kho toàn quốc",
      },
    ],
  },
  {
    path: "**",
    redirectTo: "dashboard",
  },
];

bootstrapApplication(RootComponent, {
  providers: [provideRouter(routes, withPreloading(PreloadAllModules), withHashLocation())],
}).catch((error) => console.error(error));
