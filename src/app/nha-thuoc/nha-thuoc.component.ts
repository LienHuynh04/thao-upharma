import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UpharmaService, ShopPlanApiItem } from '../upharma.service';

export interface ShopListItem {
  province: 'ĐÀ' | 'HU';
  code: string;
  nameAddress: string;
  phone: string;
  openDate: string;
  age: string;
  currentPhase: string;
  targetDsHhs: string;
  gpp: string;
}

@Component({
  selector: 'app-nha-thuoc',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container p-3 p-md-4">
      <!-- Loading Indicator -->
      <div *ngIf="isLoading" class="alert d-flex align-items-center gap-2 mb-3 rounded-3 shadow-sm" style="background-color: #e8f5e9; border: 1px solid #c8e6c9; color: #0d472b; font-size: 13px;">
        <span class="spinner-border spinner-border-sm"></span>
        <span class="fw-bold">Đang tải dữ liệu nhà thuốc từ Upharma API...</span>
      </div>

      <!-- Section Heading -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fs-4 fw-extrabold m-0" style="color: #111827; font-weight: 800;">Danh sách nhà thuốc</h2>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-success btn-sm fw-bold px-3 py-2 rounded-3 shadow-sm d-flex align-items-center gap-1" style="border-color: #10b981; color: #10b981; background: #fff;">
            <span>📥</span> Import Excel
          </button>
          <button class="btn btn-success btn-sm fw-bold px-3 py-2 rounded-3 shadow-sm d-flex align-items-center gap-1" style="background-color: #0d472b; border-color: #0d472b;">
            <span>+</span> Thêm nhà thuốc
          </button>
        </div>
      </div>

      @if (loadError) {
        <div class="alert alert-danger mb-3" role="alert">{{ loadError }}</div>
      }

      <!-- Main Data Table Card -->
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden" style="background-color: #ffffff; border: 1px solid #e2e8f0 !important;">
        <div class="table-responsive">
          <table class="table table-hover align-middle m-0 pharmacy-table" style="font-size: 13px;">
            <colgroup>
              <col class="province-column">
              <col class="code-column">
              <col class="address-column">
              <col class="phone-column">
              <col class="open-date-column">
              <col class="age-column">
              <col class="phase-column">
              <col class="target-column">
              <col class="gpp-column">
              <col class="actions-column">
            </colgroup>
            <thead style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <tr>
                <th class="py-3 px-2 text-secondary fw-bold text-center" style="width: 45px;">KV</th>
                <th class="py-3 px-2 text-secondary fw-bold" style="width: 85px;">Mã</th>
                <th class="py-3 px-3 text-secondary fw-bold address-col">Địa chỉ</th>
                <th class="py-3 px-2 text-secondary fw-bold text-center" style="width: 100px;">SĐT</th>
                <th class="py-3 px-2 text-secondary fw-bold text-center" style="width: 105px;">Ngày mở bán</th>
                <th class="py-3 px-2 text-secondary fw-bold text-center" style="width: 75px;">Tuổi</th>
                <th class="py-3 px-2 text-secondary fw-bold text-center" style="width: 140px;">Giai đoạn hiện tại</th>
                <th class="py-3 px-2 text-secondary fw-bold text-center" style="width: 130px;">Target DS/HHS (tr)</th>
                <th class="py-3 px-2 text-secondary fw-bold text-center" style="width: 60px;">GPP</th>
                <th class="py-3 px-2 text-secondary fw-bold text-center" style="width: 75px;"></th>
              </tr>
            </thead>
            <tbody>
              @if (isLoading) {
                <tr><td colspan="10" class="text-center text-secondary py-4">Đang tải danh sách nhà thuốc...</td></tr>
              } @else if (shops.length === 0) {
                <tr><td colspan="10" class="text-center text-secondary py-4">Không có dữ liệu nhà thuốc.</td></tr>
              } @else {
                @for (shop of shops; track shop.code) {
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td class="px-2 text-center">
                    <span class="badge px-2 py-1" [style.background-color]="shop.province === 'ĐÀ' ? '#e0e7ff' : '#f3e8ff'" [style.color]="shop.province === 'ĐÀ' ? '#4338ca' : '#7e22ce'" style="font-weight: 700; font-size: 11px;">
                      {{ shop.province }}
                    </span>
                  </td>
                  <td class="px-2 fw-bold text-dark text-nowrap" style="white-space: nowrap !important;">{{ shop.code }}</td>
                  <td class="px-3 fw-semibold text-dark address-col" style="white-space: normal !important; word-break: break-word; line-height: 1.4;">{{ cleanAddress(shop.nameAddress) }}</td>
                  <td class="px-2 text-center text-muted text-nowrap" style="white-space: nowrap !important;">{{ shop.phone || '—' }}</td>
                  <td class="px-2 text-center text-muted text-nowrap" style="white-space: nowrap !important;">{{ shop.openDate || '—' }}</td>
                  <td class="px-2 text-center text-muted text-nowrap" style="white-space: nowrap !important;">{{ shop.age || '—' }}</td>
                  <td class="px-2 text-center text-muted text-nowrap" style="white-space: nowrap !important;">{{ shop.currentPhase || '—' }}</td>
                  <td class="px-2 text-center fw-bold text-dark text-nowrap" style="white-space: nowrap !important;">{{ shop.targetDsHhs }}</td>
                  <td class="px-2 text-center text-nowrap" style="white-space: nowrap !important;">
                    @if (shop.gpp === 'Chưa' || shop.gpp === 'Chưa có GPP') {
                      <span class="badge px-2 py-1 bg-secondary-subtle text-secondary fw-bold" style="font-size: 11px;">Chưa</span>
                    } @else {
                      <span class="badge px-2 py-1 bg-success-subtle text-success fw-bold" style="font-size: 11px;">Đạt</span>
                    }
                  </td>
                  <td class="px-2 text-center text-nowrap" style="white-space: nowrap !important;">
                    <div class="d-flex justify-content-center gap-2" style="font-size: 12px; font-weight: 700;">
                      <a href="javascript:void(0)" class="text-decoration-none" style="color: #059669;">Sửa</a>
                      <a href="javascript:void(0)" class="text-decoration-none" style="color: #ef4444;">Xoá</a>
                    </div>
                  </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background-color: #f8fafc;
      min-height: 100vh;
      font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    :host .table-responsive > .pharmacy-table {
      width: 1400px !important;
      min-width: 1400px !important;
      table-layout: fixed !important;
    }

    .pharmacy-table .province-column { width: 55px; }
    .pharmacy-table .code-column { width: 110px; }
    .pharmacy-table .address-column { width: 380px; }
    .pharmacy-table .phone-column { width: 125px; }
    .pharmacy-table .open-date-column { width: 140px; }
    .pharmacy-table .age-column { width: 90px; }
    .pharmacy-table .phase-column { width: 190px; }
    .pharmacy-table .target-column { width: 155px; }
    .pharmacy-table .gpp-column { width: 75px; }
    .pharmacy-table .actions-column { width: 80px; }

    .pharmacy-table th.address-col,
    .pharmacy-table td.address-col {
      width: 380px !important;
      min-width: 380px !important;
    }
  `]
})
export class NhaThuocComponent implements OnInit {
  isLoading = false;
  loadError = '';

  private readonly shopCatalog: ShopListItem[] = [
    { province: 'ĐÀ', code: 'SHOP0010', nameAddress: 'Nhà thuốc số 10 - 194 Thái Thị Bôi - Đà Nẵng', phone: '', openDate: '15/03/2021', age: '67 tháng', currentPhase: 'Giai đoạn 3 (Ổn định)', targetDsHhs: '0.0 / 0.0', gpp: 'Đạt GPP' },
    { province: 'ĐÀ', code: 'SHOP0022', nameAddress: 'Nhà thuốc số 22 - 410 Hoàng Diệu - Đà Nẵng', phone: '', openDate: '01/08/2021', age: '62 tháng', currentPhase: 'Giai đoạn 3 (Ổn định)', targetDsHhs: '0.0 / 0.0', gpp: 'Đạt GPP' },
    { province: 'ĐÀ', code: 'SHOP0025', nameAddress: 'Nhà thuốc số 25 - 170 Lê Đình Lý - Thanh Khê - Đà Nẵng', phone: '', openDate: '10/12/2021', age: '58 tháng', currentPhase: 'Giai đoạn 3 (Ổn định)', targetDsHhs: '0.0 / 0.0', gpp: 'Đạt GPP' },
    { province: 'ĐÀ', code: 'SHOP0040', nameAddress: 'Nhà thuốc số 40 - 537B Núi Thành - Hoà Cường - Đà Nẵng', phone: '', openDate: '05/04/2022', age: '54 tháng', currentPhase: 'Giai đoạn 2 (Tăng trưởng)', targetDsHhs: '0.0 / 0.0', gpp: 'Đạt GPP' },
    { province: 'ĐÀ', code: 'SHOP0043', nameAddress: 'Nhà thuốc số 43 - 1 Vũ Lăng - An Khê - ĐN', phone: '', openDate: '20/09/2022', age: '49 tháng', currentPhase: 'Giai đoạn 2 (Tăng trưởng)', targetDsHhs: '0.0 / 0.0', gpp: 'Đạt GPP' },
    { province: 'ĐÀ', code: 'SHOP0046', nameAddress: 'Nhà thuốc số 46 - Khu phố chợ Túy Loan - Hòa Vang - ĐN', phone: '', openDate: '12/01/2023', age: '45 tháng', currentPhase: 'Giai đoạn 2 (Tăng trưởng)', targetDsHhs: '0.0 / 0.0', gpp: 'Đạt GPP' },
    { province: 'ĐÀ', code: 'SHOP0097', nameAddress: 'Nhà thuốc số 97 - 44 Nguyễn Lương Bằng, Liên Chiểu, Đà Nẵng', phone: '', openDate: '18/06/2023', age: '40 tháng', currentPhase: 'Giai đoạn 2 (Tăng trưởng)', targetDsHhs: '0.0 / 0.0', gpp: 'Đạt GPP' },
    { province: 'HU', code: 'SHOP0119', nameAddress: 'Nhà thuốc số 119 - 290 Phan Bội Châu, Phường Thuận Hoá, Thành phố Huế', phone: '', openDate: '01/11/2023', age: '35 tháng', currentPhase: 'Giai đoạn 1 (Thâm nhập)', targetDsHhs: '0.0 / 0.0', gpp: 'Đạt GPP' },
    { province: 'HU', code: 'SHOP0120', nameAddress: 'Nhà thuốc số 120 - Thôn 3, Xã Phú Vinh, Thành phố Huế', phone: '', openDate: '15/03/2024', age: '31 tháng', currentPhase: 'Giai đoạn 1 (Thâm nhập)', targetDsHhs: '0.0 / 0.0', gpp: 'Đạt GPP' },
    { province: 'HU', code: 'SHOP0133', nameAddress: 'Nhà thuốc số 133 - 42 Nguyễn Công Trứ, phường Thuận Hóa, thành phố Huế', phone: '', openDate: '10/08/2024', age: '26 tháng', currentPhase: 'Giai đoạn 1 (Thâm nhập)', targetDsHhs: '0.0 / 0.0', gpp: 'Đạt GPP' },
    { province: 'ĐÀ', code: 'SHOP0144', nameAddress: 'Nhà thuốc số 144 - 77-79 Lê Văn Hiến, Phường Ngũ Hành Sơn, Đà Nẵng', phone: '', openDate: '01/01/2025', age: '21 tháng', currentPhase: 'Giai đoạn 1 (Khởi tạo)', targetDsHhs: '0.0 / 0.0', gpp: 'Chưa có GPP' },
  ];
  shops: ShopListItem[] = [];

  constructor(
    private upharma: UpharmaService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.loadShopsData();
  }

  async loadShopsData() {
    this.isLoading = true;
    this.loadError = '';
    this.shops = [];
    try {
      const session = this.upharma.ensureLogin();
      const timeStart = '2026-10-01 00:00:00';
      const timeEnd = '2026-10-31 23:59:59';

      const shopPlansMap = new Map<string, ShopPlanApiItem[]>();
      const userShopMap = new Map<string, any>();

      await Promise.all(
        this.shopCatalog.map(async (shop) => {
          try {
            const res = await this.upharma.callEndpoint<any>('/ShopPlan/GetShopPlanByTime', {
              TimeStart: timeStart,
              TimeEnd: timeEnd,
              ShopCode: shop.code,
              Token: session.Token,
              uPharmaID: String(session.UserInfo.uPharmaID),
            });

            if (res && Array.isArray(res.ShopPlanLst) && res.ShopPlanLst.length > 0) {
              shopPlansMap.set(shop.code, res.ShopPlanLst);
            }
          } catch (e) {
            console.warn(`Failed to fetch shop plan for ${shop.code}`);
          }
        })
      );

      // 1. Fetch User Info & Shop List
      try {
        const userInfoRes = await this.upharma.callEndpoint<any>('/User/GetUserInfoByID', {
          uPharmaID: session.UserInfo.uPharmaID,
          Token: session.Token,
        });
        if (userInfoRes && userInfoRes.UserInfo && Array.isArray(userInfoRes.UserInfo.ShopLst)) {
          userInfoRes.UserInfo.ShopLst.forEach((s: any) => userShopMap.set(s.ShopCode, s));
        }
      } catch (e) {
        console.warn('GetUserInfoByID call optional');
      }

      // 2. Fetch Shop Groups
      try {
        await this.upharma.callEndpoint<any>('/ShopGroup/GetGShopLst', {
          Token: session.Token,
          uPharmaID: String(session.UserInfo.uPharmaID),
        });
      } catch (e) {
        console.warn('GetGShopLst call optional');
      }

      this.shops = this.shopCatalog.map(shop => {
        const plans = shopPlansMap.get(shop.code) || [];
        const userShop = userShopMap.get(shop.code);

        let targetDs = 0;
        let targetHhs = 0;

        plans.forEach(p => {
          targetDs += Number(p.Amount) || 0;
          targetHhs += Number(p.PointSales01 || p.QuantityHHS) || 0;
        });

        const dsTr = targetDs > 0 ? (targetDs / 1000000).toFixed(1) : '0.0';
        const hhsTr = targetHhs > 0 ? (targetHhs / 1000000).toFixed(1) : '0.0';

        const phone = userShop?.PhoneNumber || shop.phone || '';
        const shopName = String(userShop?.ShopName || shop.nameAddress);
        const shopAddress = String(userShop?.ShopAddress || '');
        const nameAddress = shopAddress
          ? (shopName.includes(shopAddress) ? shopName : `${shopName} - ${shopAddress}`)
          : shop.nameAddress;

        return {
          ...shop,
          nameAddress,
          phone,
          targetDsHhs: `${dsTr} / ${hhsTr}`
        };
      });

    } catch (err) {
      console.error('Error loading shops data from API:', err);
      this.loadError = 'Không tải được danh sách nhà thuốc. Vui lòng thử lại.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  cleanAddress(addr: string): string {
    if (!addr) return '—';
    return addr.replace(/^Nhà\s+thuốc\s+số\s+\d+\s*-\s*/i, '').trim();
  }
}
