import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UpharmaService, ShopPlanApiItem } from '../upharma.service';
import { environment } from '../../environments/environment';

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
      <div *ngIf="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5" style="min-height: 50vh;">
        <div class="spinner-border text-success mb-3" style="width: 2.5rem; height: 2.5rem; color: #0d472b !important;" role="status"></div>
        <div class="fw-bold text-dark fs-5">Đang tải dữ liệu nhà thuốc...</div>
      </div>

      <!-- Section Heading -->
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3" *ngIf="!isLoading">
        <div>
          <h2 class="fs-4 fw-extrabold m-0" style="color: #111827; font-weight: 800;">Danh sách nhà thuốc</h2>
          <span class="text-muted" style="font-size: 12px;">Hệ thống nhà thuốc Upharma được phân quyền quản lý</span>
        </div>

        <!-- Tabs: Đang hiển thị / Đã ẩn -->
        <div class="d-flex align-items-center gap-2 p-1 bg-white rounded-pill border shadow-sm">
          <button
            type="button"
            class="btn btn-sm rounded-pill fw-bold px-3 py-1 d-inline-flex align-items-center gap-2 border-0 transition-all"
            [style.background-color]="activeTab === 'active' ? '#0d472b' : 'transparent'"
            [style.color]="activeTab === 'active' ? '#ffffff' : '#64748b'"
            (click)="activeTab = 'active'"
          >
            <span>Đang hiển thị</span>
            <span
              class="badge rounded-pill"
              [style.background-color]="activeTab === 'active' ? '#10b981' : '#e2e8f0'"
              [style.color]="activeTab === 'active' ? '#ffffff' : '#475569'"
            >{{ activeShops.length }}</span>
          </button>

          <button
            type="button"
            class="btn btn-sm rounded-pill fw-bold px-3 py-1 d-inline-flex align-items-center gap-2 border-0 transition-all"
            [style.background-color]="activeTab === 'hidden' ? '#0d472b' : 'transparent'"
            [style.color]="activeTab === 'hidden' ? '#ffffff' : '#64748b'"
            (click)="activeTab = 'hidden'"
          >
            <span>Đã ẩn</span>
            <span
              class="badge rounded-pill"
              [style.background-color]="activeTab === 'hidden' ? '#ef4444' : '#e2e8f0'"
              [style.color]="activeTab === 'hidden' ? '#ffffff' : '#475569'"
            >{{ hiddenShops.length }}</span>
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
                <th class="py-3 px-2 text-secondary fw-bold text-center">KV</th>
                <th class="py-3 px-2 text-secondary fw-bold">Mã</th>
                <th class="py-3 px-3 text-secondary fw-bold address-col">Địa chỉ</th>
                <th class="py-3 px-2 text-secondary fw-bold text-center">SĐT</th>
                <th class="py-3 px-2 text-secondary fw-bold text-center">Ngày mở bán</th>
                <th class="py-3 px-2 text-secondary fw-bold text-center">Tuổi</th>
                <th class="py-3 px-2 text-secondary fw-bold text-center">Giai đoạn hiện tại</th>
                <th class="py-3 px-2 text-secondary fw-bold text-center">Target DS/HHS (tr)</th>
                <th class="py-3 px-2 text-secondary fw-bold text-center">GPP</th>
                <th class="py-3 px-2 text-secondary fw-bold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              @if (isLoading) {
                <tr><td colspan="10" class="text-center text-secondary py-4">Đang tải danh sách nhà thuốc...</td></tr>
              } @else if (displayedShops.length === 0) {
                <tr>
                  <td colspan="10" class="text-center text-secondary py-5">
                    <div class="d-flex flex-column align-items-center justify-content-center">
                      <span class="fs-1 mb-2">{{ activeTab === 'active' ? '🏥' : '👁️‍🗨️' }}</span>
                      <span class="fw-semibold">{{ activeTab === 'active' ? 'Không có nhà thuốc nào đang hiển thị.' : 'Chưa có nhà thuốc nào bị ẩn.' }}</span>
                    </div>
                  </td>
                </tr>
              } @else {
                @for (shop of displayedShops; track shop.code) {
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
                    @if (activeTab === 'active') {
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-secondary px-2 py-1 fw-bold rounded-2 d-inline-flex align-items-center gap-1 shadow-2xs"
                        style="font-size: 11.5px;"
                        [disabled]="isUpdatingShopCode === shop.code"
                        (click)="hideShop(shop)"
                        title="Ẩn nhà thuốc này"
                      >
                        <span *ngIf="isUpdatingShopCode !== shop.code">👁️‍🗨️</span>
                        <span *ngIf="isUpdatingShopCode === shop.code" class="spinner-border spinner-border-sm" role="status"></span>
                        Ẩn
                      </button>
                    } @else {
                      <button
                        type="button"
                        class="btn btn-sm btn-success px-2 py-1 fw-bold rounded-2 text-white d-inline-flex align-items-center gap-1 shadow-2xs"
                        style="font-size: 11.5px; background-color: #0d472b; border-color: #0d472b;"
                        [disabled]="isUpdatingShopCode === shop.code"
                        (click)="unhideShop(shop)"
                        title="Khôi phục hiển thị nhà thuốc này"
                      >
                        <span *ngIf="isUpdatingShopCode !== shop.code">👁️</span>
                        <span *ngIf="isUpdatingShopCode === shop.code" class="spinner-border spinner-border-sm" role="status"></span>
                        Hiện lại
                      </button>
                    }
                  </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
      <div class="text-secondary fw-semibold ps-1 mt-2" style="font-size: 13px; color: #6b7280;" *ngIf="!isLoading">
        Tổng số: {{ displayedShops.length }} nhà thuốc {{ activeTab === 'active' ? 'đang hiển thị' : 'đã ẩn' }} (Tổng cộng: {{ shops.length }} nhà thuốc)
      </div>

      <!-- Toast thông báo -->
      <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1090;" *ngIf="toastMessage">
        <div class="toast show align-items-center text-white bg-success border-0 shadow-lg rounded-3" role="alert">
          <div class="d-flex">
            <div class="toast-body fw-bold d-flex align-items-center gap-2">
              <span>✓</span> {{ toastMessage }}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" (click)="toastMessage = ''"></button>
          </div>
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
      width: 100% !important;
      min-width: 1100px !important;
    }

    .pharmacy-table .province-column { width: 55px; }
    .pharmacy-table .code-column { width: 105px; }
    .pharmacy-table .address-column { width: auto; }
    .pharmacy-table .phone-column { width: 120px; }
    .pharmacy-table .open-date-column { width: 120px; }
    .pharmacy-table .age-column { width: 85px; }
    .pharmacy-table .phase-column { width: 170px; }
    .pharmacy-table .target-column { width: 145px; }
    .pharmacy-table .gpp-column { width: 75px; }
    .pharmacy-table .actions-column { width: 95px; }

    .pharmacy-table th.address-col,
    .pharmacy-table td.address-col {
      min-width: 250px !important;
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
  activeTab: 'active' | 'hidden' = 'active';
  hiddenShopCodes = new Set<string>();
  isUpdatingShopCode = '';
  toastMessage = '';
  private toastTimer: any = null;

  get activeShops(): ShopListItem[] {
    return this.shops.filter(s => !this.hiddenShopCodes.has(s.code));
  }

  get hiddenShops(): ShopListItem[] {
    return this.shops.filter(s => this.hiddenShopCodes.has(s.code));
  }

  get displayedShops(): ShopListItem[] {
    return this.activeTab === 'active' ? this.activeShops : this.hiddenShops;
  }

  constructor(
    private upharma: UpharmaService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await Promise.all([
      this.loadShopsData(),
      this.loadHiddenShops()
    ]);
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

  private get uPharmaID(): string {
    const session = this.upharma.getSession();
    const id = session?.UserInfo?.uPharmaID;
    if (id !== undefined && id !== null && String(id).trim() !== '') {
      return String(id).replace(/[.#$\[\]\/]/g, '_');
    }
    return 'default_user';
  }

  private get storageKey(): string {
    return `upharma_hidden_shops_${this.uPharmaID}`;
  }

  private getLocalStorageHidden(): Set<string> {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? new Set(JSON.parse(data)) : new Set();
    } catch {
      return new Set();
    }
  }

  private saveLocalStorageHidden(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify([...this.hiddenShopCodes]));
    } catch {}
  }

  async loadHiddenShops(): Promise<void> {
    // 1. Tải ngay từ localStorage để hiển thị tức thì
    this.hiddenShopCodes = this.getLocalStorageHidden();

    // 2. Đồng bộ với Firebase
    try {
      const url = `${environment.firebaseDbUrl}/hidden_shops/${this.uPharmaID}.json`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          const remoteCodes = Object.keys(data);
          for (const c of remoteCodes) {
            this.hiddenShopCodes.add(c);
          }
          this.saveLocalStorageHidden();
        }
      }
    } catch (e) {
      console.warn('Lỗi khi tải danh sách nhà thuốc ẩn từ Firebase:', e);
    } finally {
      this.cdr.detectChanges();
    }
  }

  async hideShop(shop: ShopListItem): Promise<void> {
    this.isUpdatingShopCode = shop.code;
    // Cập nhật giao diện tức thì
    this.hiddenShopCodes.add(shop.code);
    this.saveLocalStorageHidden();
    this.showToast(`Đã ẩn nhà thuốc ${shop.code} thành công.`);
    this.cdr.detectChanges();

    // Đồng bộ lên Firebase
    try {
      const url = `${environment.firebaseDbUrl}/hidden_shops/${this.uPharmaID}/${shop.code}.json`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hidden: true,
          shopCode: shop.code,
          nameAddress: shop.nameAddress,
          updatedAt: new Date().toISOString()
        })
      });
      if (!res.ok) {
        console.warn(`[Firebase] Không thể ghi trạng thái ẩn (HTTP ${res.status}), đã lưu offline.`);
      }
    } catch (e) {
      console.warn(`[Firebase] Lỗi mạng khi ẩn nhà thuốc ${shop.code}, đã lưu offline:`, e);
    } finally {
      this.isUpdatingShopCode = '';
      this.cdr.detectChanges();
    }
  }

  async unhideShop(shop: ShopListItem): Promise<void> {
    this.isUpdatingShopCode = shop.code;
    // Cập nhật giao diện tức thì
    this.hiddenShopCodes.delete(shop.code);
    this.saveLocalStorageHidden();
    this.showToast(`Đã khôi phục hiển thị nhà thuốc ${shop.code} thành công.`);
    this.cdr.detectChanges();

    // Đồng bộ lên Firebase
    try {
      const url = `${environment.firebaseDbUrl}/hidden_shops/${this.uPharmaID}/${shop.code}.json`;
      const res = await fetch(url, {
        method: 'DELETE'
      });
      if (!res.ok) {
        console.warn(`[Firebase] Không thể xóa trạng thái ẩn (HTTP ${res.status}), đã lưu offline.`);
      }
    } catch (e) {
      console.warn(`[Firebase] Lỗi mạng khi khôi phục nhà thuốc ${shop.code}, đã lưu offline:`, e);
    } finally {
      this.isUpdatingShopCode = '';
      this.cdr.detectChanges();
    }
  }

  showToast(msg: string): void {
    this.toastMessage = msg;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastMessage = '';
      this.cdr.detectChanges();
    }, 3000);
  }
}
