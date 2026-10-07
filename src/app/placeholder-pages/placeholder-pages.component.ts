import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-under-construction',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-4 d-flex flex-column align-items-center justify-content-center text-center" style="min-height: 70vh;">
      <div class="card p-5 border-0 shadow-sm rounded-4 w-100" style="background-color: #ffffff; border: 1px solid #e2e8f0 !important; max-width: 520px;">
        <div class="display-3 mb-3">{{ icon }}</div>
        <h2 class="fw-extrabold text-dark mb-2" style="font-weight: 800; font-size: 24px; color: #111827;">{{ pageTitle }}</h2>
        <div class="badge fs-6 fw-bold px-3 py-2 rounded-pill mb-3" style="background-color: #e8f5e9 !important; color: #0d472b !important; border: 1px solid #c8e6c9; display: inline-block;">
          ⚙️ Đang làm
        </div>
        <p class="text-secondary fs-6 mb-4" style="color: #6b7280; font-size: 14px;">
          Trang <strong>{{ pageTitle }}</strong> đang được đội ngũ kỹ thuật phát triển và sẽ cập nhật trong thời gian sớm nhất.
        </p>
        <div>
          <a routerLink="/dashboard" class="btn fw-bold px-4 py-2 rounded-3 shadow-sm text-white" style="background-color: #0d472b; border-color: #0d472b; font-size: 14px;">
            « Quay về Tổng Quan
          </a>
        </div>
      </div>
    </div>
  `
})
export class PageUnderConstructionComponent {
  @Input() pageTitle = 'Trang';
  @Input() icon = '⚙️';
}

// 1. Nhà Thuốc
@Component({
  selector: 'app-nha-thuoc',
  standalone: true,
  imports: [PageUnderConstructionComponent],
  template: `<app-page-under-construction pageTitle="Nhà Thuốc" icon="🏪"></app-page-under-construction>`
})
export class NhaThuocComponent {}

// 2. Nhân Sự
@Component({
  selector: 'app-nhan-su',
  standalone: true,
  imports: [PageUnderConstructionComponent],
  template: `<app-page-under-construction pageTitle="Nhân Sự" icon="👥"></app-page-under-construction>`
})
export class NhanSuComponent {}

// 3. OKR
@Component({
  selector: 'app-okr',
  standalone: true,
  imports: [PageUnderConstructionComponent],
  template: `<app-page-under-construction pageTitle="OKR" icon="🎯"></app-page-under-construction>`
})
export class OkrComponent {}

// 4. Khuyến Mãi
@Component({
  selector: 'app-khuyen-mai',
  standalone: true,
  imports: [PageUnderConstructionComponent],
  template: `<app-page-under-construction pageTitle="Khuyến Mãi" icon="🎁"></app-page-under-construction>`
})
export class KhuyenMaiComponent {}

// 5. Báo Cáo NV
@Component({
  selector: 'app-bao-cao-nv',
  standalone: true,
  imports: [PageUnderConstructionComponent],
  template: `<app-page-under-construction pageTitle="Báo Cáo NV" icon="📝"></app-page-under-construction>`
})
export class BaoCaoNvComponent {}

// 6. Báo Cáo
@Component({
  selector: 'app-bao-cao',
  standalone: true,
  imports: [PageUnderConstructionComponent],
  template: `<app-page-under-construction pageTitle="Báo Cáo" icon="📊"></app-page-under-construction>`
})
export class BaoCaoComponent {}

// 7. Chỉ Tiêu
@Component({
  selector: 'app-chi-tieu',
  standalone: true,
  imports: [PageUnderConstructionComponent],
  template: `<app-page-under-construction pageTitle="Chỉ Tiêu" icon="📌"></app-page-under-construction>`
})
export class ChiTieuComponent {}

// 8. Hiệu Suất
@Component({
  selector: 'app-hieu-suat',
  standalone: true,
  imports: [PageUnderConstructionComponent],
  template: `<app-page-under-construction pageTitle="Hiệu Suất" icon="📈"></app-page-under-construction>`
})
export class HieuSuatComponent {}

// 9. Khách Hàng
@Component({
  selector: 'app-khach-hang',
  standalone: true,
  imports: [PageUnderConstructionComponent],
  template: `<app-page-under-construction pageTitle="Khách Hàng" icon="👤"></app-page-under-construction>`
})
export class KhachHangComponent {}

// 10. Nhập Doanh Số
@Component({
  selector: 'app-nhap-doanh-so',
  standalone: true,
  imports: [PageUnderConstructionComponent],
  template: `<app-page-under-construction pageTitle="Nhập Doanh Số" icon="➕"></app-page-under-construction>`
})
export class NhapDoanhSoComponent {}

// 11. Hàng Hoá
@Component({
  selector: 'app-hang-hoa',
  standalone: true,
  imports: [PageUnderConstructionComponent],
  template: `<app-page-under-construction pageTitle="Hàng Hoá" icon="📦"></app-page-under-construction>`
})
export class HangHoaComponent {}

// 12. Wrong FEFO
@Component({
  selector: 'app-wrong-fefo',
  standalone: true,
  imports: [PageUnderConstructionComponent],
  template: `<app-page-under-construction pageTitle="Wrong FEFO" icon="⚠️"></app-page-under-construction>`
})
export class WrongFefoComponent {}

// 13. Hàng Không Có
@Component({
  selector: 'app-hang-khong-co',
  standalone: true,
  imports: [PageUnderConstructionComponent],
  template: `<app-page-under-construction pageTitle="Hàng Không Có" icon="🛒"></app-page-under-construction>`
})
export class HangKhongCoComponent {}

// 14. Đánh Giá AI
@Component({
  selector: 'app-danh-gia-ai',
  standalone: true,
  imports: [PageUnderConstructionComponent],
  template: `<app-page-under-construction pageTitle="Đánh Giá AI" icon="✨"></app-page-under-construction>`
})
export class DanhGiaAiComponent {}

// 15. Chấm KPI
@Component({
  selector: 'app-cham-kpi',
  standalone: true,
  imports: [PageUnderConstructionComponent],
  template: `<app-page-under-construction pageTitle="Chấm KPI" icon="✅"></app-page-under-construction>`
})
export class ChamKpiComponent {}

// 16. Công Việc Thông Minh
@Component({
  selector: 'app-cong-viec-thong-minh',
  standalone: true,
  imports: [PageUnderConstructionComponent],
  template: `<app-page-under-construction pageTitle="Công Việc Thông Minh" icon="📋"></app-page-under-construction>`
})
export class CongViecThongMinhComponent {}

// 17. Check
@Component({
  selector: 'app-check',
  standalone: true,
  imports: [PageUnderConstructionComponent],
  template: `<app-page-under-construction pageTitle="Check" icon="☑️"></app-page-under-construction>`
})
export class CheckComponent {}
