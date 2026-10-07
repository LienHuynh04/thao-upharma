import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DashboardService } from '../../../dashboard/dashboard.service';

export interface SidebarMenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: string | number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="upharma-sidebar" [class.collapsed]="isCollapsed">
      <!-- Sidebar Brand Header -->
      <div class="sidebar-header d-flex align-items-center justify-content-between">
        <a routerLink="/dashboard" class="brand-link d-flex align-items-center gap-2 text-decoration-none">
          <div class="brand-logo">U</div>
          <div class="brand-info" *ngIf="!isCollapsed">
            <div class="brand-title">NHÀ THUỐC UPHARMA</div>
            <div class="brand-subtitle">ĐÀ NẴNG & HUẾ</div>
          </div>
        </a>
        <button
          class="collapse-toggle-btn border-0 bg-transparent text-white-50 p-1 rounded cursor-pointer ms-auto"
          (click)="toggleCollapse.emit()"
          [title]="isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'"
        >
          <span class="fs-5 fw-bold" style="line-height: 1;">{{ isCollapsed ? '»' : '«' }}</span>
        </button>
      </div>

      <!-- Navigation Menu -->
      <nav class="sidebar-nav flex-fill overflow-auto py-2">
        @for (item of menuItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="active"
            class="nav-item"
            [title]="item.label"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label" *ngIf="!isCollapsed">{{ item.label }}</span>
            @if (item.badge !== undefined && !isCollapsed) {
              <span class="nav-badge">{{ item.badge }}</span>
            }
          </a>
        }
      </nav>

      <!-- Sidebar Footer / Logout -->
      <div class="sidebar-footer border-top p-2" style="border-color: rgba(255, 255, 255, 0.1) !important;">
        <button (click)="onLogout($event)" class="nav-item logout-btn border-0 bg-transparent w-100 text-start" [title]="'Đăng xuất'">
          <span class="nav-icon">🚪</span>
          <span class="nav-label" *ngIf="!isCollapsed">Đăng xuất</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .upharma-sidebar {
      width: 240px;
      min-width: 240px;
      height: 100vh;
      position: sticky;
      top: 0;
      background-color: #0d472b;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      user-select: none;
      transition: width 0.2s ease, min-width 0.2s ease;
      z-index: 1020;
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
      font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .upharma-sidebar.collapsed {
      width: 68px;
      min-width: 68px;
    }

    .sidebar-header {
      padding: 14px 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .brand-logo {
      width: 36px;
      height: 36px;
      min-width: 36px;
      background-color: #ffffff;
      color: #0d472b;
      font-weight: 900;
      font-size: 22px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .brand-info {
      overflow: hidden;
      white-space: nowrap;
    }

    .brand-title {
      font-size: 13px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.2;
      letter-spacing: 0.2px;
    }

    .brand-subtitle {
      font-size: 10px;
      color: #88c9a1;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }

    .collapse-toggle-btn {
      transition: color 0.15s ease;
    }

    .collapse-toggle-btn:hover {
      color: #ffffff !important;
    }

    .sidebar-nav {
      padding: 10px 8px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .sidebar-nav::-webkit-scrollbar {
      width: 4px;
    }

    .sidebar-nav::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 9px 12px;
      color: #e2f1e8;
      text-decoration: none;
      font-size: 13.5px;
      font-weight: 700;
      border-radius: 8px;
      transition: all 0.15s ease;
      gap: 12px;
      cursor: pointer;
    }

    .nav-item:hover {
      background-color: rgba(255, 255, 255, 0.12);
      color: #ffffff;
    }

    .nav-item.active {
      background-color: #ffffff;
      color: #0d472b;
      font-weight: 800;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    }

    .nav-icon {
      font-size: 17px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      min-width: 22px;
    }

    .nav-label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-badge {
      background-color: #ef4444;
      color: #ffffff;
      font-size: 11px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 12px;
      line-height: 1;
    }

    .logout-btn {
      color: #88c9a1;
    }

    .logout-btn:hover {
      background-color: rgba(239, 68, 68, 0.2) !important;
      color: #fca5a5 !important;
    }
  `]
})
export class SidebarComponent implements OnInit {
  @Input() isCollapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();
  @Output() logoutRequested = new EventEmitter<Event>();

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    void this.loadManagedEmployeeCount();
  }

  private async loadManagedEmployeeCount(): Promise<void> {
    try {
      const summary = await this.dashboardService.getManagedEmployeeSummary();
      this.menuItems = this.menuItems.map((item) =>
        item.route === '/nhan-su' ? { ...item, badge: summary.total } : item
      );
    } catch (error) {
      console.error('Failed to load managed employee count for sidebar:', error);
    }
  }

  menuItems: SidebarMenuItem[] = [
    { label: 'Tổng Quan', icon: '▦', route: '/dashboard' },
    { label: 'Nhà Thuốc', icon: '🏪', route: '/nha-thuoc' },
    { label: 'Nhân Sự', icon: '👥', route: '/nhan-su' },
    { label: 'OKR', icon: '🎯', route: '/okr' },
    { label: 'Khuyến Mãi', icon: '🎁', route: '/khuyen-mai' },
    { label: 'Báo Cáo NV', icon: '📝', route: '/bao-cao-nv' },
    { label: 'Báo Cáo', icon: '📊', route: '/bao-cao' },
    { label: 'Chỉ Tiêu', icon: '📌', route: '/chi-tieu' },
    { label: 'Hiệu Suất', icon: '📈', route: '/hieu-suat' },
    { label: 'Khách Hàng', icon: '👤', route: '/khach-hang' },
    { label: 'Nhập Doanh Số', icon: '➕', route: '/nhap-doanh-so' },
    { label: 'Hàng Hoá', icon: '📦', route: '/hang-hoa' },
    { label: 'Wrong FEFO', icon: '⚠️', route: '/wrong-fefo' },
    { label: 'Hàng Không Có', icon: '🛒', route: '/hang-khong-co' },
    { label: 'Đánh Giá AI', icon: '✨', route: '/danh-gia-ai' },
    { label: 'Chấm KPI', icon: '✅', route: '/cham-kpi' },
    { label: 'Công Việc Thông Minh', icon: '📋', route: '/cong-viec-thong-minh' },
    { label: 'Check', icon: '☑️', route: '/check' },
  ];

  onLogout(event: Event): void {
    this.logoutRequested.emit(event);
  }
}
