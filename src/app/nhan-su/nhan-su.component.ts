import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShopInfo, UpharmaService } from '../upharma.service';

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
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fs-4 fw-extrabold m-0" style="color: #111827; font-weight: 800;">Nhân sự</h2>
          <span class="text-muted" style="font-size: 12px;">Quản lý hồ sơ nhân sự & Cán bộ quản lý Upharma</span>
        </div>
        <div class="d-flex gap-2 align-items-center">
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

          <button class="btn btn-outline-success btn-sm fw-bold px-3 py-2 rounded-3 shadow-sm d-flex align-items-center gap-1" style="border-color: #10b981; color: #10b981; background: #fff; height: 35px;">
            <span>📥</span> Import Excel
          </button>
          <button class="btn btn-success btn-sm fw-bold px-3 py-2 rounded-3 shadow-sm d-flex align-items-center gap-1" style="background-color: #0d472b; border-color: #0d472b; height: 35px;" (click)="showAddModal = true">
            <span>+</span> Thêm nhân viên
          </button>
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

      <!-- Main Data Table Card -->
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-3" style="background-color: #ffffff; border: 1px solid #e2e8f0 !important;">
        <div class="table-responsive">
          <table class="table table-hover align-middle m-0" style="font-size: 13px;">
            <thead style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <tr>
                <th class="py-3 px-3 text-secondary fw-bold" style="width: 110px;">Mã NV</th>
                <th class="py-3 px-3 text-secondary fw-bold">Tên nhân viên</th>
                <th class="py-3 px-3 text-secondary fw-bold">Chức danh</th>
                <th class="py-3 px-3 text-secondary fw-bold text-center">Mã NT</th>
                <th class="py-3 px-3 text-secondary fw-bold">Tỉnh</th>
                <th class="py-3 px-3 text-secondary fw-bold text-center">Ngày nhận việc</th>
                <th class="py-3 px-3 text-secondary fw-bold text-center" style="width: 90px;"></th>
              </tr>
            </thead>
            <tbody>
              @if (isLoading) {
                <tr><td colspan="7" class="text-center text-secondary py-4">Đang tải danh sách nhân sự...</td></tr>
              } @else if (displayedEmployees.length === 0) {
                <tr><td colspan="7" class="text-center text-secondary py-4">Không có dữ liệu nhân sự.</td></tr>
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
                    <div class="d-flex justify-content-center gap-2" style="font-size: 12px; font-weight: 700;">
                      <a href="javascript:void(0)" class="text-decoration-none" style="color: #64748b;" (click)="hideEmployee(emp)">Ẩn</a>
                    </div>
                  </td>
                </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
      <div class="text-secondary fw-semibold ps-1" style="font-size: 13px; color: #6b7280;">
        {{ displayedEmployees.length }} nhân sự ({{ activeDisplayedEmployeeCount }} đang làm)
      </div>
    </div>

    <!-- Modal Thêm/Sửa nhân viên -->
    @if (showAddModal) {
      <div class="modal fade show d-block" style="background: rgba(0,0,0,0.5);" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content rounded-4 border-0 shadow">
            <div class="modal-header border-bottom-0 pb-0">
              <h5 class="modal-title fw-bold text-dark">{{ editingEmp ? 'Sửa thông tin nhân viên' : 'Thêm mới nhân viên' }}</h5>
              <button type="button" class="btn-close" (click)="closeModal()"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label fw-semibold">Mã NV</label>
                <input type="text" class="form-control rounded-3" [(ngModel)]="newEmp.code" placeholder="UP001299" [disabled]="!!editingEmp" />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Tên nhân viên</label>
                <input type="text" class="form-control rounded-3" [(ngModel)]="newEmp.name" placeholder="Nguyễn Văn A" />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Chức danh</label>
                <select class="form-select rounded-3" [(ngModel)]="newEmp.role">
                  <option value="NVBH">NVBH</option>
                  <option value="Dược sĩ tư vấn">Dược sĩ tư vấn</option>
                  <option value="Cửa hàng trưởng">Cửa hàng trưởng</option>
                  <option value="Quản lý vùng">Quản lý vùng</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Mã Nhà thuốc</label>
                <select class="form-select rounded-3" [(ngModel)]="newEmp.shopCode">
                  @for (shop of managedShops; track shop.ShopCode) {
                    <option [value]="shop.ShopCode">{{ shop.ShopCode }} — {{ shop.ShopName }}</option>
                  }
                </select>
              </div>
            </div>
            <div class="modal-footer border-top-0 pt-0">
              <button type="button" class="btn btn-light rounded-3 fw-bold" (click)="closeModal()">Hủy</button>
              <button type="button" class="btn btn-success rounded-3 fw-bold text-white" style="background-color: #0d472b; border-color: #0d472b;" (click)="saveEmployee()">
                {{ editingEmp ? 'Cập nhật' : 'Thêm mới' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
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

  get displayedEmployees(): EmployeeListItem[] {
    if (!this.filterShopCode) return this.employees;
    return this.employees.filter(e => e.shopCode === this.filterShopCode);
  }

  get activeDisplayedEmployeeCount(): number {
    const active = this.displayedEmployees.filter(employee => employee.resigned !== 'Đã nghỉ');
    const uniqueKeys = new Set(
      active.map(e => (e.code && e.code !== '—' ? e.code : (e.id || e.name)).trim().toLowerCase())
    );
    return uniqueKeys.size;
  }

  constructor(
    private upharma: UpharmaService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.loadEmployeesWorkflow();
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
      this.employees = salesmen.map(item => this.mapEmployee(item, shopCode, shop));
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
      this.employees = results.flatMap(result => result.status === 'fulfilled' ? result.value : []);
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
        this.employees.unshift(created);
      }
    } catch (e) {
      console.warn('Error saving employee:', e);
    } finally {
      this.closeModal();
      this.cdr.detectChanges();
    }
  }

  hideEmployee(emp: EmployeeListItem) {
    const idx = this.employees.findIndex(e => e.code === emp.code);
    if (idx !== -1) {
      this.employees.splice(idx, 1);
      this.cdr.detectChanges();
    }
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
