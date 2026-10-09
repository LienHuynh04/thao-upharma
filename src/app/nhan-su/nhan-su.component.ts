import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShopInfo, UpharmaService } from '../upharma.service';
import { environment } from '../../environments/environment';

export interface EmployeeListItem {
  id?: string;
  code: string;
  name: string;
  role: string;
  shopCode: string;
  province: string;
  startDate: string;
  resigned: string;
}

@Component({
  selector: 'app-nhan-su',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container p-3 p-md-4">
      <!-- Section Heading -->
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 class="fs-4 fw-extrabold m-0" style="color: #111827; font-weight: 800;">Nhân sự</h2>
          <span class="text-muted" style="font-size: 12px;">Quản lý hồ sơ nhân sự & Cán bộ quản lý Upharma</span>
        </div>
        <div class="d-flex flex-wrap gap-2 align-items-center">
          <!-- Tabs: Đang hiển thị / Đã ẩn -->
          <div class="d-flex align-items-center gap-1 p-1 bg-white rounded-pill border shadow-sm">
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
              >{{ activeFilteredEmployees.length }}</span>
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
              >{{ hiddenFilteredEmployees.length }}</span>
            </button>
          </div>

          <!-- Filter by Shop Dropdown -->
          <select
            class="form-select form-select-sm rounded-3 border-secondary-subtle fw-bold"
            style="width: 180px; height: 35px;"
            [(ngModel)]="filterShopCode"
            (change)="onFilterShopChange()"
          >
            <option value="">Tất cả nhà thuốc</option>
            @for (shop of managedShops; track shop.ShopCode) {
              <option [value]="shop.ShopCode">{{ shop.ShopCode }} — {{ shop.ShopName }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Manager Profile Header Banner -->
      @if (managerUser) {
        <div class="card border-0 shadow-sm rounded-4 p-3 mb-4" style="background: linear-gradient(135deg, #0d472b, #1b633f); color: #fff;">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div class="d-flex align-items-center gap-3">
              <div class="rounded-circle bg-white text-dark d-flex align-items-center justify-content-center fw-bold shadow-sm" style="width: 48px; height: 48px; font-size: 20px; color: #0d472b !important;">
                👤
              </div>
              <div>
                <div class="d-flex align-items-center gap-2">
                  <h4 class="m-0 fw-bold fs-5 text-white">{{ managerUser.name }}</h4>
                  <span class="badge bg-warning text-dark fw-bold px-2 py-1" style="font-size: 11px;">{{ managerUser.role }}</span>
                </div>
                <div class="text-white-50 small mt-1">
                  <span>📱 {{ managerUser.phone }}</span> ·
                  <span>✉️ {{ managerUser.email }}</span> ·
                  <span>🏪 Quản lý {{ managerUser.shopCount }} Nhà thuốc</span>
                </div>
              </div>
            </div>
            <div class="text-end">
              <span class="badge bg-light text-dark fw-bold px-3 py-2" style="font-size: 12px;">Cấp Quản Lý Hệ Thống</span>
            </div>
          </div>
        </div>
      }

      @if (loadError) {
        <div class="alert alert-danger mb-3 d-flex justify-content-between align-items-center gap-2" role="alert">
          <span>{{ loadError }}</span>
          <button type="button" class="btn btn-sm btn-outline-danger text-nowrap" (click)="retryLoadEmployees()" [disabled]="isLoading">Thử tải lại</button>
        </div>
      }

      <!-- KPI Summary Cards -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white" style="border: 1px solid #e2e8f0 !important;">
            <div class="text-secondary small fw-semibold text-uppercase" style="font-size: 11px;">Tổng nhân viên</div>
            <div class="fs-4 fw-extrabold text-dark mt-1">{{ activeDisplayedEmployeeCount }} <span class="fs-6 text-muted fw-normal">người</span></div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white" style="border: 1px solid #e2e8f0 !important;">
            <div class="text-secondary small fw-semibold text-uppercase" style="font-size: 11px;">Cửa hàng trưởng (CHT)</div>
            <div class="fs-4 fw-extrabold mt-1" style="color: #0284c7 !important;">{{ chtCount }} <span class="fs-6 text-muted fw-normal">người</span></div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white" style="border: 1px solid #e2e8f0 !important;">
            <div class="text-secondary small fw-semibold text-uppercase" style="font-size: 11px;">Nhân viên bán hàng (NVBH)</div>
            <div class="fs-4 fw-extrabold mt-1" style="color: #0d472b !important;">{{ nvbhCount }} <span class="fs-6 text-muted fw-normal">người</span></div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white" style="border: 1px solid #e2e8f0 !important;">
            <div class="text-secondary small fw-semibold text-uppercase" style="font-size: 11px;">Tổng bản ghi</div>
            <div class="fs-4 fw-extrabold text-dark mt-1">{{ displayedEmployees.length }} <span class="fs-6 text-muted fw-normal">bản ghi</span></div>
          </div>
        </div>
      </div>

      <!-- Main Data Table Card -->
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-3" style="background-color: #ffffff; border: 1px solid #e2e8f0 !important;">
        <div class="table-responsive">
          <table class="table table-hover align-middle m-0" style="font-size: 13px; width: 100% !important; min-width: 900px;">
            <thead style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <tr>
                <th class="py-3 px-3 text-secondary fw-bold" style="width: 110px;">Mã NV</th>
                <th class="py-3 px-3 text-secondary fw-bold" style="min-width: 180px;">Tên nhân viên</th>
                <th class="py-3 px-3 text-secondary fw-bold" style="width: 130px;">Chức danh</th>
                <th class="py-3 px-3 text-secondary fw-bold text-center" style="width: 90px;">Mã NT</th>
                <th class="py-3 px-3 text-secondary fw-bold" style="width: 100px;">Tỉnh</th>
                <th class="py-3 px-3 text-secondary fw-bold text-center" style="width: 130px;">Ngày nhận việc</th>
                <th class="py-3 px-3 text-secondary fw-bold text-center" style="width: 105px;">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              @if (isLoading) {
                <tr><td colspan="7" class="text-center text-secondary py-4">Đang tải danh sách nhân sự...</td></tr>
              } @else if (displayedEmployees.length === 0) {
                <tr>
                  <td colspan="7" class="text-center text-secondary py-5">
                    <div class="d-flex flex-column align-items-center justify-content-center">
                      <span class="fs-1 mb-2">{{ activeTab === 'active' ? '👥' : '👁️‍🗨️' }}</span>
                      <span class="fw-semibold">{{ activeTab === 'active' ? 'Không có nhân sự nào đang hiển thị.' : 'Chưa có nhân sự nào bị ẩn.' }}</span>
                    </div>
                  </td>
                </tr>
              } @else {
                @for (emp of displayedEmployees; track (emp.code + '-' + emp.role + '-' + emp.shopCode + '-' + $index)) {
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td class="px-3 fw-bold text-dark" style="white-space: nowrap !important;">{{ emp.code }}</td>
                  <td class="px-3 fw-bold text-dark">{{ emp.name }}</td>
                  <td class="px-3" style="white-space: nowrap !important;">
                    <span class="badge px-2 py-1" style="background-color: #e0e7ff !important; color: #4338ca !important; font-weight: 700; font-size: 11px;">
                      {{ emp.role }}
                    </span>
                  </td>
                  <td class="px-3 text-center text-muted" style="white-space: nowrap !important;">{{ emp.shopCode || '—' }}</td>
                  <td class="px-3 fw-semibold text-dark">{{ emp.province }}</td>
                  <td class="px-3 text-center text-muted" style="white-space: nowrap !important;">{{ emp.startDate || '—' }}</td>
                  <td class="px-3 text-center" style="white-space: nowrap !important;">
                    @if (activeTab === 'active') {
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-secondary px-2 py-1 fw-bold rounded-2 d-inline-flex align-items-center gap-1 shadow-2xs"
                        style="font-size: 11.5px;"
                        [disabled]="isUpdatingEmpKey === getEmployeeKey(emp)"
                        (click)="hideEmployee(emp)"
                        title="Ẩn nhân viên này"
                      >
                        <span *ngIf="isUpdatingEmpKey !== getEmployeeKey(emp)">👁️‍🗨️</span>
                        <span *ngIf="isUpdatingEmpKey === getEmployeeKey(emp)" class="spinner-border spinner-border-sm" role="status"></span>
                        Ẩn
                      </button>
                    } @else {
                      <button
                        type="button"
                        class="btn btn-sm btn-success px-2 py-1 fw-bold rounded-2 text-white d-inline-flex align-items-center gap-1 shadow-2xs"
                        style="font-size: 11.5px; background-color: #0d472b; border-color: #0d472b;"
                        [disabled]="isUpdatingEmpKey === getEmployeeKey(emp)"
                        (click)="unhideEmployee(emp)"
                        title="Khôi phục hiển thị nhân viên này"
                      >
                        <span *ngIf="isUpdatingEmpKey !== getEmployeeKey(emp)">👁️</span>
                        <span *ngIf="isUpdatingEmpKey === getEmployeeKey(emp)" class="spinner-border spinner-border-sm" role="status"></span>
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
      <div class="text-secondary fw-semibold ps-1" style="font-size: 13px; color: #6b7280;" *ngIf="!isLoading">
        Tổng số bản ghi: {{ displayedEmployees.length }} {{ activeTab === 'active' ? 'đang hiển thị' : 'đã ẩn' }} | Tổng nhân viên: {{ activeDisplayedEmployeeCount }} ({{ chtCount }} CHT, {{ nvbhCount }} NVBH)
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
  `]
})
export class NhanSuComponent implements OnInit {
  isLoading = false;
  filterShopCode = '';

  managerUser: {
    name: string;
    role: string;
    phone: string;
    email: string;
    shopCount: number;
  } | null = null;

  showAddModal = false;
  editingEmp: EmployeeListItem | null = null;
  newEmp: EmployeeListItem = {
    code: '',
    name: '',
    role: 'NVBH',
    shopCode: 'SHOP0010',
    province: 'Đà Nẵng',
    startDate: '01/10/2026',
    resigned: 'Đang làm'
  };

  employees: EmployeeListItem[] = [];
  loadError = '';
  managedShops: ShopInfo[] = [];

  activeTab: 'active' | 'hidden' = 'active';
  hiddenEmployeeKeys = new Set<string>();
  isUpdatingEmpKey = '';
  toastMessage = '';
  private toastTimer: any = null;

  getEmployeeKey(emp: EmployeeListItem): string {
    const empCode = (emp.code && emp.code !== '—' ? emp.code : (emp.id || emp.name || '')).trim().toLowerCase();
    const shopCode = (emp.shopCode || '').trim().toLowerCase();
    const rawKey = `${empCode}__${shopCode}`;
    return rawKey.replace(/[.#$\[\]\/]/g, '_');
  }

  get filteredByShopEmployees(): EmployeeListItem[] {
    if (!this.filterShopCode) return this.employees;
    return this.employees.filter(e => e.shopCode === this.filterShopCode);
  }

  get activeFilteredEmployees(): EmployeeListItem[] {
    return this.filteredByShopEmployees.filter(e => !this.hiddenEmployeeKeys.has(this.getEmployeeKey(e)));
  }

  get hiddenFilteredEmployees(): EmployeeListItem[] {
    return this.filteredByShopEmployees.filter(e => this.hiddenEmployeeKeys.has(this.getEmployeeKey(e)));
  }

  get displayedEmployees(): EmployeeListItem[] {
    return this.activeTab === 'active' ? this.activeFilteredEmployees : this.hiddenFilteredEmployees;
  }

  isCHT(role: string): boolean {
    const r = (role || '').toLowerCase();
    return (
      r.includes('cửa hàng trưởng') ||
      r.includes('cht') ||
      r.includes('trưởng cửa hàng') ||
      r.includes('quản lý') ||
      r.includes('qlnt') ||
      r.includes('trưởng nhà thuốc')
    );
  }

  get uniqueActiveEmployees(): EmployeeListItem[] {
    const active = this.displayedEmployees.filter(employee => employee.resigned !== 'Đã nghỉ');
    const map = new Map<string, EmployeeListItem>();
    for (const emp of active) {
      const key = (emp.code && emp.code !== '—' ? emp.code : (emp.id || emp.name)).trim().toLowerCase();
      const existing = map.get(key);
      if (!existing) {
        map.set(key, emp);
      } else {
        if (this.isCHT(emp.role)) {
          map.set(key, emp);
        }
      }
    }
    return [...map.values()];
  }

  get chtCount(): number {
    return this.uniqueActiveEmployees.filter(e => this.isCHT(e.role)).length;
  }

  get nvbhCount(): number {
    return Math.max(0, this.uniqueActiveEmployees.length - this.chtCount);
  }

  get activeDisplayedEmployeeCount(): number {
    return this.uniqueActiveEmployees.length;
  }

  /**
   * Khử trùng dữ liệu nhân sự:
   * Nếu trùng cả Mã NV và Mã NT thì remove 1 bản ghi.
   * Nếu một bản ghi là NVBH và một bản ghi là CHT thì ưu tiên giữ CHT.
   */
  deduplicateEmployees(list: EmployeeListItem[]): EmployeeListItem[] {
    const map = new Map<string, EmployeeListItem>();
    for (const emp of list) {
      const empCode = (emp.code && emp.code !== '—' ? emp.code : (emp.id || emp.name)).trim().toLowerCase();
      const shopCode = (emp.shopCode || '').trim().toLowerCase();
      const key = `${empCode}__${shopCode}`;

      const existing = map.get(key);
      if (!existing) {
        map.set(key, emp);
      } else {
        const empIsCht = this.isCHT(emp.role);
        const existingIsCht = this.isCHT(existing.role);

        if (empIsCht && !existingIsCht) {
          // Ưu tiên CHT
          map.set(key, emp);
        } else if (!empIsCht && existingIsCht) {
          // Giữ existing vì đã là CHT
        } else {
          // Cùng nhóm vai trò: ưu tiên người đang làm hơn người đã nghỉ
          if (existing.resigned === 'Đã nghỉ' && emp.resigned !== 'Đã nghỉ') {
            map.set(key, emp);
          }
        }
      }
    }
    return [...map.values()];
  }

  constructor(
    private upharma: UpharmaService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await Promise.all([
      this.loadEmployeesWorkflow(),
      this.loadHiddenEmployees()
    ]);
  }

  async onFilterShopChange() {
    if (this.filterShopCode) {
      await this.loadEmployeeOfShop(this.filterShopCode);
    } else {
      await this.loadEmployeesWorkflow();
    }
  }

  // Load sales staff assigned to the selected shop.
  async loadEmployeeOfShop(shopCode: string) {
    this.isLoading = true;
    this.loadError = '';
    this.employees = [];
    try {
      const shop = this.managedShops.find(item => item.ShopCode === shopCode);
      const salesmen = await this.upharma.getSalesmanByShop(shopCode);
      const mapped = salesmen.map(item => this.mapEmployee(item, shopCode, shop));
      this.employees = this.deduplicateEmployees(mapped);
    } catch (e) {
      console.error(`Failed to load employees for ${shopCode}:`, e);
      this.loadError = 'Không tải được danh sách nhân sự. Vui lòng thử lại.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  // Load sales staff for all shops managed by the signed-in user.
  async loadEmployeesWorkflow() {
    this.isLoading = true;
    this.loadError = '';
    this.employees = [];
    try {
      const session = this.upharma.ensureLogin();
      this.managedShops = Array.isArray(session.UserInfo.ShopLst) ? session.UserInfo.ShopLst : [];
      if (this.managedShops.length === 0) {
        throw new Error('The signed-in user has no managed shops.');
      }
      if (!this.managedShops.some(shop => shop.ShopCode === this.newEmp.shopCode)) {
        this.newEmp.shopCode = this.managedShops[0].ShopCode;
      }

      try {
        const userInfoRes = await this.upharma.callEndpoint<any>('/User/GetUserInfoByID', {
          uPharmaID: session.UserInfo.uPharmaID,
          Token: session.Token
        });
        if (userInfoRes && userInfoRes.UserInfo) {
          const info = userInfoRes.UserInfo;
          const shopLst = Array.isArray(info.ShopLst) ? info.ShopLst : [];

          this.managerUser = {
            name: info.FullName || session.UserInfo.FullName,
            role: info.UTypeTxt || '',
            phone: info.PhoneNumber || '',
            email: info.Email || '',
            shopCount: shopLst.length || this.managedShops.length
          };
        }
      } catch (e) {
        console.warn('Optional UserInfo fetch for manager user info');
      }

      const results: PromiseSettledResult<EmployeeListItem[]>[] = [];
      for (const shop of this.managedShops) {
        try {
          const salesmen = await this.upharma.getSalesmanByShop(shop.ShopCode);
          results.push({
            status: 'fulfilled',
            value: salesmen.map(item => this.mapEmployee(item, shop.ShopCode, shop))
          });
        } catch (reason) {
          results.push({ status: 'rejected', reason });
        }
      }

      const failedResults = results.flatMap((result, index) =>
        result.status === 'rejected'
          ? [{ shopCode: this.managedShops[index].ShopCode, reason: result.reason }]
          : []
      );
      const rawEmployees = results.flatMap(result => result.status === 'fulfilled' ? result.value : []);
      this.employees = this.deduplicateEmployees(rawEmployees);
      const failedShops = failedResults.map(result => result.shopCode);
      if (failedShops.length > 0) {
        console.error('Employee list failed for managed shops:', failedResults);
        const hasForbidden = failedResults.some(result => /HTTP 403|Forbidden/i.test(String(result.reason?.message || result.reason)));
        this.loadError = hasForbidden
          ? `UPharma từ chối quyền truy cập (HTTP 403) với một số nhà thuốc. Đã tải ${this.employees.length} nhân sự; vui lòng đăng nhập lại hoặc kiểm tra quyền quản lý shop.`
          : `Không tải được nhân sự của: ${failedShops.join(', ')}. Đã tải ${this.employees.length} nhân sự; vui lòng thử tải lại.`;
      }
    } catch (err) {
      console.error('Error loading employee workflow:', err);
      this.loadError = 'Không tải được danh sách nhân sự. Vui lòng thử lại.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  async retryLoadEmployees(): Promise<void> {
    if (this.filterShopCode) {
      await this.loadEmployeeOfShop(this.filterShopCode);
    } else {
      await this.loadEmployeesWorkflow();
    }
  }

  private mapEmployee(item: any, shopCode: string, shop?: ShopInfo): EmployeeListItem {
    const apiLocation = `${item.City || ''} ${item.Address || ''} ${item.Region || ''}`.trim().toLowerCase();
    const shopLocation = `${shop?.ShopAddress || ''} ${shop?.ShopName || ''}`.toLowerCase();
    const location = apiLocation || shopLocation;
    const province = location.includes('huế') || /SHOP0(119|120|133)/.test(shopCode) ? 'Huế' : 'Đà Nẵng';
    const startDate = String(item.TimeStartWork || item.StartDate || item.JoinDate || '');

    return {
      id: String(item.EmployeeID || item.uPharmaID || item.DocumentID || item.EmployeeCode || item.EmCode || ''),
      code: item.uPharmaIDCode || item.EmployeeCode || item.EmCode || item.uPharmaID || '—',
      name: item.EmployeeName || item.FullName || 'Nhân viên',
      role: item.UserDefineName || item.RoleName || item.UTypeTxt || item.PositionName || item.JobTitle || item.Title || item.EmRole || item.ChucVu || 'NVBH',
      shopCode: item.ShopCode || shopCode,
      province,
      startDate: startDate ? startDate.slice(0, 10) : '—',
      resigned: item.IsResign === true || Number(item.IsResign) === 1 || String(item.IsResign).toLowerCase() === 'true' ? 'Đã nghỉ' : 'Đang làm'
    };
  }

  // 3. Calling POST /Employee/GetEmployeeInfoByID and POST /Employee/GetInstructorByID for edit
  async editEmployee(emp: EmployeeListItem) {
    this.editingEmp = emp;
    this.newEmp = { ...emp };
    this.showAddModal = true;

    try {
      const session = this.upharma.ensureLogin();
      await this.upharma.callEndpoint<any>('/Employee/GetEmployeeInfoByID', {
        uPharmaID: session.UserInfo.uPharmaID,
        Token: session.Token,
        EmployeeID: emp.id || emp.code
      });
      await this.upharma.callEndpoint<any>('/Employee/GetInstructorByID', {
        uPharmaID: session.UserInfo.uPharmaID,
        Token: session.Token,
        ID: emp.id || emp.code
      });
    } catch (e) {
      console.warn('GetEmployeeInfoByID / GetInstructorByID optional call');
    }
  }

  // 4. Calling POST /Employee/CheckNewEmployee, POST /Employee/AddEmployeeInfo, POST /Employee/UpdateEmployeeInfo
  async saveEmployee() {
    if (!this.newEmp.code || !this.newEmp.name) return;

    try {
      const session = this.upharma.ensureLogin();

      if (this.editingEmp) {
        // Calling POST /Employee/UpdateEmployeeInfo
        try {
          await this.upharma.callEndpoint<any>('/Employee/UpdateEmployeeInfo', {
            uPharmaID: session.UserInfo.uPharmaID,
            Token: session.Token,
            EmployeeCode: this.newEmp.code,
            FullName: this.newEmp.name,
            RoleName: this.newEmp.role,
            ShopCode: this.newEmp.shopCode
          });
        } catch (e) {
          console.warn('UpdateEmployeeInfo optional call');
        }

        const idx = this.employees.findIndex(e => e.code === this.editingEmp?.code);
        if (idx !== -1) {
          this.employees[idx] = {
            ...this.newEmp,
            province: this.newEmp.shopCode.includes('119') || this.newEmp.shopCode.includes('120') || this.newEmp.shopCode.includes('133') ? 'Huế' : 'Đà Nẵng'
          };
        }
      } else {
        // Calling POST /Employee/CheckNewEmployee
        try {
          await this.upharma.callEndpoint<any>('/Employee/CheckNewEmployee', {
            uPharmaID: session.UserInfo.uPharmaID,
            Token: session.Token,
            EmployeeCode: this.newEmp.code
          });
        } catch (e) {
          console.warn('CheckNewEmployee optional check');
        }

        // Calling POST /Employee/AddEmployeeInfo
        try {
          await this.upharma.callEndpoint<any>('/Employee/AddEmployeeInfo', {
            uPharmaID: session.UserInfo.uPharmaID,
            Token: session.Token,
            EmployeeCode: this.newEmp.code,
            FullName: this.newEmp.name,
            RoleName: this.newEmp.role,
            ShopCode: this.newEmp.shopCode
          });
        } catch (e) {
          console.warn('AddEmployeeInfo optional call');
        }

        const created: EmployeeListItem = {
          ...this.newEmp,
          province: this.newEmp.shopCode.includes('119') || this.newEmp.shopCode.includes('120') || this.newEmp.shopCode.includes('133') ? 'Huế' : 'Đà Nẵng'
        };
        this.employees = this.deduplicateEmployees([created, ...this.employees]);
      }
    } catch (e) {
      console.warn('Error saving employee:', e);
    } finally {
      this.closeModal();
      this.cdr.detectChanges();
    }
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
    return `upharma_hidden_employees_${this.uPharmaID}`;
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
      localStorage.setItem(this.storageKey, JSON.stringify([...this.hiddenEmployeeKeys]));
    } catch {}
  }

  async loadHiddenEmployees(): Promise<void> {
    // 1. Tải ngay từ localStorage để hiển thị tức thì
    this.hiddenEmployeeKeys = this.getLocalStorageHidden();

    // 2. Đồng bộ với Firebase
    try {
      const url = `${environment.firebaseDbUrl}/hidden_employees/${this.uPharmaID}.json`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          const remoteKeys = Object.keys(data);
          for (const k of remoteKeys) {
            this.hiddenEmployeeKeys.add(k);
          }
          this.saveLocalStorageHidden();
        }
      }
    } catch (e) {
      console.warn('Lỗi khi tải danh sách nhân sự ẩn từ Firebase:', e);
    } finally {
      this.cdr.detectChanges();
    }
  }

  async hideEmployee(emp: EmployeeListItem): Promise<void> {
    const empKey = this.getEmployeeKey(emp);
    this.isUpdatingEmpKey = empKey;

    // Cập nhật giao diện tức thì
    this.hiddenEmployeeKeys.add(empKey);
    this.saveLocalStorageHidden();
    this.showToast(`Đã ẩn nhân viên ${emp.name} (${emp.code}) thành công.`);
    this.cdr.detectChanges();

    // Đồng bộ lên Firebase
    try {
      const url = `${environment.firebaseDbUrl}/hidden_employees/${this.uPharmaID}/${empKey}.json`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hidden: true,
          empKey,
          code: emp.code,
          name: emp.name,
          role: emp.role,
          shopCode: emp.shopCode,
          updatedAt: new Date().toISOString()
        })
      });
      if (!res.ok) {
        console.warn(`[Firebase] Không thể ghi trạng thái ẩn nhân sự (HTTP ${res.status}), đã lưu offline.`);
      }
    } catch (e) {
      console.warn(`[Firebase] Lỗi mạng khi ẩn nhân sự ${emp.code}, đã lưu offline:`, e);
    } finally {
      this.isUpdatingEmpKey = '';
      this.cdr.detectChanges();
    }
  }

  async unhideEmployee(emp: EmployeeListItem): Promise<void> {
    const empKey = this.getEmployeeKey(emp);
    this.isUpdatingEmpKey = empKey;

    // Cập nhật giao diện tức thì
    this.hiddenEmployeeKeys.delete(empKey);
    this.saveLocalStorageHidden();
    this.showToast(`Đã khôi phục hiển thị nhân viên ${emp.name} (${emp.code}) thành công.`);
    this.cdr.detectChanges();

    // Đồng bộ xóa trên Firebase (DELETE)
    try {
      const url = `${environment.firebaseDbUrl}/hidden_employees/${this.uPharmaID}/${empKey}.json`;
      const res = await fetch(url, {
        method: 'DELETE'
      });
      if (!res.ok) {
        console.warn(`[Firebase] Không thể xóa trạng thái ẩn nhân sự (HTTP ${res.status}), đã lưu offline.`);
      }
    } catch (e) {
      console.warn(`[Firebase] Lỗi mạng khi bỏ ẩn nhân sự ${emp.code}, đã lưu offline:`, e);
    } finally {
      this.isUpdatingEmpKey = '';
      this.cdr.detectChanges();
    }
  }

  showToast(msg: string): void {
    this.toastMessage = msg;
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => {
      this.toastMessage = '';
      this.cdr.detectChanges();
    }, 3500);
  }

  closeModal() {
    this.showAddModal = false;
    this.editingEmp = null;
    this.newEmp = {
      code: '',
      name: '',
      role: 'NVBH',
      shopCode: 'SHOP0010',
      province: 'Đà Nẵng',
      startDate: '01/10/2026',
      resigned: 'Đang làm'
    };
  }
}
